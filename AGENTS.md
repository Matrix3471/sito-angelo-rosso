# AGENTS.md — Sito Angelo Rosso

**Repo GitHub**: https://github.com/angelo-infermiere/TelemedicinaFrancofonte (pubblico)
**Sito live**: https://angelo-infermiere.github.io/TelemedicinaFrancofonte/ (GitHub Pages, branch `master`, root `/`)

> Contesto per agenti AI (Codex, Claude Code, ecc.) che lavorano su questo progetto.

## Identità del progetto

Sito statico per **Angelo Rosso**, infermiere libero professionista.
Obiettivo: generare contatti via WhatsApp/telefono per servizi sanitari domiciliari.
Area operativa: **Francofonte, Lentini, Carlentini** (SR, Sicilia).

## Stack tecnico

- **100% statico**: HTML + CSS + JS vanilla. Niente framework, niente backend, niente Node.
- `index.html` — homepage definitiva, servita da GitHub Pages come sito in produzione (file principale, self-contained)
- `landing-onefile.BACKUP.html` — vecchia versione, non più in uso (index.html non fa più redirect, contiene la pagina intera)
- `styles.css` — fogli stile separati (alcune pagine li usano, landing-onefile è self-contained)
- CSV locali: `Pazienti.csv`, `consultazioni.csv`, `bilanci.csv`, `newsletter.csv`, `chatbot_interactions.csv`, `richieste_contatto.csv`, `agenda_disponibilita.csv`
- Mirror Excel: cartella `excel/` (stessi dati in .xlsx)
- Docs: cartella `docs/`

## File principali

| File | Ruolo |
|------|-------|
| `index.html` | Homepage definitiva IN PRODUZIONE — tutto inline (CSS + JS + HTML) |
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

## Stato attuale (2026-08-27)

- Sito **pubblicato e live** su GitHub Pages: https://angelo-infermiere.github.io/TelemedicinaFrancofonte/
- `index.html` = unico file servito in produzione (branch `master`, root `/`)
- Altri file HTML in root (`landing-v3.html`, `Senza titoloCodice.html`, `mpiglr53-...html`, `landing-onefile.BACKUP.html`, `dashboard-fidelizzazione.html`, file in `materiali-promozionali-2026/`) sono bozze/backup/materiali stampa, NON collegati alla build Pages
- Dashboard fidelizzazione creata ma non testata su dati reali

## Prossimi step prioritari

1. Validare promesse operative nel copy (tempi risposta, prezzi) prima di ogni modifica
2. Ripulire root dai file HTML non più in uso (bozze/backup) per evitare confusione su quale sia il file live

## Regole OBBLIGATORIE per ogni modifica

- **NO diagnosi** — nel chatbot, nel copy, ovunque
- **SEMPRE escalation 112/118** per urgenze nel chatbot
- **SEMPRE disclaimer sanitario** presente nella pagina
- **Solo dati necessari** nella raccolta contatti (minimizzazione GDPR)
- Promesse operative (es. "referto in 15 min", "disponibile 24h") → **non aggiungere/modificare** senza conferma esplicita del proprietario
- CTA principale sempre verso **WhatsApp** o **telefono** — niente form complessi

## Convenzioni codice

- JS vanilla: no import, no require, no bundler
- CSS inline in `index.html` — non separare in file esterno
- Variabili JS configurabili raccolte in blocco `// CONFIG` all'inizio degli script
- Niente dipendenze npm — file singoli autocontenuti
- Commenti in italiano
