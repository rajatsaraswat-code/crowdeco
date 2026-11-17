@echo off
echo ========================================================
echo       Starting CrowdEco Predictive Crowd Management
echo ========================================================
echo.

set "PATH=C:\Users\golden oak\AppData\Local\Programs\node-v20.18.0-win-x64;%PATH%"

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "CrowdEco Backend" cmd /k "cd backend && python run_backend.py"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Next.js Frontend Dashboard on port 3000...
start "CrowdEco Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo CrowdEco services are launching!
echo Backend API:  http://localhost:8000
echo WebSocket:    ws://localhost:8000/ws/live-feed
echo Frontend App: http://localhost:3000
echo.
pause
