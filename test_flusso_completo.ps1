
# Simulazione flusso completo: chatbot -> Cal.com webhook -> sync -> agente
$URL = (Get-Content ".\run_agent.bat" | Select-String "APPS_SCRIPT_URL=") -replace ".*APPS_SCRIPT_URL=", ""
$URL = $URL.Trim()
if (-not $URL) { Write-Error "APPS_SCRIPT_URL non trovata in run_agent.bat"; exit 1 }
Write-Host "URL: $URL"

Write-Host "`n=== STEP 1: Chatbot -> Richieste + Pazienti ===" -ForegroundColor Cyan

$bookings = @(
    @{ name="Ferraro Luigi";    patientName="Ferraro Luigi";    service="ECG";                 city="Francofonte"; relation="Diretto"; age="58"; reason="Controllo cardiaco";            prescription="No"; note="";                     phone="3334521890"; email="angelo2017@outlook.it"; consentContact="Si" },
    @{ name="Marino Concetta";  patientName="Marino Concetta";  service="Holter ECG";          city="Lentini";     relation="Diretto"; age="72"; reason="Monitoraggio aritmia";          prescription="Si"; note="Pacemaker assente";   phone="3471239876"; email="angelo2017@outlook.it"; consentContact="Si" },
    @{ name="Grasso Salvatore"; patientName="Grasso Salvatore"; service="Prelievo domiciliare"; city="Francofonte"; relation="Diretto"; age="45"; reason="Analisi sangue di controllo"; prescription="Si"; note="A digiuno 8:00";      phone="3209876543"; email="angelo2017@outlook.it"; consentContact="Si" }
)

foreach ($b in $bookings) {
    $json    = $b | ConvertTo-Json -Compress
    $encoded = [System.Uri]::EscapeDataString($json)
    $r = Invoke-WebRequest -Uri ($URL + "?payload=" + $encoded) -UseBasicParsing
    Write-Host "  $($b.name) - $($b.service): $($r.Content)"
}

Write-Host "`n=== STEP 2: Cal.com webhook -> Prenotazioni ===" -ForegroundColor Cyan

$startTime = (Get-Date).AddDays(-2).ToString("yyyy-MM-ddT09:00:00Z")
$endTime   = (Get-Date).AddDays(-2).ToString("yyyy-MM-ddT09:30:00Z")
$uid       = "test-" + (Get-Date -Format "yyyyMMddHHmmss")

$webhookBody = @{
    triggerEvent = "BOOKING_CREATED"
    payload = @{
        uid       = $uid
        type      = "ecg"
        eventType = @{ title = "ECG" }
        title     = "ECG con Angelo Rosso"
        startTime = $startTime
        endTime   = $endTime
        attendees = @(@{ name="Ferraro Luigi"; email="angelo2017@outlook.it"; timeZone="Europe/Rome" })
        additionalNotes = "Test simulazione"
    }
} | ConvertTo-Json -Depth 5

$r = Invoke-WebRequest -Uri $URL -Method POST -Body $webhookBody -ContentType "application/json" -UseBasicParsing
Write-Host "  Cal.com webhook: $($r.Content)"

Write-Host "`n=== STEP 3: Sync Prenotazioni -> Consultazioni ===" -ForegroundColor Cyan
$r = Invoke-WebRequest -Uri ($URL + "?action=sync_consultazioni") -UseBasicParsing
Write-Host "  Sync: $($r.Content)"

Write-Host "`n=== STEP 4: Agente AI ===" -ForegroundColor Cyan
& cmd /c ".\run_agent.bat"
