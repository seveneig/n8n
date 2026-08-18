#!/usr/bin/env python3
"""
Baut aus startseite.html die fertige Seite nach ausgabe/.

  startseite.html         Quelle. Bilder und Schrift als ASSET:name-Platzhalter.
  ausgabe/startseite.html Alles eingebettet, läuft ohne Netzwerkzugriff.

Die Assets stammen aus assets.json und wurden aus dem gespeicherten
Seiten-Dump von / extrahiert.
"""

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "startseite.html")
DIST = os.path.join(HERE, "ausgabe")


def main():
    with open(os.path.join(HERE, "assets.json"), encoding="utf-8") as fh:
        assets = json.load(fh)

    with open(SRC, encoding="utf-8") as fh:
        html = fh.read()

    marker = "/* FONT-FACE-JOST */"
    if marker not in html:
        raise SystemExit("Font-Marker fehlt in startseite.html")
    html = html.replace(marker, assets["fontcss"], 1)

    missing = set()

    def sub(match):
        name = match.group(1)
        if name not in assets["img"]:
            missing.add(name)
            return match.group(0)
        return assets["img"][name]

    html = re.sub(r"ASSET:([a-z0-9-]+)", sub, html)
    if missing:
        raise SystemExit("Unbekannte Assets: " + ", ".join(sorted(missing)))

    os.makedirs(DIST, exist_ok=True)
    target = os.path.join(DIST, "startseite.html")
    with open(target, "w", encoding="utf-8") as fh:
        fh.write(html)
    print("startseite.html  %6.2f MB" % (os.path.getsize(target) / 1e6))


if __name__ == "__main__":
    main()
