# Stato progetto - Sito Angelo Rosso

Ultimo aggiornamento: 28 aprile 2026

## 1. Sintesi rapida

Il progetto e un sito statico per promuovere servizi sanitari domiciliari e telemedicina locale.

Il servizio e centrato su:

1. ECG a domicilio.
2. Holter ECG a domicilio.
3. Holter pressorio a domicilio.
4. Assistenza infermieristica domiciliare.

Area operativa principale:

1. Francofonte.
2. Lentini.
3. Carlentini.

Obiettivo principale del sito:

1. Far capire subito chi e Angelo Rosso.
2. Far capire subito quali servizi offre.
3. Far capire subito dove opera.
4. Portare il visitatore a contattare via WhatsApp o telefono.

## 2. Stato tecnico attuale

Il progetto e composto da file HTML, CSS e JavaScript statici. Non ci sono al momento framework, backend, database o sistema di build.

File principali:

1. `index.html`: file di ingresso. Reindirizza a `landing-onefile.html`.
2. `landing-onefile.html`: homepage principale consigliata. Contiene HTML, CSS e JavaScript incorporati.
3. `styles.css`: stylesheet collegato alla vecchia versione `index.html`, oggi secondario.
4. `progettazione-sito.md`: documento strategico iniziale del progetto.
5. `prompt-pro-landing.md`: prompt usato per impostare la landing page.
6. `prompt-pro-chatbot-clinico.md`: prompt professionale per evolvere il chatbot sanitario-informativo.

Materiali secondari:

1. `one-pager-francofonte.html`
2. `brochure-francofonte.html`
3. `brochure-definitiva.html`
4. `volantino-francofonte.html`
5. `cartello-bancone.html`
6. `cartello-parete-definitivo.html`
7. `assets/brochure/ecg-holter-pressorio.png`

## 3. Scelta operativa consigliata

La base da usare e `landing-onefile.html`.

Motivo:

1. E gia la versione piu completa.
2. Ha struttura one-page orientata al contatto.
3. Contiene gia sezioni servizi, area coperta, FAQ, CTA e chatbot.
4. Riduce dispersione rispetto a lavorare su piu versioni parallele.

Decisione pratica:

1. Consolidare `landing-onefile.html` come homepage definitiva.
2. Usare gli altri file come materiali di supporto o archivio.
3. Evitare di continuare a sviluppare contemporaneamente `index.html` e `landing-onefile.html`.

## 4. Stato del chatbot

Nel file `landing-onefile.html` esiste gia un widget chatbot.

Stato attuale:

1. Il chatbot e integrato nel sito.
2. Funziona con logica JavaScript locale.
3. Risponde tramite regole e parole chiave.
4. Prepara una richiesta WhatsApp.
5. Non e ancora collegato a un vero modello AI.

Limite importante:

Il chatbot attuale non e ancora un vero chatbot intelligente. E un assistente a regole, quindi puo rispondere solo a casi previsti nel codice.

Nuovo asset creato:

`prompt-pro-chatbot-clinico.md`

Questo file contiene il prompt professionale per trasformare il chatbot in un assistente sanitario-informativo con:

1. competenze su ECG, Holter ECG, Holter pressorio e assistenza infermieristica;
2. tono professionale e semplice;
3. limiti clinici chiari;
4. gestione dei sintomi cardiologici;
5. escalation verso 112/118 in caso di urgenza;
6. raccolta ordinata dei dati per WhatsApp;
7. attenzione alla privacy sanitaria.

## 5. Criticita principali

### Criticita 1 - Chatbot ancora troppo limitato

Il chatbot attuale non puo sostenere una conversazione clinica realistica.

Per renderlo davvero efficace serve:

1. backend leggero;
2. collegamento a un modello AI;
3. prompt clinico-informativo;
4. regole di sicurezza non aggirabili;
5. filtro per urgenze e sintomi critici;
6. tracciamento minimo delle richieste o invio ordinato a WhatsApp.

### Criticita 2 - Promesse operative da validare

Prima della pubblicazione definitiva bisogna confermare:

1. tempi reali di intervento;
2. tempi reali di refertazione;
3. eventuale referto urgente;
4. prezzi finali;
5. prestazioni realmente erogabili;
6. prestazioni che richiedono prescrizione o indicazione medica;
7. titolo professionale esatto da mostrare nel sito.

### Criticita 3 - Compliance sanitaria

Il sito tratta un ambito sanitario. Quindi deve evitare:

1. diagnosi online;
2. promesse di risultato;
3. frasi che possano sostituire medico o pronto soccorso;
4. raccolta inutile di dati sanitari sensibili;
5. messaggi commerciali aggressivi su sintomi potenzialmente seri.

Serve mantenere sempre:

1. disclaimer chiaro;
2. invito a chiamare 112/118 in caso di urgenza;
3. distinzione tra informazione generale e valutazione clinica reale.

## 6. Priorita operative

### Priorita alta

1. Rendere `landing-onefile.html` la homepage definitiva.
2. Ripulire testi e promesse non validate.
3. Migliorare il chatbot esistente con risposte piu sicure e piu utili.
4. Integrare il prompt `prompt-pro-chatbot-clinico.md` in una futura versione AI.
5. Verificare privacy, disclaimer e gestione dati sanitari.

### Priorita media

1. Migliorare SEO locale per Francofonte, Lentini e Carlentini.
2. Migliorare CTA WhatsApp.
3. Rafforzare le FAQ.
4. Separare meglio testi commerciali e informazioni sanitarie.
5. Valutare una pagina privacy dedicata.

### Priorita bassa

1. Ordinare cartelle e file archivio.
2. Spostare i materiali secondari in una cartella `materiali/` o `docs/`.
3. Creare versioni stampa definitive per brochure, cartello e volantino.

## 7. Roadmap consigliata

### Fase 1 - Stabilizzazione sito

Obiettivo:

Preparare una versione pubblicabile della landing.

Azioni:

1. Revisionare `landing-onefile.html`.
2. Eliminare frasi troppo forti o non confermate.
3. Rendere il copy piu naturale e meno generato.
4. Controllare mobile, leggibilita e CTA.
5. Rafforzare disclaimer sanitario.

### Fase 2 - Chatbot serio ma sicuro

Obiettivo:

Passare da chatbot a regole a chatbot realmente utile.

Azioni:

1. Usare `prompt-pro-chatbot-clinico.md` come base ufficiale.
2. Definire backend per chiamate AI.
3. Impostare blocchi rigidi per emergenze.
4. Limitare diagnosi, farmaci e interpretazione referti.
5. Generare riepilogo WhatsApp ordinato.
6. Testare conversazioni critiche prima della pubblicazione.

### Fase 3 - Pubblicazione

Obiettivo:

Mettere online una versione solida.

Azioni:

1. Verificare dominio e hosting.
2. Impostare meta title e description.
3. Controllare performance.
4. Testare link telefono e WhatsApp.
5. Aggiungere pagina privacy se necessaria.
6. Pubblicare solo dopo validazione dei contenuti sanitari.

## 8. Modello AI consigliato

Per lavorare sul progetto con Codex o API AI:

1. Modello principale consigliato: `GPT-5.5`.
2. Alternativa solida: `gpt-5.4`.
3. Modello economico per micro-task: `gpt-5.4-mini`.

Scelta consigliata:

Usare `GPT-5.5` per le parti strategiche, clinico-informative, copy e architettura del chatbot.

Motivo:

Il progetto non richiede solo codice. Richiede giudizio su comunicazione sanitaria, UX, conversione, sicurezza e limiti clinici.

## 9. Prossimo task migliore

Il prossimo task piu utile e:

**Rifare il chatbot dentro `landing-onefile.html` usando la logica del prompt clinico, mantenendolo sicuro e orientato al contatto WhatsApp.**

Ordine consigliato:

1. Migliorare prima il chatbot a regole gia presente.
2. Aggiungere riconoscimento dei sintomi urgenti.
3. Aggiungere risposte clinico-informative semplici.
4. Migliorare raccolta dati per WhatsApp.
5. Solo dopo valutare integrazione AI vera con backend.

## 10. Cosa fare adesso

Step immediati:

1. Confermare se i prezzi attuali sono definitivi.
2. Confermare se `Referti Fast ECG`, `Holter cardiaco` e `Holter pressorio` sono nomi corretti.
3. Confermare quali prestazioni infermieristiche sono realmente erogate.
4. Confermare se il sito deve restare statico o se puo usare un backend.
5. Procedere con la revisione del chatbot in `landing-onefile.html`.
