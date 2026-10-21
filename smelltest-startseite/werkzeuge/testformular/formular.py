"""Erzeugt das HTML des Testformulars (Layout) – Schritt 1 von 3.

Aufruf: python3 -I formular.py <ausgabe.html>

Inhalt (Texte, Bilder, Farbcodes, Dokumentnummer) entspricht dem Formular
«WIP Smell-QMS Olfaction_Test Formular D 261007»; nur die Gestaltung ist neu,
im Stil der Website (Farben und Formen aus assets/css/sd.css).
Felder sind mit data-feld / data-wert markiert; Schritt 2 misst ihre
Position und Schritt 3 legt dort die PDF-Formularfelder an.
"""
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
ASSETS = HIER.parent.parent / 'assets'
SCHRIFT = Path('/root/.fonts')  # ebrima.ttf / ebrima-bold.ttf (vom Kunden geliefert)

DOKNR = 'WIP Smell-QMS Olfaction_Test Formular D 261007'

SEQUENZEN = [
    [('Kaffee', '01-1-Kaffee'), ('Tomate', '01-2-Tomate'), ('Banane', '01-3-Banane')],
    [('Apfel', '02-1_apfel'), ('Vanille', '02-2-Vanille'), ('Melone', '02-3-melone')],
    [('Benzin', '03-1-Benzin'), ('Pfirsich', '03-2-Pfirsich'), ('Pfeffer', '03-3-Pfeffer')],
    [('Rauch', '04-1-rauch'), ('Zitrone', '04-2-zitrone'), ('Gras', '04-3-Gras')],
    [('Knoblauch', '05-1-Knoblauch'), ('Ananas', 'ananas_2025'), ('Orange', '05-3-Orange')],
    [('Rose', '06-1-Rose'), ('Bier', '06-2-BIer'), ('Birne', '06-3-Birne')],
    [('Zwiebel', '07-1-zwiebel'), ('Kokosnuss', '07-2-Kokosnuss'), ('Schokolade', '07-3-Schokolade')],
    [('Fisch', '08-1-fisch'), ('Tabak', '08-2-Tabak'), ('Essig', '08-3-Essig')],
]
SEITEN = [('beide', 'beide'), ('rechts', 'rechts'), ('links', 'links')]


def url(p):
    return Path(p).resolve().as_uri()


def sequenz(nr, optionen):
    bilder = ''.join(
        f'<figure><div class="bild"><img src="{url(ASSETS / "test-svg" / (datei + ".svg"))}" alt=""></div>'
        f'<figcaption>{name}</figcaption></figure>'
        for name, datei in optionen)
    zeilen = ''
    for schluessel, text in SEITEN:
        kaestchen = ''.join(
            f'<span class="zelle"><i class="box" data-feld="Diskette{nr}_{schluessel}" data-wert="{name}"></i></span>'
            for name, _ in optionen)
        zeilen += f'<div class="zeile {schluessel}"><span class="lbl"><i></i>{text}</span>{kaestchen}</div>'
    return (f'<section class="karte"><div class="nr">{nr}</div>'
            f'<div class="bilder"><span></span>{bilder}</div><div class="zeilen">{zeilen}</div></section>')


def fuss(seite):
    return f'<footer><span>{DOKNR}</span><span>{seite}(2)</span></footer>'


CSS = f"""
@font-face {{ font-family: 'EbrimaPDF'; font-weight: 400; src: url('{url(SCHRIFT / 'ebrima.ttf')}'); }}
@font-face {{ font-family: 'EbrimaPDF'; font-weight: 700; src: url('{url(SCHRIFT / 'ebrima-bold.ttf')}'); }}
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ background: #fff; }}
body {{ font-family: 'EbrimaPDF', ebrima, sans-serif; color: var(--ink); font-size: 10pt; line-height: 1.4;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }}

:root {{
  /* Markenfarben wie auf der Website */
  --blue: #407BA0; --blue-soft: #BCD3E5; --blue-mist: #EDF4F9; --navy: #00102E;
  --ink: #16233A; --muted: #5C6E85; --line: #E1EAF2; --tint: #F5F9FC;
  /* Farbcode der Nasenseiten (wie im Original-Formular) */
  --grau: #808080; --gruen: #76923C; --orange: #E8975C;
  --grau-hell: #F1F2F4; --gruen-hell: #EEF4E3; --orange-hell: #FDF0E6;
}}

.seite {{ width: 210mm; height: 297mm; padding: 13mm 15mm 10mm; position: relative;
          display: flex; flex-direction: column; break-after: page; overflow: hidden; }}
.seite:last-child {{ break-after: auto; }}
/* Markenband oben */
.seite::before {{ content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3.2mm;
                  background: linear-gradient(90deg, var(--navy), var(--blue) 70%, var(--blue-soft)); }}

/* Kopf */
.kopf {{ display: flex; align-items: center; gap: 5mm; }}
.kopf .maskott {{ height: 17mm; width: auto; }}
.kopf .titel {{ flex: 1; }}
.kopf .eyebrow {{ display: block; font-size: 8pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--blue); }}
.kopf h1 {{ margin-top: .6mm; font-size: 19pt; font-weight: 700; line-height: 1.1; letter-spacing: -.01em; color: var(--navy); }}
.kopf .logo {{ height: 13mm; width: auto; }}
.kopf--klein {{ justify-content: space-between; padding-bottom: 5mm; border-bottom: .6pt solid var(--line); }}
.kopf--klein .titel h1 {{ font-size: 11pt; margin: 0; }}
.kopf--klein .logo {{ height: 11mm; }}

/* Patientendaten */
.pat {{ display: grid; grid-template-columns: 1.15fr 1.15fr .9fr; gap: 5.5mm; margin-top: 9mm; }}
.etikett {{ display: block; font-size: 7.5pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }}
.feld {{ height: 8.6mm; margin-top: 1.6mm; border: .8pt solid var(--blue-soft); border-radius: 2.2mm; background: #fff; }}

.intro {{ margin-top: 7mm; padding: 4mm 5mm 4mm 5.5mm; border-radius: 3mm; background: var(--tint);
          border-left: 1.2mm solid var(--blue); font-size: 10pt; line-height: 1.55; color: var(--ink); }}

/* Sequenzen als Karten */
.raster {{ display: grid; grid-template-columns: 1fr 1fr; gap: 7mm 5.5mm; margin-top: 9mm; }}
.karte {{ position: relative; padding: 5.5mm 5mm 5mm; border: .7pt solid var(--line); border-radius: 3.5mm; background: #fff; }}
.nr {{ position: absolute; left: 5mm; top: 5mm; width: 9mm; height: 9mm; border-radius: 50%;
       display: grid; place-items: center; background: var(--navy); color: #fff; font-size: 12pt; font-weight: 700; line-height: 1; }}
.bilder, .zeile {{ display: grid; grid-template-columns: 14mm repeat(3, 1fr); }}
figure {{ display: grid; justify-items: center; align-content: end; }}
.bild {{ height: 21mm; width: 100%; display: flex; align-items: flex-end; justify-content: center; }}
.bild img {{ max-height: 21mm; max-width: 18mm; }}
figcaption {{ margin-top: 2mm; font-size: 9.2pt; font-weight: 700; line-height: 1.1; color: var(--navy); }}
.zeilen {{ margin-top: 4.5mm; display: grid; gap: 1.8mm; }}
.zeile {{ height: 7.8mm; align-items: center; border-radius: 1.8mm; }}
.zeile .lbl {{ display: flex; align-items: center; gap: 1.4mm; padding-left: 1.8mm; font-size: 7.8pt; font-weight: 700; color: var(--ink); }}
.zeile .lbl i {{ width: 2mm; height: 2mm; border-radius: 50%; }}
.zeile.beide {{ background: var(--grau-hell); }}   .zeile.beide .lbl i {{ background: var(--grau); }}
.zeile.rechts {{ background: var(--gruen-hell); }} .zeile.rechts .lbl i {{ background: var(--gruen); }}
.zeile.links {{ background: var(--orange-hell); }} .zeile.links .lbl i {{ background: var(--orange); }}
.zelle {{ display: flex; justify-content: center; }}
.box {{ display: block; width: 4.8mm; height: 4.8mm; border: .9pt solid var(--blue); background: #fff; border-radius: .9mm; }}

/* Auswertung */
.unten {{ display: grid; grid-template-columns: 1.25fr 1fr; gap: 5.5mm; margin-top: 8mm; }}
.panel {{ padding: 5mm; border-radius: 3.5mm; }}
.panel--tint {{ background: var(--tint); }}
.panel--rand {{ border: .7pt solid var(--line); }}
.panel h2 {{ font-size: 11.5pt; font-weight: 700; color: var(--navy); }}
.ausw-tab {{ display: grid; grid-template-columns: 1fr 9mm 24mm; align-items: center; gap: 3mm 3mm; margin-top: 3mm; }}
.ausw-tab .kopfz {{ font-size: 7pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); text-align: center; }}
.ausw-tab .feld {{ margin-top: 0; height: 8mm; }}
.ausw-tab .box {{ justify-self: center; width: 4.8mm; height: 4.8mm; }}
.ausw-tab > span {{ font-size: 9.8pt; }}
.g {{ color: var(--grau); font-weight: 700; }} .gr {{ color: var(--gruen); font-weight: 700; }} .o {{ color: var(--orange); font-weight: 700; }}
.pruefer .etikett {{ margin-top: 3.4mm; }}
.pruefer .feld {{ height: 8mm; }}
.maskott-unten {{ position: absolute; right: 15mm; bottom: 17mm; height: 19mm; }}

footer {{ margin-top: auto; display: flex; justify-content: space-between; font-size: 7pt; color: var(--muted);
          border-top: .5pt solid var(--line); padding-top: 2mm; }}
"""


def seite1():
    return f"""
<div class="seite">
  <header class="kopf">
    <img class="maskott" src="{url(ASSETS / 'icons' / 'maskottchen.webp')}" alt="">
    <div class="titel"><span class="eyebrow">SMELL Discettes</span><h1>Olfaction Test Formular</h1></div>
    <img class="logo" src="{url(ASSETS / 'logo' / 'logo.webp')}" alt="">
  </header>
  <div class="pat">
    <label><span class="etikett">Name</span><div class="feld" data-feld="Name"></div></label>
    <label><span class="etikett">Vorname</span><div class="feld" data-feld="Vorname"></div></label>
    <label><span class="etikett">Geburtsdatum</span><div class="feld" data-feld="Geburtsdatum"></div></label>
  </div>
  <p class="intro">Kreuzen Sie bitte in jeder der 8 Sequenzen unten dasjenige Bild an, welches
  am besten mit dem Duft korrespondiert, den Sie eben gerochen haben. Der Test kann mit beiden
  Nasenöffnungen oder auch rechts und links getrennt erfolgen. Danke für Ihre Mitarbeit!</p>
  <div class="raster">{''.join(sequenz(i + 1, SEQUENZEN[i]) for i in range(4))}</div>
  {fuss(1)}
</div>"""


def seite2():
    zeilen = ''.join(
        f'<span>{label}</span><i class="box" data-feld="Getestet_{k}" data-wert="Ja"></i>'
        f'<div class="feld" data-feld="Punkte_{k}"></div>'
        for k, label in (('beide', '<span class="g">beide</span> Nasenöffnungen'),
                         ('rechts', '<span class="gr">rechte</span> Nasenöffnung'),
                         ('links', '<span class="o">linke</span> Nasenöffnung')))
    return f"""
<div class="seite">
  <header class="kopf kopf--klein">
    <div class="titel"><span class="eyebrow">SMELL Discettes</span><h1>Olfaction Test Formular</h1></div>
    <img class="logo" src="{url(ASSETS / 'logo' / 'logo.webp')}" alt="">
  </header>
  <div class="raster">{''.join(sequenz(i + 1, SEQUENZEN[i]) for i in range(4, 8))}</div>
  <div class="unten">
    <section class="panel panel--tint">
      <h2>Testauswertung:</h2>
      <div class="ausw-tab">
        <span></span><span></span><span class="kopfz">Anzahl Punkte</span>
        {zeilen}
      </div>
    </section>
    <section class="panel panel--rand pruefer">
      <h2>Prüferin / Prüfer</h2>
      <label><span class="etikett">Name</span><div class="feld" data-feld="Pruefer_Name"></div></label>
      <label><span class="etikett">Datum</span><div class="feld" data-feld="Pruefer_Datum"></div></label>
    </section>
  </div>
  <img class="maskott-unten" src="{url(ASSETS / 'icons' / 'maskottchen.webp')}" alt="">
  {fuss(2)}
</div>"""


html = f"""<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>SMELL Discettes Olfaction Test Formular</title><style>{CSS}</style></head>
<body>{seite1()}{seite2()}</body></html>"""
Path(sys.argv[1]).write_text(html, encoding='utf-8')
print('HTML geschrieben:', sys.argv[1])
