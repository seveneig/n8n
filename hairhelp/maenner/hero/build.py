#!/usr/bin/env python3
"""Baut die neue Auftaktsektion der Männerseite mit dem Studiofoto.

Es entstehen drei Dateien:

  hero-mann.html          eigenständig, alles eingebettet – zum Ansehen
  hero-mann.css           zum Einbau: Elementor → Website-Einstellungen → CSS
  hero-mann-widget.html   zum Einbau: ins HTML-Widget

Der Grundgedanke: Der Studiogrund des Fotos ist – nach dem Ausgleich der
Vignette durch grund-glaetten.py – überall #131410. Genau diese Farbe trägt
auch die Herofläche. Foto und Fläche sind damit dieselbe Oberfläche, es gibt
keine Bildkante und keinen Rahmen; der Mann steht scheinbar direkt auf der
Seite. Deshalb auch kein Passepartout und kein Radius wie bei .hero-media.

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
BILD_URL = '/wp-content/uploads/hairhelp/mann-hero.webp'
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
  /* Der Studiogrund des Fotos, gemessen und geglättet. Fläche und Foto
     tragen dieselbe Farbe – deshalb ist die Bildkante unsichtbar. */
  --auftakt-grund:{GRUND};
}}

{W},{W} *,{W} *::before,{W} *::after{{box-sizing:border-box}}
{W}{{
  position:relative;
  isolation:isolate;
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

/* --- Das Foto -----------------------------------------------------------
   Es liegt hinter dem Satz und füllt die Fläche rechts vollständig aus:
   keine Fassung, kein Radius, keine Kante. Der linke Rand löst sich über
   einen kurzen Verlauf auf – er überdeckt nur den leeren Teil des Fotos,
   die Person beginnt erst bei rund 35 % der Bildbreite. */
{W} .auftakt__bild{{
  position:absolute;top:0;bottom:0;right:0;
  width:min(82%,1240px);
  margin:0;
  z-index:0;
  pointer-events:none;
}}
{W} .auftakt__bild img{{
  width:100%;height:100%;
  object-fit:cover;
  /* 0 % zeigt den linken Bildteil – dadurch rückt der Mann nach rechts,
     aus dem Satzspiegel heraus. */
  object-position:0% 18%;
}}
/* Zwei Verläufe in derselben Grundfarbe: links löst sich die Bildkante
   auf, unten geht der Mann in die Fläche über, statt an der
   Abschnittskante abgeschnitten zu werden. */
{W} .auftakt__bild::after{{
  content:"";position:absolute;inset:0;
  background:
    linear-gradient(0deg,
      var(--auftakt-grund) 0 1%,
      rgba(19,20,16,.5) 7%,
      rgba(19,20,16,0) 17%),
    linear-gradient(90deg,
      var(--auftakt-grund) 0 8%,
      rgba(19,20,16,.55) 17%,
      rgba(19,20,16,0) 28%);
}}

/* --- Der Satz ------------------------------------------------------------ */
{W} .spine{{
  position:relative;z-index:1;
  max-width:var(--spine);margin:0 auto;padding:0 32px;
}}
{W} .auftakt__satz{{
  max-width:min(52%,600px);
  padding:96px 0 104px;
}}
/* Wird die Fläche schmaler, rückt der Mann näher an den Satz. Der Satz
   gibt dann Breite ab, damit die Schulter frei bleibt. */
@media (max-width:1400px){{
  {W} .auftakt__satz{{max-width:min(48%,540px)}}
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

/* --- Schmale Fenster -----------------------------------------------------
   Ab hier steht das Foto oben und der Satz darunter. Es bleibt randlos:
   der untere Bildrand läuft über einen Verlauf in die Fläche aus, sodass
   auch gestapelt keine Kante entsteht. */
@media (max-width:1180px){{
  {W} .auftakt__bild{{
    position:static;width:auto;
    margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
  }}
  {W} .auftakt__bild img{{
    height:auto;aspect-ratio:16/10;
    object-position:50% 6%;
  }}
  /* Gestapelt löst sich nur der untere Bildrand auf – lang genug, dass
     auch der Oberkörper weich in die Fläche übergeht. */
  {W} .auftakt__bild::after{{
    background:linear-gradient(0deg,
      var(--auftakt-grund) 0 7%,
      rgba(19,20,16,.8) 17%,
      rgba(19,20,16,0) 44%);
  }}
  {W} .auftakt__satz{{max-width:none;padding:26px 0 72px}}
}}
/* Je schmaler das Fenster, desto hochformatiger der Ausschnitt – so bleibt
   der Mann gross genug, statt in der Breite zu verschwinden. */
@media (max-width:900px){{
  {W} .auftakt__bild img{{aspect-ratio:3/2}}
}}
@media (max-width:720px){{
  {W}{{font-size:16px}}
  {W} .spine{{padding:0 20px}}
  {W} .auftakt__satz{{padding:24px 0 60px}}
  {W} .cta{{width:100%;padding-left:20px;padding-right:20px}}
}}
@media (max-width:640px){{
  {W} .auftakt__bild img{{aspect-ratio:1/1;object-position:50% 3%}}
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
  <figure class="auftakt__bild">
    <img src="{bild_quelle}" alt="{BILD_ALT}"
         width="1500" height="837" fetchpriority="high" decoding="async">
  </figure>
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


daten = base64.b64encode((HIER / 'mann-hero.webp').read_bytes()).decode()

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
    f'     mann-hero.webp in die Mediathek laden und die Adresse unten\n'
    f'     anpassen, falls sie abweicht. -->\n'
    + satz(BILD_URL) + '\n', encoding='utf-8')

for d in ('hero-mann.html', 'hero-mann.css', 'hero-mann-widget.html'):
    p = HIER / d
    print(f'{p.name:26s} {p.stat().st_size / 1024:7.1f} KB')
