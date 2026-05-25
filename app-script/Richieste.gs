var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";

function doGet(e) {
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
        sheet.appendRow(["Data", "Nome", "Email"]);
      }
      sheet.appendRow([data.data, data.nome, data.email]);
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
  } catch(err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}
