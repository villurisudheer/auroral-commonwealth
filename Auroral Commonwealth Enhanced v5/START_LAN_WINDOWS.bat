@echo off
title Auroral Commonwealth LAN Multiplayer
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js LTS first.
  pause
  exit /b 1
)
echo The server will print both LOCAL and LAN addresses.
echo Share the LAN address with players on the same Wi-Fi/network.
node server.mjs
pause
