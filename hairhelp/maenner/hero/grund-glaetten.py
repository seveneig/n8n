"""Vignette des Studiogrunds ausgleichen, damit Foto und Herofläche exakt
denselben Grundton tragen.

  mann-hero-original.webp  wie geliefert, 2000 x 1116, mit Vignette
  mann-hero.webp           1500 x 837, Grund überall #131410

Das Original trägt eine deutliche Vignette: Ecken #0f100f, Mitte #171713 –
acht Stufen Unterschied. Als Fläche neben einer einfarbigen Fläche fällt das
als Kante auf. Das Skript schätzt das Grundfeld über ein Raster, wäscht die
Lücken hinter der Person aus den Rändern ein und zieht die Abweichung ab,
gewichtet nach Dunkelheit. Helle Bildteile – Gesicht, Arme, Shirt – bleiben
damit unberührt, die Streuung im Grund sinkt von acht auf 1,8 Stufen.
"""
import pathlib

from PIL import Image, ImageFilter
import numpy as np

HIER = pathlib.Path(__file__).parent

ZIEL = np.array([0x13, 0x14, 0x11], float)

a = np.asarray(Image.open(HIER / 'mann-hero-original.webp').convert('RGB')).astype(float)
h, w, _ = a.shape
lum = a @ [.2126, .7152, .0722]
grund = lum < 45                      # Grund, Haar und Schatten

# Grundfeld grob schaetzen: Median je Rasterzelle, Luecken aus Nachbarn fuellen
RZ = 24
feld = np.full((h // RZ + 1, w // RZ + 1, 3), np.nan)
for y in range(feld.shape[0]):
    for x in range(feld.shape[1]):
        z = a[y*RZ:(y+1)*RZ, x*RZ:(x+1)*RZ]
        m = grund[y*RZ:(y+1)*RZ, x*RZ:(x+1)*RZ]
        if m.sum() > RZ * RZ * .55:
            feld[y, x] = np.median(z[m], 0)

for _ in range(60):                   # Luecken (Person) aus dem Rand einwaschen
    luecke = np.isnan(feld[..., 0])
    if not luecke.any():
        break
    p = np.pad(feld, ((1, 1), (1, 1), (0, 0)), constant_values=np.nan)
    nach = np.nanmean(np.stack([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]]), 0)
    feld[luecke] = nach[luecke]

feld_bild = Image.fromarray(np.clip(feld, 0, 255).astype(np.uint8))
feld_bild = feld_bild.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))
F = np.asarray(feld_bild).astype(float)

gewicht = np.clip(1 - lum / 60, 0, 1)[..., None] ** 1.2
aus = np.clip(a + (ZIEL - F) * gewicht, 0, 255).astype(np.uint8)

bild = Image.fromarray(aus)
bild.resize((1500, round(1500 * h / w)), Image.LANCZOS).save(
    HIER / 'mann-hero.webp', quality=84, method=6)

# Kontrolle
b = np.asarray(Image.open(HIER / 'mann-hero.webp').convert('RGB')).astype(float)
H, W, _ = b.shape
for name, (x0, x1, y0, y1) in {
    'Ecke o.l.': (0, 200, 0, 200), 'Ecke o.r.': (W-200, W, 0, 200),
    'Ecke u.l.': (0, 200, H-200, H), 'Ecke u.r.': (W-200, W, H-200, H),
    'links Kopf': (150, 400, 120, 520), 'rechts Kopf': (1150, 1400, 120, 520),
    'oben Mitte': (560, 940, 10, 50),
}.items():
    med = np.median(b[y0:y1, x0:x1].reshape(-1, 3), 0).astype(int)
    print(f'{name:12s} #{med[0]:02x}{med[1]:02x}{med[2]:02x}')
