# Launch basic live server for CrowdEco
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Starting CrowdEco Basic Live Server (No Node.js)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Serving CrowdEco at: http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:5000"
python -m http.server 5000
