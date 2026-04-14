@echo off
TITLE SwiftStrike Developer Launcher
SETLOCAL

:: Navigate to project directory
cd /d "%~dp0"

echo [SwiftStrike] Checking for dependencies...
if not exist "node_modules\" (
    echo [SwiftStrike] node_modules not found, installing...
    call npm install
)

echo [SwiftStrike] Starting development environment...
echo [SwiftStrike] This will compile the Rust backend and launch the UI.
echo.

:: Start Tauri dev
call npm run tauri dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [SwiftStrike] Critical Error: Application failed to start.
    echo [SwiftStrike] Please ensure you have Rust and Node.js installed.
    pause
)

ENDLOCAL
