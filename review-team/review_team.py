#!/usr/bin/env python3
"""
Angelo Rosso — AI Review Team
Multi-agente: sito eccellente + marketing + compliance legale
Output: report Markdown con analisi completa + piano d'azione

Agenti:
  1. Market Researcher   — ricerca concorrenti web
  2. Copywriter Sanitario
  3. Compliance Legale
  4. SEO Locale
  5. UX/UI Reviewer
  6. CRO Specialist
  7. Tech Developer
  8. Debate Moderator    — mette a confronto tutti
  9. Orchestratore       — report finale esecutivo

Uso:
  pip install -r requirements.txt
  set ANTHROPIC_API_KEY=sk-ant-...
  python review_team.py
"""

import sys
import os
import time
import json
from pathlib import Path
from datetime import datetime

# Fix encoding su Windows (cmd/PowerShell con cp1252)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── DIPENDENZE ──────────────────────────────────────────────────────────────

try:
    import anthropic
except ImportError:
    sys.exit("Errore: anthropic non installato. Esegui: pip install anthropic")

try:
    from duckduckgo_search import DDGS
    SEARCH_OK = True
except ImportError:
    SEARCH_OK = False
    print("AVVISO: duckduckgo-search non installato — ricerca web disabilitata.")
    print("        Installa con: pip install duckduckgo-search\n")

try:
    from bs4 import BeautifulSoup
    BS4_OK = True
except ImportError:
    BS4_OK = False

# ─── CONFIG ──────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
TIMESTAMP = datetime.now().strftime("%Y%m%d-%H%M")
OUTPUT_FILE = PROJECT_ROOT / "review-team" / f"report-{TIMESTAMP}.md"

MODEL_SPECIALIST = "claude-sonnet-4-6"
MODEL_DEBATE     = "claude-sonnet-4-6"
MODEL_FINAL      = "claude-sonnet-4-6"

MAX_TOKENS = 4096

# Limite caratteri per singolo agente (risparmio token)
LANDING_CHARS = 30000
BROCHURE_CHARS = 8000

# ─── CARICAMENTO FILE ────────────────────────────────────────────────────────

def load_project_context() -> dict:
    files = {
        "landing":         PROJECT_ROOT / "landing-onefile.html",
        "chatbot_prompt":  PROJECT_ROOT / "assets/chatbot/system-prompt-tawk.txt",
        "agents_md":       PROJECT_ROOT / "AGENTS.md",
        "stato_progetto":  PROJECT_ROOT / "STATO PROGETTO .md",
        "newsletter_html": PROJECT_ROOT / "emails/newsletter-estate-2026.html",
        "brochure":        PROJECT_ROOT / "brochure-definitiva.html",
        "apps_script":     PROJECT_ROOT / "apps-script/richieste.gs",
    }

    context = {}
    for key, path in files.items():
        if path.exists():
            content = path.read_text(encoding="utf-8", errors="replace")
            context[key] = content
            print(f"  ✓ {path.name}  ({len(content):,} chars)")
        else:
            context[key] = ""
            print(f"  — {path.name}  (non trovato)")

    return context


def extract_text_from_html(html: str) -> str:
    if BS4_OK and html:
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        return soup.get_text(separator="\n", strip=True)
    return html


def build_site_summary(context: dict) -> str:
    landing_text = extract_text_from_html(context.get("landing", ""))
    brochure_text = extract_text_from_html(context.get("brochure", ""))

    # Estrai anche meta tags dall'HTML raw
    landing_raw = context.get("landing", "")
    meta_block = ""
    for line in landing_raw.splitlines():
        if any(tag in line for tag in ["<title", "<meta ", "<h1", "<h2", "og:"]):
            meta_block += line.strip() + "\n"

    return f"""=== META / SEO TAGS ===
{meta_block[:3000]}

=== TESTO VISIBILE LANDING (estratto) ===
{landing_text[:LANDING_CHARS]}

=== BROCHURE (testo) ===
{brochure_text[:BROCHURE_CHARS]}

=== CHATBOT SYSTEM PROMPT ===
{context.get('chatbot_prompt', 'N/D')}

=== APPS SCRIPT (integrazione backend) ===
{context.get('apps_script', 'N/D')[:4000]}

=== AGENTS.md ===
{context.get('agents_md', 'N/D')}
"""

# ─── API HELPER ──────────────────────────────────────────────────────────────

_client = None

def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            sys.exit(
                "\nErrore: ANTHROPIC_API_KEY non impostata.\n"
                "Imposta con:  set ANTHROPIC_API_KEY=sk-ant-...\n"
            )
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def run_agent(label: str, system: str, prompt: str, model: str = MODEL_SPECIALIST) -> str:
    print(f"  → {label}...", end="", flush=True)
    try:
        resp = get_client().messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text
        print(f" ✓ ({len(text):,} chars)")
        return text
    except anthropic.RateLimitError:
        print(" ⚠ rate limit — attendo 60s...")
        time.sleep(60)
        return run_agent(label, system, prompt, model)
    except Exception as e:
        print(f" ✗ ERRORE: {e}")
        return f"[Agente {label} — errore: {e}]"

# ─── FASE 1: RICERCA DI MERCATO ───────────────────────────────────────────────

def phase_market_research() -> str:
    print("\n[FASE 1] Ricerca di mercato concorrenti...")

    queries = [
        "ECG holter domicilio Francofonte Lentini Carlentini",
        "infermiere domiciliare Lentini prezzi",
        "holter cardiaco ECG domicilio Siracusa Sicilia",
        "servizi infermieristici domiciliari provincia Siracusa",
        "telemedicina domiciliare Sicilia orientale prezzi",
        "ECG a domicilio costo Italia 2025",
    ]

    raw_results = []
    if SEARCH_OK:
        for q in queries:
            try:
                with DDGS() as ddgs:
                    results = list(ddgs.text(q, max_results=4, region="it-it"))
                if results:
                    raw_results.append(f'\n### "{q}"')
                    for r in results:
                        title = r.get("title", "?")
                        url   = r.get("href", "")
                        body  = r.get("body", "")[:250]
                        raw_results.append(f"- **{title}**\n  {url}\n  {body}")
                time.sleep(0.8)
            except Exception as e:
                raw_results.append(f'### "{q}" — errore: {e}')
    else:
        raw_results.append("Ricerca web non disponibile (duckduckgo-search non installato).")

    search_data = "\n".join(raw_results)

    system = (
        "Sei un analista di mercato specializzato in servizi sanitari territoriali italiani. "
        "Lavori solo con dati reali. Se i dati sono insufficienti lo dici esplicitamente. "
        "Non inventi concorrenti o prezzi."
    )

    prompt = f"""Analizza il mercato dei servizi infermieristici/diagnostici domiciliari
in provincia di Siracusa, Sicilia orientale.

CONTESTO — PROGETTO:
Angelo Rosso, infermiere professionale libero.
Servizi: ECG domicilio, Holter ECG, Holter pressorio, assistenza infermieristica domiciliare.
Zona: Francofonte, Lentini, Carlentini (SR).
Prezzi landing: ECG €25 · Holter ECG €45 · Holter pressorio €50.
Prezzi chatbot system prompt: ECG €38 · Holter cardiaco €60 · Holter pressorio €48.
[NB: c'è un'incongruenza di prezzi tra i due file — annotalo]

RISULTATI RICERCA WEB:
{search_data}

Produci analisi markdown con:
## 1. Concorrenti identificati
(con URL, tipo di servizio, punti di forza)

## 2. Analisi prezzi
(Angelo vs mercato — è sopra/sotto/in linea?)

## 3. Posizionamento competitivo
(cosa lo differenzia, cosa no)

## 4. Gap e opportunità
(cosa la concorrenza non copre bene)

## 5. Minacce
(rischi competitivi concreti)

## 6. Raccomandazioni strategiche
(3-5 azioni concrete basate sui dati)
"""

    return run_agent("Market Researcher", system, prompt)

# ─── FASE 2: REVISIONI SPECIALISTICHE ────────────────────────────────────────

def phase_specialist_reviews(site_summary: str) -> dict:
    print("\n[FASE 2] Revisioni specialistiche...")

    specs = {

        "copywriter": (
            "Copywriter Sanitario",
            (
                "Sei un copywriter esperto in comunicazione sanitaria italiana. "
                "Conosci D.Lgs. 145/2007, Codice Deontologico Infermieri OPI, conversion copywriting. "
                "Sei diretto e costruttivo. Ogni critica ha una proposta concreta."
            ),
            f"""Analizza il copy del sito di Angelo Rosso, infermiere professionale
(ECG, Holter, assistenza domiciliare — Francofonte/Lentini/Carlentini, SR).

MATERIALI:
{site_summary}

Valuta:
## 1. Efficacia copy — voto /10
(hero headline, sottotitolo, CTA, FAQ, newsletter)

## 2. Frasi problematiche
(promesse non mantenibili, tono sbagliato, rischio legale)

## 3. Riscritture consigliate
(almeno 5 esempi PRIMA → DOPO)

## 4. Opportunità di copy mancate
(messaggi potenti non sfruttati per questo target)

## 5. Priorità intervento
(ordine urgenza: cosa cambiare prima del lancio vs. dopo)
"""
        ),

        "compliance": (
            "Consulente Compliance Sanitaria",
            (
                "Sei un consulente legale specializzato in diritto sanitario italiano e GDPR. "
                "Conosci: D.Lgs. 145/2007 (pubblicità sanitaria), D.Lgs. 196/2003, GDPR 2016/679, "
                "Codice Deontologico Infermieri OPI, normative su libera professione infermieristica. "
                "Distingui rischi reali da teorici. Sei preciso ma non allarmista."
            ),
            f"""Analizza la compliance legale del sito e dei materiali di Angelo Rosso,
infermiere libero professionista in Sicilia.

MATERIALI:
{site_summary}

Valuta:
## 1. Criticità ALTA (blocca il lancio)
(rischi legali immediati con norma di riferimento)

## 2. Criticità MEDIA (entro 3 mesi dal lancio)

## 3. Cosa è già conforme
(punti positivi — già rispetta le norme)

## 4. Disclaimer obbligatori mancanti o insufficienti

## 5. GDPR: raccolta dati e chatbot
(consenso, informativa, dati sanitari nel chatbot)

## 6. Azioni prioritarie
(lista ordinata — cosa fare prima del lancio)
"""
        ),

        "seo": (
            "SEO Locale Specialist",
            (
                "Sei un esperto SEO con focus su SEO locale italiano e siti healthcare. "
                "Conosci: Google Business Profile, Local Pack, schema markup MedicalBusiness, "
                "E-E-A-T per siti sanitari, Core Web Vitals, keyword locali italiane."
            ),
            f"""Analizza il potenziale SEO locale del sito di Angelo Rosso.
Target geografico: Francofonte, Lentini, Carlentini (SR, Sicilia).

MATERIALI:
{site_summary}

Valuta:
## 1. Meta title e description
(analisi attuale + riscrittura consigliata)

## 2. Struttura headings H1/H2/H3
(keyword locale ottimizzazione)

## 3. Schema markup da implementare
(codice JSON-LD consigliato per LocalBusiness/MedicalBusiness/FAQPage)

## 4. Keyword strategiche mancanti
(almeno 10 — con intento di ricerca e volume stimato)

## 5. Google Business Profile
(azioni concrete da fare — categoria, servizi, foto, recensioni)

## 6. Link building locale
(fonti concrete: medici di base, farmacie, comuni, stampa locale SR)

## 7. Quick win SEO
(cosa implementare entro 1 settimana)
"""
        ),

        "ux": (
            "UX/UI Designer",
            (
                "Sei un UX designer specializzato in siti per professionisti sanitari locali. "
                "Focus su: accessibilità WCAG 2.1 AA, UX per anziani 65+ e familiari, "
                "mobile-first, funnel di conversione verso WhatsApp."
            ),
            f"""Analizza UX e UI del sito di Angelo Rosso.
Target: familiari di anziani (40-65), anziani diretti (65+), caregiver.
Obiettivo conversione: click WhatsApp o chiamata.

MATERIALI:
{site_summary}

Valuta:
## 1. Primo schermo (hero)
(chiarezza messaggio nei primi 5 secondi)

## 2. Accessibilità per anziani
(font, contrasto, touch target, leggibilità, gergo)

## 3. Mobile experience
(criticità specifiche mobile)

## 4. Flusso verso conversione
(dal click al WhatsApp — dove si perde l'utente)

## 5. Gerarchia visiva
(cosa funziona, cosa no)

## 6. Quick win UX
(5 modifiche immediate, alto impatto, bassa difficoltà)

## 7. Modifiche strutturali
(più lavoro ma impatto significativo)
"""
        ),

        "cro": (
            "CRO Specialist",
            (
                "Sei uno specialista in Conversion Rate Optimization per servizi locali e sanitari. "
                "Analizzi funnel, CTA, friction, trust signal, urgency etica, social proof. "
                "Ogni raccomandazione è basata su behavioral psychology e best practice CRO."
            ),
            f"""Analizza le opportunità CRO del sito di Angelo Rosso.
Conversione target: click WhatsApp o chiamata telefonica.

MATERIALI:
{site_summary}

Valuta:
## 1. CTA analysis — voto /10
(posizione, copy, colore, frequenza, micro-copy)

## 2. Trust signal
(cosa c'è, cosa manca — testimonianze, certificazioni, numeri concreti)

## 3. Friction point
(cosa rallenta o blocca la conversione)

## 4. Urgency / Scarcity etiche
(opportunità non sfruttate — senza manipolazione)

## 5. Above the fold
(tutto il necessario per convertire è visibile senza scroll?)

## 6. Test A/B prioritari
(3-5 test con ipotesi chiara e metrica di successo)

## 7. Quick win CRO
(5 modifiche immediate che aumentano la conversione)
"""
        ),

        "tech": (
            "Full-Stack Developer",
            (
                "Sei uno sviluppatore full-stack esperto in siti statici, chatbot, performance e sicurezza web. "
                "Analizzi HTML/CSS/JS, identifichi bug, inconsistenze, problemi di sicurezza e best practice. "
                "Sei concreto — ogni problema ha una soluzione specifica."
            ),
            f"""Analizza gli aspetti tecnici del sito di Angelo Rosso (sito statico HTML/CSS/JS vanilla).

MATERIALI (incluso codice):
{site_summary}

Identifica:
## 1. Bug e inconsistenze
(includi: prezzi diversi tra file, variabili non utilizzate, logica errata)

## 2. Performance
(cosa rallenta il caricamento, suggerimenti concreti)

## 3. Sicurezza
(XSS, dati esposti, form, API key nel codice)

## 4. Chatbot — analisi tecnica
(limitazioni attuali, step di miglioramento senza backend)

## 5. Integrazione Google Sheets / Brevo
(problemi nel codice, suggerimenti)

## 6. Accessibilità tecnica
(ARIA, alt text, focus management, HTML semantico)

## 7. Priorità tecniche
(cosa risolvere prima del lancio vs. dopo)
"""
        ),

        "marketing": (
            "Digital Marketing Strategist",
            (
                "Sei un digital marketing strategist specializzato in PMI di servizi locali italiani. "
                "Pianifichi strategie multicanale con ROI misurabile per budget limitati. "
                "Conosci Google Ads locali, Facebook/Instagram per over 50, referral B2B nel settore sanitario."
            ),
            f"""Analizza la strategia di marketing per Angelo Rosso, infermiere domiciliare.
Zona: Francofonte, Lentini, Carlentini (SR).
Budget presumibilmente limitato (libero professionista singolo).

MATERIALI:
{site_summary}

Valuta:
## 1. Canali prioritari
(Google Business Profile, Google Ads locali, Facebook, passaparola B2B)

## 2. Strategia Google Business Profile
(azioni specifiche per dominare le ricerche locali)

## 3. Google Ads locali
(campagna consigliata, keyword, budget minimo, copy annunci)

## 4. Facebook/Instagram
(strategia per raggiungere famiglie di anziani — contenuti, targeting)

## 5. Referral B2B
(come conquistare medici di base e farmacie come fonti di segnalazione)

## 6. Email marketing / newsletter
(valutazione strategia attuale Brevo + suggerimenti)

## 7. Budget consigliato
(allocazione mensile indicativa per ogni canale)

## 8. KPI da monitorare
(metriche concrete: richieste WhatsApp, chiamate, costo per contatto)
"""
        ),
    }

    results = {}
    for key, (label, system, prompt) in specs.items():
        results[key] = run_agent(label, system, prompt)
        time.sleep(1.5)

    return results

# ─── FASE 3: DIBATTITO ────────────────────────────────────────────────────────

def phase_debate(specialist_outputs: dict, market_research: str) -> str:
    print("\n[FASE 3] Dibattito tra specialisti...")

    summaries = []
    for key, text in specialist_outputs.items():
        # Prendi le prime 1500 chars di ogni analisi per il debate
        summaries.append(f"### {key.upper()}\n{text[:1500]}\n[...truncato]")

    all_reviews = "\n\n---\n\n".join(summaries)

    system = (
        "Sei un senior advisor con 20 anni di esperienza in strategia digitale per PMI sanitarie italiane. "
        "Identifichi contraddizioni, stabili priorità concrete, fai scelte difficili. "
        "Sei diretto, pragmatico, non diplomatico."
    )

    prompt = f"""Il tuo team di 7 specialisti ha analizzato il sito e la strategia di Angelo Rosso
(infermiere domiciliare, Francofonte/Lentini/Carlentini, SR).

RICERCA DI MERCATO:
{market_research[:2000]}
[...truncato]

ANALISI SPECIALISTI (estratti):
{all_reviews}

Produci la sintesi critica:
## 1. Consenso trasversale
(problemi citati da più specialisti — alta priorità assoluta)

## 2. Contraddizioni tra specialisti
(dove non sono d'accordo — chi ha ragione e perché)

## 3. Rischi ignorati o sottovalutati
(cosa nessuno ha evidenziato abbastanza)

## 4. TOP 10 AZIONI
(lista unica ordinata per impatto × urgenza)
| # | Azione | Specialista | Urgenza | Impatto |
|---|--------|-------------|---------|---------|

## 5. Cosa NON fare
(azioni che sembrano buone ma sono sbagliate per questo caso specifico)

## 6. Quick wins — Settimana 1
(azioni eseguibili da Angelo stesso, senza tecnici, in 7 giorni)

## 7. Roadmap 90 giorni
| Fase | Periodo | Obiettivo | Azioni chiave |
|------|---------|-----------|---------------|
"""

    return run_agent("Debate Moderator", system, prompt, model=MODEL_DEBATE)

# ─── FASE 4: REPORT FINALE ────────────────────────────────────────────────────

def phase_final_report(
    market_research: str,
    specialist_outputs: dict,
    debate: str,
) -> str:
    print("\n[FASE 4] Report finale esecutivo...")

    system = (
        "Sei l'orchestratore del team di revisione AI. "
        "Sintetizzi tutto in un report esecutivo chiaro, azionabile, prioritizzato. "
        "Scrivi per un professionista sanitario non tecnico. "
        "Usa linguaggio semplice, esempi concreti, azioni specifiche."
    )

    prompt = f"""Sintetizza il lavoro del team AI in un report esecutivo per Angelo Rosso,
infermiere professionale che vuole: sito eccellente + marketing efficace + compliance legale.

SINTESI DIBATTITO:
{debate}

RICERCA MERCATO (estratto):
{market_research[:1500]}

ANALISI COPYWRITER (estratto):
{specialist_outputs.get('copywriter', '')[:800]}

ANALISI COMPLIANCE (estratto):
{specialist_outputs.get('compliance', '')[:800]}

ANALISI SEO (estratto):
{specialist_outputs.get('seo', '')[:600]}

ANALISI MARKETING (estratto):
{specialist_outputs.get('marketing', '')[:600]}

Produci il REPORT ESECUTIVO FINALE:

# GIUDIZIO COMPLESSIVO
| Area | Voto /10 | Motivazione |
|------|----------|-------------|
| Sito (design + UX) | | |
| Copy e messaggi | | |
| Compliance legale | | |
| SEO locale | | |
| Marketing | | |
| Tecnica | | |
| **Media globale** | | |

# PUNTI DI FORZA
(cosa funziona già — 5-7 punti)

# PROBLEMI CRITICI — DA RISOLVERE PRIMA DEL LANCIO
(ogni problema: descrizione + soluzione specifica + chi lo risolve)

# PIANO D'AZIONE 90 GIORNI

## Settimana 1 — Angelo lo fa da solo (zero budget)

## Mese 1 — Priorità alta (piccolo investimento)

## Mese 2-3 — Crescita e ottimizzazione

# BUDGET CONSIGLIATO
| Voce | Costo indicativo | Priorità |
|------|-----------------|----------|

# LA COSA PIÙ IMPORTANTE
(un paragrafo — la singola azione più urgente prima di andare online)
"""

    return run_agent("Orchestratore", system, prompt, model=MODEL_FINAL)

# ─── ASSEMBLA E SALVA REPORT ─────────────────────────────────────────────────

def build_full_report(
    market_research: str,
    specialist_outputs: dict,
    debate: str,
    final_report: str,
) -> str:
    section = lambda title, content: f"\n\n---\n\n# {title}\n\n{content}"

    parts = [
        f"# Angelo Rosso — AI Review Team Report",
        f"*Generato il {datetime.now().strftime('%d/%m/%Y alle %H:%M')}*\n",
        f"**Modello:** {MODEL_SPECIALIST}  |  **Agenti:** 9",
        "",
        "---",
        "",
        "# REPORT ESECUTIVO",
        "",
        final_report,
    ]

    appendix_map = {
        "APPENDICE A — Ricerca di Mercato":        market_research,
        "APPENDICE B — Copywriter Sanitario":       specialist_outputs.get("copywriter", ""),
        "APPENDICE C — Compliance Legale":          specialist_outputs.get("compliance", ""),
        "APPENDICE D — SEO Locale":                 specialist_outputs.get("seo", ""),
        "APPENDICE E — UX/UI Review":               specialist_outputs.get("ux", ""),
        "APPENDICE F — CRO Specialist":             specialist_outputs.get("cro", ""),
        "APPENDICE G — Tech Developer":             specialist_outputs.get("tech", ""),
        "APPENDICE H — Marketing Strategist":       specialist_outputs.get("marketing", ""),
        "APPENDICE I — Dibattito e Sintesi":        debate,
    }

    for title, content in appendix_map.items():
        parts.append(section(title, content))

    return "\n".join(parts)

# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    banner = "=" * 60
    print(f"\n{banner}")
    print("  ANGELO ROSSO — AI REVIEW TEAM")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print(banner)

    print("\nCaricamento file progetto...")
    context = load_project_context()
    site_summary = build_site_summary(context)
    print(f"\n  Contesto sito: {len(site_summary):,} chars totali")

    t0 = time.time()

    market_research     = phase_market_research()
    specialist_outputs  = phase_specialist_reviews(site_summary)
    debate              = phase_debate(specialist_outputs, market_research)
    final_report        = phase_final_report(market_research, specialist_outputs, debate)

    report = build_full_report(market_research, specialist_outputs, debate, final_report)

    OUTPUT_FILE.write_text(report, encoding="utf-8")

    elapsed = int(time.time() - t0)
    print(f"\n{banner}")
    print(f"  ✓ Report salvato: {OUTPUT_FILE.name}")
    print(f"  Dimensione: {len(report):,} caratteri")
    print(f"  Tempo totale: {elapsed // 60}m {elapsed % 60}s")
    print(banner)
    print(f"\n  Apri il report con:")
    print(f"  review-team\\{OUTPUT_FILE.name}")
    print()


if __name__ == "__main__":
    main()
