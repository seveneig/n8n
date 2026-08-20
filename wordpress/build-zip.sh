#!/usr/bin/env bash
#
# Erzeugt das Installationspaket fuer WordPress.
#
# Aufruf aus dem Verzeichnis wordpress/:  ./build-zip.sh
# Ergebnis: hairhelp-partner-dashboard.zip, im Backend unter
# Plugins -> Installieren -> Plugin hochladen einspielbar.
#
set -euo pipefail

cd "$(dirname "$0")"

PAKET="hairhelp-partner-dashboard"
ZIEL="${PAKET}.zip"

rm -f "$ZIEL"

# Entwicklungsdateien bleiben draussen, die Testreihen laufen aus dem Repository.
zip -r -q "$ZIEL" "$PAKET" \
	-x "${PAKET}/tests/*" \
	-x "*.DS_Store" \
	-x "*/.git/*"

echo "Erzeugt: $ZIEL ($(du -h "$ZIEL" | cut -f1))"
unzip -l "$ZIEL" | tail -1
