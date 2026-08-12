# Einbau in Elementor

## Für jede Seite: drei Schritte

| WordPress-Seite | Datei zum Kopieren |
|---|---|
| Startseite | `elementor-startseite.html` |
| Produkt | `elementor-produkt.html` |
| Über uns | `elementor-ueber-uns.html` |

1. Die passende Datei öffnen und den **gesamten Inhalt** kopieren (Strg/Cmd + A, Strg/Cmd + C).
2. In Elementor eine **neue Sektion / Container** anlegen und darin ein **HTML-Widget** platzieren.
3. Den kopierten Code in das HTML-Widget einfügen und speichern.

## Wichtig: Container-Einstellungen

Damit die Seite exakt so aussieht wie im Entwurf, muss der Container, in dem das
HTML-Widget liegt, **die volle Breite ohne Innenabstand** haben:

| Einstellung | Wert |
|---|---|
| Container-Breite / Content Width | **Full Width** (volle Breite) |
| Padding (Innenabstand) | **0** – oben, unten, links, rechts |
| Margin (Aussenabstand) | **0** |
| Gap / Elementenabstand | **0** |

Die Seite bringt ihre eigenen Abstände, Ränder und Breitenbegrenzungen mit
(Inhaltsbreite 1200 px, zentriert). Ein zusätzliches Container-Padding würde die
farbigen Bänder (dunkelblaue Kennzahlen-Leiste, Evidenz-Sektion, Footer)
einschnüren, statt sie über die volle Breite laufen zu lassen.

## Warum das 1:1 aussieht

- **Alles ist gekapselt.** Der komplette Code liegt in einem Wrapper `.sdx` mit
  eigenem CSS-Reset. Theme- und Elementor-Styles (Schriftart, Zeilenhöhe,
  Laufweite, Listenpunkte, Bildrahmen, Link-Unterstreichungen) können nicht
  hineinwirken.
- **Getestet.** Jede der drei Seiten wurde gegen ein absichtlich „feindliches"
  Test-Theme gerendert (Serifenschrift, rote Überschriften, Bildrahmen,
  Unterstreichungen, abweichende Laufweite) und ist dort **pixelidentisch** mit der
  Standalone-Version – 0 abweichende Pixel, bei 1440 px und bei 390 px.
- **Keine externen Dateien.** Schrift (Lato, SIL Open Font License) und alle
  Bilder sind als Base64 eingebettet. Es gibt keine gebrochenen Bildpfade, egal
  wohin der Block kopiert wird, und es werden keine Anfragen an Google Fonts
  gestellt (relevant für den DSGVO-Hinweis der Seite).
- **Die Styles sind nicht global.** Kein einziges CSS-Selektor greift ausserhalb
  von `.sdx` – der Rest der Website bleibt unberührt.

## Header und Footer

Der Block enthält einen eigenen **Header** (Logo, Navigation, Sprachumschaltung,
Bestellen-Button) und einen eigenen **Footer**. Falls das WordPress-Theme bereits
Header oder Footer ausgibt, einfach den jeweiligen Abschnitt aus dem Code löschen –
beide sind im Quelltext kommentiert:

```html
<!-- ---------- Header (löschbar, falls das Theme bereits einen Header hat) ---------- -->
...
<!-- ---------- Footer ---------- -->
```

## Was noch verlinkt werden muss

Alle Links stehen aktuell auf Platzhalter (`href="#"`). Zu ersetzen sind:

| Stelle | Platzhalter | Ziel |
|---|---|---|
| Alle Seiten | „Vertriebspartner finden" / „Vertriebspartner werden" | Partnerliste bzw. Bewerbungsformular |
| Produkt | Platzhalter für die **Länderkarte** im Abschnitt Bezugsquellen | Interaktive Karte oder Partnerliste |
| Header + Footer | `FR` / `IT` | Die französische und italienische Seite |
| Footer | Impressum, Datenschutz | Entsprechende Unterseiten |
| Überall | `info@smelldiscettes.ch` | Die echte Kontaktadresse |

**Die Verlinkung zwischen den drei Seiten steht bereits** – im Code als
`index.html`, `produkt.html` und `ueber-uns.html`. Diese drei Pfade müssen nach
dem Einfügen auf die tatsächlichen WordPress-Adressen geändert werden, zum
Beispiel `/de/`, `/de/produkt/` und `/de/ueber-uns/`. Am schnellsten geht das mit
Suchen-und-Ersetzen im HTML-Widget, bevor gespeichert wird.

Die internen Sprungmarken (`#anwendung`, `#praeoperativ`, `#artikel`,
`#bestellen`, `#publikationen`, `#geschichte`) funktionieren bereits.

## Änderungen später

Bearbeitet werden immer die Quelldateien `index.html`, `produkt.html` und
`ueber-uns.html` – sie haben normale Bildpfade und sind gut lesbar. Das Design
aller drei Seiten liegt gemeinsam in `assets/css/sd.css`; eine Änderung dort wirkt
sich auf alle Seiten aus. Danach:

```bash
node build-elementor.mjs
```

Das erzeugt alle drei `elementor-*.html` neu (Schrift und Bilder wieder
eingebettet). Der neue Inhalt wird dann wieder ins jeweilige HTML-Widget kopiert.

## Alternative: Bilder aus der WordPress-Mediathek

Die Elementor-Dateien sind 380–570 KB gross, weil alle Bilder eingebettet sind. Das
ist für ein Widget in Ordnung, aber nicht optimal für die Ladezeit. Wer es schlanker
möchte: die Dateien aus `assets/` in die WordPress-Mediathek hochladen und
stattdessen den Inhalt der jeweiligen Quelldatei verwenden, wobei jeder Pfad
`assets/…` durch die jeweilige Mediathek-URL ersetzt wird
(`https://.../wp-content/uploads/…`). Der Font-Block aus `assets/fonts/lato.css`
muss dabei im `<style>` bleiben, sonst greift wieder die Theme-Schrift.
