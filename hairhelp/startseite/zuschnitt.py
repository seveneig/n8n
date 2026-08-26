"""Schneidet die drei Vorher/Nachher-Paare deckungsgleich auf 4:3 zu.

Die sechs Aufnahmen sind unterschiedlich gerahmt – ohne Ausgleich springt der
Kopf, sobald man den Regler zieht. Für jedes Einzelbild sind Kopfoberkante,
Kinn und Gesichtsmitte aus dem Bild abgelesen; daraus wird ein Ausschnitt
berechnet, in dem der Kopf überall gleich gross an derselben Stelle sitzt.
"""
from PIL import Image

# Datei: (Kopfoberkante, Kinn, Gesichtsmitte) in Bildkoordinaten
KOEPFE = {
    'v1_0.webp': (35, 700, 1160),
    'v1_1.webp': (30, 835, 1235),
    'v2_0.webp': (125, 430, 558),
    'v2_1.webp': (130, 430, 538),
    'v3_0.webp': (120, 560, 815),
    'v3_1.webp': (45, 330, 520),
}

KOPF_ANTEIL = 0.46    # Kopfhöhe im Verhältnis zur Ausschnitthöhe
OBEN_ANTEIL = 0.16    # Luft über dem Kopf
SEITEN = 4 / 3

def ausschnitt(datei, breite_aus=1000):
    y_oben, y_kinn, x_mitte = KOEPFE[datei]
    im = Image.open(datei).convert('RGB')
    W, H = im.size
    kopf_h = y_kinn - y_oben
    h = kopf_h / KOPF_ANTEIL
    w = h * SEITEN
    # nicht grösser als das Bild
    f = min(1.0, W / w, H / h)
    w, h = w * f, h * f
    x0 = x_mitte - w / 2
    y0 = y_oben - OBEN_ANTEIL * h
    x0 = max(0, min(x0, W - w))
    y0 = max(0, min(y0, H - h))
    aus = im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h)))
    return aus.resize((breite_aus, round(breite_aus / SEITEN)), Image.LANCZOS)

if __name__ == '__main__':
    for d in KOEPFE:
        a = ausschnitt(d)
        a.save('zu_' + d.replace('.webp', '.png'))
        print(d, Image.open(d).size, '->', a.size)
