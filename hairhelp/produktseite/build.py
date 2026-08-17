#!/usr/bin/env python3
"""
Baut aus produktseite.html zwei Ausgaben:

  produktseite.html          Quelle. Fotos per Live-URL von hairhelp-haarverdichter.ch,
                             Kleinassets (Logo, Farbmuster, Zahlarten, Anleitungsbilder)
                             als Platzhalter ASSET:name.

  ausgabe/produktseite.html  Produktion. Wie die Quelle, aber ASSET:-Platzhalter und
                             die Hausschrift Jost sind eingebettet.

  ausgabe/vorschau.html      Vorschau. Zusätzlich sind auch alle Fotos eingebettet,
                             damit die Seite ohne Netzwerkzugriff vollständig rendert.

Die Assets stammen aus assets.json (aus dem gespeicherten Seiten-Dump extrahiert).
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "produktseite.html")
DIST = os.path.join(HERE, "ausgabe")

# Farbvarianten, deren Dosenbild im gespeicherten Seiten-Dump nicht enthalten ist.
# Für die Vorschau greifen sie auf das vorhandene Dunkelbraun-Bild zurück.
FALLBACK_DOSE = ("https://hairhelp-haarverdichter.ch/wp-content/uploads/"
                 "2024/10/Dark-Brown-HairHelp-Dose.webp")


def load_assets(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def inject_fonts(html, font_css):
    marker = "/* FONT-FACE-JOST */"
    if marker not in html:
        raise SystemExit("Font-Marker fehlt in produktseite.html")
    return html.replace(marker, font_css, 1)


def resolve_placeholders(html, extra):
    """ASSET:name -> data-URI."""
    missing = set()

    def sub(match):
        name = match.group(1)
        if name not in extra:
            missing.add(name)
            return match.group(0)
        return extra[name]

    html = re.sub(r"ASSET:([a-z0-9-]+)", sub, html)
    if missing:
        raise SystemExit("Unbekannte Assets: " + ", ".join(sorted(missing)))
    return html


def inline_photos(html, url2data):
    """Live-URLs -> data-URI (nur für die Vorschau)."""
    urls = sorted(set(re.findall(
        r"https://hairhelp-haarverdichter\.ch/wp-content/uploads/[^\s\"']+", html)))
    unresolved = []
    for url in urls:
        data = url2data.get(url)
        if data is None:
            data = url2data.get(FALLBACK_DOSE)
            unresolved.append(url)
        html = html.replace(url, data)
    if unresolved:
        print("Vorschau: Ersatzbild für "
              + ", ".join(os.path.basename(u) for u in unresolved))
    return html


def main():
    assets_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "assets.json")
    assets = load_assets(assets_path)

    with open(SRC, encoding="utf-8") as fh:
        source = fh.read()

    os.makedirs(DIST, exist_ok=True)

    production = resolve_placeholders(inject_fonts(source, assets["fontcss"]),
                                      assets["extra"])
    preview = inline_photos(production, assets["url2data"])

    for name, content in (("produktseite.html", production),
                          ("vorschau.html", preview)):
        target = os.path.join(DIST, name)
        with open(target, "w", encoding="utf-8") as fh:
            fh.write(content)
        print("%-20s %6.2f MB" % (name, os.path.getsize(target) / 1e6))


if __name__ == "__main__":
    main()
