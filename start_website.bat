@echo off
title STUDYVAULT Local Server
echo ========================================================
echo         STARTING STUDYVAULT LOCAL SERVER (PORT 3000)
echo ========================================================
cd /d "%~dp0"
echo Project Directory: %CD%
echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000
echo Server is running! Keep this window open while using the website.
echo Press Ctrl+C to stop the server.
echo.
python -m http.server 3000
pause
