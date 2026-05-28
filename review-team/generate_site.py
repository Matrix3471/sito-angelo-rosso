#!/usr/bin/env python3
"""
Angelo Rosso — Site Generator v2
Parte da landing-onefile.html (layout garantito).
Il Copywriter Sanitario migliora i testi informali.
Il JS Generator migliora chatbot e integrazione Sheets.

Uso:
  set ANTHROPIC_API_KEY=sk-ant-...
  python review-team\generate_site.py
  python review-team\generate_site.py --skip-js   (solo copy, niente JS)
"""

import sys
import os
import re
import time
from pathlib import Path
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import anthropic
except ImportError:
    sys.exit("Errore: pip install anthropic")

try:
    from bs4 import BeautifulSoup, NavigableString
    BS4_OK = True
except ImportError:
    sys.exit("Errore: pip install beautifulsoup4")

# ─── CONFIG ──────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
REVIEW_DIR   = Path(__file__).parent
SOURCE_HTML  = PROJECT_ROOT / "landing-onefile.html"
OUTPUT_HTML  = PROJECT_ROOT / "landing-v2.html"

MODEL = "claude-sonnet-4-6"

CANONICAL = {
    "whatsapp": "393315677922",
    "phone": "3315677922",
    "email": "angelo.rosso073@gmail.com",
    "sheet_url": "https://script.google.com/macros/s/AKfycbx9jIDN38OdALDsx9cNCIe0gM9BWXqKf47doQ2rruITImL7wug2sT1XWI7rYw5HcRpu5A/exec",
    "prezzi": {
        "ECG domicilio": "€25",
        "Holter ECG 24h": "€45",
        "Holter pressorio 24h": "€50",
        "Assistenza infermieristica": "da €25",
    },
    "zone": "Francofonte, Lentini, Carlentini",
    "nome": "Angelo Rosso",
    "titolo": "Infermiere Professionale",
}

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def get_client():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        sys.exit("\nErrore: ANTHROPIC_API_KEY non impostata.\n")
    return anthropic.Anthropic(api_key=key)

_client = None

def run_agent(label: str, system: str, prompt: str, max_tokens: int = 4096) -> str:
    global _client
    if _client is None:
        _client = get_client()
    print(f"  -> {label}...", end="", flush=True)
    try:
        resp = _client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text
        print(f" OK ({len(text):,} chars)")
        return text
    except anthropic.RateLimitError:
        print(" rate limit — attendo 60s...")
        time.sleep(60)
        return run_agent(label, system, prompt, max_tokens)
    except Exception as e:
        print(f" ERRORE ({type(e).__name__}): {e}")
        return ""

def find_latest_report() -> str:
    reports = sorted(REVIEW_DIR.glob("report-*.md"), reverse=True)
    if reports:
        print(f"  Report trovato: {reports[0].name}")
        return reports[0].read_text(encoding="utf-8", errors="replace")[:6000]
    return ""

# ─── STEP 1: COPYWRITER SANITARIO ────────────────────────────────────────────

COPYWRITER_SYSTEM = """Sei un copywriter esperto di comunicazione sanitaria istituzionale italiana.
Scrivi per strutture e professionisti sanitari accreditati.

REGOLE TASSATIVE:
- Usa sempre "domicilio" (mai "casa vostra", "a casa", "salotto")
- Usa "paziente" o "Lei" (mai "tu", "voi", "il tuo")
- Titoli: descrittivi e precisi, non slogan pubblicitari o frasi metaforiche
- Niente esclamazioni o puntini di sospensione
- CTA: dirette ("Prenoti su WhatsApp", "Contatti Angelo Rosso")
- Nessuna promessa non verificabile ("sempre disponibile", "massima cura")
- Tono: professionale, rassicurante, autorevole — come un medico di famiglia
- Usa termini clinici corretti ma spiegali in parentesi se necessario
- Frasi brevi, struttura chiara

ESEMPIO CORRETTO:
  Titolo: "Elettrocardiogramma domiciliare"
  Descrizione: "L'esame viene eseguito al domicilio del paziente dall'infermiere."

ESEMPIO DA EVITARE:
  Titolo: "Il cuore controllato, senza uscire di casa"
  Descrizione: "Veniamo da te nel tuo salotto!"
"""

def extract_text_for_copywriter(soup: BeautifulSoup) -> str:
    """Estrae i testi che il copywriter deve migliorare."""
    sections = []

    # Hero
    h1 = soup.find("h1")
    if h1:
        sections.append(f"[HERO_H1]\n{h1.get_text(strip=True)}")
    eyebrow = soup.find(class_="eyebrow")
    if eyebrow:
        sections.append(f"[HERO_EYEBROW]\n{eyebrow.get_text(strip=True)}")
    lead = soup.find(class_="lead")
    if lead:
        sections.append(f"[HERO_LEAD]\n{lead.get_text(strip=True)}")
    panel_title = soup.find(class_="panel-title")
    if panel_title:
        sections.append(f"[PANEL_TITLE]\n{panel_title.get_text(strip=True)}")
    # Panel paragraph (after panel-title)
    if panel_title:
        panel_p = panel_title.find_next_sibling("p")
        if panel_p:
            sections.append(f"[PANEL_P]\n{panel_p.get_text(strip=True)}")

    # CTA buttons
    btns = soup.find_all(class_=re.compile(r"button"))
    for i, btn in enumerate(btns[:4]):
        t = btn.get_text(strip=True)
        if t:
            sections.append(f"[CTA_{i+1}]\n{t}")

    # H2 section titles
    for i, h2 in enumerate(soup.find_all("h2")):
        t = h2.get_text(strip=True)
        if t and "panel" not in str(h2.get("class", "")):
            sections.append(f"[SECTION_H2_{i+1}]\n{t}")

    # Service card descriptions (h3 already good, only improve descriptions)
    for i, card in enumerate(soup.find_all(class_="service-card")[:4]):
        p = card.find("p")
        if p:
            sections.append(f"[SERVICE_DESC_{i+1}]\n{p.get_text(strip=True)}")

    # Come funziona step descriptions
    for i, step in enumerate(soup.find_all(class_=re.compile(r"step"))[:4]):
        p = step.find("p")
        if p:
            sections.append(f"[STEP_P_{i+1}]\n{p.get_text(strip=True)}")

    # FAQ answers
    for i, faq in enumerate(soup.find_all(class_=re.compile(r"faq"))[:6]):
        p = faq.find("p")
        if p:
            sections.append(f"[FAQ_P_{i+1}]\n{p.get_text(strip=True)}")

    return "\n\n".join(sections)


def step_copywriter(current_texts: str, report: str) -> str:
    system = COPYWRITER_SYSTEM
    prompt = f"""Riscrivi i seguenti testi del sito di Angelo Rosso (infermiere professionale domiciliare,
Francofonte/Lentini/Carlentini SR) seguendo le regole di comunicazione sanitaria.

Per ogni etichetta [LABEL], riscrivi il testo mantenendo la stessa etichetta.
Non aggiungere etichette nuove. Non omettere etichette.
Mantieni la lunghezza simile all'originale (±20%).

TESTI DA MIGLIORARE:
{current_texts}

CRITICITÀ DA CORREGGERE (dal report di revisione):
{report[:1500]}

DATI FISSI (non modificare):
- Nome: Angelo Rosso — Infermiere Professionale
- ECG domicilio: €25 | Holter ECG 24h: €45 | Holter pressorio 24h: €50 | Assistenza: da €25
- Zone: Francofonte, Lentini, Carlentini
- WhatsApp: +39 331 567 7922

Rispondi SOLO con le etichette e i testi riscritti, nessun commento."""

    return run_agent("Copywriter Sanitario", system, prompt, max_tokens=6000)


def parse_copywriter_output(text: str) -> dict:
    """Parsa output strutturato [LABEL]\\ntesto → {LABEL: testo}."""
    result = {}
    pattern = re.compile(r'\[([A-Z0-9_]+)\]\s*\n(.*?)(?=\n\[|$)', re.DOTALL)
    for m in pattern.finditer(text):
        key = m.group(1).strip()
        val = m.group(2).strip()
        if val:
            result[key] = val
    return result


def apply_copy_to_html(soup: BeautifulSoup, copy: dict) -> BeautifulSoup:
    """Applica il nuovo copy ai nodi HTML corrispondenti."""

    def replace_text(el, new_text):
        if el is None or not new_text:
            return
        # Rimuovi tutti i nodi figli che sono solo testo
        for child in list(el.children):
            if isinstance(child, NavigableString):
                child.extract()
        # Riscrivi il testo mantenendo eventuali tag figli (link, span)
        # Se ci sono tag figli importanti, aggiorna solo il primo nodo testo
        has_child_tags = any(
            not isinstance(c, NavigableString)
            for c in el.children
        )
        if has_child_tags:
            # Inserisci il nuovo testo come primo figlio
            el.insert(0, NavigableString(new_text + " "))
        else:
            el.clear()
            el.append(NavigableString(new_text))

    # Hero H1
    if "HERO_H1" in copy:
        h1 = soup.find("h1")
        if h1:
            h1.clear()
            h1.append(NavigableString(copy["HERO_H1"]))

    # Hero eyebrow
    if "HERO_EYEBROW" in copy:
        el = soup.find(class_="eyebrow")
        if el:
            el.clear()
            el.append(NavigableString(copy["HERO_EYEBROW"]))

    # Hero lead
    if "HERO_LEAD" in copy:
        el = soup.find(class_="lead")
        if el:
            el.clear()
            el.append(NavigableString(copy["HERO_LEAD"]))

    # Panel title
    if "PANEL_TITLE" in copy:
        el = soup.find(class_="panel-title")
        if el:
            el.clear()
            el.append(NavigableString(copy["PANEL_TITLE"]))

    # Panel paragraph
    if "PANEL_P" in copy:
        pt = soup.find(class_="panel-title")
        if pt:
            el = pt.find_next_sibling("p")
            if el:
                el.clear()
                el.append(NavigableString(copy["PANEL_P"]))

    # CTAs
    btns = [b for b in soup.find_all(class_=re.compile(r"button")) if b.get_text(strip=True)][:4]
    for i, btn in enumerate(btns):
        key = f"CTA_{i+1}"
        if key in copy:
            # Preserva eventuali SVG/icone, aggiorna solo il testo
            texts = [c for c in btn.children if isinstance(c, NavigableString)]
            if texts:
                for t in texts:
                    t.replace_with(NavigableString(copy[key]))
            else:
                # Fallback: aggiungi testo
                btn.append(NavigableString(copy[key]))

    # Section H2s
    h2s = [h for h in soup.find_all("h2") if "panel" not in str(h.get("class", ""))]
    for i, h2 in enumerate(h2s):
        key = f"SECTION_H2_{i+1}"
        if key in copy:
            h2.clear()
            h2.append(NavigableString(copy[key]))

    # Service card descriptions
    for i, card in enumerate(soup.find_all(class_="service-card")[:4]):
        key = f"SERVICE_DESC_{i+1}"
        if key in copy:
            p = card.find("p")
            if p:
                p.clear()
                p.append(NavigableString(copy[key]))

    # Come funziona steps
    for i, step in enumerate(soup.find_all(class_=re.compile(r"step"))[:4]):
        key = f"STEP_P_{i+1}"
        if key in copy:
            p = step.find("p")
            if p:
                p.clear()
                p.append(NavigableString(copy[key]))

    # FAQ answers
    for i, faq in enumerate(soup.find_all(class_=re.compile(r"faq"))[:6]):
        key = f"FAQ_P_{i+1}"
        if key in copy:
            p = faq.find("p")
            if p:
                p.clear()
                p.append(NavigableString(copy[key]))

    return soup


# ─── STEP 2: JS GENERATOR (opzionale) ────────────────────────────────────────

JS_SYSTEM = """Sei un frontend developer JavaScript expert.
Genera SOLO il blocco <script>...</script> completo.
Inizia DIRETTAMENTE con <script>. Finisci con </script>. Niente markdown."""

def step_generate_js(report: str) -> str:
    prompt = f"""Genera il JavaScript completo per il sito di Angelo Rosso, infermiere professionale domiciliare.

CRITICITÀ DAL REPORT:
{report[:1000]}

CONFIG OBBLIGATORIA:
const CONFIG = {{
  whatsapp: "{CANONICAL['whatsapp']}",
  phone: "{CANONICAL['phone']}",
  email: "{CANONICAL['email']}",
  sheetUrl: "{CANONICAL['sheet_url']}",
  prezzi: {{
    ecg: "€25",
    holterEcg: "€45",
    holterPressorio: "€50",
    assistenza: "da €25"
  }}
}};

CHATBOT — risposte obbligatorie (rule-based, no AI):
- keyword "urgenza/dolore/petto/respiro/svenimento" → PRIMA risposta: chiamare 112/118
- keyword "ecg/elettrocardiogramma" → descrizione clinica + €25 + link WhatsApp
- keyword "holter ecg" → descrizione clinica + €45 + link WhatsApp
- keyword "holter pressorio/pressione" → descrizione clinica + €50 + link WhatsApp
- keyword "assistenza/infermiere/medicazione" → descrizione + da €25 + link WhatsApp
- keyword "prezzi/costo/quanto/tariffe" → lista prezzi completa
- keyword "zona/dove/comune/francofonte/lentini/carlentini" → area operativa
- keyword "prenot/appuntamento/quando" → avvia booking flow

BOOKING FLOW (6 step sequenziali):
  0: "Può indicare il suo nome?"
  1: "Quale prestazione Le serve? ECG / Holter ECG / Holter pressorio / Assistenza infermieristica"
  2: "In quale comune si trova? (Francofonte, Lentini, Carlentini o altro)"
  3: "Per chi è la prestazione e qual è il motivo clinico?"
  4: "Quale fascia oraria preferisce? Mattina / Pomeriggio / Sera"
  5: "Note aggiuntive? (piano, difficoltà di deambulazione, ecc.) — risponda 'nessuna' se non ve ne sono"

Fine booking:
- Genera messaggio WhatsApp strutturato con tutti i dati
- Chiama sendToSheet(data) per registrare su Google Sheets

sendToSheet(data):
- Invia a CONFIG.sheetUrl via new Image().src (bypass CORS)
- Parametri: action, nome, servizio, comune, motivo, fascia, note, timestamp

ALTRI COMPORTAMENTI:
- FAQ accordion: click su domanda toggle risposta
- Scroll reveal: IntersectionObserver su elementi .reveal (opacity 0→1, translateY 24→0)
- Sticky WhatsApp bar: visibile su mobile dopo 200px scroll, nascosta sopra
- Newsletter form (#newsletter-form): invia email a Sheets con action=newsletter
- NO dipendenze esterne. JS vanilla ES6+.

Inizia con <script> e finisci con </script>."""

    return run_agent("JS Generator", JS_SYSTEM, prompt, max_tokens=14000)


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    skip_js = "--skip-js" in sys.argv

    print("=" * 60)
    print("  ANGELO ROSSO — SITE GENERATOR v2")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 60)

    if not SOURCE_HTML.exists():
        sys.exit(f"\nErrore: {SOURCE_HTML} non trovato.\n")

    print(f"\nBase: {SOURCE_HTML.name}")
    report = find_latest_report()

    t0 = time.time()

    # Step 1: Carica HTML originale
    print("\n[STEP 1] Caricamento HTML originale...")
    html_src = SOURCE_HTML.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(html_src, "html.parser")
    print(f"  Caricato: {len(html_src):,} chars")

    # Step 2: Copywriter Sanitario
    print("\n[STEP 2] Estrazione testi per Copywriter...")
    current_texts = extract_text_for_copywriter(soup)
    print(f"  Testi estratti: {len(current_texts):,} chars")

    print("\n[STEP 3] Copywriter Sanitario...")
    new_copy_raw = step_copywriter(current_texts, report)

    if not new_copy_raw:
        print("  WARN: Copywriter output vuoto — uso testi originali")
        new_copy = {}
    else:
        new_copy = parse_copywriter_output(new_copy_raw)
        print(f"  Sezioni aggiornate: {len(new_copy)}")
        # Salva per revisione
        copy_path = REVIEW_DIR / f"copy-{datetime.now().strftime('%Y%m%d-%H%M')}.md"
        copy_path.write_text(new_copy_raw, encoding="utf-8")
        print(f"  Copy salvato: {copy_path.name}")

    # Step 3: Applica copy all'HTML
    print("\n[STEP 4] Applicazione copy...")
    soup = apply_copy_to_html(soup, new_copy)

    # Step 4: JS Generator (opzionale)
    if not skip_js:
        print("\n[STEP 5] JS Generator...")
        new_js = step_generate_js(report)

        if new_js and "<script" in new_js:
            # Sostituisce l'ultimo <script> nel documento (quello principale)
            scripts = soup.find_all("script")
            main_script = None
            for s in reversed(scripts):
                if s.get("type") not in ("application/ld+json",) and not s.get("src"):
                    # Prende lo script più lungo (= quello del chatbot)
                    if len(s.get_text()) > 500:
                        main_script = s
                        break
            if main_script:
                # Estrai contenuto JS (senza tag)
                js_content = re.sub(r'^<script[^>]*>', '', new_js, flags=re.I)
                js_content = re.sub(r'</script>\s*$', '', js_content, flags=re.I)
                main_script.clear()
                main_script.append(NavigableString(js_content))
                print("  JS sostituito nel documento")
            else:
                print("  WARN: script principale non trovato — JS non sostituito")
        else:
            print("  WARN: JS Generator output vuoto — JS originale mantenuto")
    else:
        print("\n[STEP 5] JS Generator saltato (--skip-js)")

    # Step 5: Salva
    print("\n[STEP 6] Salvataggio...")
    final_html = str(soup)
    # Fix encoding: assicura UTF-8 meta charset
    if 'charset="UTF-8"' not in final_html and "charset=UTF-8" not in final_html:
        final_html = final_html.replace("<head>", '<head>\n  <meta charset="UTF-8">', 1)

    OUTPUT_HTML.write_text(final_html, encoding="utf-8")

    elapsed = int(time.time() - t0)
    size_kb = len(final_html) // 1024

    print(f"\n{'=' * 60}")
    print(f"  File generato: landing-v2.html  ({size_kb} KB)")
    print(f"  Tempo:         {elapsed // 60}m {elapsed % 60}s")
    print("=" * 60)
    print()
    print("  Apri nel browser e confronta con landing-onefile.html")
    print()


if __name__ == "__main__":
    main()
