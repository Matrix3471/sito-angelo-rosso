# Guida Integrazione Chatbot - Angelo Rosso

## File creati

```
assets/chatbot/
├── tawk-widget.js          # Script principale del widget
├── system-prompt-tawk.txt  # Prompt da copiare in Tawk.to
└── README.md               # Questo file
```

---

## Passaggio 1: Registrati su Tawk.to

1. Vai su **https://www.tawk.to/**
2. Clicca **"Sign Up Free"**
3. Registrati con email o account Google
4. Completa il profilo (nome, sito web)

---

## Passaggio 2: Configura la proprietà

1. Dopo il login, vedrai la dashboard
2. Clicca su **"Amministrazione"** (icona ingranaggio)
3. Vai su **"Canali" → "Widget"**
4. Attiva il widget se non è attivo
5. Copia il **Property ID** (formato: `abcdef123456789`)

---

## Passaggio 3: Inserisci il Property ID

1. Apri il file `assets/chatbot/tawk-widget.js`
2. Trova la riga: `propertyId: 'TUO_PROPERTY_ID',`
3. Sostituisci `'TUO_PROPERTY_ID'` con il tuo Property ID reale
4. Salva il file

---

## Passaggio 4: Configura il System Prompt

1. In Tawk.to, vai su **"Amministrazione" → "Assistenza AI"**
2. Clicca su **"Impostazioni"**
3. Trova il campo **"System Prompt"**
4. Apri il file `assets/chatbot/system-prompt-tawk.txt`
5. Copia tutto il contenuto
6. Incollalo nel campo System Prompt di Tawk.to
7. Clicca **"Salva"**

---

## Passaggio 5: Integra nel sito

Apri `landing-onefile.html` e aggiungi questa riga prima di `</body>`:

```html
<script src="assets/chatbot/tawk-widget.js"></script>
```

Oppure usa l'integrazione diretta che trovi più avanti.

---

## Passaggio 6: Test

1. Pubblica il sito
2. Apri la pagina
3. Dovresti vedere il widget di chat in basso a destra
4. Prova a scrivere un messaggio
5. Verifica che il chatbot risponda secondo il prompt

---

## Alternative gratuite

Se Tawk.to non ti convince, ecco altre opzioni:

| Servizio | Gratis | AI | Note |
|----------|--------|-----|------|
| **Tawk.to** | ✅ | ✅ (a pagamento) | Buono, facile |
| **Crisp** | ✅ (limitato) | ✅ | Molto completo |
| **Smartsupp** | ✅ | ❌ | Solo chat |
| **WhatsApp Click to Chat** | ✅ | ❌ | Solo pulsante |

---

## Problemi comuni

### Il widget non appare
- Verifica di aver inserito il Property ID corretto
- Controlla che il file JS sia caricato correttamente
- Prova a svuotare la cache del browser

### Il chatbot non risponde come previsto
- Verifica di aver copiato correttamente il System Prompt
- Controlla che l'AI sia attiva in Tawk.to

### Vuoi disattivare il widget temporaneamente
- Commenta la riga di inclusione nel file HTML

---

## Contatti di Angelo Rosso (già configurati)

- **WhatsApp**: 393315677922
- **Telefono**: 3315677922
- **Email**: angelo.rosoo073@gmail.com

---

## Supporto

Per modifiche al prompt o al comportamento del chatbot:
1. Modifica il file `system-prompt-tawk.txt`
2. Aggiorna il System Prompt in Tawk.to
3. Ripubblica il sito

---

*Creato per il progetto Angelo Rosso - Telemedicina*
*Data: 29 Aprile 2026*