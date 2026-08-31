if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "ANTHROPIC_API_KEY non impostata. Impostala una volta con:"
    Write-Host '  setx ANTHROPIC_API_KEY "sk-ant-..."'
    Write-Host "poi riapri PowerShell e rilancia questo script."
    Read-Host "Premi Invio per chiudere"
    exit 1
}
Set-Location "C:\Users\angel\TELEMEDICINA\sito-angelo-rosso"
python review-team\generate_site.py --skip-js
Read-Host "Premi Invio per chiudere"


