"""Macht das Olfaction-Test-Formular ausfüllbar.

Aufruf: python3 -I formular_bauen.py <eingabe.pdf> <ausgabe.pdf>

- Je Sequenz und Nasenseite bilden die drei Bilder eine Optionsgruppe:
  höchstens eine Auswahl, Anzeige als Kreuz wie auf dem Papierformular.
- Textfelder für Name, Vorname, Geburtsdatum, Punkte, Prüfer, Datum.
- In Acrobat/Adobe Reader werden die Punkte je Nasenseite automatisch
  gezählt und das zugehörige Kästchen der Testauswertung gesetzt.
"""
import sys
import pymupdf

QUELLE, ZIEL = sys.argv[1], sys.argv[2]

OPTIONEN = [
    ['Kaffee', 'Tomate', 'Banane'],
    ['Apfel', 'Vanille', 'Melone'],
    ['Benzin', 'Pfirsich', 'Pfeffer'],
    ['Rauch', 'Zitrone', 'Gras'],
    ['Knoblauch', 'Ananas', 'Orange'],
    ['Rose', 'Bier', 'Birne'],
    ['Zwiebel', 'Kokosnuss', 'Schokolade'],
    ['Fisch', 'Tabak', 'Essig'],
]
RICHTIG = ['Kaffee', 'Vanille', 'Pfirsich', 'Gras', 'Ananas', 'Rose', 'Schokolade', 'Fisch']
SEITEN = ['beide', 'rechts', 'links']
# x-Position der Kästchen je Nasenseite, für Bild 1, 2, 3
SPALTEN = {
    'beide':  [193.8, 286.1, 374.8],
    'rechts': [215.5, 307.9, 396.4],
    'links':  [238.4, 330.2, 418.9],
}
BLAU_DUNKEL = '0.07 0.16 0.36'  # Farbe des Kreuzes

doc = pymupdf.open(QUELLE)
seiten_xref = [doc[i].xref for i in range(doc.page_count)]


def neu(objekt, stream=None):
    x = doc.get_new_xref()
    doc.update_object(x, objekt)
    if stream is not None:
        doc.update_stream(x, stream)
    return x


def pdf_text(s):
    return '(' + s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)') + ')'


# ---------- Kästchen aus der Seite lesen ------------------------------
def kaestchen(seite):
    q = [dr['rect'] for dr in doc[seite].get_drawings()
         if round(dr['rect'].width) == 13 and round(dr['rect'].height) == 14]
    return sorted(q, key=lambda r: (round(r.y0 / 4), r.x0))


def zu_seite(x):
    for s, xs in SPALTEN.items():
        for i, sx in enumerate(xs):
            if abs(x - sx) < 3:
                return s, i
    return None, None


# ---------- Erscheinungsbilder ----------------------------------------
_ap_cache = {}


def ap_kreuz(w, h):
    k = ('x', round(w, 2), round(h, 2))
    if k not in _ap_cache:
        m = 3.2
        inhalt = (f'q {BLAU_DUNKEL} RG 1.7 w 1 J '
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


def rechteck(r, pad=0.0):
    return f'[{r.x0 + pad:.2f} {doc[0].rect.height - r.y1 + pad:.2f} {r.x1 - pad:.2f} {doc[0].rect.height - r.y0 - pad:.2f}]'


def rect_pdf(seite, r, pad=0.0):
    h = doc[seite].rect.height
    return f'[{r.x0 + pad:.2f} {h - r.y1 + pad:.2f} {r.x1 - pad:.2f} {h - r.y0 - pad:.2f}]'


def optionsgruppe(name, kinder):
    """kinder: Liste (seite, rect, exportwert). Kreuz-Darstellung, abwählbar."""
    eltern = doc.get_new_xref()
    kids = []
    for seite, r, wert in kinder:
        w, h = r.width, r.height
        ein, aus = ap_kreuz(w, h), ap_leer(w, h)
        k = neu(f'<< /Type /Annot /Subtype /Widget /Parent {eltern} 0 R /P {seiten_xref[seite]} 0 R '
                f'/Rect {rect_pdf(seite, r)} /F 4 /AS /Off /MK << /CA (8) >> '
                f'/DA (/ZaDb 0 Tf {BLAU_DUNKEL} rg) '
                f'/AP << /N << /{wert} {ein} 0 R /Off {aus} 0 R >> >> >>')
        kids.append(k)
        widgets[seiten_xref[seite]].append(k)
    # Ff 32768 = Optionsfeld (ohne NoToggleToOff: eine Auswahl lässt sich wieder entfernen)
    doc.update_object(eltern, f'<< /FT /Btn /Ff 32768 /T {pdf_text(name)} /V /Off '
                              f'/Kids [{" ".join(f"{k} 0 R" for k in kids)}] >>')
    felder.append(eltern)
    return eltern


def kontrollkaestchen(name, seite, r):
    w, h = r.width, r.height
    x = neu(f'<< /Type /Annot /Subtype /Widget /FT /Btn /T {pdf_text(name)} /V /Off /AS /Off '
            f'/P {seiten_xref[seite]} 0 R /Rect {rect_pdf(seite, r)} /F 4 /MK << /CA (8) >> '
            f'/DA (/ZaDb 0 Tf {BLAU_DUNKEL} rg) '
            f'/AP << /N << /Ja {ap_kreuz(w, h)} 0 R /Off {ap_leer(w, h)} 0 R >> >> >>')
    widgets[seiten_xref[seite]].append(x)
    felder.append(x)
    return x


def textfeld(name, seite, r, groesse=11, format_js=None, rechnen_js=None, max_len=None, mittig=False, taste_js=None):
    aa = ''
    if taste_js:
        aa += f'/V << /S /JavaScript /JS {pdf_text(taste_js)} >> '
    if format_js:
        aa += f'/F << /S /JavaScript /JS {pdf_text(format_js[0])} >> /K << /S /JavaScript /JS {pdf_text(format_js[1])} >> '
    if rechnen_js:
        aa += f'/C << /S /JavaScript /JS {pdf_text(rechnen_js)} >> '
    x = neu(f'<< /Type /Annot /Subtype /Widget /FT /Tx /T {pdf_text(name)} /V () '
            f'/P {seiten_xref[seite]} 0 R /Rect {rect_pdf(seite, r)} /F 4 '
            f'/DA (/Helv {groesse} Tf 0 0.06 0.18 rg) /MK << >> '
            + (f'/Q 1 ' if mittig else '')
            + (f'/MaxLen {max_len} ' if max_len else '')
            + (f'/AA << {aa}>> ' if aa else '') + '>>')
    widgets[seiten_xref[seite]].append(x)
    felder.append(x)
    if rechnen_js:
        rechne.append(x)
    return x


# ---------- Seite 1: Kopf ---------------------------------------------
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
DATUM = None
textfeld('Name', 0, pymupdf.Rect(126.0, 136.0, 272.0, 157.3), groesse=11)
textfeld('Vorname', 0, pymupdf.Rect(351.0, 135.1, 505.7, 156.5), groesse=11)
textfeld('Geburtsdatum', 0, pymupdf.Rect(350.5, 160.1, 505.2, 181.4), groesse=11, taste_js=DATUM_JS)

# ---------- Sequenzen auf beiden Seiten --------------------------------
gruppen = {}  # (sequenz, nasenseite) -> Liste (seite, rect, wert)
for seite, erste_sequenz in ((0, 0), (1, 4)):
    reihen = {}
    for r in kaestchen(seite):
        ns, idx = zu_seite(r.x0)
        if ns is None:
            continue  # Kästchen der Testauswertung
        reihen.setdefault(ns, []).append((r, idx))
    for ns, liste in reihen.items():
        # je Nasenseite: nach y sortieren, je drei Kästchen bilden eine Sequenz
        liste.sort(key=lambda t: (t[0].y0, t[0].x0))
        assert len(liste) == 12, (seite, ns, len(liste))
        for n in range(4):
            seq = erste_sequenz + n
            drei = sorted(liste[n * 3:(n + 1) * 3], key=lambda t: t[1])
            for r, idx in drei:
                gruppen.setdefault((seq, ns), []).append((seite, r, OPTIONEN[seq][idx]))

for seq in range(8):
    for ns in SEITEN:
        kinder = gruppen[(seq, ns)]
        assert len(kinder) == 3
        optionsgruppe(f'Diskette{seq + 1}_{ns}', kinder)

# ---------- Seite 2: Testauswertung -----------------------------------
AUSWERTUNG_KAESTCHEN = {'beide': 653, 'rechts': 678, 'links': 700}
AUSWERTUNG_PUNKTE = {
    'beide':  pymupdf.Rect(234.0, 652.6, 301.1, 671.8),
    'rechts': pymupdf.Rect(233.0, 676.0, 300.1, 695.3),
    'links':  pymupdf.Rect(233.8, 700.0, 300.8, 719.2),
}
eval_boxen = {}
for r in kaestchen(1):
    if zu_seite(r.x0)[0] is None:
        for ns, y in AUSWERTUNG_KAESTCHEN.items():
            if abs(r.y0 - y) < 3:
                eval_boxen[ns] = r
assert len(eval_boxen) == 3, eval_boxen

for ns in SEITEN:
    kontrollkaestchen(f'Getestet_{ns}', 1, eval_boxen[ns])

RICHTIG_JS = '[' + ','.join(f'"{w}"' for w in RICHTIG) + ']'
for ns in SEITEN:
    js = (f'var richtig = {RICHTIG_JS};\n'
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
    textfeld(f'Punkte_{ns}', 1, AUSWERTUNG_PUNKTE[ns], groesse=12, rechnen_js=js, mittig=True)

# Prüferin / Prüfer
textfeld('Pruefer_Name', 1, pymupdf.Rect(354.3, 651.5, 470.0, 667.0), groesse=10.5)
textfeld('Pruefer_Datum', 1, pymupdf.Rect(357.8, 700.7, 470.0, 716.2), groesse=10.5, taste_js=DATUM_JS)

# ---------- Formular eintragen ----------------------------------------
helv = neu('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
zadb = neu('<< /Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats >>')
acro = neu(f'<< /Fields [{" ".join(f"{f} 0 R" for f in felder)}] '
           f'/CO [{" ".join(f"{f} 0 R" for f in rechne)}] '
           f'/DR << /Font << /Helv {helv} 0 R /ZaDb {zadb} 0 R >> >> '
           f'/DA (/Helv 0 Tf 0 g) >>')
doc.xref_set_key(doc.pdf_catalog(), 'AcroForm', f'{acro} 0 R')

for pxref, ws in widgets.items():
    alt = doc.xref_get_key(pxref, 'Annots')
    bestehend = alt[1].strip('[]') if alt[0] == 'array' else ''
    doc.xref_set_key(pxref, 'Annots', '[' + (bestehend + ' ' if bestehend else '') + ' '.join(f'{w} 0 R' for w in ws) + ']')
    doc.xref_set_key(pxref, 'Tabs', '/R')

doc.set_metadata({**{k: v for k, v in doc.metadata.items() if v and k not in ('format', 'encryption')},
                  'title': 'SMELL Discettes Olfaction Test Formular',
                  'author': 'SMELL Discettes GmbH',
                  'creator': 'SMELL Discettes GmbH',
                  'subject': 'Ausfüllbares Testformular'})
doc.save(ZIEL, garbage=3, deflate=True)
print('Felder:', len(felder), '| Optionsgruppen:', len(gruppen), '| Widgets:', sum(len(v) for v in widgets.values()))
