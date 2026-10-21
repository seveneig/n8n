"""Erzeugt das HTML des Testformulars (Layout) – Schritt 1 von 3.

Aufruf: python3 -I formular.py <ausgabe.html>

Inhalt (Texte, Bilder, Farbcodes, Dokumentnummer) entspricht dem Formular
«WIP Smell-QMS Olfaction_Test Formular D 261007»; nur das Layout ist neu.
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
        zeilen += f'<div class="zeile {schluessel}"><span class="lbl">{text}</span>{kaestchen}</div>'
    return (f'<section class="seq"><div class="nr">{nr}</div>'
            f'<div class="bilder"><span></span>{bilder}</div>{zeilen}</section>')


def fuss(seite):
    return f'<footer><span>{DOKNR}</span><span>{seite}(2)</span></footer>'


CSS = f"""
@font-face {{ font-family: 'EbrimaPDF'; font-weight: 400; src: url('{url(SCHRIFT / 'ebrima.ttf')}'); }}
@font-face {{ font-family: 'EbrimaPDF'; font-weight: 700; src: url('{url(SCHRIFT / 'ebrima-bold.ttf')}'); }}
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ background: #fff; }}
body {{ font-family: 'EbrimaPDF', ebrima, sans-serif; color: #16233A; font-size: 10.5pt; line-height: 1.35;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }}

:root {{
  --blau: #4A7DBA; --tinte: #16233A; --grau: #808080; --gruen: #76923C; --orange: #E8975C;
  --band-beide: #E3E3E3; --band-rechts: #DCE8C6; --band-links: #FADCC4;
}}

.seite {{ width: 210mm; height: 297mm; padding: 11mm 16mm 9mm; position: relative;
          display: flex; flex-direction: column; break-after: page; overflow: hidden; }}
.seite:last-child {{ break-after: auto; }}

/* Kopf */
.kopf {{ display: grid; grid-template-columns: 30mm 1fr 30mm; align-items: center; height: 24mm; }}
.kopf .maskott {{ height: 19mm; width: auto; justify-self: start; }}
.kopf .logo {{ height: 15mm; width: auto; justify-self: end; }}
.kopf h1 {{ text-align: center; font-size: 16pt; font-weight: 700; line-height: 1.2; color: var(--tinte); }}
.kopf--klein {{ height: 17mm; grid-template-columns: 1fr 30mm; }}
.kopf--klein .logo {{ grid-column: 2; }}

/* Patientendaten */
.pat {{ display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 0 5mm; margin-top: 5mm; }}
.pat label {{ display: block; font-size: 9pt; font-weight: 700; color: var(--tinte); letter-spacing: .02em; }}
.feld {{ height: 7.6mm; margin-top: 1.2mm; border: 0.9pt solid var(--blau); border-radius: 1.6mm; background: #fff; }}

.intro {{ margin-top: 5mm; font-size: 10.5pt; line-height: 1.5; text-align: left; hyphens: manual; max-width: 168mm; }}

/* Sequenzen */
.seqs {{ margin-top: 4mm; border-top: 1.1pt solid var(--blau); }}
.seq {{ display: grid; grid-template-columns: 11mm 1fr; border-bottom: 1.1pt solid var(--blau); padding: 2.6mm 0 2.8mm; }}
.nr {{ grid-row: 1 / span 4; align-self: center; font-size: 19pt; font-weight: 700; color: var(--blau); padding-left: 1mm; }}
.bilder, .zeile {{ display: grid; grid-template-columns: 19mm repeat(3, 1fr); grid-column: 2; }}
figure {{ display: grid; justify-items: center; align-content: end; }}
.bild {{ height: 17.5mm; width: 30mm; display: flex; align-items: flex-end; justify-content: center; }}
.bild img {{ max-height: 17.5mm; max-width: 30mm; }}
figcaption {{ margin-top: 0.8mm; font-size: 9.5pt; font-weight: 700; line-height: 1.1; }}
.zeile {{ height: 5.6mm; align-items: center; }}
.zeile:nth-child(3) {{ margin-top: 1.6mm; }}
.zeile .lbl {{ font-size: 8.8pt; font-weight: 700; padding-left: 2mm; }}
.zeile.beide {{ background: var(--band-beide); }}
.zeile.rechts {{ background: var(--band-rechts); }}
.zeile.links {{ background: var(--band-links); }}
.zelle {{ display: flex; justify-content: center; }}
.box {{ display: block; width: 4.3mm; height: 4.3mm; border: 1pt solid var(--blau); background: #fff; border-radius: 0.4mm; }}

/* Auswertung */
.ausw {{ margin-top: 7mm; display: grid; grid-template-columns: 1fr 66mm; gap: 0 12mm; }}
.ausw h2 {{ font-size: 11.5pt; font-weight: 700; }}
.ausw h3 {{ font-size: 9.5pt; font-weight: 700; }}
.ausw-tab {{ display: grid; grid-template-columns: 1fr 7mm 24mm; align-items: center; gap: 2.4mm 3mm; margin-top: 2.2mm; }}
.ausw-tab .kopfz {{ font-size: 8.5pt; font-weight: 700; color: #5C6E85; text-align: center; }}
.ausw-tab .feld {{ margin-top: 0; height: 7mm; }}
.ausw-tab .box {{ justify-self: center; width: 4.6mm; height: 4.6mm; }}
.g {{ color: var(--grau); font-weight: 700; }} .gr {{ color: var(--gruen); font-weight: 700; }} .o {{ color: var(--orange); font-weight: 700; }}
.pruefer label {{ display: block; margin-top: 2.6mm; font-size: 9pt; font-weight: 700; }}
.pruefer .feld {{ height: 7mm; }}
.maskott-unten {{ position: absolute; right: 16mm; bottom: 18mm; height: 20mm; }}

footer {{ margin-top: auto; display: flex; justify-content: space-between; font-size: 7.5pt; color: #5C6E85;
          border-top: 0.5pt solid #C9D6E3; padding-top: 1.6mm; }}
"""


def seite1():
    return f"""
<div class="seite">
  <header class="kopf">
    <img class="maskott" src="{url(ASSETS / 'icons' / 'maskottchen.webp')}" alt="">
    <h1>SMELL Discettes Olfaction Test Formular</h1>
    <img class="logo" src="{url(ASSETS / 'logo' / 'logo.webp')}" alt="">
  </header>
  <div class="pat">
    <label>Name<div class="feld" data-feld="Name"></div></label>
    <label>Vorname<div class="feld" data-feld="Vorname"></div></label>
    <label>Geburtsdatum<div class="feld" data-feld="Geburtsdatum"></div></label>
  </div>
  <p class="intro">Kreuzen Sie bitte in jeder der 8 Sequenzen unten dasjenige Bild an, welches
  am besten mit dem Duft korrespondiert, den Sie eben gerochen haben. Der Test kann mit beiden
  Nasenöffnungen oder auch rechts und links getrennt erfolgen. Danke für Ihre Mitarbeit!</p>
  <div class="seqs">{''.join(sequenz(i + 1, SEQUENZEN[i]) for i in range(4))}</div>
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
    <img class="logo" src="{url(ASSETS / 'logo' / 'logo.webp')}" alt="">
  </header>
  <div class="seqs">{''.join(sequenz(i + 1, SEQUENZEN[i]) for i in range(4, 8))}</div>
  <section class="ausw">
    <div>
      <h2>Testauswertung:</h2>
      <div class="ausw-tab">
        <span></span><span></span><span class="kopfz">Anzahl Punkte</span>
        {zeilen}
      </div>
    </div>
    <div class="pruefer">
      <h3>Prüferin / Prüfer</h3>
      <label>Name<div class="feld" data-feld="Pruefer_Name"></div></label>
      <label>Datum<div class="feld" data-feld="Pruefer_Datum"></div></label>
    </div>
  </section>
  <img class="maskott-unten" src="{url(ASSETS / 'icons' / 'maskottchen.webp')}" alt="">
  {fuss(2)}
</div>"""


html = f"""<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>SMELL Discettes Olfaction Test Formular</title><style>{CSS}</style></head>
<body>{seite1()}{seite2()}</body></html>"""
Path(sys.argv[1]).write_text(html, encoding='utf-8')
print('HTML geschrieben:', sys.argv[1])
