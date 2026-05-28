
  // ECG line animation — simple PQRST loop
  (function(){
    const path = document.getElementById('ecg-line');
    const bpm = document.getElementById('ecg-bpm');
    if (!path) return;

    const W = 420, H = 120, base = 60;
    let offset = 0;
    const beatLen = 140; // px per beat
    const speed = 1.6;   // px per frame

    function buildPath(off) {
      // generate three full beats starting at offset
      let d = "";
      const beats = Math.ceil(W / beatLen) + 2;
      for (let i = -1; i < beats; i++) {
        const x0 = i * beatLen - (off % beatLen);
        // PQRST waveform (relative)
        // baseline → P bump → Q dip → R spike → S dip → T bump → baseline
        const points = [
          [x0,        base],
          [x0 + 10,   base],
          [x0 + 18,   base - 6],    // P
          [x0 + 26,   base],
          [x0 + 40,   base],
          [x0 + 44,   base + 6],    // Q
          [x0 + 50,   base - 38],   // R
          [x0 + 56,   base + 14],   // S
          [x0 + 62,   base],
          [x0 + 80,   base],
          [x0 + 92,   base - 10],   // T
          [x0 + 104,  base],
          [x0 + beatLen, base]
        ];
        points.forEach((p, idx) => {
          d += (idx === 0 && i === -1 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
        });
      }
      return d;
    }

    function tick() {
      offset += speed;
      path.setAttribute('d', buildPath(offset));
      requestAnimationFrame(tick);
    }
    tick();

    // bpm flicker (visual only)
    let bpms = [70, 71, 72, 73, 72, 74, 72, 71, 73];
    let bi = 0;
    setInterval(() => {
      bi = (bi + 1) % bpms.length;
      if (bpm) bpm.textContent = bpms[bi] + " bpm";
    }, 1400);
  })();

  // Reveal on scroll
  (function(){
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  })();
  // Newsletter mock submit
  (function(){
    const form = document.getElementById('news-form');
    const success = document.getElementById('news-success');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      success.classList.add('visible');
      form.querySelectorAll('input').forEach(i => { if (i.type !== 'checkbox') i.value = ''; });
      form.querySelector('button').textContent = 'Iscrizione inviata';
      setTimeout(() => {
        success.classList.remove('visible');
        form.querySelector('button').textContent = 'Iscrivimi';
      }, 4500);
    });
  })();

  // Chat widget \u2014 full booking flow
  (function(){
    const fab = document.getElementById('chat-fab');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const body = document.getElementById('chat-body');
    const chips = document.getElementById('chat-chips');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    if (!fab) return;

    const whatsappNumber = "393315677922";
    const calComUrl = "https://cal.com/angelo-rosso/visita-domiciliare";
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbx9jIDN38OdALDsx9cNCIe0gM9BWXqKf47doQ2rruITImL7wug2sT1XWI7rYw5HcRpu5A/exec";

    const state = { mode: "idle", bookingStep: null, booking: null };

    const quickMenus = {
      idle: ["ECG", "Holter ECG", "Holter pressorio", "Assistenza", "Prezzi", "Orari", "Zona", "Prenotare"],
      booking: ["Annulla", "Prezzi", "Servizi", "Prescrizione"]
    };

    function normalize(v) {
      return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
    }
    function escHtml(v) {
      return String(v||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
    }
    function scroll() { body.scrollTop = body.scrollHeight; }

    function addBot(text) {
      const d = document.createElement("div");
      d.className = "chat-msg bot";
      d.textContent = text;
      body.appendChild(d);
      scroll();
    }
    function addUser(text) {
      const d = document.createElement("div");
      d.className = "chat-msg user";
      d.textContent = text;
      body.appendChild(d);
      scroll();
    }

    function renderChips(mode) {
      chips.innerHTML = "";
      (quickMenus[mode]||[]).forEach(label => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chat-chip";
        b.textContent = label;
        chips.appendChild(b);
      });
    }

    function sendToSheet(data) {
      if (!SHEET_URL) return;
      new Image().src = SHEET_URL + "?payload=" + encodeURIComponent(JSON.stringify(data));
    }

    function createEmptyBooking() {
      return { name:"", patientName:"", service:"", city:"", relation:"", age:"", reason:"", prescription:"", date:"", time:"", note:"", phone:"", email:"", consentContact:"" };
    }

    // \u2500\u2500 text utilities \u2500\u2500
    function stripNoise(v) {
      let s = v.trim().replace(/\s+/g," ");
      const pp = [/^(ho detto|ti ho detto|avevo detto|intendo|volevo dire|cioe|cio\u00e8)\s+/i,/^(serve|mi serve|vorrei|devo fare|si tratta di)\s+/i,/^(per|a|ad)\s+/i,/^(un|una|uno|il|lo|la|l')\s+/i];
      let changed=true;
      while(changed){changed=false;pp.forEach(p=>{const n=s.replace(p,"").trim();if(n!==s){s=n;changed=true;}});}
      return s;
    }
    function cleanService(v) {
      const n=normalize(v);
      if(n.includes("holter")&&n.includes("press")) return "Holter pressorio";
      if(n.includes("holter")) return "Holter ECG";
      if(n.includes("ecg")||n.includes("elettrocardiogramma")) return "ECG";
      if(n.includes("assistenza")||n.includes("infermier")||n.includes("medicaz")||n.includes("iniezion")||n.includes("catetere")) return "Assistenza infermieristica";
      return stripNoise(v);
    }
    function cleanRelation(v) {
      const n=normalize(v);
      if(n==="io"||n.includes("per me")||n.includes("me stesso")||n.includes("me stessa")) return "me stesso/a";
      if(n.includes("mamma")||n.includes("madre")) return "familiare (mamma)";
      if(n.includes("papa")||n.includes("padre")) return "familiare (padre)";
      if(n.includes("moglie")) return "familiare (moglie)";
      if(n.includes("marito")) return "familiare (marito)";
      if(n.includes("figlia")) return "familiare (figlia)";
      if(n.includes("figlio")) return "familiare (figlio)";
      if(n.includes("nonna")) return "familiare (nonna)";
      if(n.includes("nonno")) return "familiare (nonno)";
      if(n.includes("familiare")) return "familiare";
      return stripNoise(v);
    }
    function cleanPrescription(v) {
      const n=normalize(v);
      if(n.includes("non so")) return "non so";
      if(n==="si"||n.includes("s\u00ec")||n.includes("prescrizione")||n.includes("impegnativa")) return "s\u00ec";
      if(n==="no"||n.includes("non ce")||n.includes("non ho")) return "no";
      return stripNoise(v);
    }
    function cleanPersonName(v) {
      return v.trim().replace(/\s+/g," ").replace(/^[?:;.,\-\s]+/i,"").replace(/^(io sono|sono|mi chiamo|il mio nome e|il mio nome \u00e8)\s+/i,"").replace(/^(signor|sig\.|signora|sig\.ra|dottor|dott\.)\s+/i,"").trim() || v.trim();
    }
    function cleanRequesterName(v) {
      return cleanPersonName(v.split(/\s+e\s+(?:il\s+)?nome\s+di\s+/i)[0].split(/\s+e\s+(?:mia|mio)\s+/i)[0]);
    }
    function extractPatientName(v) {
      const pp=[/nome\s+di\s+(?:mia|mio)?\s*(?:mamma|madre|papa|padre|moglie|marito|figlia|figlio|nonna|nonno)?\s*(?:e|si chiama)?\s+(.+)$/i,/(?:mia|mio)\s+(?:mamma|madre|papa|padre|moglie|marito|figlia|figlio|nonna|nonno)\s+(?:si chiama|e)\s+(.+)$/i];
      for(const p of pp){const m=v.match(p);if(m&&m[1])return cleanPersonName(m[1]);}
      return "";
    }
    function timeToMin(v) {
      const m=String(v||"").match(/(\d{1,2})[:.](\d{2})|(?:^|\D)(\d{1,2})(?:\D|$)/);
      if(!m) return null;
      const h=Number(m[1]||m[3]),min=Number(m[2]||0);
      return(h<0||h>23||min<0||min>59)?null:h*60+min;
    }
    function minToTime(v) { return `${String(Math.floor(v/60)).padStart(2,"0")}:${String(v%60).padStart(2,"0")}`; }
    function normalizeTime(v) { const m=timeToMin(v); return m===null?"":minToTime(m); }
    function normalizeDate(v) {
      const raw=String(v||"").trim(), n=normalize(raw), today=new Date(), yr=today.getFullYear();
      if(n==="oggi") return today.toISOString().slice(0,10);
      if(n==="domani"){const t=new Date(today);t.setDate(t.getDate()+1);return t.toISOString().slice(0,10);}
      const days={lunedi:1,"luned\u00ec":1,martedi:2,"marted\u00ec":2,mercoledi:3,"mercoled\u00ec":3,giovedi:4,"gioved\u00ec":4,venerdi:5,"venerd\u00ec":5,sabato:6,domenica:0};
      if(days[n]!==undefined){const d=new Date(today),diff=(days[n]-d.getDay()+7)%7;d.setDate(d.getDate()+(diff===0?7:diff));return d.toISOString().slice(0,10);}
      const iso=n.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
      if(iso)return`${iso[1]}-${iso[2].padStart(2,"0")}-${iso[3].padStart(2,"0")}`;
      const num=n.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
      if(num){const y=num[3]?Number(num[3].length===2?`20${num[3]}`:num[3]):yr;return`${y}-${num[2].padStart(2,"0")}-${num[1].padStart(2,"0")}`;}
      const months={gennaio:"01",febbraio:"02",marzo:"03",aprile:"04",maggio:"05",giugno:"06",luglio:"07",agosto:"08",settembre:"09",ottobre:"10",novembre:"11",dicembre:"12"};
      const mm=n.match(/\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?\b/);
      if(mm)return`${mm[3]||yr}-${months[mm[2]]}-${mm[1].padStart(2,"0")}`;
      return "";
    }
    function fmtDate(v) { if(!v)return""; const p=v.split("-"); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:v; }

    const urgentSignals=["dolore al petto","peso al petto","oppressione","mancanza di respiro","manca il respiro","fiato corto","difficolta a respirare","difficolt\u00e0 a respirare","svenimento","svenuto","perdita di coscienza","sudorazione fredda","braccio sinistro","palpitazioni forti","palpitazioni intense","ictus","bocca storta","non riesco a parlare","forte debolezza","confusione improvvisa"];
    function hasUrgent(n) { return urgentSignals.some(s=>n.includes(normalize(s)))||(n.includes("palpitazioni")&&["dolore","petto","fiato","respiro","sven","debolezza","forti","intense"].some(s=>n.includes(s))); }

    // \u2500\u2500 answer functions \u2500\u2500
    function answerEcg() { addBot("L'ECG registra l'attivit\u00e0 elettrica del cuore in quel momento. Utile quando il medico vuole controllare ritmo e frequenza. Non fa diagnosi da solo e non sostituisce una visita.\nSe ci sono dolore al petto, difficolt\u00e0 a respirare, svenimento o sintomi improvvisi importanti, chiama subito 112/118."); addBot("Vuoi richiedere questo servizio a domicilio? Scrivi 'prenotare' oppure clicca il pulsante."); }
    function answerHolterEcg() { addBot("L'Holter ECG registra il ritmo del cuore per 24 ore o pi\u00f9. Utile per palpitazioni, battiti irregolari o episodi da valutare che non compaiono durante un ECG breve."); addBot("Vuoi richiedere questo servizio a domicilio? Scrivi 'prenotare' oppure clicca il pulsante."); }
    function answerHolterPressorio() { addBot("L'Holter pressorio misura la pressione pi\u00f9 volte durante giorno e notte. Aiuta il medico a capire l'andamento della pressione senza basarsi su una sola misurazione."); addBot("Vuoi richiedere questo servizio a domicilio? Scrivi 'prenotare' oppure clicca il pulsante."); }
    function answerAssistance() { addBot("L'assistenza infermieristica a domicilio pu\u00f2 includere: medicazioni, parametri vitali, iniezioni quando appropriate, gestione catetere, stomie, glicemia e supporto post-dimissione.\nAlcune prestazioni richiedono prescrizione o indicazione medica."); addBot("Vuoi richiedere assistenza a domicilio? Scrivi 'prenotare' oppure clicca il pulsante."); }
    function answerPrices() { addBot("Tariffe:\n- ECG: \u20ac35\n- Holter ECG: \u20ac60\n- Holter pressorio: \u20ac65\n- Visita infermieristica: \u20ac35\n- Medicazione: \u20ac25\n- Iniezione/prelievo: \u20ac20\n\nTariffe private note prima dell'appuntamento."); }
    function answerZone() { addBot("Operativit\u00e0 su Francofonte, Lentini e Carlentini. Per altri comuni verifica direttamente via WhatsApp."); }
    function answerTimings() { addBot("Orario operativo: luned\u00ec\u2013sabato, 9:00\u201313:00 e 15:00\u201318:00.\nI tempi esatti si confermano al primo contatto, in base alla prestazione, al comune e alla disponibilit\u00e0."); }
    function answerPrescription() { addBot("Alcune prestazioni richiedono prescrizione o indicazione medica. Se non sai se serve, scrivi 'non so': verr\u00e0 verificato al contatto diretto."); }
    function answerSymptoms() { addBot("Prima cosa: hai dolore al petto, fiato corto importante, svenimento, sudorazione fredda, forte debolezza o difficolt\u00e0 improvvisa a parlare?\n\nSe s\u00ec, chiama subito 112/118. Altrimenti posso prepararti una richiesta per WhatsApp."); }
    function answerEmergency() { addBot("Da quello che descrivi potrebbe esserci una situazione urgente. Non aspettare: chiama immediatamente il 112 o il 118.\n\nSe hai dolore al petto, difficolt\u00e0 a respirare, svenimento o sintomi improvvisi, attiva subito i soccorsi."); }
    function answerGreeting() { addBot("Ciao! Posso aiutarti con informazioni su ECG, Holter e assistenza infermieristica, oppure prepararti una richiesta di prenotazione. Cosa ti interessa?"); }
    function answerFallback() { addBot("Posso aiutarti su: servizi, prezzi, orari, zona, prescrizione, prenotazione. Scrivi una parola chiave o scegli un pulsante."); }

    // \u2500\u2500 booking \u2500\u2500
    function resetBooking(silent) {
      state.mode="idle"; state.bookingStep=null; state.booking=createEmptyBooking();
      renderChips("idle");
      if(!silent) addBot("Va bene. Sono di nuovo nel menu principale.");
    }
    function startBooking() {
      state.mode="booking"; state.bookingStep=0; state.booking=createEmptyBooking();
      renderChips("booking");
      addBot("Ti aiuto a preparare una richiesta WhatsApp ordinata. Non scrivere dati sanitari non necessari: bastano le informazioni essenziali.");
      promptStep();
      input.focus();
    }

    const prompts = {
      0: "Come ti chiami? Scrivi nome e cognome di chi sta richiedendo il servizio.",
      1: "Quale servizio ti interessa? ECG, Holter ECG, Holter pressorio o assistenza infermieristica?",
      2: "In quale comune serve il servizio? Il servizio \u00e8 pensato soprattutto per Francofonte, Lentini e Carlentini.",
      3: "Il servizio \u00e8 per te, per un familiare o per un paziente assistito?",
      4: "Qual \u00e8 il nome e cognome del paziente?",
      5: "Qual \u00e8 l'et\u00e0 indicativa del paziente?",
      6: "Qual \u00e8 il motivo della richiesta, in una frase breve? Per privacy, scrivi solo l'essenziale.",
      7: "Hai una prescrizione o indicazione medica? Puoi rispondere: s\u00ec, no o non so.",
      8: "Per quale giorno vorresti l'appuntamento? Puoi scrivere es. 10/06/2026, domani o 15 giugno.",
      9: "A che ora vorresti l'appuntamento? (Orario: lun\u2013sab 9:00\u201313:00 e 15:00\u201318:00) Es. 09:00, 10:30 o 15:45.",
      10: "Ci sono note pratiche utili? Es. difficolt\u00e0 di movimento, piano senza ascensore, paziente allettato. Se non serve, scrivi 'no'.",
      11: "Lascia un numero di telefono per essere ricontattato.",
      12: "Se vuoi, puoi lasciare anche un'email. Se non vuoi, scrivi 'no'.",
      13: "Acconsenti a essere ricontattato per questa richiesta? Rispondi s\u00ec o no."
    };
    function promptStep() { if(prompts[state.bookingStep]) addBot(prompts[state.bookingStep]); }

    function buildCalUrl(d) {
      const notes=[`Servizio: ${d.service}`,`Paziente: ${d.patientName||d.name}${d.age?` (${d.age} anni)`:""}`,d.patientName&&d.name?`Richiedente: ${d.name}${d.relation?` (${d.relation})`:""}`:null,`Telefono: ${d.phone}`,d.city?`Comune: ${d.city}`:null,d.time?`Orario preferito: ${d.time}`:null,d.reason?`Motivo: ${d.reason}`:null,d.note?`Note: ${d.note}`:null].filter(Boolean).join("\n");
      return `${calComUrl}?${new URLSearchParams({name:d.patientName||d.name||"",email:d.email||"",notes}).toString()}`;
    }

    function addSummaryCard(d) {
      const card=document.createElement("div");
      card.className="chat-summary";
      const title=document.createElement("strong");
      title.textContent="Riepilogo richiesta";
      const text=document.createElement("div");
      text.style.whiteSpace="pre-wrap";
      text.innerHTML=[`Richiedente: ${escHtml(d.name)}`,d.patientName?`Paziente: ${escHtml(d.patientName)}`:null,`Rapporto: ${escHtml(d.relation)}`,`Servizio: ${escHtml(d.service)}`,`Comune: ${escHtml(d.city)}`,`Et\u00e0 indicativa: ${escHtml(d.age)}`,`Motivo: ${escHtml(d.reason)}`,`Prescrizione: ${escHtml(d.prescription)}`,`Giorno: ${escHtml(fmtDate(d.date))}`,`Orario preferito: ${escHtml(d.time)}`,d.note?`Note: ${escHtml(d.note)}`:"Note: nessuna",`Telefono: ${escHtml(d.phone)}`,d.email?`Email: ${escHtml(d.email)}`:null].filter(Boolean).join("<br>");
      const waMsg=["Buongiorno, vorrei prenotare un servizio.",`Richiedente: ${d.name}`,d.patientName?`Paziente: ${d.patientName}`:null,`Rapporto: ${d.relation}`,`Servizio: ${d.service}`,`Comune: ${d.city}`,`Et\u00e0 indicativa: ${d.age}`,`Motivo: ${d.reason}`,`Prescrizione: ${d.prescription}`,`Giorno: ${fmtDate(d.date)}`,`Orario preferito: ${d.time}`,d.note?`Note: ${d.note}`:"Note: nessuna",`Telefono: ${d.phone}`,d.email?`Email: ${d.email}`:null].filter(Boolean).join("\n");
      const row=document.createElement("div");
      row.className="chat-action-row";
      const calLink=document.createElement("a");
      calLink.className="chat-action";
      calLink.textContent="Scegli data e orario";
      calLink.href=buildCalUrl(d);
      calLink.target="_blank";
      calLink.rel="noopener noreferrer";
      const waLink=document.createElement("a");
      waLink.className="chat-action";
      waLink.textContent="Apri WhatsApp";
      waLink.href=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`;
      waLink.target="_blank";
      waLink.rel="noopener noreferrer";
      const restart=document.createElement("button");
      restart.type="button";
      restart.className="chat-action secondary";
      restart.textContent="Nuova richiesta";
      restart.addEventListener("click",()=>resetBooking());
      row.appendChild(calLink);
      row.appendChild(waLink);
      row.appendChild(restart);
      card.appendChild(title);
      card.appendChild(text);
      card.appendChild(row);
      body.appendChild(card);
      scroll();
    }

    function handleBooking(rawText) {
      const text=rawText.trim(), n=normalize(text);
      if(hasUrgent(n)){resetBooking(true);answerEmergency();return;}
      if(n==="annulla"||n==="stop"){resetBooking();return;}
      if(n.includes("prezz")||n.includes("costo")||n.includes("tariff")){answerPrices();promptStep();return;}
      if(n.includes("prescr")||n.includes("impegnativa")){answerPrescription();promptStep();return;}
      if(n.includes("sintom")||n.includes("palpitazioni")){answerSymptoms();promptStep();return;}

      const s=state.booking, step=state.bookingStep;
      if(step===0){if(text.length<2){addBot("Scrivi nome e cognome di chi sta richiedendo il servizio.");return;}s.name=cleanRequesterName(text);s.patientName=extractPatientName(text);state.bookingStep=1;}
      else if(step===1){s.service=cleanService(text);state.bookingStep=2;}
      else if(step===2){s.city=text.trim();state.bookingStep=3;}
      else if(step===3){s.relation=cleanRelation(text);state.bookingStep=s.patientName?5:4;}
      else if(step===4){s.patientName=cleanPersonName(text);state.bookingStep=5;}
      else if(step===5){s.age=text.trim();state.bookingStep=6;}
      else if(step===6){s.reason=stripNoise(text);state.bookingStep=7;}
      else if(step===7){s.prescription=cleanPrescription(text);state.bookingStep=8;}
      else if(step===8){const d=normalizeDate(text);s.date=d||text;if(!d)addBot(`Ok, segnato come "${text}". Angelo verificher\u00e0 la disponibilit\u00e0 al contatto diretto.`);state.bookingStep=9;}
      else if(step===9){const t=normalizeTime(text);s.time=t||text;state.bookingStep=10;}
      else if(step===10){s.note=n==="no"?"":stripNoise(text);state.bookingStep=11;}
      else if(step===11){const ph=text.replace(/[^\d+]/g,"");if(ph.length<6){addBot("Numero troppo corto. Scrivi un numero di telefono valido.");return;}s.phone=ph;state.bookingStep=12;}
      else if(step===12){s.email=n==="no"?"":text.trim();state.bookingStep=13;}
      else if(step===13){s.consentContact=(n==="si"||n==="s\u00ec"||n==="yes"||n==="ok")?"S\u00ec":"No";state.mode="summary";state.bookingStep=null;sendToSheet(s);renderChips("idle");addSummaryCard(s);addBot("Clicca 'Scegli data e orario' per prenotare il tuo slot. Per qualsiasi dubbio puoi anche contattarmi su WhatsApp.");return;}
      promptStep();
    }

    function processInput(rawText) {
      const text=rawText.trim();
      if(!text) return;
      addUser(text);
      const n=normalize(text);
      if(hasUrgent(n)){if(state.mode==="booking")resetBooking(true);answerEmergency();return;}
      if(state.mode==="booking"){handleBooking(text);return;}
      if(n.includes("prenot")||n.includes("appunt")||n.includes("richied")||n==="prenotare"){startBooking();return;}
      if(n.includes("prezz")||n.includes("costo")||n.includes("tariff")){answerPrices();return;}
      if(n.includes("orari")||n.includes("quando")||n.includes("ore")||n==="orari"){answerTimings();return;}
      if(n.includes("zona")||n.includes("comune")||n.includes("dove")||n.includes("francofonte")||n.includes("lentini")||n.includes("carlentini")){answerZone();return;}
      if(n.includes("holter")&&n.includes("press")){answerHolterPressorio();return;}
      if(n.includes("holter")){answerHolterEcg();return;}
      if(n.includes("ecg")||n.includes("elettrocardiogramma")){answerEcg();return;}
      if(n.includes("assistenza")||n.includes("infermier")||n.includes("medicaz")||n.includes("iniezion")){answerAssistance();return;}
      if(n.includes("sintom")||n.includes("palpitazioni")||n.includes("battiti")){answerSymptoms();return;}
      if(n.includes("prescr")||n.includes("impegnativa")){answerPrescription();return;}
      if(n.includes("referto")||n.includes("tempo")||n.includes("tempi")){addBot("Referto PDF entro 24\u201348 ore via WhatsApp o email. Per Holter ECG e pressorio: referto strumentale + lettura del cardiologo in un unico documento.");return;}
      if(n==="ciao"||n==="salve"||n==="buongiorno"||n==="buonasera"){answerGreeting();return;}
      answerFallback();
    }

    // \u2500\u2500 init \u2500\u2500
    state.booking = createEmptyBooking();
    renderChips("idle");

    fab.addEventListener('click', () => panel.classList.toggle('open'));
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    chips.addEventListener('click', (e) => {
      const btn=e.target.closest('.chat-chip');
      if(!btn) return;
      const label=btn.textContent.trim();
      setTimeout(()=>input.focus(),80);
      processInput(label);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val=input.value.trim();
      if(!val) return;
      input.value="";
      processInput(val);
    });
  })();

  // Tweaks panel + edit-mode protocol
  (function(){
    const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
      "palette": "terracotta",
      "showChat": true,
      "showNewsletter": true
    }/*EDITMODE-END*/;

    let state = Object.assign({}, TWEAKS_DEFAULTS);
    const panel = document.getElementById('tweaks');
    const closeBtn = document.getElementById('tweaks-close');
    const grid = document.getElementById('palette-grid');
    const togChat = document.getElementById('toggle-chat');
    const togNews = document.getElementById('toggle-news');

    function apply() {
      document.body.dataset.palette = state.palette;
      document.body.classList.toggle('chat-hidden', !state.showChat);
      document.body.classList.toggle('news-hidden', !state.showNewsletter);
      grid.querySelectorAll('.palette-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.palette === state.palette);
      });
      togChat.classList.toggle('on', state.showChat);
      togNews.classList.toggle('on', state.showNewsletter);
    }

    function persist(edits) {
      try {
        window.parent.postMessage({type: '__edit_mode_set_keys', edits}, '*');
      } catch (e) {}
    }

    grid.addEventListener('click', (e) => {
      const sw = e.target.closest('.palette-swatch');
      if (!sw) return;
      state.palette = sw.dataset.palette;
      apply();
      persist({palette: state.palette});
    });
    togChat.addEventListener('click', () => {
      state.showChat = !state.showChat;
      apply();
      persist({showChat: state.showChat});
    });
    togNews.addEventListener('click', () => {
      state.showNewsletter = !state.showNewsletter;
      apply();
      persist({showNewsletter: state.showNewsletter});
    });

    function show() { panel.classList.add('open'); }
    function hide() { panel.classList.remove('open'); }
    closeBtn.addEventListener('click', () => {
      hide();
      try { window.parent.postMessage({type: '__edit_mode_dismissed'}, '*'); } catch (e) {}
    });

    window.addEventListener('message', (e) => {
      const t = e.data && e.data.type;
      if (t === '__activate_edit_mode') show();
      else if (t === '__deactivate_edit_mode') hide();
    });

    // Apply defaults, then announce availability
    apply();
    try { window.parent.postMessage({type: '__edit_mode_available'}, '*'); } catch (e) {}
  })();
