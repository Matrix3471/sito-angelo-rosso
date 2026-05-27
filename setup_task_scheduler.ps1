# setup_task_scheduler.ps1
# Configura Task Scheduler Windows per eseguire agent_prenotazioni.py ogni mattina alle 08:00
# Esegui come Amministratore oppure con: powershell -ExecutionPolicy Bypass -File setup_task_scheduler.ps1

$TaskName    = "AngeloRosso-AgentPrenotazioni"
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptPath  = Join-Path $ScriptDir "agent_prenotazioni.py"
$LogPath     = Join-Path $ScriptDir "agent_prenotazioni.log"
$PythonPath  = (Get-Command python -ErrorAction SilentlyContinue).Source

if (-not $PythonPath) {
    Write-Error "Python non trovato nel PATH. Installa Python e riprova."
    exit 1
}

# Leggi API keys da variabili d'ambiente esistenti o chiedi all'utente
$AnthropicKey    = $env:ANTHROPIC_API_KEY
$BrevoKey        = $env:BREVO_API_KEY
$AppsScriptUrl   = $env:APPS_SCRIPT_URL

if (-not $AnthropicKey) {
    $AnthropicKey = Read-Host "Inserisci ANTHROPIC_API_KEY"
}
if (-not $BrevoKey) {
    $BrevoKey = Read-Host "Inserisci BREVO_API_KEY (invio per skip / dry run)"
}
if (-not $AppsScriptUrl) {
    $AppsScriptUrl = Read-Host "Inserisci APPS_SCRIPT_URL (URL deployment Apps Script)"
}

# Wrapper batch che imposta le variabili e lancia Python
$WrapperPath = Join-Path $ScriptDir "run_agent.bat"
$BatchContent = @"
@echo off
set ANTHROPIC_API_KEY=$AnthropicKey
set BREVO_API_KEY=$BrevoKey
set APPS_SCRIPT_URL=$AppsScriptUrl
"$PythonPath" "$ScriptPath"
"@
[System.IO.File]::WriteAllText($WrapperPath, $BatchContent, [System.Text.Encoding]::ASCII)

# Rimuovi task esistente se presente
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Task esistente rimosso."
}

# Crea trigger: ogni giorno alle 08:00
$Trigger = New-ScheduledTaskTrigger -Daily -At "08:00"

# Azione: esegui batch wrapper
$Action = New-ScheduledTaskAction -Execute $WrapperPath

# Impostazioni: esegui anche se non loggato, non svegliare PC
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -StartWhenAvailable `
    -DontStopIfGoingOnBatteries `
    -AllowStartIfOnBatteries

Register-ScheduledTask `
    -TaskName $TaskName `
    -Trigger $Trigger `
    -Action $Action `
    -Settings $Settings `
    -RunLevel Highest `
    -Force | Out-Null

Write-Host ""
Write-Host "Task Scheduler configurato:" -ForegroundColor Green
Write-Host "  Nome    : $TaskName"
Write-Host "  Orario  : ogni giorno alle 08:00"
Write-Host "  Script  : $ScriptPath"
Write-Host "  Log     : $LogPath"
Write-Host "  Wrapper : $WrapperPath"
Write-Host ""
Write-Host "Per eseguire subito (test):" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  oppure: python agent_prenotazioni.py"
Write-Host ""
Write-Host "ATTENZIONE: run_agent.bat contiene le API key in chiaro." -ForegroundColor Red
Write-Host "Non committare run_agent.bat su git." -ForegroundColor Red
