#!/usr/bin/env python3
"""Löst den Garantie-Abschnitt („Ohne Risiko") aus der Produktseite heraus.

Ergebnis ist eine einzelne, in sich geschlossene HTML-Datei: Schrift, Farbtoken
und alle benutzten Regeln sind eingebettet, das Siegelbild ebenso. Sie läuft
ohne Netzwerkzugriff.

Alles ist unter `.hh-garantie` gekapselt – keine Regel auf `body`, `*` oder
`:root`. Der Block lässt sich damit unverändert in ein HTML-Widget einsetzen,
ohne die Gastseite zu verändern.
"""
import json, pathlib, re

HIER = pathlib.Path(__file__).parent
QUELLE = HIER.parent / 'produktseite.html'
ZIEL = HIER / 'garantie-ohne-risiko.html'
WURZEL = '.hh-garantie.hh-garantie'

quelle = QUELLE.read_text(encoding='utf-8')

SIEGEL = ('https://hairhelp-haarverdichter.ch/wp-content/uploads/2024/10/'
          'Shop-30Tage-Geld-zurueck-Siegel1.webp')


def token_block(anfang: str) -> str:
    """Liest einen Deklarationsrumpf (nur die --token:wert-Zeilen) aus."""
    i = quelle.index(anfang) + len(anfang)
    rumpf = quelle[i:quelle.index('\n}', i)]
    zeilen = [z.strip() for z in rumpf.split('\n')]
    return '\n'.join('  ' + z for z in zeilen if z.startswith('--'))


def abschnitt() -> str:
    """Der Abschnitt hinter der Kommentarmarke „Garantie"."""
    marke = quelle.index('<!-- ====================== Garantie ====================== -->')
    anfang = quelle.index('<section', marke)
    tiefe, j = 0, anfang
    while True:
        auf = quelle.find('<section', j + 1)
        zu = quelle.find('</section>', j + 1)
        if auf != -1 and auf < zu:
            tiefe += 1
            j = auf
        elif tiefe == 0:
            return quelle[anfang:zu + len('</section>')]
        else:
            tiefe -= 1
            j = zu


mittel = json.loads((HIER.parent / 'assets.json').read_text(encoding='utf-8'))

def haerten(html: str) -> str:
    """Gibt den Symbolen Masse und Strichfarbe als Attribut mit.

    Attribute stehen in der Rangfolge unter jeder CSS-Regel – solange das
    Stylesheet greift, ändert sich nichts. Fällt es weg (WordPress filtert
    <style> heraus, ein Optimierer räumt es weg), bleiben die Symbole klein
    und als Strichzeichnung stehen, statt als schwarze Flächen über die
    ganze Spaltenbreite zu wachsen.
    """
    return html.replace(
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" '
        'width="20" height="20" fill="none" stroke="currentColor" '
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">')


roh = haerten(abschnitt()).replace(
    '<section class="band band--ink">',
    '<section class="hh-garantie band band--ink" lang="de">', 1)

markup = roh.replace(SIEGEL, mittel['url2data'][SIEGEL])   # eigenständig
markup_widget = roh                                        # Bild von der Website

hell = token_block(':root{')
dunkel = token_block('@media (prefers-color-scheme: dark){\n  :root:not([data-theme="light"]){')
if not dunkel:
    dunkel = token_block(':root[data-theme="dark"]{')

css = f"""{WURZEL}{{
{hell}
}}
/* Das Band ist immer dunkel; die Token laufen trotzdem mit, damit der Block
   sich auch in einer dunklen Umgebung richtig verhält. */
@media (prefers-color-scheme: dark){{
  :root:not([data-theme="light"]) {WURZEL}{{
{dunkel}
  }}
}}
:root[data-theme="dark"] {WURZEL}{{
{dunkel}
}}

{WURZEL},{WURZEL} *,{WURZEL} *::before,{WURZEL} *::after{{box-sizing:border-box}}
{WURZEL}{{
  position:relative;
  background:var(--ink);
  color:var(--ink-text);
  font-family:Jost,"Century Gothic","Futura",system-ui,sans-serif;
  font-size:17px;
  line-height:1.7;
  -webkit-font-smoothing:antialiased;
  padding:88px 0;
}}
/* Nur die Hintergrundfarbe bricht aus der Spalte aus und läuft über die
   volle Breite; der Inhalt bleibt in der Spalte. Läuft die Seite dadurch
   waagrecht über, braucht die Gastseite `overflow-x:hidden` am body – oder
   der Elementor-Container wird auf volle Breite gestellt. */
{WURZEL}::before{{
  content:"";position:absolute;top:0;bottom:0;
  left:calc(50% - 50vw);width:100vw;
  background:var(--ink);z-index:0;pointer-events:none;
}}
{WURZEL} > *{{position:relative;z-index:1}}
{WURZEL} img{{max-width:100%;display:block}}
{WURZEL} a{{color:inherit}}
{WURZEL} :focus-visible{{outline:2px solid var(--gold);outline-offset:3px;border-radius:2px}}
@media (prefers-reduced-motion: reduce){{
  {WURZEL} *,{WURZEL} *::before,{WURZEL} *::after{{
    animation-duration:.001ms!important;transition-duration:.001ms!important}}
}}

{WURZEL} .spine{{max-width:var(--spine);margin:0 auto;padding:0 32px}}

{WURZEL} .sect-head{{
  display:flex;flex-direction:column;gap:14px;
  padding-top:22px;border-top:1px solid var(--gold);margin-bottom:44px;
}}
{WURZEL} .sect-head h2{{
  font-size:clamp(28px,3.6vw,42px);font-weight:700;letter-spacing:-.005em;
  line-height:1.12;text-transform:uppercase;margin:0;text-wrap:balance;
  /* Ausdrücklich, nicht geerbt: eine Theme-Regel auf h2 schlägt sonst durch. */
  color:var(--ink-text);
}}
/* Auf dunklem Grund trägt das helle Gold 6:1 – dort bleibt es die Textfarbe. */
{WURZEL} .eyebrow{{
  font-size:12px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gold);margin:0;
}}
{WURZEL} .sect-head h2 .lead{{color:var(--gold);font-weight:500}}

{WURZEL} .guarantee{{
  display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:60px;align-items:center;
}}
{WURZEL} .guarantee-list{{
  margin:32px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:18px;
}}
{WURZEL} .guarantee-list li{{display:flex;gap:15px;align-items:flex-start}}
{WURZEL} .guarantee-list svg{{
  width:20px;height:20px;flex-shrink:0;margin-top:4px;
  stroke:var(--gold);fill:none;stroke-width:1.7;
}}
{WURZEL} .guarantee-list li{{color:var(--ink-text)}}
{WURZEL} .guarantee-list strong{{font-weight:600;color:var(--ink-text)}}
{WURZEL} .guarantee-list span{{color:var(--ink-text-soft)}}
{WURZEL} .guarantee-seal img{{width:100%;max-width:280px;margin:0 auto}}

@media (max-width:860px){{
  {WURZEL} .guarantee{{grid-template-columns:1fr;gap:38px}}
  /* Einspaltig richtet sich die Grafik durch die max-width sonst links aus. */
  {WURZEL} .guarantee-seal{{max-width:200px;margin-left:auto;margin-right:auto}}
}}
@media (max-width:720px){{
  {WURZEL}{{font-size:16px;padding:64px 0}}
  {WURZEL} .spine{{padding:0 20px}}
}}"""

seite = f"""<meta charset="utf-8">
<title>HairHelp – 30-Tage-Sorglos-Garantie</title>
<meta name="description" content="Der Garantie-Abschnitt der HairHelp-Produktseite: 30 Tage testen, kostenloser Rückversand, 100 % Geld zurück.">

<style>
/* ==========================================================================
   HairHelp – Abschnitt „Ohne Risiko / Ihre 30-Tage-Sorglos-Garantie"
   Herausgelöst aus der Produktseite.

   Schrift, Farbtoken, alle benutzten Regeln und das Siegelbild sind
   eingebettet – die Datei läuft für sich, ohne Netzwerkzugriff.
   Alles ist unter .hh-garantie gekapselt: keine Regel auf body, * oder :root.
   Der Block kann darum unverändert in ein HTML-Widget eingesetzt werden.
   ========================================================================== */

{mittel['fontcss']}

{css}
</style>

{markup}
"""

ZIEL.write_text(seite, encoding='utf-8')


# ---------------------------------------------------------------------------
# Fassung für den Einbau: getrennt in Stylesheet und Markup.
#
# Die eigenständige Datei trägt 284 KB Schrift und ein 121 KB grosses Bild mit
# sich. Die Website hat beides längst – Jost ist ihre Hausschrift, das Siegel
# liegt in der Mediathek. Für den Einbau fallen sie weg; übrig bleiben wenige
# Kilobyte, die kein Filter und kein Optimierer mehr abräumt.
# ---------------------------------------------------------------------------
STIL = HIER / 'garantie.css'
WIDGET = HIER / 'garantie-widget.html'

STIL.write_text(
    '/* HairHelp – Abschnitt „Ohne Risiko / Ihre 30-Tage-Sorglos-Garantie"\n'
    '   Einsetzen unter Elementor \u2192 Website-Einstellungen \u2192 Benutzerdefiniertes CSS.\n'
    '   Ohne Schrifteinbettung: Jost ist die Hausschrift der Website.\n'
    '   Alles unter .hh-garantie gekapselt, die Klasse steht doppelt, damit die\n'
    '   Regeln die Theme-Regeln schlagen, ohne dass !important nötig wird.\n'
    '   Bei WP Rocket \u2192 „Ungenutztes CSS entfernen" auf die Ausschlussliste setzen. */\n\n'
    + css + '\n', encoding='utf-8')

WIDGET.write_text(
    '<!-- HairHelp – Abschnitt „Ohne Risiko / Ihre 30-Tage-Sorglos-Garantie"\n'
    '     In ein HTML-Widget einfügen. Das Stylesheet steht in garantie.css und\n'
    '     gehört unter Elementor \u2192 Website-Einstellungen \u2192 Benutzerdefiniertes CSS. -->\n'
    + markup_widget + '\n', encoding='utf-8')

for datei in (ZIEL, STIL, WIDGET):
    print(f'{datei.name:28s} {datei.stat().st_size/1024:7.1f} KB')
