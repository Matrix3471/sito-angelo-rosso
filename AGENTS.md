# AGENTS.md — Sito Angelo Rosso

> Contesto per agenti AI (Codex, Claude Code, ecc.) che lavorano su questo progetto.

## Identità del progetto

Sito statico per **Angelo Rosso**, infermiere libero professionista.
Obiettivo: generare contatti via WhatsApp/telefono per servizi sanitari domiciliari.
Area operativa: **Francofonte, Lentini, Carlentini** (SR, Sicilia).

## Stack tecnico

- **100% statico**: HTML + CSS + JS vanilla. Niente framework, niente backend, niente Node.
- `landing-onefile.html` — homepage definitiva (file principale, ~169KB)
- `index.html` — redirect a `landing-onefile.html`
- `styles.css` — fogli stile separati (alcune pagine li usano, landing-onefile è self-contained)
- CSV locali: `Pazienti.csv`, `consultazioni.csv`, `bilanci.csv`, `newsletter.csv`, `chatbot_interactions.csv`, `richieste_contatto.csv`, `agenda_disponibilita.csv`
- Mirror Excel: cartella `excel/` (stessi dati in .xlsx)
- Docs: cartella `docs/`

## File principali

| File | Ruolo |
|------|-------|
| `landing-onefile.html` | Homepage definitiva — tutto inline (CSS + JS + HTML) |
| `index.html` | Redirect a landing-onefile.html |
| `dashboard-fidelizzazione.html` | Dashboard che legge i CSV locali |
| `brochure-definitiva.html` | Brochure stampabile servizi |
| `cartello-parete-definitivo.html` | Cartello A3 per studi/farmacie |
| `cartello-bancone.html` | Cartello banco per partner |
| `volantino-francofonte.html` | Volantino distribuzione locale |
| `one-pager-francofonte.html` | One-pager B2B per partner |
| `assets/chatbot/` | Widget Tawk.to + system prompt chatbot |
| `docs/airtable-raccolta-dati.md` | Spec integrazione Airtable (non ancora attiva) |

## Servizi offerti (usare prezzi esatti)

- ECG a domicilio
- Holter ECG a domicilio
- Holter pressorio a domicilio
- Holter cardiaco a domicilio
- Assistenza infermieristica: visita domiciliare, medicazione, iniezione/prelievo

## Stato attuale (2026-05-07)

- Chatbot rule-based funzionante (dentro `landing-onefile.html`) — non AI
- `airtableRequestFormUrl` — variabile JS presente nel codice, da compilare con URL form reale
- Airtable: struttura documentata in `docs/airtable-raccolta-dati.md`, **non ancora collegata**
- Sito **non ancora pubblicato** su dominio/hosting
- Dashboard fidelizzazione creata ma non testata su dati reali

## Prossimi step prioritari

1. Collegare Airtable form (`airtableRequestFormUrl` → URL form Airtable)
2. Migliorare chatbot: riconoscimento sintomi urgenti + raccolta dati → WhatsApp
3. Pubblicare su hosting statico (Netlify/Vercel/GitHub Pages) + dominio
4. Validare promesse operative nel copy (tempi risposta, prezzi) prima del lancio

## Regole OBBLIGATORIE per ogni modifica

- **NO diagnosi** — nel chatbot, nel copy, ovunque
- **SEMPRE escalation 112/118** per urgenze nel chatbot
- **SEMPRE disclaimer sanitario** presente nella pagina
- **Solo dati necessari** nella raccolta contatti (minimizzazione GDPR)
- Promesse operative (es. "referto in 15 min", "disponibile 24h") → **non aggiungere/modificare** senza conferma esplicita del proprietario
- CTA principale sempre verso **WhatsApp** o **telefono** — niente form complessi

## Convenzioni codice

- JS vanilla: no import, no require, no bundler
- CSS inline in `landing-onefile.html` — non separare in file esterno
- Variabili JS configurabili raccolte in blocco `// CONFIG` all'inizio degli script
- Niente dipendenze npm — file singoli autocontenuti
- Commenti in italiano
