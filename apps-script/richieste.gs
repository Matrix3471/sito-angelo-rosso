// Google Apps Script — raccolta richieste chatbot
// Deploy come: Web App > Chi può accedere: Chiunque > Esegui come: Me
// Prima di usare: esegui setupSheet() una volta dal menu Esegui.

var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";
var SHEET_NAME = "Richieste";

var HEADERS = [
  "Nome richiedente",
  "Data richiesta",
  "Nome paziente",
  "Telefono",
  "Email",
  "Comune",
  "Servizio richiesto",
  "Rapporto con paziente",
  "Eta indicativa",
  "Motivo breve",
  "Prescrizione indicazione",
  "Giorno richiesto",
  "Orario richiesto",
  "Orario preferito",
  "Esito disponibilita",
  "Alternative proposte",
  "Note pratiche",
  "Consenso ricontatto",
  "Fonte",
  "Stato",
  "Note operatore"
];

function setupSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var isEmpty = firstRow.every(function(cell) { return cell === ""; });

  if (isEmpty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  try {
    console.log("doGet chiamato");
    if (!e || !e.parameter) {
      console.log("e o e.parameter undefined");
      return jsonResponse({ status: "error", message: "Nessun parametro ricevuto" });
    }
    console.log("payload:", e.parameter.payload);

    var data = JSON.parse(e.parameter.payload);
    console.log("data parsed:", JSON.stringify(data));

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    console.log("sheet:", sheet ? "trovato" : "NON TROVATO");

    if (!sheet) {
      return jsonResponse({ status: "error", message: "Foglio non trovato. Esegui setupSheet()." });
    }

    var now = new Date();
    var timestamp = Utilities.formatDate(now, "Europe/Rome", "d/M/yyyy HH:mm");

    sheet.appendRow([
      data.name           || "",
      timestamp,
      data.patientName    || "",
      data.phone          || "",
      data.email          || "",
      data.city           || "",
      data.service        || "",
      data.relation       || "",
      data.age            || "",
      data.reason         || "",
      data.prescription   || "",
      data.date           || "",
      "",
      data.time           || "",
      "",
      "",
      data.note           || "",
      data.consentContact || "",
      "Chatbot",
      "Da verificare",
      ""
    ]);

    console.log("appendRow completato");
    return jsonResponse({ status: "ok" });
  } catch (err) {
    console.log("ERRORE:", err.toString());
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
