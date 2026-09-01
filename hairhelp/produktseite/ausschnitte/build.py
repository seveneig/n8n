#!/usr/bin/env python3
"""Löst einzelne Abschnitte aus der Produktseite heraus.

Je Abschnitt entstehen drei Dateien:

  <name>.html          eigenständig, alles eingebettet – zum Ansehen
  <name>.css           zum Einbau: Elementor → Website-Einstellungen → CSS
  <name>-widget.html   zum Einbau: ins HTML-Widget

Warum getrennt: WP Rocket räumt mit „Ungenutztes CSS entfernen" einen inline
gesetzten <style>-Block weg. Ausserdem schleppt die eigenständige Fassung die
Schrift (284 KB) und die Bilder mit, die die Website längst hat.

Alles ist unter einer Wurzelklasse gekapselt – keine Regel auf `body`, `*`
oder `:root`. Die Klasse steht doppelt, das hebt die Spezifität über die
üblichen Theme-Regeln, ohne dass irgendwo `!important` nötig wird.
"""
import json
import pathlib

HIER = pathlib.Path(__file__).parent
QUELLE = HIER.parent / 'produktseite.html'

quelle = QUELLE.read_text(encoding='utf-8')
mittel = json.loads((HIER.parent / 'assets.json').read_text(encoding='utf-8'))


# --------------------------------------------------------------------------
# Bausteine aus der Produktseite lesen
# --------------------------------------------------------------------------

def token_block(anfang: str) -> str:
    """Liest einen Deklarationsrumpf (nur die --token:wert-Zeilen) aus."""
    i = quelle.index(anfang) + len(anfang)
    rumpf = quelle[i:quelle.index('\n}', i)]
    return '\n'.join('  ' + z.strip() for z in rumpf.split('\n')
                     if z.strip().startswith('--'))


def abschnitt(marke: str) -> str:
    """Der Abschnitt hinter einer Kommentarmarke, samt verschachtelter Tags."""
    kommentar = f'<!-- ====================== {marke} ====================== -->'
    anfang = quelle.index('<section', quelle.index(kommentar))
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


def haerten(html: str) -> str:
    """Gibt den Symbolen Masse und Strichfarbe als Attribut mit.

    Attribute stehen in der Rangfolge unter jeder CSS-Regel – solange das
    Stylesheet greift, ändert sich nichts. Fällt es weg, bleiben die Symbole
    klein und als Strichzeichnung stehen, statt als schwarze Flächen über die
    ganze Spaltenbreite zu wachsen.
    """
    return html.replace(
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" '
        'width="20" height="20" fill="none" stroke="currentColor" '
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">')


HELL = token_block(':root{')
DUNKEL = token_block('@media (prefers-color-scheme: dark){\n'
                     '  :root:not([data-theme="light"]){')


def grundgeruest(w: str, grund: str, vollbreit: bool = True) -> str:
    """Token, Grundregeln und – falls gewünscht – der Ausbruch des Grundes."""
    ausbruch = f"""
/* Nur die Hintergrundfarbe bricht aus der Spalte aus und läuft über die
   volle Breite; der Inhalt bleibt in der Spalte. Läuft die Seite dadurch
   waagrecht über, braucht die Gastseite `overflow-x:hidden` am body – oder
   der Elementor-Container wird auf volle Breite gestellt. */
{w}::before{{
  content:"";position:absolute;top:0;bottom:0;
  left:calc(50% - 50vw);width:100vw;
  background:var({grund});z-index:0;pointer-events:none;
}}
{w} > *{{position:relative;z-index:1}}""" if vollbreit else ''

    return f"""{w}{{
{HELL}
}}
/* Die Token laufen mit, damit der Block sich auch in einer dunklen
   Umgebung richtig verhält. */
@media (prefers-color-scheme: dark){{
  :root:not([data-theme="light"]) {w}{{
{DUNKEL}
  }}
}}
:root[data-theme="dark"] {w}{{
{DUNKEL}
}}

{w},{w} *,{w} *::before,{w} *::after{{box-sizing:border-box}}
{w}{{
  position:relative;
  background:var({grund});
  font-family:Jost,"Century Gothic","Futura",system-ui,sans-serif;
  font-size:17px;
  line-height:1.7;
  -webkit-font-smoothing:antialiased;
  padding:88px 0;
}}{ausbruch}
{w} img{{max-width:100%;display:block}}
{w} a{{color:inherit}}
{w} :focus-visible{{outline:2px solid var(--gold);outline-offset:3px;border-radius:2px}}
@media (prefers-reduced-motion: reduce){{
  {w} *,{w} *::before,{w} *::after{{
    animation-duration:.001ms!important;transition-duration:.001ms!important}}
}}

{w} .spine{{max-width:var(--spine);margin:0 auto;padding:0 32px}}"""


def kopfzeile(w: str, hell_auf_dunkel: bool) -> str:
    """Die zweifarbige Abschnittsüberschrift mit Goldlinie."""
    titelfarbe = 'var(--ink-text)' if hell_auf_dunkel else 'var(--text)'
    # Auf hellem Grund trägt das helle Gold nur 2.9:1 – dort gilt das Textgold.
    goldfarbe = 'var(--gold)' if hell_auf_dunkel else 'var(--gold-text)'
    return f"""
{w} .sect-head{{
  display:flex;flex-direction:column;gap:14px;
  padding-top:22px;border-top:1px solid var(--gold);margin-bottom:44px;
}}
{w} .sect-head h2{{
  font-size:clamp(28px,3.6vw,42px);font-weight:700;letter-spacing:-.005em;
  line-height:1.12;text-transform:uppercase;margin:0;text-wrap:balance;
  /* Ausdrücklich, nicht geerbt: eine Theme-Regel auf h2 schlägt sonst durch. */
  color:{titelfarbe};
}}
{w} .eyebrow{{
  font-size:12px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:{goldfarbe};margin:0;
}}
{w} .sect-head h2 .lead{{color:{goldfarbe};font-weight:500}}"""


SCHMAL = """
@media (max-width:720px){{
  {w}{{font-size:16px;padding:64px 0}}
  {w} .spine{{padding:0 20px}}
}}"""


# --------------------------------------------------------------------------
# Die einzelnen Abschnitte
# --------------------------------------------------------------------------

def css_garantie(w: str) -> str:
    return f"""{grundgeruest(w, '--ink')}
{w}{{color:var(--ink-text)}}
{kopfzeile(w, True)}

{w} .guarantee{{
  display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:60px;align-items:center;
}}
{w} .guarantee-list{{
  margin:32px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:18px;
}}
{w} .guarantee-list li{{display:flex;gap:15px;align-items:flex-start;color:var(--ink-text)}}
{w} .guarantee-list svg{{
  width:20px;height:20px;flex-shrink:0;margin-top:4px;
  stroke:var(--gold);fill:none;stroke-width:1.7;
}}
{w} .guarantee-list strong{{font-weight:600;color:var(--ink-text)}}
{w} .guarantee-list span{{color:var(--ink-text-soft)}}
{w} .guarantee-seal img{{width:100%;max-width:280px;margin:0 auto}}

@media (max-width:860px){{
  {w} .guarantee{{grid-template-columns:1fr;gap:38px}}
  /* Einspaltig richtet sich die Grafik durch die max-width sonst links aus. */
  {w} .guarantee-seal{{max-width:200px;margin-left:auto;margin-right:auto}}
}}{SCHMAL.format(w=w)}"""


def css_stimme(w: str) -> str:
    return f"""{grundgeruest(w, '--ground-alt')}
{w}{{color:var(--text)}}

{w} .story{{
  display:grid;grid-template-columns:230px minmax(0,1fr);gap:48px;align-items:start;
}}
{w} .story-portrait{{margin:0}}
{w} .story-portrait img{{width:100%;border-radius:var(--radius)}}
{w} .story-portrait figcaption{{
  margin-top:14px;font-size:13px;line-height:1.5;color:var(--text-soft);
}}
{w} .story-portrait b{{display:block;color:var(--text);font-size:14px;font-weight:600}}
/* Auf hellem Grund trägt das helle Gold nur 2.9:1 – hier gilt das Textgold. */
{w} .eyebrow{{
  font-size:12px;font-weight:500;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gold-text);margin:0 0 12px;
}}
{w} .story-body h3{{
  margin:0 0 20px;font-size:clamp(24px,2.8vw,32px);font-weight:600;
  line-height:1.2;letter-spacing:-.01em;text-wrap:balance;
  /* Ausdrücklich, nicht geerbt: eine Theme-Regel auf h3 schlägt sonst durch. */
  color:var(--text);
}}
{w} .story-body p{{margin:0 0 16px;color:var(--text-soft);max-width:62ch}}
{w} .story-body p:last-child{{margin-bottom:0}}
{w} .story-body .pull{{
  color:var(--text);font-size:19px;line-height:1.55;
  padding-left:20px;border-left:2px solid var(--gold);
}}

@media (max-width:760px){{
  {w} .story{{grid-template-columns:1fr;gap:28px}}
  {w} .story-portrait{{max-width:180px}}
}}{SCHMAL.format(w=w)}"""


def css_faq(w: str) -> str:
    return f"""{grundgeruest(w, '--ground')}
{w}{{color:var(--text)}}
{kopfzeile(w, False)}

{w} .faq{{border-top:1px solid var(--line)}}
{w} .faq details{{border-bottom:1px solid var(--line)}}
{w} .faq summary{{
  display:flex;align-items:center;justify-content:space-between;gap:22px;
  padding:22px 4px;cursor:pointer;list-style:none;
  font-size:17.5px;font-weight:500;color:var(--text);transition:color .18s;
}}
{w} .faq summary::-webkit-details-marker{{display:none}}
{w} .faq summary:hover{{color:var(--gold-text)}}
/* Plus, das sich beim Öffnen zum Kreuz dreht. */
{w} .faq summary::after{{
  content:"";width:13px;height:13px;flex-shrink:0;background:var(--gold);
  clip-path:polygon(46% 0,54% 0,54% 46%,100% 46%,100% 54%,54% 54%,54% 100%,46% 100%,46% 54%,0 54%,0 46%,46% 46%);
  transition:transform .25s ease;
}}
{w} .faq details[open] summary::after{{transform:rotate(135deg)}}
{w} .faq-body{{padding:0 4px 26px;max-width:72ch}}
{w} .faq-body p{{margin:0 0 12px;color:var(--text-soft);font-size:15.5px}}
{w} .faq-body p:last-child{{margin-bottom:0}}
{w} .faq-body b{{color:var(--text);font-weight:600}}

{w} .fit{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px;margin-top:18px}}
{w} .fit-col h4{{
  margin:0 0 12px;display:flex;align-items:center;gap:9px;
  font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
}}
{w} .fit-col ul{{
  margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;
  font-size:15px;color:var(--text-soft);
}}
{w} .fit-col li{{padding-left:18px;position:relative}}
{w} .fit-col li::before{{
  content:"";position:absolute;left:0;top:11px;width:6px;height:1px;background:var(--line-firm);
}}
{w} .fit-yes h4{{color:var(--ok)}}
{w} .fit-no h4{{color:var(--alert)}}
@media (max-width:600px){{ {w} .fit{{grid-template-columns:1fr}} }}{SCHMAL.format(w=w)}"""


def css_schluss(w: str) -> str:
    # Hier bricht der ganze Abschnitt aus, nicht nur die Farbe: der Grund ist
    # ein Foto mit Verlauf, das über die volle Breite laufen muss.
    return f"""{grundgeruest(w, '--ink', vollbreit=False)}
{w}{{
  min-height:520px;display:grid;align-items:center;overflow:hidden;
  color:var(--ink-text);padding:0;
  margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
}}
{w} .closer-media{{position:absolute;inset:0}}
{w} .closer-media img{{width:100%;height:100%;object-fit:cover;object-position:60% center}}
{w} .closer-media::after{{
  content:"";position:absolute;inset:0;
  background:linear-gradient(100deg, rgba(20,19,16,.97) 0%, rgba(20,19,16,.93) 42%, rgba(20,19,16,.55) 72%, rgba(20,19,16,.2) 100%);
}}
{w} .spine{{position:relative;z-index:1;padding-top:72px;padding-bottom:72px}}
{w} .closer-inner{{max-width:480px;display:flex;flex-direction:column;gap:22px}}
{w} h2{{
  margin:0;font-size:clamp(30px,4vw,46px);font-weight:700;line-height:1.1;
  letter-spacing:-.01em;text-transform:uppercase;text-wrap:balance;
  /* Ausdrücklich, nicht geerbt: eine Theme-Regel auf h2 schlägt sonst durch. */
  color:var(--ink-text);
}}
{w} h2 .lead{{
  display:block;color:var(--gold);font-weight:500;font-size:.55em;
  letter-spacing:.16em;margin-bottom:12px;
}}
{w} p{{margin:0;color:var(--ink-text-soft);font-size:16.5px}}
{w} .cta{{
  align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;
  gap:12px;min-height:58px;padding:0 34px;
  background:var(--gold);border:1px solid var(--gold);border-radius:var(--radius);
  color:#1A1A18;font:inherit;font-size:14px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
  transition:background .2s,border-color .2s;
}}
{w} .cta:hover{{background:var(--ink-text);border-color:var(--ink-text)}}
{w} .closer-assure{{
  display:flex;gap:26px;flex-wrap:wrap;font-size:13px;
  color:var(--ink-text-soft);padding-top:6px;
}}
{w} .closer-assure span{{display:flex;align-items:center;gap:8px}}
{w} .closer-assure svg{{width:15px;height:15px;stroke:var(--gold);fill:none;stroke-width:1.8}}
@media (max-width:720px){{
  {w}{{font-size:16px}}
  {w} .spine{{padding:56px 20px}}
}}"""


ABSCHNITTE = [
    dict(name='garantie-ohne-risiko', marke='Garantie', klasse='hh-garantie',
         css=css_garantie, titel='HairHelp – 30-Tage-Sorglos-Garantie',
         beschreibung='Der Garantie-Abschnitt der HairHelp-Produktseite: '
                      '30 Tage testen, kostenloser Rückversand, 100 % Geld zurück.'),
    dict(name='kundengeschichte-barbara', marke='Kundengeschichte', klasse='hh-stimme',
         css=css_stimme, titel='HairHelp – Kundengeschichte Barbara Zollinger',
         beschreibung='Kundengeschichte von Barbara Zollinger, 53, '
                      'Pflegefachfrau aus Luzern, zum HairHelp Haarverdichter.'),
    dict(name='haeufige-fragen', marke='FAQ', klasse='hh-faq',
         css=css_faq, titel='HairHelp – Häufige Fragen',
         beschreibung='Antworten vor dem Kauf: Geheimratsecken, natürliches '
                      'Aussehen, Verträglichkeit, Halt, Ergiebigkeit und Eignung.'),
    dict(name='schlussaufruf', marke='Schlussaufruf', klasse='hh-schluss',
         css=css_schluss, titel='HairHelp – Schlussaufruf',
         beschreibung='Abschliessender Aufruf der HairHelp-Produktseite: '
                      '12 g reichen für 4–6 Wochen, 30 Tage Rückgabe.'),
]


def bauen(a: dict) -> None:
    w = f'.{a["klasse"]}.{a["klasse"]}'
    css = a['css'](w)

    roh = haerten(abschnitt(a['marke']))
    # Wurzelklasse und Sprache an den Abschnitt hängen
    kopf_ende = roh.index('>')
    kopf = roh[:kopf_ende]
    kopf = (kopf.replace('class="', f'class="{a["klasse"]} ', 1)
            if 'class="' in kopf else kopf + f' class="{a["klasse"]}"')
    roh = kopf + ' lang="de"' + roh[kopf_ende:]

    # Bilder: eigenständig eingebettet, im Widget von der Website geladen
    eigen = roh
    for url, daten in mittel['url2data'].items():
        if url in eigen:
            eigen = eigen.replace(url, daten)

    (HIER / f'{a["name"]}.html').write_text(
        f"""<meta charset="utf-8">
<title>{a['titel']}</title>
<meta name="description" content="{a['beschreibung']}">

<style>
/* ==========================================================================
   {a['titel']}
   Herausgelöst aus der Produktseite.

   Schrift, Farbtoken, alle benutzten Regeln und die Bilder sind eingebettet –
   die Datei läuft für sich, ohne Netzwerkzugriff. Alles ist unter
   .{a['klasse']} gekapselt: keine Regel auf body, * oder :root.
   ========================================================================== */

{mittel['fontcss']}

{css}
</style>

{eigen}
""", encoding='utf-8')

    (HIER / f'{a["name"]}.css').write_text(
        f'/* {a["titel"]}\n'
        f'   Einsetzen unter Elementor → Website-Einstellungen → Benutzerdefiniertes CSS.\n'
        f'   Ohne Schrifteinbettung: Jost ist die Hausschrift der Website.\n'
        f'   Alles unter .{a["klasse"]} gekapselt, die Klasse steht doppelt, damit die\n'
        f'   Regeln die Theme-Regeln schlagen, ohne dass !important nötig wird.\n'
        f'   Bei WP Rocket → „Ungenutztes CSS entfernen" auf die Ausschlussliste setzen. */\n\n'
        + css + '\n', encoding='utf-8')

    (HIER / f'{a["name"]}-widget.html').write_text(
        f'<!-- {a["titel"]}\n'
        f'     In ein HTML-Widget einfügen. Das Stylesheet steht in\n'
        f'     {a["name"]}.css und gehört unter Elementor →\n'
        f'     Website-Einstellungen → Benutzerdefiniertes CSS. -->\n'
        + roh + '\n', encoding='utf-8')


for a in ABSCHNITTE:
    bauen(a)
    for endung in ('.html', '.css', '-widget.html'):
        d = HIER / f'{a["name"]}{endung}'
        print(f'{d.name:34s} {d.stat().st_size / 1024:7.1f} KB')
