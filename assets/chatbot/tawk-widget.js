<!-- 
  ========================================
  CHATBOT ANGELO ROSSO - Widget WhatsApp
  ========================================
  Integrazione per landing-onefile.html
  
  Istruzioni:
  1. Registrati gratis su https://www.tawk.to/
  2. Crea un account e imposta la proprietà
  3. Copia il tuo Property ID dalla dashboard
  4. Sostituisci "TUO_PROPERTY_ID" qui sotto
  5. In Tawk.to > Amministrazione > Assistente AI >
     Impostazioni > System Prompt, inserisci il contenuto
     del file "system-prompt-chatbot.txt"
-->

<!-- Configurazione Chatbot Angelo Rosso -->
<script>
window.tawkSettings = {
  // ⚠️ SOSTITUISCI QUESTO CON IL TUO PROPERTY ID DA TAWK.TO
  propertyId: 'TUO_PROPERTY_ID', // Esempio: '1234567890abcdef'
  
  // Configurazione widget
  widgetConfig: {
    position: 'right', // Posizione: 'right' o 'left'
    greeting: 'Ciao! Sono l\'assistente di Angelo Rosso. Come posso aiutarti?',
    greetingDelay: 3, // Secondi prima del messaggio di benvenuto
  },
  
  // Orari di attività (opzionale)
  availability: {
    monday:    { start: '08:00', end: '20:00' },
    tuesday:   { start: '08:00', end: '20:00' },
    wednesday: { start: '08:00', end: '20:00' },
    thursday:  { start: '08:00', end: '20:00' },
    friday:    { start: '08:00', end: '20:00' },
    saturday:  { start: '09:00', end: '14:00' },
    sunday:    { start: '00:00', end: '00:00' } // Chiuso
  },
  
  // Contatti diretti
  contacts: {
    whatsapp: '393315677922',
    phone: '3315677922',
    email: 'angelo.rosoo073@gmail.com'
  }
};
</script>

<!-- Script Tawk.to (non modificare) -->
<script>
var Tawk_API=Tawk_API||{}, tawkOnLoad=Tawk_OnLoad;
Tawk_API.onLoad = function(){
  // Personalizzazione visuale del widget
  if (typeof Tawk_API !== 'undefined') {
    Tawk_API.setWidgetPosition(window.tawkSettings?.widgetConfig?.position || 'right');
  }
};
</script>

<!-- Pulsante WhatsApp alternativo (fallback) -->
<div id="whatsapp-float-container" style="display:none;">
  <a href="https://wa.me/393315677922?text=Ciao,%20vorrei%20informazioni%20sui%20servizi%20di%20Angelo%20Rosso" 
     target="_blank" 
     class="whatsapp-float-btn"
     aria-label="Contatta su WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span class="whatsapp-tooltip">Scrivi su WhatsApp</span>
  </a>
</div>

<style>
/* Stile pulsante WhatsApp flottante */
#whatsapp-float-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

.whatsapp-float-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #25D366;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.whatsapp-float-btn svg {
  width: 32px;
  height: 32px;
  color: white;
}

.whatsapp-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(37, 211, 102, 0.5);
}

.whatsapp-tooltip {
  position: absolute;
  right: 72px;
  background: #075E54;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.whatsapp-float-btn:hover .whatsapp-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Animazione pulse per attenzione */
@keyframes whatsapp-pulse {
  0% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); }
  50% { box-shadow: 0 4px 30px rgba(37, 211, 102, 0.7); }
  100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); }
}

.whatsapp-float-btn {
  animation: whatsapp-pulse 2s infinite;
}
</style>

<script>
// Mostra pulsante WhatsApp se Tawk.to non è configurato
document.addEventListener('DOMContentLoaded', function() {
  var propertyId = window.tawkSettings?.propertyId;
  
  // Se il property ID non è stato configurato, mostra il pulsante WhatsApp
  if (!propertyId || propertyId === 'TUO_PROPERTY_ID') {
    var container = document.getElementById('whatsapp-float-container');
    if (container) {
      container.style.display = 'block';
    }
    console.log('⚠️ Chatbot: Configura il Property ID in tawk-widget.js per attivare il widget AI');
  }
});
</script>