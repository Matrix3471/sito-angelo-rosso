var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";

function doGet(e) {
  if (e.parameter.action === "read") {
    var result = readSheet(e.parameter.sheet || "");
    var callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (e.parameter.action === "sync_consultazioni") {
    syncRichiesteToConsultazioni();
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (e.parameter.action === "update_row") {
    var updates = JSON.parse(decodeURIComponent(e.parameter.updates || "{}"));
    var result = updateRow(e.parameter.sheet, e.parameter.id_col, e.parameter.id_val, updates);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return handleWrite(e);
}

function updateRow(sheetName, idCol, idVal, updates) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { error: "sheet not found: " + sheetName };
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { error: "sheet empty" };
    var headers = data[0].map(function(h) { return String(h || "").trim().toLowerCase().replace(/\s+/g, "_"); });
    var idIdx = headers.indexOf(String(idCol).toLowerCase());
    if (idIdx === -1) return { error: "column not found: " + idCol };
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]).trim() === String(idVal).trim()) {
        for (var col in updates) {
          var colIdx = headers.indexOf(String(col).toLowerCase());
          if (colIdx === -1) {
            // aggiunge nuova colonna se non esiste
            var newCol = sheet.getLastColumn() + 1;
            sheet.getRange(1, newCol).setValue(col);
            sheet.getRange(i + 1, newCol).setValue(updates[col]);
          } else {
            sheet.getRange(i + 1, colIdx + 1).setValue(updates[col]);
          }
        }
        return { ok: true, row: i + 1 };
      }
    }
    return { error: "row not found", id_col: idCol, id_val: idVal };
  } catch (err) {
    return { error: err.message };
  }
}

function readSheet(sheetName) {
  try {
    if (!sheetName) return { error: "sheet param missing" };
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { headers: [], rows: [] };
    var values = sheet.getDataRange().getValues();
    if (values.length === 0) return { headers: [], rows: [] };
    return { headers: values[0], rows: values.slice(1) };
  } catch (err) {
    return { error: err.message };
  }
}

function ensureHeader(sheet, headers) {
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
}

function handleWrite(e) {
  try {
    var raw = e.parameter.payload;
    if (!raw) return ContentService.createTextOutput("no payload");
    var data = JSON.parse(decodeURIComponent(raw));
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet;

    if (data.type === "newsletter") {
      sheet = ss.getSheetByName("Newsletter");
      if (!sheet) sheet = ss.insertSheet("Newsletter");
      ensureHeader(sheet, ["Nome", "Email", "Comune", "Data"]);
      sheet.appendRow([data.nome, data.email, data.comune, data.data]);
    } else {
      sheet = ss.getSheetByName("Richieste");
      if (!sheet) sheet = ss.insertSheet("Richieste");
      ensureHeader(sheet, ["data", "nome", "paziente", "servizio", "citta", "relazione", "eta", "motivo", "prescrizione", "note", "telefono", "email", "consenso"]);
      sheet.appendRow([
        new Date().toISOString(),
        data.name, data.patientName, data.service, data.city,
        data.relation, data.age, data.reason, data.prescription,
        data.note, data.phone, data.email, data.consentContact
      ]);

      var pSheet = ss.getSheetByName("Pazienti");
      if (!pSheet) pSheet = ss.insertSheet("Pazienti");
      ensureHeader(pSheet, ["id", "nome", "cognome", "email", "consenso_email", "non_contattare"]);
      var fullName = (data.patientName || data.name || "").trim();
      var parts = fullName.split(/\s+/);
      var pNome = parts[0] || "";
      var pCognome = parts.slice(1).join(" ") || "";
      var pEmail = data.email || "";
      var consenso = data.consentContact || "No";
      if (pEmail) {
        var pData = pSheet.getDataRange().getValues();
        var existingRow = -1;
        for (var i = 1; i < pData.length; i++) {
          if (pData[i][3] === pEmail) { existingRow = i + 1; break; }
        }
        if (existingRow === -1) {
          pSheet.appendRow(["P" + new Date().getTime(), pNome, pCognome, pEmail, consenso, "No"]);
        } else {
          pSheet.getRange(existingRow, 5).setValue(consenso);
        }
      }
    }
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}

function syncRichiesteToConsultazioni() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var now = new Date();

  // source: Prenotazioni (Cal.com webhook)
  // columns: data_ricezione(0) nome(1) email(2) inizio(3) fine(4) servizio(5) note_cliente(6) uid(7) evento(8)
  var pnSheet = ss.getSheetByName("Prenotazioni");
  if (!pnSheet || pnSheet.getLastRow() < 2) return;

  var paSheet = ss.getSheetByName("Pazienti");
  var emailToId = {};
  if (paSheet && paSheet.getLastRow() >= 2) {
    var paData = paSheet.getDataRange().getValues();
    for (var i = 1; i < paData.length; i++) {
      if (paData[i][3]) emailToId[String(paData[i][3]).trim().toLowerCase()] = String(paData[i][0]);
    }
  }

  var cSheet = ss.getSheetByName("Consultazioni");
  if (!cSheet) cSheet = ss.insertSheet("Consultazioni");

  // Forza header corretto anche se già presente (fix typo id_pazienti -> id_paziente)
  var correctHeaders = ["id_paziente", "data_consultazione", "tipo_servizio", "email_richiedente"];
  if (cSheet.getLastRow() === 0) {
    cSheet.appendRow(correctHeaders);
  } else {
    cSheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);
  }

  var existing = {};
  if (cSheet.getLastRow() >= 2) {
    var cData = cSheet.getDataRange().getValues();
    for (var j = 1; j < cData.length; j++) {
      var d = cData[j][1];
      var dStr = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
      existing[cData[j][0] + "|" + dStr + "|" + cData[j][2]] = true;
    }
  }

  var pnData = pnSheet.getDataRange().getValues();
  for (var k = 1; k < pnData.length; k++) {
    var row = pnData[k];
    var inizio = new Date(row[3]);
    if (isNaN(inizio.getTime()) || inizio > now) continue; // skip future or invalid
    var email = String(row[2] || "").trim().toLowerCase();
    var servizio = String(row[5] || "").trim();
    var dataStr = inizio.toISOString().slice(0, 10);
    if (!email || !servizio) continue;
    var patientId = emailToId[email] || email;
    var key = patientId + "|" + dataStr + "|" + servizio;
    if (existing[key]) continue;
    cSheet.appendRow([patientId, dataStr, servizio, email]);
    existing[key] = true;
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var p = body.payload || body;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Prenotazioni");
    if (!sheet) sheet = ss.insertSheet("Prenotazioni");
    ensureHeader(sheet, ["data_ricezione", "nome", "email", "inizio", "fine", "servizio", "note_cliente", "uid", "evento"]);
    var attendee = (p.attendees && p.attendees[0]) || {};
    var servizio = (p.eventType && p.eventType.title) || p.type || p.title || "";
    sheet.appendRow([
      new Date().toISOString(),
      attendee.name || "",
      attendee.email || "",
      p.startTime || "",
      p.endTime || "",
      servizio,
      p.additionalNotes || "",
      p.uid || "",
      body.triggerEvent || ""
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}
