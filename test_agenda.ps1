
# Test slot libero vs slot occupato
$URL = (Get-Content ".\run_agent.bat" | Select-String "APPS_SCRIPT_URL=") -replace ".*APPS_SCRIPT_URL=", ""
$URL = $URL.Trim()

$domani      = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$dopodomani  = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")

function Append-Row($sheet, $row) {
    $encoded = [System.Uri]::EscapeDataString(($row | ConvertTo-Json -Compress))
    $r = Invoke-WebRequest -Uri ($URL + "?action=append_row&sheet=" + $sheet + "&row=" + $encoded) -UseBasicParsing
    return $r.Content
}

function Submit-Booking($b) {
    $json    = $b | ConvertTo-Json -Compress
    $encoded = [System.Uri]::EscapeDataString($json)
    $r = Invoke-WebRequest -Uri ($URL + "?payload=" + $encoded) -UseBasicParsing
    return $r.Content
}

# ── SETUP AGENDA ──────────────────────────────────────────────────────────────
Write-Host "`n=== SETUP AGENDA ===" -ForegroundColor Cyan

# Header
Append-Row "Agenda" @("data", "ora", "stato") | Out-Null

# Domani: 2 slot LIBERI  → Test 1 dovrebbe prenotare
Append-Row "Agenda" @($domani, "09:00", "libero")     | Out-Null
Append-Row "Agenda" @($domani, "11:00", "libero")     | Out-Null

# Dopodomani: 2 slot OCCUPATI → Test 2 nessun posto → Cal.com
Append-Row "Agenda" @($dopodomani, "09:00", "occupato") | Out-Null
Append-Row "Agenda" @($dopodomani, "11:00", "occupato") | Out-Null

Write-Host "  Agenda popolata: slot liberi $domani, slot occupati $dopodomani"

# ── TEST 1: SLOT LIBERO ───────────────────────────────────────────────────────
Write-Host "`n=== TEST 1: Slot libero ($domani) ===" -ForegroundColor Green

Submit-Booking @{
    name="Vitale Carmela"; patientName="Vitale Carmela"; service="ECG"
    city="Francofonte"; relation="Diretto"; age="61"
    reason="Controllo cardiaco annuale"
    prescription="Si"; note="Disponibile domani mattina $domani"
    phone="3356781234"; email="angelo2017@outlook.it"; consentContact="Si"
} | Out-Null
Write-Host "  Booking Vitale Carmela (ECG, domani) inserito"

# ── TEST 2: SLOT OCCUPATO ─────────────────────────────────────────────────────
Write-Host "`n=== TEST 2: Slot occupato ($dopodomani) ===" -ForegroundColor Yellow

Submit-Booking @{
    name="Nicotra Enzo"; patientName="Nicotra Enzo"; service="Holter ECG"
    city="Lentini"; relation="Diretto"; age="55"
    reason="Monitoraggio battito cardiaco"
    prescription="No"; note="Disponibile solo $dopodomani"
    phone="3471112233"; email="angelo2017@outlook.it"; consentContact="Si"
} | Out-Null
Write-Host "  Booking Nicotra Enzo (Holter ECG, dopodomani) inserito"

# ── AGENTE ───────────────────────────────────────────────────────────────────
Write-Host "`n=== AGENTE ===" -ForegroundColor Cyan
& cmd /c ".\run_agent.bat"
