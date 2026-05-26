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

function handleWrite(e) {
  try {
    var raw = e.parameter.payload;
    if (!raw) return ContentService.createTextOutput("no payload");
    var data = JSON.parse(decodeURIComponent(raw));
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet;

    if (data.type === "newsletter") {
      sheet = ss.getSheetByName("Newsletter");
      if (!sheet) {
        sheet = ss.insertSheet("Newsletter");
        sheet.appendRow(["Nome", "Email", "Comune", "Data"]);
      }
      sheet.appendRow([data.nome, data.email, data.comune, data.data]);
    } else {
      sheet = ss.getSheetByName("Richieste");
      if (!sheet) {
        sheet = ss.insertSheet("Richieste");
        sheet.appendRow(["data", "nome", "paziente", "servizio", "citta", "relazione", "eta", "motivo", "prescrizione", "giorno", "orario", "note", "telefono", "email", "consenso"]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        data.name, data.patientName, data.service, data.city,
        data.relation, data.age, data.reason, data.prescription,
        data.date, data.time, data.note, data.phone,
        data.email, data.consentContact
      ]);
    }
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}
