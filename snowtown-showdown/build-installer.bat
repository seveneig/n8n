@echo off
rem Baut den Windows-Installer (setup.exe) unter Windows.
rem Voraussetzung: NSIS installiert (https://nsis.sourceforge.io)
cd /d "%~dp0"
if not exist dist mkdir dist
makensis installer\installer.nsi
if errorlevel 1 (
  echo Fehler beim Bauen. Ist NSIS installiert und makensis im PATH?
  exit /b 1
)
echo Fertig: dist\Snowtown-Showdown-Setup.exe
