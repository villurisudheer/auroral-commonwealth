@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 18 or newer, then run this file again.
  pause
  exit /b 1
)
echo AURORAL COMMONWEALTH v7.1 - CHRONICLE EDITION
echo Open http://127.0.0.1:8000 after the server starts.
echo Maps, custom countries and offline ML work without Python or an API key.
echo Optional local LLM: install Ollama and set AC_LLM_MODEL before launching.
echo.
node server.mjs
pause
