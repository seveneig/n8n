#!/usr/bin/env python3
"""Baut die neue Auftaktsektion der Männerseite mit dem Studiofoto.

Es entstehen drei Dateien:

  hero-mann.html          eigenständig, alles eingebettet – zum Ansehen
  hero-mann.css           zum Einbau: Elementor → Website-Einstellungen → CSS
  hero-mann-widget.html   zum Einbau: ins HTML-Widget

Klassische Hero-Struktur: das Foto liegt als Hintergrund über der ganzen
Fläche, darüber ein Schleier, darüber der Satz.

Der Schleier hat genau die Farbe des Studiogrunds (#131410, gemessen und
durch grund-glaetten.py geglättet). Er dunkelt also nicht mit einem fremden
Schwarz ab, sondern verstärkt den Grund, den das Foto schon hat – links, wo
der Satz steht, dicht; rechts, wo der Mann steht, licht.

Das Foto ist von breit-machen.py nach links verbreitert. Ohne das stünde der
Mann in der Mitte der Fläche, also genau unter der Schrift.

Getrennte CSS-Datei, weil WP Rocket mit „Ungenutztes CSS entfernen" einen
inline gesetzten <style>-Block wegräumt (das ist auf der Website schon
einmal passiert).
"""
import base64
import json
import pathlib

HIER = pathlib.Path(__file__).parent
QUELLE = HIER.parent / 'maenner.html'

quelle = QUELLE.read_text(encoding='utf-8')
mittel = json.loads((HIER.parent / 'assets.json').read_text(encoding='utf-8'))

KLASSE = 'hh-auftakt'
W = f'.{KLASSE}.{KLASSE}'

# Adresse des Fotos in der WordPress-Mediathek. Für die Widget-Fassung.
BILD_URL = '/wp-content/uploads/hairhelp/mann-hero-breit.webp'
BILD_ALT = ('Lächelnder Mann mit vollem, dichtem Haar vor dunklem Studiogrund')


def token_block(anfang: str) -> str:
    """Liest einen Deklarationsrumpf (nur die --token:wert-Zeilen) aus."""
    i = quelle.index(anfang) + len(anfang)
    rumpf = quelle[i:quelle.index('\n}', i)]
    return '\n'.join('  ' + z.strip() for z in rumpf.split('\n')
                     if z.strip().startswith('--'))


HELL = token_block(':root{')
DUNKEL = token_block('@media (prefers-color-scheme: dark){\n'
                     '  :root:not([data-theme="light"]){')

# Gemessen am geglätteten Foto: Median des Studiogrunds über die
# personenfreien Randspalten, n = 577'530 Bildpunkte, Streuung 1.8 Stufen.
GRUND = '#131410'


CSS = f"""{W}{{
{HELL}
}}
/* Die Token laufen mit, damit der Block sich auch in einer dunklen
   Umgebung richtig verhält. Der Auftakt selbst bleibt in beiden
   Erscheinungsbildern dunkel – er ist die Farbe des Fotos. */
@media (prefers-color-scheme: dark){{
  :root:not([data-theme="light"]) {W}{{
{DUNKEL}
  }}
}}
:root[data-theme="dark"] {W}{{
{DUNKEL}
}}

{W}{{
  /* Der Studiogrund des Fotos, gemessen und geglättet. Fläche, Schleier und
     Foto tragen damit denselben Ton. */
  --auftakt-grund:{GRUND};
}}

{W},{W} *,{W} *::before,{W} *::after{{box-sizing:border-box}}
{W}{{
  position:relative;
  isolation:isolate;
  display:flex;
  align-items:center;
  min-height:clamp(540px,50vw,760px);
  background:var(--auftakt-grund);
  color:var(--ink-text);
  font-family:Jost,"Century Gothic","Futura",system-ui,sans-serif;
  font-size:17px;
  line-height:1.7;
  -webkit-font-smoothing:antialiased;
  overflow:hidden;
  /* Der ganze Abschnitt läuft über die volle Breite, nicht nur die Farbe:
     das Foto muss bis an den Bildschirmrand reichen. Läuft die Seite dadurch
     waagrecht über, braucht die Gastseite `overflow-x:hidden` am body. */
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
}}
/* Theme-Regeln auf h1, p oder a setzen eine eigene Schrift. Vererbt wird
   sie dann nicht mehr – deshalb ausdrücklich für alles im Block. */
{W} *{{font-family:inherit}}
{W} img{{max-width:100%;display:block}}
{W} a{{color:inherit}}
{W} :focus-visible{{outline:2px solid var(--gold);outline-offset:3px;border-radius:2px}}
@media (prefers-reduced-motion: reduce){{
  {W} *,{W} *::before,{W} *::after{{
    animation-duration:.001ms!important;transition-duration:.001ms!important}}
}}

/* --- Hintergrund --------------------------------------------------------
   Das Foto füllt die ganze Fläche. `object-position:0%` zeigt den linken
   Bildteil – dort liegt der von breit-machen.py angesetzte Grund, und der
   Mann rückt dadurch nach rechts, aus dem Satzspiegel heraus. */
{W} .auftakt__grund{{
  position:absolute;inset:0;z-index:0;
  width:100%;height:100%;
  margin:0;
  object-fit:cover;
  object-position:0% center;
}}

/* --- Schleier -----------------------------------------------------------
   Waagrecht: dicht über dem Satz, licht über dem Mann. Senkrecht: oben und
   unten etwas dichter, damit auch die Augenbraue und die Zusagenzeile
   überall auf ruhigem Grund liegen. Die Deckung ist nicht geschätzt, sondern
   an der hellsten Stelle unter jeder Textzeile nachgemessen. */
{W} .auftakt__schleier{{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background:
    linear-gradient(180deg,
      rgba(19,20,16,.34) 0%,
      rgba(19,20,16,0) 26%,
      rgba(19,20,16,0) 66%,
      rgba(19,20,16,.4) 100%),
    linear-gradient(90deg,
      rgba(19,20,16,.97) 0%,
      rgba(19,20,16,.95) 28%,
      rgba(19,20,16,.82) 46%,
      rgba(19,20,16,.55) 66%,
      rgba(19,20,16,.4) 84%,
      rgba(19,20,16,.42) 100%);
}}

/* --- Der Satz ------------------------------------------------------------ */
{W} .spine{{
  position:relative;z-index:2;width:100%;
  max-width:var(--spine);margin:0 auto;padding:0 32px;
}}
{W} .auftakt__satz{{
  max-width:min(54%,620px);
  padding:92px 0;
}}
/* Dieselbe Goldlinie wie über jeder Abschnittsüberschrift der Seite. */
{W} .auftakt__satz::before{{
  content:"";display:block;width:64px;height:1px;
  background:var(--gold);margin-bottom:24px;
}}
{W} .eyebrow{{
  font-size:12px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gold);margin:0;
}}
{W} h1{{
  margin:16px 0 0;
  font-size:clamp(30px,3.5vw,46px);font-weight:700;
  line-height:1.08;letter-spacing:-.015em;text-transform:uppercase;
  text-wrap:balance;overflow-wrap:break-word;hyphens:auto;
  /* Ausdrücklich, nicht geerbt: eine Theme-Regel auf h1 schlägt sonst durch. */
  color:var(--ink-text);
}}
{W} .lede{{margin:18px 0 0;font-size:18px;color:var(--gold-lt);max-width:44ch}}
{W} .intro{{margin:20px 0 0;color:var(--ink-text-soft);max-width:52ch}}

{W} .cta{{
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  margin-top:30px;padding:15px 34px;text-decoration:none;
  background:var(--gold);border:1px solid var(--gold);border-radius:var(--radius);
  color:#1A1A18;font:inherit;font-size:14px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
  transition:background .2s,border-color .2s;
}}
{W} .cta:hover{{background:var(--ink-text);border-color:var(--ink-text);color:#1A1A18}}

{W} .auftakt__zusagen{{
  display:flex;gap:24px;flex-wrap:wrap;align-items:center;margin:26px 0 0;
  font-size:13.5px;color:var(--ink-text-soft);
}}
{W} .auftakt__zusagen span{{display:flex;align-items:center;gap:8px}}
/* Die Masse stehen zusätzlich im style-Attribut (siehe satz()), damit die
   Symbole auch dann klein bleiben, wenn dieses Stylesheet fehlt und eine
   Theme-Regel wie `svg{{width:100%;fill:#000}}` greift. Die Farbe kommt über
   `color`, weil das Attribut `stroke:currentColor` setzt. */
{W} .auftakt__zusagen svg{{color:var(--gold)}}

/* --- Schmalere Fenster ---------------------------------------------------
   Unter 1281 px reicht die Breite nicht mehr, um den Mann rechts stehen zu
   lassen: der Ausschnitt wird schmaler als der angesetzte Grund. Ab hier
   rückt `object-position` in das Foto hinein, damit sein Gesicht sichtbar
   bleibt, und der Schleier wird gleichmässiger – der Satz liegt dann über
   dem Bild, nicht mehr daneben. */
@media (max-width:1280px){{
  {W} .auftakt__grund{{object-position:62% center}}
  {W} .auftakt__satz{{max-width:min(58%,560px)}}
  {W} .auftakt__schleier{{
    background:
      linear-gradient(180deg,
        rgba(19,20,16,.34) 0%,
        rgba(19,20,16,0) 26%,
        rgba(19,20,16,0) 62%,
        rgba(19,20,16,.45) 100%),
      linear-gradient(90deg,
        rgba(19,20,16,.96) 0%,
        rgba(19,20,16,.93) 34%,
        rgba(19,20,16,.78) 58%,
        rgba(19,20,16,.6) 82%,
        rgba(19,20,16,.55) 100%);
  }}
}}
/* Einspaltig kann der Satz nicht mehr neben dem Mann stehen – er steht über
   ihm. Statt das ganze Bild flach abzudunkeln, wird es geteilt: oben bleibt
   sein Gesicht unter einem leichten Schleier sichtbar, darunter wird dicht
   abgedunkelt, und der Satz beginnt erst dort. Das Bild bleibt so ein Bild
   und nicht bloss eine dunkle Fläche. */
@media (max-width:900px){{
  /* Einspaltig steht der Satz über dem ganzen Bild, nicht mehr daneben.
     Der Schleier wird darum gleichmässig – ein Verlauf würde je nach
     Textlänge mitten im Gesicht liegen. Die Deckung von rund 0.9 ist nicht
     geschätzt: bei der hellsten Stelle des Fotos (Wange, Wert 200) und dem
     Gold der Augenbraue braucht es 0.87, damit 5:1 noch steht. Der Mann
     bleibt darunter als Gestalt erkennbar, sein Shirt hebt sich vom Grund
     ab (35 gegen 19). */
  {W}{{min-height:clamp(560px,96vw,720px)}}
  {W} .auftakt__grund{{object-position:62% center}}
  {W} .auftakt__satz{{max-width:none;padding:80px 0}}
  {W} .auftakt__schleier{{
    background:
      linear-gradient(180deg,
        rgba(19,20,16,.84) 0%,
        rgba(19,20,16,.89) 14%,
        rgba(19,20,16,.91) 100%),
      linear-gradient(90deg,
        rgba(19,20,16,.34) 0%,
        rgba(19,20,16,.14) 62%,
        rgba(19,20,16,.1) 100%);
  }}
}}
@media (max-width:720px){{
  {W}{{font-size:16px;min-height:clamp(540px,130vw,700px)}}
  {W} .spine{{padding:0 20px}}
  {W} .auftakt__satz{{padding:68px 0}}
  {W} .cta{{width:100%;padding-left:20px;padding-right:20px}}
}}
"""


def satz(bild_quelle: str) -> str:
    """Das Markup. Die Symbole tragen Masse und Strichfarbe als Attribut:
    fällt das Stylesheet weg, bleiben sie kleine Strichzeichnungen."""
    def sym(pfade: str) -> str:
        # Masse und Fülle im style-Attribut: Attribute allein stehen unter
        # jeder CSS-Regel, das style-Attribut steht über allen. Ohne das
        # wächst das Symbol unter einer Theme-Regel `svg{width:100%}` zur
        # schwarzen Fläche über die halbe Seite – genau das ist auf der
        # Website schon einmal passiert, als WP Rocket das CSS entfernt hat.
        return ('<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" '
                'width="15" height="15" fill="none" stroke="currentColor" '
                'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
                'style="width:15px;height:15px;flex:none;fill:none;'
                f'stroke:currentColor">{pfade}</svg>')

    return f"""<section class="{KLASSE}" lang="de">
  <img class="auftakt__grund" src="{bild_quelle}" alt="{BILD_ALT}"
       width="2000" height="881" fetchpriority="high" decoding="async">
  <div class="auftakt__schleier" aria-hidden="true"></div>
  <div class="spine">
    <div class="auftakt__satz">
      <p class="eyebrow">Haarverdichtung für Männer</p>
      <h1>Streuhaar für Männer – Geheimratsecken und lichte Stellen sofort verdichten</h1>
      <p class="lede">Schluss mit Geheimratsecken und lichten Stellen.</p>
      <p class="intro">Geheimratsecken, eine lichter werdende Tonsur oder allgemein dünnes Haar – viele Männer kennen dieses Problem. Bevor Sie zur Mütze greifen, gibt es eine einfache, sofort wirksame kosmetische Lösung.</p>
      <a class="cta" href="#shop">HairHelp Streuhaar bestellen</a>
      <div class="auftakt__zusagen">
        <span>{sym('<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/>')}Sichtbar in unter 60 Sekunden</span>
        <span>{sym('<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>')}30 Tage Rückgabe</span>
      </div>
    </div>
  </div>
</section>"""


daten = base64.b64encode((HIER / 'mann-hero-breit.webp').read_bytes()).decode()

(HIER / 'hero-mann.html').write_text(
    f"""<meta charset="utf-8">
<title>Auftakt Männerseite</title>
<meta name="description" content="Auftakt der Seite „Streuhaar für Männer“: {BILD_ALT}.">

<style>
/* ==========================================================================
   HairHelp – Auftakt der Männerseite

   Schrift, Farbtoken, alle benutzten Regeln und das Foto sind eingebettet –
   die Datei läuft für sich, ohne Netzwerkzugriff. Alles ist unter
   .{KLASSE} gekapselt: keine Regel auf body, * oder :root.
   ========================================================================== */

{mittel['fontcss']}

body{{margin:0;background:{GRUND}}}

{CSS}
</style>

{satz('data:image/webp;base64,' + daten)}
""", encoding='utf-8')

(HIER / 'hero-mann.css').write_text(
    f'/* HairHelp – Auftakt Männerseite\n'
    f'   Einsetzen unter Elementor → Website-Einstellungen → Benutzerdefiniertes CSS.\n'
    f'   Ohne Schrifteinbettung: Jost ist die Hausschrift der Website.\n'
    f'   Alles unter .{KLASSE} gekapselt, die Klasse steht doppelt, damit die\n'
    f'   Regeln die Theme-Regeln schlagen, ohne dass !important nötig wird.\n'
    f'   Bei WP Rocket → „Ungenutztes CSS entfernen" auf die Ausschlussliste setzen. */\n\n'
    + CSS, encoding='utf-8')

(HIER / 'hero-mann-widget.html').write_text(
    f'<!-- HairHelp – Auftakt Männerseite\n'
    f'     In ein HTML-Widget einfügen. Das Stylesheet steht in hero-mann.css\n'
    f'     und gehört unter Elementor → Website-Einstellungen →\n'
    f'     Benutzerdefiniertes CSS.\n\n'
    f'     mann-hero-breit.webp in die Mediathek laden und die Adresse unten\n'
    f'     anpassen, falls sie abweicht. -->\n'
    + satz(BILD_URL) + '\n', encoding='utf-8')

for d in ('hero-mann.html', 'hero-mann.css', 'hero-mann-widget.html'):
    p = HIER / d
    print(f'{p.name:26s} {p.stat().st_size / 1024:7.1f} KB')
