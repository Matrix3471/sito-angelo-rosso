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
  return handleWrite(e);
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

  var rSheet = ss.getSheetByName("Richieste");
  if (!rSheet || rSheet.getLastRow() < 2) return;

  var pSheet = ss.getSheetByName("Pazienti");
  var pEmailToId = {};
  if (pSheet && pSheet.getLastRow() >= 2) {
    var pData = pSheet.getDataRange().getValues();
    for (var i = 1; i < pData.length; i++) {
      if (pData[i][3]) pEmailToId[String(pData[i][3]).trim().toLowerCase()] = String(pData[i][0]);
    }
  }

  var cSheet = ss.getSheetByName("Consultazioni");
  if (!cSheet) cSheet = ss.insertSheet("Consultazioni");
  ensureHeader(cSheet, ["id_paziente", "data_consultazione", "tipo_servizio", "email_richiedente"]);

  var existing = {};
  if (cSheet.getLastRow() >= 2) {
    var cData = cSheet.getDataRange().getValues();
    for (var j = 1; j < cData.length; j++) {
      var key = cData[j][0] + "|" + String(cData[j][1]).slice(0, 10) + "|" + cData[j][2];
      existing[key] = true;
    }
  }

  var rData = rSheet.getDataRange().getValues();
  // headers: data(0) nome(1) paziente(2) servizio(3) citta(4) relazione(5) eta(6) motivo(7) prescrizione(8) note(9) telefono(10) email(11) consenso(12)
  for (var k = 1; k < rData.length; k++) {
    var row = rData[k];
    var email = String(row[11] || "").trim().toLowerCase();
    var servizio = String(row[3] || "").trim();
    var dataStr = String(row[0] || "").slice(0, 10);
    if (!email || !servizio || !dataStr) continue;
    var patientId = pEmailToId[email] || email;
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
    sheet.appendRow([
      new Date().toISOString(),
      attendee.name || "",
      attendee.email || "",
      p.startTime || "",
      p.endTime || "",
      p.title || "",
      p.additionalNotes || "",
      p.uid || "",
      body.triggerEvent || ""
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}
