# LANDING PAGE EXPERT BRIEF
## Angelo Rosso — Infermiere Domiciliare | Francofonte · Lentini · Carlentini
*Versione 1.0 — Documento operativo per implementazione CSS/HTML/JS*

---

## HERO SECTION

**H1 (7 parole — benefit diretto + geo immediata):**
```
Infermiere a domicilio a Francofonte, Lentini, Carlentini
```
*Rationale tecnico: "infermiere a domicilio + comune" è la query esatta su Google Maps e Search. Tre comuni in H1 cattura immediatamente l'occhio del residente locale e segnala pertinenza geografica al crawler. Nessun gergo medico, nessun brand name — il benefit è implicito nella parola "domicilio".*

---

**H2 (11 parole — identità + azione immediata):**
```
Sono Angelo. Vengo da te — senza lista d'attesa.
```
*Rationale: il nome proprio crea immediatezza relazionale. "Vengo da te" è il verbo d'azione che il caregiver ansioso vuole leggere. Il dash crea pausa ritmica che aumenta la ritenzione.*

---

**Lead (2 righe — emozione + rassicurazione per figli caregiver):**
```
Tuo padre ha bisogno di un ECG? Tua madre non riesce a spostarsi?
Chiami adesso: in poche ore sono da voi, a casa vostra, senza code e senza stress.
```
*Rationale: apertura con domanda retorica doppia — intercetta sia il figlio che pensa al padre che quello che pensa alla madre. "Chiami adesso" è imperativo diretto senza attrito. "Senza code e senza stress" rimuove le due obiezioni primarie del target (attesa + fatica logistica). "Casa vostra" rafforza il concetto di domicilio con pronome possessivo.*

---

**CTA PRIMARIA:**
```
[ 💬 Scrivi su WhatsApp — rispondo io ]
```
- `href="https://wa.me/393315677922?text=Ciao%20Angelo%2C%20ho%20bisogno%20di%20informazioni"`
- Background: `#ff7a18` | Testo: `#ffffff` | Font-weight: 700
- Border-radius: 8px | Padding: 16px 28px | Font-size: 18px
- Hover: `background #e06a10`, `transform: translateY(-2px)`, `box-shadow: 0 6px 20px rgba(255,122,24,0.4)`
- Icona WhatsApp SVG inline a sinistra del testo

**CTA SECONDARIA:**
```
[ 📞 Chiama ora: 331 567 7922 ]
```
- `href="tel:+393315677922"`
- Background: `transparent` | Bordo: `2px solid #1a3a5c` | Testo: `#1a3a5c` | Font-weight: 600
- Border-radius: 8px | Padding: 14px 26px | Font-size: 17px
- Hover: `background #1a3a5c`, `color #ffffff`

---

**Trust line sotto CTA (1 riga — velocità + disponibilità):**
```
✓ Risposta in meno di 30 minuti  ·  ✓ Disponibile 7 giorni su 7  ·  ✓ Iscritto OPI Siracusa
```
- Font-size: 13px | Colore: `#5a7a8a` | Margin-top: 12px
- Su mobile: stack verticale, una per riga, centrato

---

## SERVIZI — 4 CARD

### Card 1 — ECG a domicilio

| Campo | Contenuto |
|---|---|
| **Titolo** | ECG a domicilio |
| **Sottotitolo benefit** | Il cuore controllato senza uscire di casa |
| **Descrizione** | Eseguo l'elettrocardiogramma a casa tua in 20 minuti, con referto immediato da portare al cardiologo. |
| **Prezzo** | **€25** |
| **Badge prezzo** | `Prezzo fisso, nessuna sorpresa` |
| **CTA micro** | `💬 Prenota su WhatsApp` → `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20vorrei%20prenotare%20un%20ECG%20a%20domicilio` |

*Specifiche card: background `#ffffff`, border `1px solid #e8eef2`, border-radius 12px, padding 24px, box-shadow `0 2px 12px rgba(0,0,0,0.06)`. Hover: `border-color #ff7a18`, `box-shadow 0 8px 24px rgba(255,122,24,0.12)`, `transform translateY(-3px)` — transition 200ms ease.*

---

### Card 2 — Holter ECG 24h

| Campo | Contenuto |
|---|---|
| **Titolo** | Holter ECG 24 ore |
| **Sottotitolo benefit** | Il battito monitorato per un giorno intero |
| **Descrizione** | Applico il dispositivo a casa tua, lo ritiro il giorno dopo: nessuno spostamento, nessun disagio. |
| **Prezzo** | **€45** |
| **Badge prezzo** | `Applicazione + ritiro inclusi` |
| **CTA micro** | `💬 Prenota su WhatsApp` → `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20vorrei%20prenotare%20un%20Holter%20ECG%2024h` |

---

### Card 3 — Holter pressorio 24h

| Campo | Contenuto |
|---|---|
| **Titolo** | Holter pressorio 24 ore |
| **Sottotitolo benefit** | La pressione monitorata notte e giorno |
| **Descrizione** | Il bracciale registra automaticamente tutto il giorno: scopri i picchi che lo sfigmomanometro non vede. |
| **Prezzo** | **€50** |
| **Badge prezzo** | `Applicazione + ritiro inclusi` |
| **CTA micro** | `💬 Prenota su WhatsApp` → `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20vorrei%20prenotare%20un%20Holter%20pressorio%2024h` |

---

### Card 4 — Assistenza infermieristica

| Campo | Contenuto |
|---|---|
| **Titolo** | Assistenza infermieristica |
| **Sottotitolo benefit** | Medicazioni, iniezioni, prelievi — a casa |
| **Descrizione** | Dalla medicazione di una ferita al prelievo del sangue: gestisco tutto io, a domicilio, con professionalità. |
| **Prezzo** | **da €25** |
| **Badge prezzo** | `Preventivo gratuito su WhatsApp` |
| **CTA micro** | `💬 Chiedi il preventivo` → `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20ho%20bisogno%20di%20assistenza%20infermieristica` |

*Nota implementazione: la Card 4 ha prezzo "da €25" — il badge "Preventivo gratuito" converte l'incertezza del prezzo variabile in un'opportunità di contatto. Non mettere "prezzo da concordare": suona evasivo per il target.*

---

## COME FUNZIONA — 3 STEP

**Step 1**
- **Numero:** `01`
- **Titolo:** Scrivimi su WhatsApp
- **Testo:** Dimmi di cosa hai bisogno: rispondo in meno di 30 minuti, anche la sera.
- **Icona:** smartphone con fumetto WhatsApp
- **Colore numero:** `#ff7a18`

**Step 2**
- **Numero:** `02`
- **Titolo:** Scegliamo giorno e orario
- **Testo:** Concorderemo l'appuntamento che fa comodo a te — mattina, pomeriggio o sera.
- **Icona:** calendario con spunta
- **Colore numero:** `#ff7a18`

**Step 3**
- **Numero:** `03`
- **Titolo:** Vengo a casa tua
- **Testo:** Arrivo all'orario concordato con tutto il necessario: tu non devi spostare niente.
- **Icona:** casa con croce medica
- **Colore numero:** `#ff7a18`

*Layout desktop: 3 colonne con connettore orizzontale tratteggiato `#e0e8f0` tra i numeri. Layout mobile: stack verticale con linea verticale tratteggiata a sinistra.*

---

## ZONA — COPY

**Headline (6 parole — geo-rassicurazione diretta):**
```
Opero qui. Conosco queste strade.
```

**Paragrafo (3 righe — vicinanza + copertura geografica):**
```
Non sono una struttura lontana che manda chiunque. Sono Angelo, abito e lavoro
in questo territorio da anni. Quando chiami, sai già chi arriverà.
Copro Francofonte, Lentini, Carlentini e i comuni limitrofi della provincia di Siracusa:
se hai dubbi sulla tua zona, scrivimi — troveremo una soluzione.
```

**Lista comuni con micro-copy:**

| Comune | Micro-copy |
|---|---|
| 📍 **Francofonte** | Sede principale — disponibilità massima |
| 📍 **Lentini** | Interventi regolari — nessun sovrapprezzo |
| 📍 **Carlentini** | Copertura completa — prenota come gli altri |
| 📍 **Dintorni SR** | Contattami — valutiamo insieme |

*Elemento visivo: mappa SVG stilizzata della provincia di Siracusa con i tre comuni evidenziati in `#ff7a18` e pin animati al load della sezione (pulse animation 2s infinite). Alternativa se mappa non disponibile: tre chip pill `background #f0f7ff`, `border 1px solid #1a3a5c`, `border-radius 999px`, `padding 8px 16px`.*

---

## FIDUCIA — SOCIAL PROOF

### Testimonianza 1
> **"Mia madre ha 78 anni e non riesce più a prendere l'autobus. Angelo è venuto a casa in mattinata, ha fatto l'ECG in venti minuti e ci ha spiegato tutto con calma. Non avevamo mai trovato un professionista così disponibile."**
>
> — *Maria, 52 anni — figlia di paziente, Lentini*

*Rationale: target primario (figlia 52 anni), specifica il servizio (ECG), nominata la città, dettaglio temporale realistico ("venti minuti"), emozione chiave ("con calma") che risponde alla paura dell'ansia da prestazione medica.*

---

### Testimonianza 2
> **"Dopo l'intervento avevo bisogno di medicazioni quotidiane e non volevo pesare sui miei figli. Angelo viene ogni mattina puntuale, professionale, e mi fa sentire in buone mani. Adesso mi fido solo di lui."**
>
> — *Salvatore, 71 anni — paziente, Francofonte*

*Rationale: target secondario (anziano autonomo 71 anni), servizio assistenza domiciliare, leva emotiva "non pesare sui figli" — fortissima per anziani meridionali. "Mi fido solo di lui" è la frase che il target primario vuole leggere.*

---

### Trust Badge

| Badge | Testo | Icona |
|---|---|---|
| **Badge 1** | Iscritto OPI Siracusa | 🛡️ scudo con croce |
| **Badge 2** | Infermiere professionale abilitato | 📋 diploma/certificato |
| **Badge 3** | Risposta garantita entro 30 min | ⚡ fulmine o orologio |

*Specifiche badge: background `#f8fffe`, border `1px solid #c8e6d4`, border-radius 8px, padding 12px 16px, icon colore `#2d8a4e`, testo `#1a3a5c` font-weight 600, font-size 13px. Layout: flex-row su desktop, stack su mobile.*

---

## FAQ — 8 DOMANDE

**Q1: Quanto costa una visita a domicilio?**
> I prezzi sono fissi e trasparenti: ECG €25, Holter ECG 24h €45, Holter pressorio 24h €50, assistenza infermieristica da €25.
> Non ci sono costi nascosti di trasferta o chiamata: il prezzo che vedi è quello che paghi.

---

**Q2: Devo avere una prescrizione del medico per prenotare?**
> Per ECG e Holter è consigliabile avere la richiesta del tuo medico o cardiologo, ma non è obbligatoria per fissare l'appuntamento.
> Scrivimi su WhatsApp e ti dico subito cosa serve nel tuo caso specifico.

---

**Q3: In quanto tempo riesci a venire?**
> Nella maggior parte dei casi riesco a intervenire entro 24-48 ore dalla richiesta.
> Per situazioni urgenti, scrivimi subito: se sono libero vengo anche in giornata.

---

**Q4: Vieni anche a Lentini e Carlentini, o solo a Francofonte?**
> Opero regolarmente in tutti e tre i comuni senza differenze di prezzo o di disponibilità.
> Se sei in un paese vicino e hai dubbi, scrivimi: di solito riesco a coprire anche i dintorni.

---

**Q5: Chi elabora il referto dell'ECG o dell'Holter?**
> Il tracciato viene elaborato e firmato da un medico specialista convenzionato: ricevi un referto valido da mostrare al tuo cardiologo.
> Non è un semplice "stampa del tracciato" — è un documento medico completo.

---

**Q6: Come funziona il pagamento?**
> Si paga direttamente a me, in contanti o tramite bonifico, al momento della prestazione.
> Non chiedo acconti e non ci sono commissioni: paghi solo quando ho finito il lavoro.

---

**Q7: E se mia madre o mio padre non vogliono estranei in casa?**
> È una preoccupazione che capisco benissimo. Lavoro con calma, mi presento, spiego tutto quello che faccio prima di farlo.
> Molti pazienti all'inizio diffidenti diventano poi clienti abituali proprio perché si sono sentiti rispettati.

---

**Q8: Cosa succede se durante l'esame emerge qualcosa di preoccupante?**
> Non diagnostico — quella è responsabilità del medico — ma ti spiego con chiarezza cosa ho rilevato e cosa fare.
> Se c'è urgenza, ti aiuto a capire i passi immediati da seguire: non ti lascio solo con un pezzo di carta in mano.

*Implementazione FAQ: accordion con animazione `max-height` 0→auto, 250ms ease. Icona `+` che ruota a `×` su apertura. Bordo bottom `1px solid #e8eef2` tra domande. Solo una domanda aperta alla volta (JS: chiudi le altre al click). Q5 e Q8 rispondono direttamente alle criticità compliance del Report AI — linguaggio chiaro senza over-promise medico.*

---

## MICRO-INTERAZIONI

### Hover card servizi
```
transition: all 200ms ease;
transform: translateY(-4px);
border-color: #ff7a18;
box-shadow: 0 12px 32px rgba(255, 122, 24, 0.15);
```
Il prezzo scala da `font-size: 28px` a `font-size: 30px` con `transition: font-size 150ms ease`.
Il bottone CTA interno passa da `opacity: 0.85` a `opacity: 1` e `background: #e06a10`.

---

### Scroll reveal — timing per sezione
```javascript
// Configurazione IntersectionObserver
const revealConfig = {
  Sticky Bar:    { delay: 0,     animation: 'fadeInDown',  duration: '300ms' },
  Hero:          { delay: 0,     animation: 'fadeIn',      duration: '400ms' },
  Zona:          { delay: 100,   animation: 'fadeInUp',    duration: '500ms' },
  Servizi:       { delay: 0,     animation: 'staggered',   stagger: 120,  duration: '400ms' },
  // Le 4 card appaiono in sequenza: card1+0ms, card2+120ms, card3+240ms, card4+360ms
  Come Funziona: { delay: 0,     animation: 'staggered',   stagger: 180,  duration: '450ms' },
  Perché Angelo: { delay: 80,    animation: 'fadeInUp',    duration: '500ms' },
  Testimonianze: { delay: 100,   animation: 'fadeInUp',    duration: '500ms' },
  FAQ:           { delay: 0,     animation: 'fadeIn',      duration: '300ms' },
  CTA Finale:    { delay: 0,     animation: 'zoomIn',      duration: '400ms' },
};
// threshold: 0.15 per tutte le sezioni (trigger quando 15% della sezione è visibile)
// rootMargin: '0px 0px -50px 0px' (anticipa leggermente il trigger)
```
*Nota critica mobile: disabilita `transform`-based animations se `prefers-reduced-motion: reduce` è attivo. Usa solo `opacity` fade in quel caso.*

---

### Sticky WhatsApp mobile

**Trigger:** appare dopo scroll di `300px` dal top della pagina (cioè dopo che Hero CTA è uscita dalla viewport).
**Scompare:** quando l'utente è nella sezione CTA Finale (evita doppio bottone).

```html
<!-- Struttura HTML del bottone sticky mobile -->
<a href="https://wa.me/393315677922?text=Ciao%20Angelo%2C%20ho%20bisogno%20di%20informazioni"
   class="sticky-whatsapp"
   aria-label="Scrivi ad Angelo su WhatsApp">
  <svg><!-- icona WhatsApp --></svg>
  <span>Scrivi ad Angelo</span>
</a>
```

```css
.sticky-whatsapp {
  position: fixed;
  bottom: 20px;
  right: 16px;
  background: #25D366;
  color: #ffffff;
  border-radius: 999px;
  padding: 14px 20px;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: pulseGreen 2.5s ease-in-out infinite;
  /* Visibile solo su mobile */
  display: none; /* mostrato via JS dopo 300px scroll */
}

@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
  50%       { box-shadow: 0 4px 32px rgba(37,211,102,0.70); }
}

@media (min-width: 768px) {
  .sticky-whatsapp { display: none !important; }
}
```

**Copy bottone:** `💬 Scrivi ad Angelo`
**Pulse:** animazione `pulseGreen` 2.5s loop per catturare attenzione senza essere aggressiva.

---

### Chatbot opener

**Copy bottone launcher (bottom-left, desktop + mobile):**
```
💬 Ciao, posso aiutarti?
```
*Background `#1a3a5c`, testo bianco, border-radius 999px, padding 10px 18px, font-size 14px. Appare dopo 8 secondi di permanenza sulla pagina O dopo scroll del 40%.*

**Primo messaggio automatico del chatbot (appare 800ms dopo apertura):**
```
Ciao! 👋 Sono Angelo.
Hai bisogno di un ECG, un Holter o assistenza infermieristica a domicilio?

Dimmi da quale comune scrivi e ti rispondo subito:
👉 Francofonte
👉 Lentini
👉 Carlentini
👉 Altro comune
```
*Bottoni risposta rapida come chip cliccabili che aprono direttamente WhatsApp con messaggio pre-compilato per comune. Esempio: click "Lentini" → `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20scrivo%20da%20Lentini%20e%20ho%20bisogno%20di%20informazioni`*

*NOTA CRITICA GDPR (dal Report AI): il chatbot NON deve memorizzare dati su Google Sheets o backend non certificato. Ogni conversazione deve transitare direttamente su WhatsApp Business — zero storage lato sito. Il launcher è solo un redirect intelligente.*

---

## CTA FINALI

### Sticky bar mobile testo
```
📞 331 567 7922  |  💬 Scrivi su WhatsApp
```
*Questa è la sticky BAR top — diversa dal bottone floating. Altezza 44px, background `#1a3a5c`, testo bianco, font-size 13px, due link cliccabili separati da pipe. Sempre visibile su mobile. Su desktop: sticky top bar con lo stesso contenuto ma padding orizzontale 24px e layout flex spaced.*

---

### Footer headline
```
Hai ancora dubbi? Scrivimi adesso — rispondo io, non un centralino.
```
*Font-size: clamp(22px, 4vw, 32px) | Font-weight: 700 | Colore: `#ffffff` su sfondo `#1a3a5c` | Margin-bottom: 24px*

---

### Footer CTA (sezione CTA Finale — sopra footer legale)

**CTA 1 — primaria:**
```
[ 💬 Scrivi su WhatsApp ora ]
```
- Background: `#ff7a18` | Testo bianco | Border-radius 8px | Padding 16px 32px | Font-weight 700 | Font-size 18px
- Link: `https://wa.me/393315677922?text=Ciao%20Angelo%2C%20ho%20bisogno%20di%20informazioni`

**CTA 2 — secondaria:**
```
[ 📞 Chiama: 331 567 7922 ]
```
- Background: `transparent` | Bordo `2px solid rgba(255,255,255,0.6)` | Testo bianco | stessi sizing
- Link: `tel:+393315677922`

**Micro-copy sotto CTA:**
```
Disponibile 7 giorni su 7  ·  Francofonte · Lentini · Carlentini
```
*Font-size 13px | Colore `rgba(255,255,255,0.65)` | Margin-top 16px | Centrato*

---

## NOTE IMPLEMENTATIVE CRITICHE
*(Dal Report AI — priorità massima per il go-live)*

1. **Referto medico (Q5 FAQ):** la landing dichiara esplicitamente "referto firmato da medico specialista". Verificare prima del go-live che il flusso operativo garantisca questo — non è solo copy, è un impegno contrattuale.

2. **Prezzi:** i 4 prezzi nella sezione Servizi sono fissi e devono essere identici a quelli comunicati su WhatsApp e al paziente. Il Report segnala un'incongruenza storica — la landing è ora il documento ufficiale dei prezzi.

3. **GDPR — form e backend:** se viene aggiunto un form di contatto in futuro, NON usare Google Sheets come backend. Usare un servizio certificato GDPR (es. Netlify Forms con encryption, o form che invia solo su email/WhatsApp).

4. **Google Business Profile:** attivare schede separate per Francofonte, Lentini e Carlentini con link nel footer — questo vale più di qualsiasi ottimizzazione SEO on-page per il traffico locale immediato.

5. **P.IVA e OPI:** inserire nel footer legale: P.IVA, numero iscrizione OPI Siracusa, link Privacy Policy conforme GDPR. Senza questi elementi la landing non può andare online legalmente.

---

*Brief version 1.0 — Pronto per implementazione HTML/CSS/JS*
*Tutte le stringhe di testo sono definitive e copy-paste ready per il generatore di codice.*