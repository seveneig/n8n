"""Schritt 3 von 3: legt die Formularfelder an den gemessenen Stellen an.

Aufruf: python3 -I felder_setzen.py <layout.pdf> <felder.json> <ausgabe.pdf>

- Je Sequenz und Nasenseite bilden die drei Bilder eine Optionsgruppe:
  höchstens eine Auswahl, Anzeige als Kreuz, wieder abwählbar.
- Textfelder für Name, Vorname, Geburtsdatum, Punkte, Prüfer, Datum.
- In Acrobat/Adobe Reader (und pdf.js) werden die Punkte je Nasenseite
  automatisch gezählt und das Kästchen der Testauswertung gesetzt.
- Bewusst ohne NeedAppearances: sonst zeichnen manche Betrachter Punkte statt Kreuze.
"""
import json
import sys
import pymupdf

QUELLE, FELDER, ZIEL = sys.argv[1], sys.argv[2], sys.argv[3]

RICHTIG = ['Kaffee', 'Vanille', 'Pfirsich', 'Gras', 'Ananas', 'Rose', 'Schokolade', 'Fisch']
SEITEN = ['beide', 'rechts', 'links']
BLAU_DUNKEL = '0.07 0.16 0.36'  # Farbe des Kreuzes und der Eingaben

doc = pymupdf.open(QUELLE)
seiten_xref = [doc[i].xref for i in range(doc.page_count)]
gemessen = json.load(open(FELDER, encoding='utf-8'))


def neu(objekt, stream=None):
    x = doc.get_new_xref()
    doc.update_object(x, objekt)
    if stream is not None:
        doc.update_stream(x, stream)
    return x


def pdf_text(s):
    return '(' + s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)') + ')'


def rect_pdf(seite, r, pad=0.0):
    """Gemessenes Rechteck (pt, Ursprung oben links) -> PDF-Koordinaten."""
    h = doc[seite].rect.height
    x0, y0, x1, y1 = r
    return f'[{x0 + pad:.2f} {h - y1 + pad:.2f} {x1 - pad:.2f} {h - y0 - pad:.2f}]'


# ---------- Erscheinungsbilder ----------------------------------------
_ap_cache = {}


def ap_kreuz(w, h):
    k = ('x', round(w, 2), round(h, 2))
    if k not in _ap_cache:
        m = 2.9
        inhalt = (f'q {BLAU_DUNKEL} RG 1.6 w 1 J '
                  f'{m} {m} m {w - m:.2f} {h - m:.2f} l S '
                  f'{m} {h - m:.2f} m {w - m:.2f} {m} l S Q').encode()
        _ap_cache[k] = neu(f'<< /Type /XObject /Subtype /Form /BBox [0 0 {w:.2f} {h:.2f}] /Resources << >> >>', inhalt)
    return _ap_cache[k]


def ap_leer(w, h):
    k = ('o', round(w, 2), round(h, 2))
    if k not in _ap_cache:
        _ap_cache[k] = neu(f'<< /Type /XObject /Subtype /Form /BBox [0 0 {w:.2f} {h:.2f}] /Resources << >> >>', b'')
    return _ap_cache[k]


# ---------- Felder ----------------------------------------------------
felder = []                       # xrefs der Felder auf oberster Ebene
widgets = {x: [] for x in seiten_xref}
rechne = []                       # Berechnungsreihenfolge


def optionsgruppe(name, kinder):
    """kinder: Liste von Messwerten (seite, rect, wert). Kreuz-Darstellung, abwählbar."""
    eltern = doc.get_new_xref()
    kids = []
    for m in kinder:
        seite, r, wert = m['seite'], m['rect'], m['wert']
        w, h = r[2] - r[0], r[3] - r[1]
        k = neu(f'<< /Type /Annot /Subtype /Widget /Parent {eltern} 0 R /P {seiten_xref[seite]} 0 R '
                f'/Rect {rect_pdf(seite, r)} /F 4 /AS /Off /MK << /CA (8) >> '
                f'/DA (/ZaDb 0 Tf {BLAU_DUNKEL} rg) '
                f'/AP << /N << /{wert} {ap_kreuz(w, h)} 0 R /Off {ap_leer(w, h)} 0 R >> >> >>')
        kids.append(k)
        widgets[seiten_xref[seite]].append(k)
    # Ff 32768 = Optionsfeld (ohne NoToggleToOff: eine Auswahl lässt sich wieder entfernen)
    doc.update_object(eltern, f'<< /FT /Btn /Ff 32768 /T {pdf_text(name)} /V /Off '
                              f'/Kids [{" ".join(f"{k} 0 R" for k in kids)}] >>')
    felder.append(eltern)


def kontrollkaestchen(m):
    seite, r = m['seite'], m['rect']
    w, h = r[2] - r[0], r[3] - r[1]
    x = neu(f'<< /Type /Annot /Subtype /Widget /FT /Btn /T {pdf_text(m["feld"])} /V /Off /AS /Off '
            f'/P {seiten_xref[seite]} 0 R /Rect {rect_pdf(seite, r)} /F 4 /MK << /CA (8) >> '
            f'/DA (/ZaDb 0 Tf {BLAU_DUNKEL} rg) '
            f'/AP << /N << /{m["wert"]} {ap_kreuz(w, h)} 0 R /Off {ap_leer(w, h)} 0 R >> >> >>')
    widgets[seiten_xref[seite]].append(x)
    felder.append(x)


def textfeld(m, groesse=11, pruef_js=None, rechnen_js=None, mittig=False):
    seite = m['seite']
    aa = ''
    if pruef_js:
        aa += f'/V << /S /JavaScript /JS {pdf_text(pruef_js)} >> '
    if rechnen_js:
        aa += f'/C << /S /JavaScript /JS {pdf_text(rechnen_js)} >> '
    # Innenabstand, damit Text und Fokusrahmen nicht auf der gezeichneten Linie liegen
    x = neu(f'<< /Type /Annot /Subtype /Widget /FT /Tx /T {pdf_text(m["feld"])} /V () '
            f'/P {seiten_xref[seite]} 0 R /Rect {rect_pdf(seite, m["rect"], pad=2.2)} /F 4 '
            f'/DA (/Helv {groesse} Tf {BLAU_DUNKEL} rg) /MK << >> '
            + ('/Q 1 ' if mittig else '')
            + (f'/AA << {aa}>> ' if aa else '') + '>>')
    widgets[seiten_xref[seite]].append(x)
    felder.append(x)
    if rechnen_js:
        rechne.append(x)


# Datum tolerant vereinheitlichen (1.1.70 -> 01.01.1970), nie ablehnen –
# die Adobe-Standardprüfung AFDate_* weist in manchen Betrachtern jedes Datum ab.
DATUM_JS = (
    'if (event.value) {\n'
    '  var m = String(event.value).match(/^\\s*(\\d{1,2})[.\\/-](\\d{1,2})[.\\/-](\\d{2}|\\d{4})\\s*$/);\n'
    '  if (m) {\n'
    '    var j = m[3];\n'
    '    if (j.length === 2) j = (parseInt(j, 10) > 30 ? "19" : "20") + j;\n'
    '    event.value = ("0" + m[1]).slice(-2) + "." + ("0" + m[2]).slice(-2) + "." + j;\n'
    '  }\n'
    '}')

RICHTIG_JS = '[' + ','.join(f'"{w}"' for w in RICHTIG) + ']'


def punkte_js(ns):
    return (f'var richtig = {RICHTIG_JS};\n'
            f'var punkte = 0, beantwortet = 0;\n'
            f'for (var i = 1; i <= 8; i++) {{\n'
            f'  var v = this.getField("Diskette" + i + "_{ns}").value;\n'
            f'  if (v && v !== "Off") {{ beantwortet++; if (v === richtig[i - 1]) punkte++; }}\n'
            f'}}\n'
            f'if (beantwortet > 0) {{\n'
            f'  event.value = punkte;\n'
            f'  this.getField("Getestet_{ns}").checkThisBox(0, true);\n'
            f'}} else {{\n'
            f'  event.value = "";\n'
            f'}}')


# ---------- Felder in Dokumentreihenfolge anlegen ----------------------
gruppen = {}
for m in gemessen:
    n = m['feld']
    if n.startswith('Diskette'):
        gruppen.setdefault(n, []).append(m)
assert len(gruppen) == 24 and all(len(k) == 3 for k in gruppen.values()), gruppen.keys()

angelegt = set()
for m in gemessen:
    n = m['feld']
    if n.startswith('Diskette'):
        if n not in angelegt:
            optionsgruppe(n, gruppen[n])
            angelegt.add(n)
    elif n.startswith('Getestet_'):
        kontrollkaestchen(m)
    elif n.startswith('Punkte_'):
        textfeld(m, groesse=12, rechnen_js=punkte_js(n.split('_')[1]), mittig=True)
    elif n in ('Geburtsdatum', 'Pruefer_Datum'):
        textfeld(m, pruef_js=DATUM_JS)
    else:
        textfeld(m)

# ---------- Formular eintragen ----------------------------------------
helv = neu('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
zadb = neu('<< /Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats >>')
acro = neu(f'<< /Fields [{" ".join(f"{f} 0 R" for f in felder)}] '
           f'/CO [{" ".join(f"{f} 0 R" for f in rechne)}] '
           f'/DR << /Font << /Helv {helv} 0 R /ZaDb {zadb} 0 R >> >> '
           f'/DA (/Helv 0 Tf 0 g) >>')
doc.xref_set_key(doc.pdf_catalog(), 'AcroForm', f'{acro} 0 R')

for pxref, ws in widgets.items():
    doc.xref_set_key(pxref, 'Annots', '[' + ' '.join(f'{w} 0 R' for w in ws) + ']')
    doc.xref_set_key(pxref, 'Tabs', '/R')

doc.set_metadata({'title': 'SMELL Discettes Olfaction Test Formular',
                  'author': 'SMELL Discettes GmbH',
                  'creator': 'SMELL Discettes GmbH',
                  'producer': 'SMELL Discettes GmbH',
                  'subject': 'Ausfüllbares Testformular'})
doc.save(ZIEL, garbage=3, deflate=True)
print('Felder:', len(felder), '| Optionsgruppen:', len(gruppen), '| Widgets:', sum(len(v) for v in widgets.values()))
