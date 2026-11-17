# CrowdEco One-Click Startup Script (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Starting CrowdEco Predictive Crowd Management" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$nodePath = "C:\Users\golden oak\AppData\Local\Programs\node-v20.18.0-win-x64"
if (Test-Path $nodePath) {
    $env:Path = "$nodePath;$env:Path"
}

Write-Host "[1/2] Launching Python FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; python run_backend.py"

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching Next.js Frontend Dashboard on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "`$env:Path = '$nodePath;' + `$env:Path; cd frontend; npm run dev"

Write-Host ""
Write-Host "CrowdEco services launched successfully!" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "WebSocket:    ws://localhost:8000/ws/live-feed" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host ""
