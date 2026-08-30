@echo off
title Auroral Commonwealth Multiplayer Server
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required for multiplayer.
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)
echo Starting AURORAL COMMONWEALTH multiplayer server...
node server.mjs
pause
