#!/usr/bin/env python3
"""
Bettet Logo und Hero-Foto fest in Index.html ein.

Die Seite soll eine einzige, in sich geschlossene Datei bleiben (Voraussetzung
für Google Apps Script), deshalb werden die Bilder verkleinert, neu kodiert und
als data:-Adressen in den Block zwischen /* ASSETS-START */ und /* ASSETS-ENDE */
geschrieben.

Aufruf:  python3 assets/build-embed.py     (aus dem Ordner laerchiwoche-2027)
Nötig:   pip install pillow
"""

import base64
import io
import os
import re
import sys

from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HIER, '..', 'Index.html')

LOGO_WEISS = 'ltw.png'                              # weißes Logo, für dunkle Flächen
LOGO_GOLD = 'ltg.png'                               # goldenes Logo, Reserve
HERO = 'golfhotel-der-lärchenhof-10262.webp'        # Foto für den Kopfbereich

# Das Logo besteht aus drei Teilen übereinander: Wappen, Sternenreihe, Schriftzug.
# Für die Kopfzeile brauchen wir nur das Wappen — der Schriftzug wäre dort zu klein.
WAPPEN_BIS = 0.57      # Anteil der Gesamthöhe, bis zu dem das Wappen reicht


def data_uri(bild: Image.Image, fmt: str, **opts) -> str:
    puffer = io.BytesIO()
    bild.save(puffer, fmt, **opts)
    roh = puffer.getvalue()
    typ = 'image/png' if fmt == 'PNG' else 'image/jpeg'
    print(f'    {fmt:4} {bild.size[0]}×{bild.size[1]}  {len(roh)/1024:6.1f} KB')
    return f'data:{typ};base64,' + base64.b64encode(roh).decode('ascii')


def einfarbig(bild: Image.Image) -> Image.Image:
    """Das Logo ist rein weiß auf transparent. Als Graustufe+Alpha statt RGBA
    gespeichert braucht es nur einen Bruchteil des Platzes — sichtbar
    identisch, weil ohnehin nur ein Farbton vorkommt."""
    grau, alpha = bild.convert('L'), bild.getchannel('A')
    grau = grau.point(lambda _: 255)          # Farbkanal auf reines Weiß setzen
    return Image.merge('LA', (grau, alpha))


def zuschneiden(bild: Image.Image) -> Image.Image:
    """Transparenten Rand entfernen."""
    kasten = bild.getchannel('A').getbbox()
    return bild.crop(kasten) if kasten else bild


def breite_auf(bild: Image.Image, breite: int) -> Image.Image:
    if bild.width <= breite:
        return bild
    hoehe = round(bild.height * breite / bild.width)
    return bild.resize((breite, hoehe), Image.LANCZOS)


def pfad(name: str) -> str:
    p = os.path.join(HIER, name)
    if not os.path.exists(p):
        sys.exit(f'FEHLT: {p}')
    return p


def main():
    bilder = {}

    print('Logo (weiß), vollständig — Fußzeile:')
    logo = zuschneiden(Image.open(pfad(LOGO_WEISS)).convert('RGBA'))
    bilder['logo'] = data_uri(einfarbig(breite_auf(logo, 520)), 'PNG', optimize=True)

    print('Logo (weiß), nur Wappen — Kopfzeile und Wasserzeichen:')
    voll = Image.open(pfad(LOGO_WEISS)).convert('RGBA')
    wappen = zuschneiden(voll.crop((0, 0, voll.width, int(voll.height * WAPPEN_BIS))))
    bilder['wappen'] = data_uri(einfarbig(breite_auf(wappen, 320)), 'PNG', optimize=True)

    print('Hero-Foto:')
    foto = Image.open(pfad(HERO)).convert('RGB')
    bilder['hero'] = data_uri(breite_auf(foto, 1200), 'JPEG', quality=74, optimize=True,
                              progressive=True)

    # Das goldene Logo (ltg.png) wird derzeit nirgends gebraucht und deshalb
    # nicht eingebettet — es liegt unverändert im Ordner assets/ bereit.

    block = '/* ASSETS-START */\n'
    block += 'var IMG = {\n'
    for schluessel in ('wappen', 'logo', 'hero'):
        block += f"  {schluessel}: '{bilder[schluessel]}',\n"
    block += "  logoGold: '',\n"
    block += '};\n'
    block += '/* ASSETS-ENDE */'

    with open(INDEX, encoding='utf-8') as f:
        html = f.read()

    neu, anzahl = re.subn(
        r'/\* ASSETS-START \*/.*?/\* ASSETS-ENDE \*/',
        lambda _: block, html, count=1, flags=re.S)
    if not anzahl:
        sys.exit('Block /* ASSETS-START */ … /* ASSETS-ENDE */ nicht in Index.html gefunden.')

    with open(INDEX, 'w', encoding='utf-8') as f:
        f.write(neu)

    print(f'\nIndex.html geschrieben — {len(neu)/1024:.0f} KB gesamt.')


if __name__ == '__main__':
    main()
