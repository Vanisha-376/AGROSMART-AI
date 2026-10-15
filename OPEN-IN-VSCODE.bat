@echo off
cd /d "%~dp0"
where code >nul 2>nul
if errorlevel 1 (
  echo VS Code command "code" was not found.
  echo Open VS Code, choose File ^> Open Folder, and select this AGROSMART-AI folder.
  pause
  exit /b 1
)
code .
