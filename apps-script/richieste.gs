// Google Apps Script — raccolta richieste chatbot + iscrizioni newsletter + sync Brevo
// Deploy come: Web App > Chi può accedere: Chiunque > Esegui come: Me
// Prima di usare: esegui setupSheet(), setupNewsletter(), setupBrevo() dal menu Esegui.

var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";
var SHEET_NAME = "Richieste";
var NEWSLETTER_SHEET_NAME = "Newsletter";
var BREVO_API_URL = "https://api.brevo.com/v3";

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

// ─── BREVO SETUP ─────────────────────────────────────────────────────────────

// Esegui UNA VOLTA: incolla la API key, clicca Esegui, poi cancella la chiave da qui.
function setupBrevo() {
  var props = PropertiesService.getScriptProperties();
  props.setProperty("BREVO_API_KEY", "INCOLLA_QUI_LA_TUA_API_KEY");

  var listId = _brevoGetOrCreateList("Newsletter Telemedicina");
  props.setProperty("BREVO_LIST_ID", String(listId));

  console.log("Brevo setup completato. List ID: " + listId);
}

function _brevoGetOrCreateList(listName) {
  var resp = UrlFetchApp.fetch(BREVO_API_URL + "/contacts/lists?limit=50", {
    method: "GET",
    headers: { "api-key": _brevoKey(), "accept": "application/json" },
    muteHttpExceptions: true
  });

  var data = JSON.parse(resp.getContentText());
  var lists = data.lists || [];

  for (var i = 0; i < lists.length; i++) {
    if (lists[i].name === listName) {
      return lists[i].id;
    }
  }

  var create = UrlFetchApp.fetch(BREVO_API_URL + "/contacts/lists", {
    method: "POST",
    headers: {
      "api-key": _brevoKey(),
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    payload: JSON.stringify({ name: listName, folderId: 1 }),
    muteHttpExceptions: true
  });

  var created = JSON.parse(create.getContentText());
  return created.id;
}

function _brevoKey() {
  return PropertiesService.getScriptProperties().getProperty("BREVO_API_KEY");
}

function _brevoAddContact(nome, email, comune) {
  var apiKey = _brevoKey();
  if (!apiKey || apiKey === "INCOLLA_QUI_LA_TUA_API_KEY") {
    console.log("BREVO: API key non configurata. Esegui setupBrevo().");
    return;
  }

  var listId = parseInt(PropertiesService.getScriptProperties().getProperty("BREVO_LIST_ID") || "0");

  var payload = {
    email: email,
    attributes: { FIRSTNAME: nome, CITY: comune },
    updateEnabled: true
  };
  if (listId > 0) payload.listIds = [listId];

  var resp = UrlFetchApp.fetch(BREVO_API_URL + "/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  console.log("Brevo addContact [" + resp.getResponseCode() + "]: " + resp.getContentText());
}

// Sincronizza tutti i contatti esistenti nel tab Newsletter → Brevo (esegui una volta)
function syncAllToBrevo() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(NEWSLETTER_SHEET_NAME);
  if (!sheet) { console.log("Foglio Newsletter non trovato."); return; }

  var rows = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < rows.length; i++) {
    var nome    = rows[i][0];
    var email   = rows[i][1];
    var comune  = rows[i][2];
    if (email) {
      _brevoAddContact(nome, email, comune);
      count++;
      Utilities.sleep(200); // evita rate limit
    }
  }
  console.log("Sincronizzati " + count + " contatti.");
}

// ─── REQUEST HANDLERS ─────────────────────────────────────────────────────────

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

  // Sync automatico → Brevo
  _brevoAddContact(data.nome || "", data.email || "", data.comune || "");

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

// ─── AI NEWSLETTER AGENT ──────────────────────────────────────────────────────
// Flusso: Google News RSS → Claude Haiku → bozza campagna Brevo → Angelo revisiona → invia
//
// SETUP (esegui una volta in ordine):
//   1. setupClaudeKey()          — incolla API key Claude, poi cancellala dal codice
//   2. setupNewsletterTrigger()  — crea trigger bisettimanale (lunedì ore 9, settimane pari)

function setupClaudeKey() {
  // Sostituisci la stringa qui sotto con la tua API key da console.anthropic.com
  // Poi esegui questa funzione UNA VOLTA e cancella la chiave dal codice.
  // Incolla la tua API key da console.anthropic.com tra le virgolette, esegui UNA VOLTA, poi cancellala.
  PropertiesService.getScriptProperties().setProperty("CLAUDE_API_KEY", "INCOLLA_QUI_LA_TUA_CLAUDE_API_KEY");
  console.log("Claude API key salvata in Script Properties.");
}

function setupNewsletterTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "runNewsletterAgent") ScriptApp.deleteTrigger(t);
  });

  // Trigger settimanale ogni lunedì ore 9 — l'agente esegue solo nelle settimane pari
  ScriptApp.newTrigger("runNewsletterAgent")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();

  console.log("Trigger creato: ogni lunedì ore 9 (eseguirà effettivamente ogni 2 settimane).");
}

function runNewsletterAgent() {
  var weekNumber = _getWeekNumber(new Date());
  if (weekNumber % 2 !== 0) {
    console.log("Settimana " + weekNumber + " (dispari) — skip newsletter agent.");
    return;
  }

  console.log("Avvio newsletter agent — settimana " + weekNumber + "...");

  var articles = _fetchHealthNews();
  if (articles.length === 0) {
    console.log("Nessun articolo trovato. Abort.");
    return;
  }
  console.log("Articoli trovati: " + articles.length);

  var content = _generateNewsletterContent(articles);
  if (!content || !content.subject || !content.html) {
    console.log("Claude non ha generato contenuto valido. Abort.");
    return;
  }
  console.log("Contenuto generato. Oggetto: " + content.subject);

  var result = _createBrevoNewsletterDraft(content.subject, content.html);
  console.log("Bozza Brevo creata. Vai su brevo.com per revisionare e inviare.");
  return result;
}

function _getWeekNumber(d) {
  var oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
}

function _fetchHealthNews() {
  var query = encodeURIComponent("ipertensione OR cardiologia OR telemedicina OR infermiere domiciliare");
  var url = "https://news.google.com/rss/search?q=" + query + "&hl=it&gl=IT&ceid=IT:it";

  try {
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var doc = XmlService.parse(resp.getContentText());
    var items = doc.getRootElement().getChild("channel").getChildren("item");

    var articles = [];
    for (var i = 0; i < Math.min(items.length, 8); i++) {
      var item = items[i];
      articles.push({
        title: item.getChildText("title") || "",
        link: item.getChildText("link") || "",
        description: (item.getChildText("description") || "").replace(/<[^>]+>/g, "").substring(0, 250)
      });
    }
    return articles;
  } catch (e) {
    console.log("Errore fetch RSS: " + e.toString());
    return [];
  }
}

function _generateNewsletterContent(articles) {
  var claudeKey = PropertiesService.getScriptProperties().getProperty("CLAUDE_API_KEY");
  if (!claudeKey || claudeKey === "INCOLLA_QUI_LA_TUA_CLAUDE_API_KEY") {
    console.log("Claude API key non configurata. Esegui setupClaudeKey().");
    return null;
  }

  var articlesText = articles.map(function(a, i) {
    return (i + 1) + ". " + a.title + (a.description ? "\n   " + a.description : "");
  }).join("\n\n");

  var now = new Date();
  var meseAnno = Utilities.formatDate(now, "Europe/Rome", "MMMM yyyy");

  var prompt = "Sei un assistente di Angelo Rosso, infermiere professionale. "
    + "Crea una newsletter email per pazienti e famiglie interessati a ECG, Holter e assistenza infermieristica domiciliare "
    + "(servizi attivi a Francofonte, Lentini, Carlentini — Sicilia). "
    + "Tono: professionale ma caldo, rassicurante.\n\n"
    + "Notizie di salute recenti (seleziona le più rilevanti, ignora le irrilevanti):\n\n"
    + articlesText + "\n\n"
    + "Rispondi SOLO con JSON valido, nessun testo prima o dopo:\n"
    + "{\n"
    + "  \"subject\": \"oggetto email accattivante max 60 caratteri, includi il mese " + meseAnno + "\",\n"
    + "  \"html\": \"HTML completo della newsletter (solo body content, stile inline). "
    + "Struttura: header rosso #B22222 con nome Angelo Rosso Infermiere, "
    + "sezione notizie del mese (2-3 articoli con breve commento), "
    + "consiglio di salute pratico del mese, "
    + "CTA bottone rosso per prenotare visita domiciliare (link: https://cal.com/angelorosso), "
    + "footer con unsubscribe placeholder {{unsubscribe}}. Max 600px width.\"\n"
    + "}";

  var payload = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  };

  try {
    var resp = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var result = JSON.parse(resp.getContentText());
    if (result.error) {
      console.log("Claude API error: " + JSON.stringify(result.error));
      return null;
    }

    var text = result.content[0].text;
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("Claude non ha restituito JSON. Risposta: " + text.substring(0, 300));
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.log("Errore Claude API: " + e.toString());
    return null;
  }
}

function _createBrevoNewsletterDraft(subject, htmlContent) {
  var apiKey = _brevoKey();
  if (!apiKey || apiKey === "INCOLLA_QUI_LA_TUA_API_KEY") {
    console.log("Brevo API key non configurata.");
    return null;
  }

  var listId = parseInt(PropertiesService.getScriptProperties().getProperty("BREVO_LIST_ID") || "0");
  var dateStr = Utilities.formatDate(new Date(), "Europe/Rome", "dd/MM/yyyy");

  var payload = {
    name: "Newsletter AI - " + dateStr,
    subject: subject,
    htmlContent: htmlContent,
    sender: { name: "Angelo Rosso Infermiere", email: "angelo.rosso073@gmail.com" },
    recipients: { listIds: listId > 0 ? [listId] : [] }
  };

  var resp = UrlFetchApp.fetch(BREVO_API_URL + "/emailCampaigns", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var body = resp.getContentText();
  console.log("Brevo createCampaign [" + resp.getResponseCode() + "]: " + body);
  return JSON.parse(body);
}
