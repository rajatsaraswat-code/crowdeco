@echo off
echo ========================================================
echo       Starting CrowdEco Basic Live Server (No Node.js)
echo ========================================================
echo.
echo Serving CrowdEco at: http://localhost:5000
echo.
python -m http.server 5000
pause
