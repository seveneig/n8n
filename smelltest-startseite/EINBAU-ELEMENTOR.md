# Einbau in Elementor

## Schritt für Schritt

### 1. Die richtige Datei öffnen

| WordPress-Seite | Datei |
|---|---|
| Startseite – Variante A | `zum-kopieren/startseite.txt` |
| Startseite – Variante B | `zum-kopieren/startseite-variante-b.txt` |
| Startseite – Variante C | `zum-kopieren/startseite-variante-c.txt` |
| Produkt | `zum-kopieren/produkt.txt` |
| Über uns | `zum-kopieren/ueber-uns.txt` |
| Kontakt | `zum-kopieren/kontakt.txt` |
| Vertriebspartner | `zum-kopieren/vertriebspartner.txt` |
| Impressum | `zum-kopieren/impressum.txt` |
| Datenschutz | `zum-kopieren/datenschutz.txt` |

> Für die Startseite **eine der drei Varianten** wählen. Die Aussagen sind in allen
> dreien dieselben.

Diese drei Textdateien liegen im Ordner `zum-kopieren/`. Ein Doppelklick öffnet sie
direkt in Notepad. Inhaltlich sind sie identisch mit den `elementor-*.html`-Dateien –
nur die Endung ist anders, damit Windows sie im Editor öffnet statt im Browser.

> **Wichtig:** Es sind die **`elementor-*`**- bzw. **`zum-kopieren/*`**-Dateien, die
> in Elementor gehören. Die Dateien `index.html`, `produkt.html` und `ueber-uns.html`
> sind die Arbeitsdateien – sie verweisen auf einen separaten Bilderordner und
> funktionieren im Widget **nicht**.

### 2. Alles kopieren

**Strg + A**, dann **Strg + C**. Nichts herausschneiden, nichts anpassen – die
komplette Datei ist genau der Code, der ins Widget gehört. Auch die Kommentarzeilen
am Anfang können mitkopiert werden, sie sind im Browser unsichtbar.

Die Dateien sind 380–570 KB gross, weil Schrift und Bilder eingebettet sind. Notepad
braucht dafür einen Moment. Scrollen ist nicht nötig – Strg + A markiert alles.

### 3. In Elementor einfügen

1. Die Seite in Elementor bearbeiten.
2. Einen **neuen Container** (bzw. eine neue Sektion) anlegen.
3. Aus der Widget-Liste das Widget **HTML** hineinziehen
   *(in der Suche „HTML" eingeben – es heisst je nach Version «HTML» oder «Custom HTML»)*.
4. In das Codefeld klicken und mit **Strg + V** einfügen.
5. Container-Einstellungen setzen (siehe nächster Abschnitt) und **Veröffentlichen**.

Im Elementor-Editor kann die Vorschau etwas anders aussehen als auf der fertigen
Seite – der Editor legt eigene Styles über die Vorschau. Massgeblich ist die
veröffentlichte Seite.

### Falls etwas nicht klappt

- **Der Code wird beim Speichern verstümmelt**: Dann fehlt dem angemeldeten Benutzer
  das Recht `unfiltered_html`. Mit einem Administrator-Konto einfügen.
- **Umlaute erscheinen als `Ã¤` oder `?`**: Die Textdateien sind als UTF-8
  gespeichert und tragen eine Kennung, die Notepad das mitteilt. Falls es trotzdem
  auftritt, die Datei stattdessen mit Notepad++ oder VS Code öffnen.
- **Notepad reagiert träge**: Normal bei dieser Dateigrösse. Einfach Strg + A und
  Strg + C ausführen, ohne zu scrollen.

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

**Die Formulare auf Kontakt- und Vertriebspartnerseite sind gestaltet, aber noch
nicht angebunden.** Entweder `action` und `method` im Formular auf den eigenen
Endpunkt setzen, oder den Formularblock löschen und darunter ein
Elementor-Formular-Widget platzieren. Im Quelltext ist die Stelle kommentiert.

**Die Verlinkung zwischen den Seiten steht bereits** – im Code als
`index.html`, `produkt.html`, `ueber-uns.html`, `kontakt.html`,
`vertriebspartner.html`, `impressum.html` und `datenschutz.html`. Diese Pfade müssen nach
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
