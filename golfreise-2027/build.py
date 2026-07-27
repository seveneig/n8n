#!/usr/bin/env python3
"""
Baut aus src/ die fertigen Dateien in dist/.

    python3 build.py

Ergebnis:
    dist/standalone.html            -> eine Datei, Speicherung im Browser (Vorschau)
    dist/apps-script/Index.html     -> Variante für Google Apps Script
    dist/apps-script/Code.gs        -> Backend für die Google-Tabelle

Alle Bilder, das Logo und die QR-Bibliothek werden fest eingebettet:
die Seiten laufen ohne Internet-Abhängigkeiten und auch in iFrames/Sandboxes.
"""

import base64
import mimetypes
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
ASSETS = SRC / "assets"
DIST = ROOT / "dist"

# ---------------------------------------------------------------- Einstellungen
SPHINX_URL = "https://www.sphinxtravel.ch/anmeldung-ziischtigsclub-golfreise-2027"
ADMIN_PW = "Augwil2027"  # muss mit ADMIN_PASSWORD in src/Code.gs übereinstimmen

IMAGES = {
    "__EMBLEM__": "emblem.svg",
    "__IMG_HERO__": "hero.jpg",
    "__IMG_RESORT__": "resort.jpg",
    "__IMG_ROOM__": "room.jpg",
    "__IMG_GOLF1__": "golf1.jpg",
    "__IMG_GOLF2__": "golf2.jpg",
}

STANDALONE_BOOT = """
/* Hinweis im Vorschau-Modus: Daten bleiben lokal im Browser. */
(function(){
  var f = document.querySelector('.footer .wrap:last-child');
  if (!f) return;
  var n = document.createElement('p');
  n.style.cssText = 'margin-top:14px;color:var(--gold);opacity:.8';
  n.textContent = 'Vorschau-Modus: Anmeldungen werden nur in diesem Browser gespeichert. '
                + 'Für die gemeinsame Live-Liste die Google-Apps-Script-Variante verwenden.';
  f.appendChild(n);
})();
"""


def data_uri(path: pathlib.Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if path.suffix == ".svg":
        mime = "image/svg+xml"
    raw = path.read_bytes()
    return "data:%s;base64,%s" % (mime or "application/octet-stream",
                                  base64.b64encode(raw).decode("ascii"))


def build(variant: str) -> str:
    html = (SRC / "page.html").read_text(encoding="utf-8")

    for token, name in IMAGES.items():
        html = html.replace(token, data_uri(ASSETS / name))

    html = html.replace("__QR_LIB__", (ASSETS / "qrcode.min.js").read_text(encoding="utf-8"))
    html = html.replace("__SPHINX_URL__", SPHINX_URL)

    if variant == "local":
        layer = (SRC / "datalayer.local.js").read_text(encoding="utf-8")
        html = html.replace("__ADMIN_PW__", ADMIN_PW)
        html = html.replace("__BOOT_EXTRA__", STANDALONE_BOOT)
    else:
        layer = (SRC / "datalayer.gas.js").read_text(encoding="utf-8")
        # Passwort steckt serverseitig in Code.gs, nicht im ausgelieferten HTML.
        html = html.replace("__ADMIN_PW__", "")
        html = html.replace("__BOOT_EXTRA__", "")

    html = html.replace("__DATA_LAYER__", layer)

    leftovers = [t for t in ("__EMBLEM__", "__IMG_", "__QR_LIB__", "__SPHINX_URL__",
                             "__ADMIN_PW__", "__DATA_LAYER__", "__BOOT_EXTRA__")
                 if t in html]
    if leftovers:
        sys.exit("Nicht ersetzte Platzhalter: %s" % ", ".join(leftovers))
    return html


def main() -> None:
    (DIST / "apps-script").mkdir(parents=True, exist_ok=True)

    standalone = build("local")
    (DIST / "standalone.html").write_text(standalone, encoding="utf-8")

    gas = build("gas")
    if "<?" in gas.replace("<?!= siteUrl ?>", ""):
        sys.exit("Fehler: unerwartete '<?'-Sequenz — Apps Script würde sie als Scriptlet lesen.")
    (DIST / "apps-script" / "Index.html").write_text(gas, encoding="utf-8")
    shutil.copyfile(SRC / "Code.gs", DIST / "apps-script" / "Code.gs")

    for path in (DIST / "standalone.html",
                 DIST / "apps-script" / "Index.html",
                 DIST / "apps-script" / "Code.gs"):
        print("%-38s %7.1f KB" % (path.relative_to(ROOT), path.stat().st_size / 1024))


if __name__ == "__main__":
    main()
