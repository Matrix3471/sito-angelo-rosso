# Raccolta dati chatbot con Airtable

## 1. Obiettivo

Collegare il chatbot del sito alla raccolta dati operativa senza rendere pubblici i CSV interni e senza inserire chiavi API nel sito.

## 2. Struttura Airtable

Crea una base chiamata `Angelo Rosso - Telemedicina`.

Crea una tabella chiamata `Richieste` con questi campi:

1. `Data richiesta`
2. `Nome richiedente`
3. `Nome paziente`
4. `Telefono`
5. `Email`
6. `Comune`
7. `Servizio richiesto`
8. `Rapporto con paziente`
9. `Eta indicativa`
10. `Motivo breve`
11. `Prescrizione indicazione`
12. `Giorno richiesto`
13. `Orario richiesto`
14. `Orario preferito`
15. `Esito disponibilita`
16. `Alternative proposte`
17. `Note pratiche`
18. `Consenso ricontatto`
19. `Fonte`
20. `Stato`
21. `Note operatore`

Nota operativa:

`Data richiesta` indica il giorno in cui il cliente compila la richiesta. Il giorno dell'appuntamento va invece nel campo `Giorno richiesto`.

Scelta consigliata: in Airtable gestisci `Data richiesta` come campo automatico `Created time` oppure compilalo manualmente. Il chatbot non lo precompila, per evitare errori di data causati da fuso orario o interpretazione del form.

Nel form Airtable controlla anche i testi delle sezioni: se sotto `Dati del paziente` compare una dicitura come `Ristoranti dela richiesta`, va corretta nel form builder di Airtable, non nel codice del sito.

Valori consigliati per `Stato`:

1. `Da verificare`
2. `Da richiamare`
3. `Richiamato`
4. `Prenotato`
5. `Non interessato`
6. `Non contattabile`

## 3. Collegamento al sito

Nel file `landing-onefile.html` cerca questa riga:

```js
const airtableRequestFormUrl = "";
```

Dopo aver creato il form Airtable, incolla il link del form tra le virgolette.

Esempio:

```js
const airtableRequestFormUrl = "https://airtable.com/appXXXXXX/pagXXXXXX/form";
```

## 4. Uso con la dashboard

La dashboard legge il file `richieste_contatto.csv`.

Per aggiornare la dashboard:

1. esporta la tabella `Richieste` da Airtable in formato CSV;
2. rinomina il file esportato in `richieste_contatto.csv`;
3. sostituisci il file nella cartella principale del progetto;
4. aggiorna la dashboard.

## 5. Regole privacy operative

1. Raccogli solo dati essenziali.
2. Non chiedere referti o dettagli clinici nel chatbot.
3. Lascia ogni richiesta in stato `Da verificare`.
4. Non trasformare automaticamente una richiesta in paziente.
5. Non inviare email automatiche da questa prima versione.
