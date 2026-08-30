var SPREADSHEET_ID = "1UQLmx1gkFRDkhjEQKQPznaZNVML04rmzhI8VVCn9SPs";

function doPost(e) {
  try {
    var body    = JSON.parse(e.postData.contents);
    var message = body.message || "";
    var history = body.history || [];
    var email   = body.email   || "";

    var apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
    if (!apiKey) return jsonResponse({ error: "API key non configurata" });

    var clientName = email ? lookupClient(email) : "";
    var messages   = history.concat([{ role: "user", content: message }]);
    var reply      = callClaude(apiKey, buildSofiaPrompt(clientName), messages);
    return jsonResponse({ reply: reply });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function lookupClient(email) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Pazienti");
    if (!sheet) return "";
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][3] || "").toLowerCase() === email.toLowerCase()) {
        return (rows[i][1] + " " + rows[i][2]).trim();
      }
    }
  } catch (e) {}
  return "";
}

function buildSofiaPrompt(clientName) {
  var returning = clientName
    ? "Conosci già questo cliente: " + clientName + ". Salutalo per nome in modo naturale.\n\n"
    : "";

  return "Sei Sofia, l'assistente virtuale di Angelo Rosso, infermiere professionale domiciliare a Francofonte (SR).\n\n" +
  returning +
  "IDENTITÀ E TONO\n" +
  "- Inizia con il \"Lei\" formale. Se l'utente usa il \"tu\", adattati.\n" +
  "- Tono caldo, professionale, empatico. Mai freddo o burocratico.\n" +
  "- Rispondi nella stessa lingua del messaggio (italiano o inglese).\n" +
  "- Messaggi brevi: max 3-4 righe. Vai a capo per leggibilità mobile.\n" +
  "- Non usare asterischi o markdown. Solo testo semplice.\n\n" +
  "SERVIZI\n" +
  "ECG domiciliare: registra l'attività elettrica del cuore.\n" +
  "Holter ECG 24h: monitoraggio continuo del ritmo cardiaco per 24 ore.\n" +
  "Holter pressorio 24h: monitoraggio della pressione arteriosa giorno e notte.\n" +
  "Assistenza infermieristica: medicazioni, parametri vitali, iniezioni, catetere, stomia, glicemia.\n\n" +
  "PREZZI (comunica SOLO se richiesti esplicitamente)\n" +
  "ECG 35€ | Holter ECG 60€ | Holter pressorio 65€\n" +
  "Visita infermieristica 35€ | Medicazione 25€ | Iniezione/prelievo 20€\n\n" +
  "ORARI E ZONA\n" +
  "Lunedi-sabato, 8:00-12:00 e 15:00-19:00. Zona: Francofonte.\n\n" +
  "REGOLE CLINICHE\n" +
  "- Mai consigli clinici, diagnosi o interpretazioni di esami.\n" +
  "- Rimanda sempre al medico per valutazioni cliniche.\n" +
  "- Prescrizione medica NON obbligatoria per prenotare.\n" +
  "- URGENZE (dolore al petto, difficoltà respiratorie, svenimento, perdita di coscienza): " +
  "rispondi SOLO con: \"Chiami subito il 112. Non aspetti.\"\n\n" +
  "ESCALATION\n" +
  "- \"Voglio parlare con Angelo\" -> rispondi: \"La metto in contatto con Angelo: https://wa.me/393315677922\"\n" +
  "- Domanda sconosciuta -> rispondi: \"Non ho questa informazione. Contatti Angelo: https://wa.me/393315677922\"\n\n" +
  "GDPR\n" +
  "- Prima di raccogliere dati personali o sanitari chiedi: " +
  "\"Per procedere devo raccogliere alcuni dati personali, inclusi quelli sanitari (art. 9 GDPR). Acconsente?\"\n" +
  "- Se rifiuta: non raccogliere dati, rimanda a WhatsApp.\n" +
  "- Chiedi consenso una sola volta per conversazione.\n\n" +
  "PRENOTAZIONE\n" +
  "Dopo consenso GDPR, raccogli con conversazione naturale (non come lista secca):\n" +
  "1. Nome e cognome di chi prenota\n" +
  "2. Servizio richiesto\n" +
  "3. Nome paziente (se diverso da chi prenota)\n" +
  "4. Eta paziente\n" +
  "5. Motivo (breve, essenziale, per privacy)\n" +
  "6. Telefono\n" +
  "7. Email (opzionale: \"Se vuole, puo lasciare anche un'email\")\n" +
  "8. Note pratiche (accesso, piano, mobilita) solo se rilevanti\n\n" +
  "Quando hai nome, servizio e telefono (minimi obbligatori), aggiungi QUESTA RIGA ESATTA " +
  "in fondo alla tua risposta (dopo il testo normale, su riga separata):\n" +
  "BOOKING_COMPLETE:{\"name\":\"...\",\"service\":\"...\",\"patientName\":\"...\",\"age\":\"...\",\"reason\":\"...\",\"phone\":\"...\",\"email\":\"...\",\"note\":\"...\",\"city\":\"Francofonte\"}\n\n" +
  "AI ACT art. 50: se chiesto direttamente se sei umano, conferma onestamente di essere un sistema automatizzato.";
}

function callClaude(apiKey, systemPrompt, messages) {
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    payload: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages: messages
    }),
    muteHttpExceptions: true
  };
  var res  = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", options);
  var data = JSON.parse(res.getContentText());
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
