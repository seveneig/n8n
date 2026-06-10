#!/usr/bin/env bash
# Baut den Windows-Installer (setup.exe) unter Linux/macOS.
# Voraussetzung: NSIS (z. B. "apt install nsis" oder "brew install makensis")
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
makensis installer/installer.nsi
echo "Fertig: dist/Snowtown-Showdown-Setup.exe"
