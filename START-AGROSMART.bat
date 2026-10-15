@echo off
setlocal
cd /d "%~dp0"
title AGROSMART AI Launcher

echo ==============================================
echo        AGROSMART AI - ONE CLICK START
echo ==============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed. Install Node.js LTS first.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js LTS and try again.
  pause
  exit /b 1
)

if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo Created backend\.env from the example.
  echo IMPORTANT: For database features, edit backend\.env and enter your MySQL password.
  echo Also execute backend\schema.sql in MySQL Workbench once.
  echo.
)

if not exist "frontend\node_modules" (
  echo Installing frontend packages. This may take a few minutes...
  pushd frontend
  call npm install
  if errorlevel 1 (popd & echo Frontend installation failed. Check internet/npm. & pause & exit /b 1)
  popd
)
if not exist "backend\node_modules" (
  echo Installing backend packages. This may take a few minutes...
  pushd backend
  call npm install
  if errorlevel 1 (popd & echo Backend installation failed. Check internet/npm. & pause & exit /b 1)
  popd
)

echo.
echo Starting API server in a new window...
start "AGROSMART API - port 5000" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak >nul
echo Starting website in a new window...
start "AGROSMART Website - Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 5 /nobreak >nul
start "" http://localhost:5180
echo.
echo Website: http://localhost:5180
echo Weather Insight uses live Coimbatore weather when internet is available.
echo Database-backed modules need MySQL running and backend\.env configured.
echo Keep both terminal windows open while using the website.
echo.
pause
