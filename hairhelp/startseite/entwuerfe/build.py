#!/usr/bin/env python3
"""Baut die Entwurfsseite für den Abschnitt „Resultate".

Fünf Richtungen, jede mit den echten Aufnahmen. Die Bilder liegen einmal als
CSS-Variablen im Kopf und werden von allen Entwürfen gemeinsam benutzt.
"""
import base64, io, json, os, pathlib
from PIL import Image

HIER = pathlib.Path(os.environ.get('HH_ZUSCHNITTE', '.'))
ZIEL = pathlib.Path(__file__).with_name('resultate-entwuerfe.html')

QUELLE = {  # Variablenname: (Querformat 4:3, Hochformat 3:4)
    'pv': ('zu_v1_0.png', 'hoch_v1_0.png'),
    'pn': ('zu_v1_1.png', 'hoch_v1_1.png'),
    'ov': ('zu_v2_0.png', 'hoch_v2_0.png'),
    'on': ('zu_v2_1.png', 'hoch_v2_1.png'),
    'mv': ('zu_v3_0.png', 'hoch_v3_0.png'),
    'mn': ('zu_v3_1.png', 'hoch_v3_1.png'),
}

def uri(pfad, breite, guete=80):
    im = Image.open(HIER / pfad).convert('RGB')
    if im.width > breite:
        im = im.resize((breite, round(im.height * breite / im.width)), Image.LANCZOS)
    puffer = io.BytesIO()
    im.save(puffer, 'WEBP', quality=guete, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(puffer.getvalue()).decode(), len(puffer.getvalue())

def bilder():
    zeilen, summe = [], 0
    for name, (quer, hoch) in QUELLE.items():
        for kuerzel, datei, breite in (('q', quer, 900), ('h', hoch, 700)):
            u, n = uri(datei, breite)
            zeilen.append(f'  --{kuerzel}{name}:url("{u}");')
            summe += n
    print(f'  Bilder: {summe/1e6:.2f} MB')
    return '\n'.join(zeilen)

FALLE = [  # Kürzel, Person, Zone, Farbton, Gruppe
    ('p', 'Priska', 'Lichter Scheitel', 'Dunkelbraun', 'f'),
    ('m', 'Mariana', 'Dünner Ansatz', 'Dunkelbraun', 'f'),
    ('o', 'Oliver', 'Geheimratsecken', 'Braun', 'm'),
    ('o', 'Oliver', 'Lichter Oberkopf', 'Braun', 'm'),
]

# ---------------------------------------------------------------- A · Achse
def achse():
    teile = []
    for i, (k, person, zone, farbe, gruppe) in enumerate(FALLE):
        platzhalter = ' <span class="ax__ph">Platzhalter</span>' if i == 3 else ''
        grp = 'Frauen' if gruppe == 'f' else 'Männer'
        teile.append(f"""      <figure class="ax__item{' ax__item--seam' if i==2 else ''}" style="--i:{i}">
        <span class="ax__img ax__img--before" style="background-image:var(--h{k}v)" role="img" aria-label="{zone}, vorher"></span>
        <span class="ax__img ax__img--after"  style="background-image:var(--h{k}n)" role="img" aria-label="{zone}, nachher"></span>
        <figcaption><b>{zone}</b><span><i class="grp">{grp}</i>{farbe}{platzhalter}</span></figcaption>
      </figure>""")
    return f"""
<section class="v v-axis">
  <div class="v__inner">
    <p class="v__eyebrow">Resultate</p>
    <h2 class="v__h2"><span>Ein Zug</span> über vier Gesichter</h2>
  </div>

  <div class="ax" data-axis>
    <div class="ax__labels v__inner">
      <span class="ax__group">Für Frauen</span>
      <span class="ax__group">Für Männer</span>
    </div>
    <div class="ax__row">
{chr(10).join(teile)}
      <span class="ax__line" aria-hidden="true"><span class="ax__knob"></span></span>
    </div>
    <input class="ax__range" type="range" min="0" max="100" value="0" step="0.1"
           aria-label="Fasern über alle vier Aufnahmen auftragen">
    <div class="ax__foot v__inner">
      <span class="ax__state" data-axis-state>Ohne Fasern</span>
      <span class="ax__hint">Ziehen &rarr;</span>
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- B · Schnitt
def schnitt():
    def haelfte(seite, titel, faelle):
        aus = []
        for k, person, zone, farbe, g in faelle:
            aus.append(f"""        <figure class="sp__case">
          <div class="cmp" data-cmp>
            <span class="cmp__img" style="background-image:var(--q{k}v)" role="img" aria-label="{zone}, vorher"></span>
            <span class="cmp__img cmp__img--after" style="background-image:var(--q{k}n)" role="img" aria-label="{zone}, nachher"></span>
            <input class="cmp__range" type="range" min="0" max="100" value="50" aria-label="Regler {zone}">
            <span class="cmp__bar" aria-hidden="true"><span class="cmp__knob"></span></span>
          </div>
          <figcaption><b>{zone}</b><span>{farbe}</span></figcaption>
        </figure>""")
        return f"""      <div class="sp__half sp__half--{seite}">
        <p class="sp__label">{titel}</p>
{chr(10).join(aus)}
      </div>"""
    return f"""
<section class="v v-split">
  <div class="v__inner">
    <p class="v__eyebrow">Resultate</p>
    <h2 class="v__h2"><span>Zwei Studios,</span> ein Ergebnis</h2>
  </div>
  <div class="sp">
{haelfte('hell','Für Frauen',[f for f in FALLE if f[4]=='f'])}
{haelfte('dunkel','Für Männer',[f for f in FALLE if f[4]=='m'])}
    <span class="sp__seam" aria-hidden="true"></span>
  </div>
</section>"""

# ---------------------------------------------------------------- C · Wand
def wand():
    def reihe(suffix, klasse, beschriften):
        aus = []
        for i, (k, person, zone, farbe, g) in enumerate(FALLE):
            grp = 'Frauen' if g == 'f' else 'Männer'
            unter = (f'<figcaption><b>{zone}</b>'
                     f'<span><i class="grp">{grp}</i>{farbe}</span></figcaption>') if beschriften else ''
            # Die obere Reihe bleibt ohne Text – die Beschriftung steht unten.
            aus.append(f"""      <figure class="wl__cell{' wl__cell--seam' if i==2 else ''}">
        <span class="wl__img {klasse}" style="background-image:var(--h{k}{suffix})" role="img" aria-label="{zone}, {'nachher' if suffix=='n' else 'vorher'}"></span>
        {unter}
      </figure>""")
        return chr(10).join(aus)
    return f"""
<section class="v v-wall">
  <div class="v__inner">
    <p class="v__eyebrow">Resultate</p>
    <h2 class="v__h2"><span>Obere Reihe ohne,</span> untere mit</h2>
  </div>
  <div class="wl">
    <div class="wl__groups v__inner"><span>Für Frauen</span><span>Für Männer</span></div>
    <div class="wl__row wl__row--before">
{reihe('v','is-before',False)}
    </div>
    <div class="wl__rule"><span>Vorher</span><i aria-hidden="true"></i><span>Nachher</span></div>
    <div class="wl__row wl__row--after">
{reihe('n','is-after',True)}
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- D · Kolonnade
def kolonnade():
    aus = []
    for i, (k, person, zone, farbe, g) in enumerate(FALLE):
        aus.append(f"""      <figure class="ko__col{' ko__col--seam' if i==2 else ''}">
        <div class="ko__arch">
          <div class="cmp" data-cmp>
            <span class="cmp__img" style="background-image:var(--h{k}v)" role="img" aria-label="{zone}, vorher"></span>
            <span class="cmp__img cmp__img--after" style="background-image:var(--h{k}n)" role="img" aria-label="{zone}, nachher"></span>
            <input class="cmp__range" type="range" min="0" max="100" value="50" aria-label="Regler {zone}">
            <span class="cmp__bar" aria-hidden="true"><span class="cmp__knob"></span></span>
          </div>
        </div>
        <figcaption><b>{zone}</b><span><i class="grp">{'Frauen' if g=='f' else 'Männer'}</i>{farbe}</span></figcaption>
      </figure>""")
    return f"""
<section class="v v-arch">
  <div class="v__inner">
    <p class="v__eyebrow">Resultate</p>
    <h2 class="v__h2"><span>Vier Portale,</span> vier Ergebnisse</h2>
  </div>
  <div class="ko v__inner">
    <div class="ko__groups"><span>Für Frauen</span><span>Für Männer</span></div>
    <div class="ko__row">
{chr(10).join(aus)}
    </div>
    <div class="ko__base" aria-hidden="true"></div>
  </div>
</section>"""

# ---------------------------------------------------------------- E · Fallakte
def fallakte():
    aus = []
    for i, (k, person, zone, farbe, g) in enumerate(FALLE):
        marke = '<span class="fa__ph">Platzhalter</span>' if i == 3 else ''
        aus.append(f"""      <figure class="fa__card">
        <div class="fa__head"><b>Fall {i+1:02d}</b><span>{'Frau' if g=='f' else 'Mann'}</span></div>
        <div class="cmp" data-cmp>
          <span class="cmp__img" style="background-image:var(--q{k}v)" role="img" aria-label="{zone}, vorher"></span>
          <span class="cmp__img cmp__img--after" style="background-image:var(--q{k}n)" role="img" aria-label="{zone}, nachher"></span>
          <input class="cmp__range" type="range" min="0" max="100" value="50" aria-label="Regler Fall {i+1}">
          <span class="cmp__bar" aria-hidden="true"><span class="cmp__knob"></span></span>
        </div>
        <dl class="fa__data">
          <div><dt>Zone</dt><dd>{zone}</dd></div>
          <div><dt>Farbton</dt><dd>{farbe}</dd></div>
          <div><dt>Anwendung</dt><dd>unter 30 Sekunden</dd></div>
        </dl>
        {marke}
      </figure>""")
    return f"""
<section class="v v-file">
  <div class="v__inner">
    <p class="v__eyebrow">Resultate</p>
    <h2 class="v__h2"><span>Vier Fälle,</span> dokumentiert</h2>
  </div>
  <div class="fa v__inner">
{chr(10).join(aus)}
  </div>
</section>"""

RICHTUNGEN = [
    ('A', 'Die Achse', achse,
     'Ein einziger Regler zieht über alle vier Aufnahmen. Wo die Goldlinie vorbei ist, sind die Fasern aufgetragen – eine Geste, vier Ergebnisse.',
     ['Bewegung als Kern', 'unverwechselbar', 'braucht Erklärung: nichts']),
    ('B', 'Der Schnitt', schnitt,
     'Die Seite selbst zerfällt in zwei Hälften: links cremefarben wie das Frauenstudio, rechts schwarz wie das Männerstudio. Die Bilder haben keinen Rahmen mehr – ihr Studiogrund läuft in den Seitengrund über.',
     ['radikal einfach', 'Bilder ohne Fassung', 'lebt vom Vollformat']),
    ('C', 'Die Wand', wand,
     'Keine Regler. Oben alle vier ohne Fasern, gedämpft; unten alle vier mit, in voller Farbe. Der Vergleich läuft von oben nach unten statt von links nach rechts.',
     ['plakativ', 'ohne Bedienung', 'ehrlich bei ungleichen Posen']),
    ('D', 'Die Kolonnade', kolonnade,
     'Vier Bogenfenster auf einer Goldlinie, wie eine Säulenreihe. Zwischen dem zweiten und dritten Bogen steht ein höherer Pfeiler – dort trennt sich Frauen von Männern.',
     ['eigene Silhouette', 'Kosmetik-Sprache', 'dekorativer']),
    ('E', 'Die Fallakte', fallakte,
     'Jeder Fall eine nummerierte Akte mit Kenndaten. Nicht Werbung, sondern Dokumentation – der Ton eines Schweizer Labors.',
     ['sachlich', 'wirkt belegt', 'am wenigsten emotional']),
]

def main():
    print('Baue Entwurfsseite …')
    css = pathlib.Path(pathlib.Path(__file__).with_name('entwuerfe.css')).read_text(encoding='utf-8')
    js = pathlib.Path(pathlib.Path(__file__).with_name('entwuerfe.js')).read_text(encoding='utf-8')
    font = json.load(open('/home/user/n8n/hairhelp/startseite/assets.json'))['fontcss']

    bloecke = []
    for buchstabe, name, bauen, text, marken in RICHTUNGEN:
        marken_html = ''.join(f'<span>{m}</span>' for m in marken)
        bloecke.append(f"""
<div class="chrome" id="richtung-{buchstabe.lower()}">
  <div class="chrome__inner">
    <span class="chrome__letter">{buchstabe}</span>
    <div class="chrome__body">
      <h3>{name}</h3>
      <p>{text}</p>
      <div class="chrome__tags">{marken_html}</div>
    </div>
  </div>
</div>
{bauen()}""")

    seite = f"""<meta charset="utf-8">
<title>Resultate · Fünf Richtungen</title>
<meta name="description" content="Fünf Entwurfsrichtungen für den Abschnitt Resultate der HairHelp-Startseite.">

<style>
{font}
:root{{
{bilder()}
}}
{css}
</style>

<header class="top">
  <div class="top__inner">
    <p class="top__eyebrow">HairHelp · Startseite</p>
    <h1>Der Abschnitt „Resultate" – fünf Richtungen</h1>
    <p class="top__lede">Fünf Entwürfe mit den echten Aufnahmen, bewusst in verschiedene Richtungen gedacht. Die Zuschnitte sind in allen fünf deckungsgleich ausgerichtet, damit der Kopf beim Ziehen nicht springt. Der vierte Fall ist noch nicht fotografiert – dort steht vorerst dasselbe Bildpaar.</p>
    <nav class="top__nav" aria-label="Zu den Richtungen">
      {''.join(f'<a href="#richtung-{b.lower()}"><b>{b}</b>{n}</a>' for b, n, *_ in RICHTUNGEN)}
    </nav>
  </div>
</header>

<main>
{''.join(bloecke)}
</main>

<footer class="ende">
  <div class="chrome__inner"><p>Sag mir, welche Richtung – oder welche Teile aus mehreren – und ich baue sie fertig in die Startseite ein.</p></div>
</footer>

<script>
{js}
</script>
"""
    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    ZIEL.write_text(seite, encoding='utf-8')
    print(f'  {ZIEL}  {ZIEL.stat().st_size/1e6:.2f} MB')

main()
