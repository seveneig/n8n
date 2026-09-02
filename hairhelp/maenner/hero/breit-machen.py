"""Das Foto nach links verbreitern, damit es als Hintergrund taugt.

  mann-hero.webp        1500 x  837, geglättet (aus grund-glaetten.py)
  mann-hero-breit.webp  2000 x  930, der Mann rechts, links Platz für den Satz

Als Hintergrund über die ganze Fläche stünde der Mann sonst in der Mitte,
also genau unter der Schrift. Das Foto bekommt darum links Grund dazu.

Angesetzt wird kein Farbklecks, sondern die gespiegelte linke Randspalte des
Fotos selbst: an der Spiegelachse ist der Verlauf stetig, und die Körnung
des Films läuft mit. Eine glatt gefüllte Fläche würde sich daneben durch
ihre fehlende Körnung verraten.
"""
import pathlib

from PIL import Image
import numpy as np

HIER = pathlib.Path(__file__).parent

ZUGABE = 400          # Bildpunkte Grund links, bezogen auf die Vorlage
STREIFEN = 200        # so breit ist der gespiegelte Randstreifen
BREITE = 2000         # Breite der Ausgabe

quelle = np.asarray(Image.open(HIER / 'mann-hero.webp').convert('RGB'))
h, w, _ = quelle.shape

leinwand = np.empty((h, w + ZUGABE, 3), np.uint8)
leinwand[:, ZUGABE:] = quelle

# Von der Nahtstelle nach aussen: abwechselnd gespiegelt und gerade, damit
# an jeder Stossstelle dieselbe Spalte auf sich selbst trifft.
x = ZUGABE
kachel = 0
while x > 0:
    breit = min(STREIFEN, x)
    block = quelle[:, :STREIFEN]
    block = block[:, ::-1] if kachel % 2 == 0 else block
    leinwand[:, x - breit:x] = block[:, STREIFEN - breit:]
    x -= breit
    kachel += 1

bild = Image.fromarray(leinwand)
bild = bild.resize((BREITE, round(BREITE * h / (w + ZUGABE))), Image.LANCZOS)
bild.save(HIER / 'mann-hero-breit.webp', quality=84, method=6)

# Kontrolle: keine Naht, und wo steht der Mann?
b = np.asarray(bild.convert('RGB')).astype(float)
H, W, _ = b.shape
lum = b @ [.2126, .7152, .0722]
print(f'{W} x {H}, {(HIER / "mann-hero-breit.webp").stat().st_size / 1024:.0f} KB')

spalten = np.where((lum > 60).sum(0) > 25)[0]
print(f'Mann von {spalten[0] / W:.1%} bis {spalten[-1] / W:.1%}, Mitte {(spalten[0] + spalten[-1]) / 2 / W:.1%}')
zeilen = np.where((lum[:, int(W * .42):int(W * .68)] > 60).sum(1) > 18)[0]
print(f'Kopfoberkante {zeilen[0] / H:.1%}')

naht = round(ZUGABE * BREITE / (w + ZUGABE))
for x in (naht - 4, naht, naht + 4):
    print(f'  x={x:4d}  Median #%02x%02x%02x' % tuple(np.median(b[:, x], 0).astype(int)))
