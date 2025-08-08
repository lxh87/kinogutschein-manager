@echo off
setlocal

REM Change to project root (directory of this script)
cd /d "%~dp0"

echo [1/5] Ensuring port 3000 is free...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [2/5] Starting CRA dev server on fixed port 3000...
start "CRA Dev Server" cmd /k "set PORT=3000&& set BROWSER=none&& npm start"

echo [3/5] Booting Android emulator: Xiaomi_Pad_5_API_35 ...
set "EMULATOR=%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe"
if not exist "%EMULATOR%" (
  echo ERROR: Emulator not found at "%EMULATOR%"
  echo Please install Android Emulator via Android Studio SDK Manager.
  goto :eof
)
start "Android Emulator - Xiaomi Pad 5" "%EMULATOR%" -avd Xiaomi_Pad_5_API_35 -netdelay none -netspeed full

echo [4/5] Waiting for emulator to fully boot...
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB%" (
  echo ERROR: adb not found at "%ADB%"
  echo Please install Android SDK Platform-Tools.
  goto :eof
)
"%ADB%" start-server >nul 2>&1

:wait_for_boot
REM Wait until sys.boot_completed reports 1
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr /r "^1$" >nul
if errorlevel 1 (
  timeout /t 5 >nul
  goto :wait_for_boot
)

echo [5/5] Starting Expo on Android (port 8082)...
cd /d "%~dp0KinoGutscheinApp"
set RCT_METRO_PORT=8082
start "Expo Android" cmd /k "npx --yes expo start --android --port 8082 --non-interactive"

echo All set. Web server, emulator, and Expo should now be running.
endlocal

