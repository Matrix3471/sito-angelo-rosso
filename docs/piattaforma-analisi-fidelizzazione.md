# Piattaforma analisi dati e fidelizzazione - Angelo Rosso

## 1. Obiettivo

La piattaforma nasce come strumento interno per analizzare i dati del progetto di telemedicina e preparare comunicazioni email utili alla fidelizzazione dei clienti.

Obiettivo principale:

1. capire quali servizi funzionano meglio;
2. individuare clienti da seguire dopo una prestazione;
3. generare trigger operativi;
4. preparare email educative e relazionali;
5. mantenere controllo umano prima di ogni invio.

La piattaforma non deve fare diagnosi, interpretare referti o sostituire il medico.

## 2. Contesto operativo

Servizi principali:

1. ECG a domicilio;
2. Holter ECG a domicilio;
3. Holter pressorio a domicilio;
4. assistenza infermieristica domiciliare.

Area operativa principale:

1. Francofonte;
2. Lentini;
3. Carlentini.

Pubblico principale:

1. pazienti;
2. familiari;
3. caregiver;
4. contatti arrivati da sito, WhatsApp, telefono, chatbot o canali locali.

## 3. Moduli della piattaforma

### Analisi dati

La dashboard deve mostrare:

1. clienti totali;
2. clienti con consenso email;
3. clienti da ricontattare;
4. prestazioni per servizio;
5. prestazioni per comune;
6. incassi totali;
7. importi non pagati;
8. richieste da chatbot;
9. conversioni verso WhatsApp;
10. servizi piu richiesti.

### Segmentazione

I segmenti iniziali devono essere semplici:

1. servizio effettuato;
2. data ultimo servizio;
3. comune;
4. stato cliente;
5. consenso email;
6. cliente da non contattare.

Questa scelta e volutamente prudente: evita profilazioni sanitarie complesse e mantiene il progetto piu facile da gestire.

### Trigger email

I trigger iniziali sono basati sul tempo trascorso dall'ultima prestazione:

1. 1 giorno dopo: ringraziamento e richiesta feedback;
2. 7 giorni dopo: contenuto educativo collegato al servizio;
3. 30 giorni dopo: messaggio relazionale di mantenimento;
4. 90 giorni dopo: promemoria soft, senza suggerire necessita cliniche automatiche.

Nella prima versione i trigger non inviano email in automatico.

La piattaforma deve generare:

1. destinatario suggerito;
2. motivo del trigger;
3. oggetto email;
4. testo email;
5. stato del consenso;
6. eventuale blocco se il cliente non puo essere contattato.

### Comunicazioni

Le email devono essere:

1. educative;
2. relazionali;
3. semplici;
4. non aggressive;
5. prive di diagnosi;
6. prive di promesse cliniche;
7. sempre controllate prima dell'invio.

Esempi di comunicazioni:

1. ringraziamento post-servizio;
2. richiesta feedback;
3. preparazione generale a ECG o Holter;
4. consigli organizzativi;
5. invito a contattare il professionista per necessita pratiche.

### Newsletter / comunicazioni informative

La newsletter deve essere predisposta come canale informativo, non come campagna promozionale aggressiva.

Nella fase prototipo:

1. non raccoglie ancora iscritti dal sito;
2. non invia email automaticamente;
3. usa `newsletter.csv` come struttura dati;
4. distingue consenso newsletter da consenso email post-servizio;
5. mantiene gli iscritti disiscritti sempre esclusi.
6. mostra nella landing una sezione "Comunicazioni informative" solo informativa, senza form attivo.

Campi iniziali di `newsletter.csv`:

1. ID;
2. data iscrizione;
3. nome;
4. email;
5. comune;
6. consenso newsletter;
7. fonte;
8. stato;
9. note.

Esempi di contenuti adatti:

1. ADI e assistenza domiciliare integrata;
2. informazioni generali sui servizi domiciliari;
3. telemedicina, referti digitali e sanita digitale;
4. consigli organizzativi per familiari e caregiver;
5. aggiornamenti di sanita territoriale;
6. prevenzione e accesso ai servizi;
7. preparazione a ECG o Holter;
8. notizie e argomenti di vario genere collegati a salute, servizi e organizzazione delle cure;
9. educazione sanitaria generale senza diagnosi.

## 4. Dati minimi

La tabella clienti deve contenere almeno:

1. ID;
2. nome;
3. cognome;
4. comune;
5. telefono;
6. email;
7. stato;
8. data primo contatto;
9. data ultimo contatto;
10. fascia eta, se disponibile;
11. consenso email;
12. non contattare;
13. note operative.

La tabella prestazioni deve stare in `consultazioni.csv` e deve contenere almeno:

1. ID prestazione o consultazione;
2. ID paziente;
3. data;
4. tipo servizio;
5. comune;
6. stato;
7. canale;
8. note.

La tabella economica deve stare in `bilanci.csv` e deve contenere almeno:

1. ID pagamento;
2. data pagamento;
3. ID consultazione;
4. ID paziente;
5. tipo servizio;
6. importo;
7. modalita pagamento;
8. note.

## 5. Regole privacy

La piattaforma deve seguire una linea prudente.

Regole:

1. usare solo dati necessari;
2. non creare profili clinici automatici;
3. non inviare email senza consenso;
4. separare comunicazioni informative da valutazioni sanitarie;
5. permettere di segnare un cliente come "non contattare";
6. evitare contenuti che possano sembrare diagnosi o prescrizioni;
7. prevedere informativa privacy prima dell'uso reale.

Se manca il consenso email, il cliente puo comparire nelle analisi aggregate, ma non nella lista di invio.

## 6. Prima versione tecnica

La prima versione e una dashboard statica evolutiva:

1. legge i CSV presenti nel progetto;
2. mostra KPI e segmenti;
3. usa `consultazioni.csv` per i trigger post-prestazione;
4. usa `bilanci.csv` solo per incassi e pagamenti;
5. genera trigger email;
6. crea bozze controllabili;
7. non invia email;
8. non richiede backend.

Questa versione serve per validare:

1. dati disponibili;
2. logica dei trigger;
3. utilita delle analisi;
4. tono delle email;
5. campi mancanti.

## 7. Evoluzione futura

Dopo la validazione della dashboard, il progetto puo evolvere in:

1. database;
2. login protetto;
3. gestione consensi strutturata;
4. storico email inviate;
5. automazioni controllate;
6. integrazione con provider email;
7. integrazione WhatsApp Business;
8. report mensili.

La migrazione a invio automatico deve avvenire solo dopo aver validato dati, consenso, testi e processo operativo.
