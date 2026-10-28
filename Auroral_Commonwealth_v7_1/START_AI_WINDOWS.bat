@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 or newer is required. Install Node.js, then run this file again.
  pause
  exit /b 1
)
if not defined AC_LLM_MODEL set "AC_LLM_MODEL=qwen2.5:3b"
echo AURORAL COMMONWEALTH - ML / LLM EDITION
echo Offline trained ML is included and works immediately.
echo Optional chat requires Ollama running with model: %AC_LLM_MODEL%
echo One-time example setup in a terminal: ollama pull qwen2.5:3b
echo Open http://127.0.0.1:8000 and click AI Adviser inside a campaign.
echo.
node server.mjs
pause
