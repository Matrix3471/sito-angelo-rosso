// Google Apps Script — raccolta richieste chatbot + iscrizioni newsletter
// Deploy come: Web App > Chi può accedere: Chiunque > Esegui come: Me
// Prima di usare: esegui setupSheet() e setupNewsletter() dal menu Esegui.

var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";
var SHEET_NAME = "Richieste";
var NEWSLETTER_SHEET_NAME = "Newsletter";

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

var NEWSLETTER_HEADERS = [
  "Nome",
  "Email",
  "Comune",
  "Data iscrizione",
  "Consenso"
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

function setupNewsletter() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(NEWSLETTER_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(NEWSLETTER_SHEET_NAME);
  }

  var firstRow = sheet.getRange(1, 1, 1, NEWSLETTER_HEADERS.length).getValues()[0];
  var isEmpty = firstRow.every(function(cell) { return cell === ""; });

  if (isEmpty) {
    sheet.getRange(1, 1, 1, NEWSLETTER_HEADERS.length).setValues([NEWSLETTER_HEADERS]);
    sheet.getRange(1, 1, 1, NEWSLETTER_HEADERS.length).setFontWeight("bold");
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

    var action = e.parameter.action || "richiesta";
    console.log("action:", action);

    if (action === "newsletter") {
      return handleNewsletter(e.parameter);
    }

    if (action === "export_richieste") {
      return exportCsv(SHEET_NAME);
    }

    return handleRichiesta(e.parameter);
  } catch (err) {
    console.log("ERRORE:", err.toString());
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function handleRichiesta(params) {
  var data = JSON.parse(params.payload);
  console.log("richiesta data:", JSON.stringify(data));

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Foglio Richieste non trovato. Esegui setupSheet()." });
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

  console.log("richiesta appendRow completato");
  return jsonResponse({ status: "ok" });
}

function handleNewsletter(params) {
  var data = JSON.parse(params.payload);
  console.log("newsletter data:", JSON.stringify(data));

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(NEWSLETTER_SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Foglio Newsletter non trovato. Esegui setupNewsletter()." });
  }

  var now = new Date();
  var timestamp = Utilities.formatDate(now, "Europe/Rome", "d/M/yyyy HH:mm");

  sheet.appendRow([
    data.nome    || "",
    data.email   || "",
    data.comune  || "",
    timestamp,
    data.consenso || ""
  ]);

  console.log("newsletter appendRow completato");
  return jsonResponse({ status: "ok" });
}

function exportCsv(sheetName) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Foglio non trovato: " + sheetName });
  }

  var data = sheet.getDataRange().getValues();
  var csv = data.map(function(row) {
    return row.map(function(cell) {
      var val = String(cell);
      if (val.indexOf(",") !== -1 || val.indexOf('"') !== -1 || val.indexOf("\n") !== -1) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(",");
  }).join("\n");

  return jsonResponse({ status: "ok", csv: csv });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
