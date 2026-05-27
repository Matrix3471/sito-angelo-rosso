#!/usr/bin/env python3
"""
Angelo Rosso — Agente prenotazioni automatico
Legge/scrive su Google Sheets via Apps Script (Richieste, Agenda, Pazienti, Consultazioni).
Trigger email post-prestazione: 1g / 7g / 30g / 90g da Consultazioni.

Variabili d'ambiente richieste:
  ANTHROPIC_API_KEY  — chiave Claude API
  APPS_SCRIPT_URL    — URL deployment Apps Script (stesso usato dalla dashboard)
  BREVO_API_KEY      — chiave Brevo (se assente: dry run, nessuna email inviata)

Uso manuale:
  python agent_prenotazioni.py

Uso automatico (Task Scheduler):
  powershell -File setup_task_scheduler.ps1
"""

import sys
import os
import json
import logging
import urllib.parse
import requests
from pathlib import Path
from datetime import date, datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import anthropic
except ImportError:
    sys.exit("Errore: pip install anthropic")

# ─── CONFIG ──────────────────────────────────────────────────────────────────

BASE_DIR        = Path(__file__).parent
LOG_FILE        = BASE_DIR / "agent_prenotazioni.log"
APPS_SCRIPT_URL = os.environ.get("APPS_SCRIPT_URL", "")

BREVO_API_URL = "https://api.brevo.com/v3"
SENDER_EMAIL  = "angelo.rosso073@gmail.com"
SENDER_NAME   = "Angelo Rosso – Infermiere Domiciliare"
MODEL         = "claude-haiku-4-5-20251001"

TRIGGER_RULES = [
    {"day":  1, "key": "feedback",      "label": "Ringraziamento e feedback"},
    {"day":  7, "key": "education",     "label": "Contenuto educativo"},
    {"day": 30, "key": "relationship",  "label": "Relazione e mantenimento"},
    {"day": 90, "key": "soft_reminder", "label": "Promemoria soft"},
]

# ─── LOGGING ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ─── SHEETS UTILS ────────────────────────────────────────────────────────────

def _normalize(value) -> str:
    return str(value or "").strip().lower().replace(" ", "_")


def sheets_read(sheet_name: str) -> list[dict]:
    """Legge un tab da Google Sheets via Apps Script."""
    if not APPS_SCRIPT_URL:
        log.error("APPS_SCRIPT_URL non configurata")
        return []
    try:
        r = requests.get(
            APPS_SCRIPT_URL,
            params={"action": "read", "sheet": sheet_name},
            timeout=20,
            allow_redirects=True,
        )
        r.raise_for_status()
        data = r.json()
        if "error" in data or not data.get("headers"):
            return []
        headers = [_normalize(h) for h in data["headers"]]
        rows = []
        for row in data["rows"]:
            if any(str(c).strip() for c in row):
                obj = {headers[i]: str(row[i] if i < len(row) else "") for i in range(len(headers))}
                rows.append(obj)
        return rows
    except Exception as e:
        log.error(f"sheets_read({sheet_name}): {e}")
        return []


def sheets_update_row(sheet_name: str, id_col: str, id_val: str, updates: dict) -> dict:
    """Aggiorna una riga in Google Sheets (match su id_col=id_val)."""
    if not APPS_SCRIPT_URL:
        return {"errore": "APPS_SCRIPT_URL non configurata"}
    try:
        params = {
            "action":   "update_row",
            "sheet":    sheet_name,
            "id_col":   id_col,
            "id_val":   id_val,
            "updates":  urllib.parse.quote(json.dumps(updates, ensure_ascii=False)),
        }
        r = requests.get(APPS_SCRIPT_URL, params=params, timeout=20, allow_redirects=True)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"errore": str(e)}


def is_yes(value: str) -> bool:
    return str(value or "").strip().lower() in ("si", "sì", "yes", "1", "true")

# ─── TOOL FUNCTIONS ──────────────────────────────────────────────────────────

def check_availability(data_richiesta: str, orario_preferito: str = "") -> dict:
    """Cerca slot liberi nel tab Agenda. Se vuoto, suggerisce Cal.com."""
    today_str = date.today().isoformat()
    target    = data_richiesta.strip() if data_richiesta else today_str
    try:
        agenda = sheets_read("Agenda")
        if not agenda:
            return {
                "slots_disponibili": [],
                "totale_disponibili": 0,
                "nota": "Tab Agenda non presente — indica al cliente il link Cal.com per prenotare",
            }
        slots = []
        for slot in agenda:
            stato_slot = slot.get("stato", slot.get("status", "")).strip().lower()
            if stato_slot not in ("libero", "free", "disponibile"):
                continue
            slot_date = slot.get("data", "").strip()
            slot_ora  = slot.get("ora", slot.get("ora_inizio", "")).strip()
            if slot_date < today_str:
                continue
            slots.append({
                "data":     slot_date,
                "ora":      slot_ora,
                "priorita": "richiesta" if slot_date == target else "alternativa",
            })
        slots.sort(key=lambda x: (x["data"], x["ora"]))
        return {"slots_disponibili": slots[:5], "totale_disponibili": len(slots)}
    except Exception as e:
        return {"errore": str(e)}


def update_richiesta(row_id: str, stato: str, esito: str, alternative: str, note: str) -> dict:
    """Aggiorna stato e note di una richiesta in Sheets (match su campo 'data')."""
    result = sheets_update_row("Richieste", "data", row_id, {
        "stato":          stato,
        "esito":          esito,
        "alternative":    alternative,
        "note_operatore": note,
    })
    if result.get("ok"):
        return {"ok": True, "riga": result.get("row"), "stato": stato}
    return result


def send_email_brevo(to_email: str, to_name: str, subject: str, body: str) -> dict:
    """Invia email tramite Brevo API. Dry run se BREVO_API_KEY assente."""
    api_key = os.environ.get("BREVO_API_KEY", "")
    if not api_key:
        log.warning("  [DRY RUN] BREVO_API_KEY non configurata — email non inviata")
        log.info(f"  [DRY RUN] A: {to_email} | Oggetto: {subject}")
        log.info(f"  [DRY RUN] Testo:\n{body[:300]}")
        return {"ok": True, "dry_run": True}
    headers = {
        "accept":       "application/json",
        "api-key":      api_key,
        "content-type": "application/json",
    }
    payload = {
        "sender":      {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to":          [{"email": to_email, "name": to_name}],
        "subject":     subject,
        "textContent": body,
    }
    try:
        r = requests.post(f"{BREVO_API_URL}/smtp/email", headers=headers, json=payload, timeout=10)
        r.raise_for_status()
        return {"ok": True, "message_id": r.json().get("messageId", "")}
    except requests.HTTPError:
        return {"errore": f"HTTP {r.status_code}: {r.text[:200]}"}
    except requests.RequestException as e:
        return {"errore": str(e)}


def update_patient_last_contact(patient_id: str, contact_date: str) -> dict:
    """Aggiorna data_ultimo_contatto in Pazienti (match su id)."""
    result = sheets_update_row("Pazienti", "id", patient_id, {"data_ultimo_contatto": contact_date})
    if result.get("ok"):
        return {"ok": True, "patient_id": patient_id, "data_contatto": contact_date}
    return result

# ─── TOOL SCHEMA ─────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "check_availability",
        "description": "Verifica slot liberi nel tab Agenda per una data e orario richiesti.",
        "input_schema": {
            "type": "object",
            "properties": {
                "data_richiesta":   {"type": "string", "description": "Data YYYY-MM-DD"},
                "orario_preferito": {"type": "string", "description": "Orario HH:MM o stringa vuota"},
            },
            "required": ["data_richiesta"],
        },
    },
    {
        "name": "update_richiesta",
        "description": "Aggiorna stato, esito e note di una richiesta in Google Sheets.",
        "input_schema": {
            "type": "object",
            "properties": {
                "row_id":      {"type": "string", "description": "Valore esatto del campo 'data' (timestamp ISO) della riga"},
                "stato":       {"type": "string", "enum": ["Prenotato", "In attesa conferma", "Non disponibile", "Da richiamare"]},
                "esito":       {"type": "string", "description": "Testo breve esito disponibilità"},
                "alternative": {"type": "string", "description": "Slot alternativi proposti, vuoto se non serve"},
                "note":        {"type": "string", "description": "Note operative"},
            },
            "required": ["row_id", "stato", "esito", "alternative", "note"],
        },
    },
    {
        "name": "send_email_brevo",
        "description": "Invia email al richiedente tramite Brevo.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to_email": {"type": "string"},
                "to_name":  {"type": "string"},
                "subject":  {"type": "string"},
                "body":     {"type": "string", "description": "Testo email completo, professionale"},
            },
            "required": ["to_email", "to_name", "subject", "body"],
        },
    },
    {
        "name": "update_patient_last_contact",
        "description": "Aggiorna data_ultimo_contatto in Pazienti dopo invio email trigger.",
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_id":   {"type": "string"},
                "contact_date": {"type": "string", "description": "Data YYYY-MM-DD"},
            },
            "required": ["patient_id", "contact_date"],
        },
    },
]

# ─── AGENT LOOP ──────────────────────────────────────────────────────────────

def run_agent(system_prompt: str, user_message: str, label: str = "") -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    system = [{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}]
    messages: list[dict] = [{"role": "user", "content": user_message}]

    for _ in range(10):
        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=system,
            tools=TOOLS,
            messages=messages,
            extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tag = f"[{label}] " if label else ""
                    log.info(f"  {tag}Tool: {block.name}({json.dumps(block.input, ensure_ascii=False)[:120]})")
                    result = _dispatch_tool(block.name, block.input)
                    log.info(f"  {tag}→ {result[:120]}")
                    tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
            messages.append({"role": "user", "content": tool_results})
        else:
            log.warning(f"Stop reason inatteso: {response.stop_reason}")
            break
    return ""


def _dispatch_tool(name: str, inputs: dict) -> str:
    dispatch = {
        "check_availability":          lambda: check_availability(
            inputs.get("data_richiesta", ""), inputs.get("orario_preferito", "")),
        "update_richiesta":            lambda: update_richiesta(
            inputs["row_id"], inputs["stato"], inputs["esito"], inputs["alternative"], inputs["note"]),
        "send_email_brevo":            lambda: send_email_brevo(
            inputs["to_email"], inputs["to_name"], inputs["subject"], inputs["body"]),
        "update_patient_last_contact": lambda: update_patient_last_contact(
            inputs["patient_id"], inputs["contact_date"]),
    }
    fn = dispatch.get(name)
    if fn is None:
        return json.dumps({"errore": f"Tool sconosciuto: {name}"})
    return json.dumps(fn(), ensure_ascii=False)

# ─── FLUSSO 1: PRENOTAZIONI ──────────────────────────────────────────────────

SYSTEM_BOOKING = """Sei l'assistente operativo di Angelo Rosso, infermiere domiciliare a Francofonte (SR).
Gestisci le richieste di prenotazione con professionalità e precisione.

Procedura obbligatoria:
1. Controlla disponibilità agenda (check_availability) per la data/orario richiesti
2a. Se slot disponibile nella data richiesta:
    - Aggiorna richiesta come "Prenotato" (update_richiesta con il row_id fornito)
    - Invia email di conferma al cliente (send_email_brevo)
2b. Se agenda vuota o nessuno slot disponibile:
    - Aggiorna come "In attesa conferma" (update_richiesta)
    - Invia email con link Cal.com per scegliere autonomamente: https://cal.com/angelo-rosso
2c. Se data nel passato e nessuno slot disponibile nei prossimi giorni:
    - Aggiorna come "Da richiamare"
    - Invia email di avviso

Tono email: professionale, cordiale, rassicurante.
Firma sempre: "Angelo Rosso\\nInfermiere Domiciliare\\nFrancofonte (SR) | Tel. 331 567 7922"
Non inventare slot non presenti in agenda.
Disclaimer: "Questo messaggio ha natura organizzativa e non sostituisce il parere medico."
"""

def process_bookings() -> None:
    log.info("─── FLUSSO 1: PRENOTAZIONI ───")
    richieste = sheets_read("Richieste")
    if not richieste:
        log.info("Nessuna richiesta trovata in Sheets")
        return

    pending = [
        row for row in richieste
        if (not row.get("stato") or row["stato"].strip().lower() == "da verificare")
        and is_yes(row.get("consenso", ""))
        and row.get("email", "").strip()
    ]

    if not pending:
        log.info("Nessuna richiesta da elaborare")
        return

    log.info(f"{len(pending)} richiesta/e da elaborare")

    for idx, row in enumerate(pending):
        nome     = row.get("nome", "").strip()
        email    = row.get("email", "").strip()
        servizio = row.get("servizio", "").strip()
        row_id   = row.get("data", "").strip()

        log.info(f"  [{idx}] Elaboro: {nome} — {servizio}")

        user_msg = f"""Nuova richiesta di prenotazione:

row_id (usa esatto in update_richiesta): {row_id}
Nome richiedente : {nome}
Nome paziente    : {row.get('paziente', '')}
Email            : {email}
Telefono         : {row.get('telefono', '')}
Servizio         : {servizio}
Comune           : {row.get('citta', '')}
Motivo           : {row.get('motivo', '')}
Prescrizione     : {row.get('prescrizione', '')}
Note             : {row.get('note', '')}

Oggi: {date.today().isoformat()}
Gestisci la prenotazione seguendo la procedura."""

        summary = run_agent(SYSTEM_BOOKING, user_msg, label=f"IDX{idx}")
        log.info(f"  [{idx}] Completato: {summary[:200]}")


# ─── FLUSSO 2: TRIGGER EMAIL ─────────────────────────────────────────────────

SYSTEM_TRIGGERS = """Sei l'assistente di relazione post-prestazione di Angelo Rosso, infermiere domiciliare.
Scrivi email di cura della relazione con i pazienti in base al tipo di trigger.

Regole:
- Tono professionale, caldo, mai commerciale
- Personalizza con nome paziente e servizio ricevuto
- Includi sempre: "Questa comunicazione ha finalità informativa e non sostituisce il parere del medico curante."
- Per urgenze cliniche indica sempre il medico di riferimento o il 118
- Firma: "Angelo Rosso\\nInfermiere Domiciliare\\nFrancofonte (SR)"

Tipi trigger:
- feedback (1g): ringraziamento, chiedi breve riscontro su organizzazione e puntualità
- education (7g): informazioni generali utili legate al servizio ricevuto
- relationship (30g): saluto cordiale, disponibilità per future necessità
- soft_reminder (90g): promemoria disponibilità servizi, nessun tono commerciale

Dopo invio email usa sempre update_patient_last_contact per aggiornare la data contatto.
"""

def process_triggers() -> None:
    log.info("─── FLUSSO 2: TRIGGER EMAIL ───")
    patients      = sheets_read("Pazienti")
    consultations = sheets_read("Consultazioni")

    if not patients:
        log.warning("Tab Pazienti vuoto o non trovato — skip trigger")
        return
    if not consultations:
        log.warning("Tab Consultazioni vuoto o non trovato — skip trigger")
        return

    today     = date.today()
    today_str = today.isoformat()

    latest_by_patient: dict[str, dict] = {}
    for c in consultations:
        pid = c.get("id_paziente", "").strip()
        d   = c.get("data_consultazione", "").strip()
        if pid and d:
            if pid not in latest_by_patient or d > latest_by_patient[pid]["data_consultazione"]:
                latest_by_patient[pid] = c

    triggered = 0
    for patient in patients:
        pid          = str(patient.get("id", "")).strip()
        nome         = patient.get("nome", "").strip()
        cognome      = patient.get("cognome", "").strip()
        email        = patient.get("email", "").strip()
        consenso     = patient.get("consenso_email", "").strip()
        no_contact   = patient.get("non_contattare", "").strip()
        last_contact = patient.get("data_ultimo_contatto", "").strip()

        if not is_yes(consenso):
            continue
        if is_yes(no_contact):
            continue
        if not email:
            continue
        if last_contact == today_str:
            continue

        latest = latest_by_patient.get(pid)
        if not latest:
            continue

        service_date_str = latest.get("data_consultazione", "").strip()
        try:
            service_date = date.fromisoformat(service_date_str)
        except ValueError:
            continue

        days_since = (today - service_date).days
        if days_since < 1:
            continue

        applicable_rule = None
        for rule in reversed(TRIGGER_RULES):
            if days_since >= rule["day"]:
                applicable_rule = rule
                break

        if not applicable_rule:
            continue

        log.info(f"  Trigger '{applicable_rule['key']}' ({days_since}g) → {nome} {cognome} <{email}>")

        user_msg = f"""Paziente:
ID       : {pid}
Nome     : {nome} {cognome}
Email    : {email}
Servizio : {latest.get('tipo_servizio', '').replace('_', ' ')} del {service_date_str}
Giorni   : {days_since} giorni fa
Trigger  : {applicable_rule['label']} ({applicable_rule['key']})
Oggi     : {today_str}

Scrivi e invia l'email di follow-up appropriata, poi aggiorna la data ultimo contatto."""

        summary = run_agent(SYSTEM_TRIGGERS, user_msg, label=f"P{pid}")
        log.info(f"  → {summary[:150]}")
        triggered += 1

    log.info(f"Trigger elaborati: {triggered}")


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main() -> None:
    log.info(f"{'='*60}")
    log.info(f"Agente avviato — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info(f"{'='*60}")

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Errore: variabile ANTHROPIC_API_KEY non configurata")
    if not APPS_SCRIPT_URL:
        sys.exit("Errore: variabile APPS_SCRIPT_URL non configurata")
    if not os.environ.get("BREVO_API_KEY"):
        log.warning("BREVO_API_KEY assente — modalità dry run (email non inviate)")

    process_bookings()
    process_triggers()
    log.info("Agente completato.")


if __name__ == "__main__":
    main()
