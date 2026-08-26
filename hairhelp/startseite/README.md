# HairHelp – Startseite

Neugestaltung von `esidekew.myhostpoint.ch/` im Stil der übrigen neuen Seiten.
Der Inhalt ist übernommen – Überschriften, Fliesstexte, Bewertungen, Preise und
Garantietexte stammen von der bestehenden Seite.

## Dateien

| Datei | Zweck |
| --- | --- |
| `startseite.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert, ergänzt um die Farbmuster aus `../haarverdichter/`. |
| `build.py` | Erzeugt `ausgabe/startseite.html` mit eingebetteten Assets. |
| `zuschnitt.py` | Richtet die sechs Vorher/Nachher-Aufnahmen deckungsgleich auf 4:3 aus. |

```
python3 build.py
```

## Was uneinheitlich war

* **Zwei Überschriftensysteme nebeneinander.** Einmal Trennstrich, Kapitälchen,
  Trennstrich („— RESULTATE —“), einmal der zweifarbige Dual Header. Beide auf
  derselben Seite, teils direkt untereinander.
* **Drei Behandlungen für dieselbe Sache.** Vorher/Nachher erschien als grosser
  einzelner Vergleich, als zwei kleinere darunter, und weiter unten nochmals als
  Karussell auf beigem Grund.
* **Auftakt auf kaltem Grau.** Die übrigen neuen Seiten öffnen auf warmem
  Schwarz; hier stand helles Grau, das Bild oben beschnitten.
* **Hintergründe ohne Ordnung** – Weiss, Grau, Beige, Creme im Wechsel, teils
  kalt, teils warm.
* **Karten ohne Rahmen.** Die sechs „Für wen“- und die sechs Qualitätsblöcke
  standen frei, mit kursiven Überschriften und mittig gesetztem Text.
* **Produktraster ohne Fassung** – Bilder direkt auf dem Seitengrund.

## Was die neue Fassung macht

**Eine Überschriftenform für die ganze Seite:** Goldlinie, Vorspann in Gold,
Titel zweifarbig. Die Trennstrich-Variante entfällt.

**Eine Bandfolge:** Schwarz für den Auftakt, Weiss und Creme im Wechsel,
Schwarz erneut für Ergebnisse und Garantie.

**Der Abschnitt „Resultate" als Diptychon.** Siehe eigener Abschnitt unten.

**Karten mit Fassung:** Bewertungen, „Für wen“, Qualität, Produkte und
Prüfsiegel liegen in demselben Rasterbauteil mit warmer Linie.

**Prüfsiegel als Inline-SVG** in der Strichsprache der übrigen Seiten. Die
sechs Original-Siegelbilder waren im Abzug nicht enthalten (unterhalb des
sichtbaren Bereichs, nie nachgeladen).

**Alternativtexte** für alle 34 Bilder.

## Der Abschnitt „Resultate"

Die drei Vergleiche standen nebeneinander in einer Reihe: zwei Frauen vor
hellgrauem Studiogrund, ein Mann vor fast schwarzem. Der Unterschied der
Gründe wirkte dadurch wie ein Versehen, und mit einer vierten dunklen
Aufnahme wäre es schlimmer geworden – hell, hell, dunkel, dunkel in
beliebiger Folge.

**Neu bilden die beiden Studiogründe die Gliederung.** Der Abschnitt ist ein
Diptychon: links eine Tafel „Für Frauen", rechts eine Tafel „Für Männer", je
zwei Fälle übereinander, dazwischen eine Goldlinie im selben Gewicht wie die
Linie über der Abschnittsüberschrift. Damit gruppieren sich die hellen
Aufnahmen links und die dunklen rechts – aus dem Zufall wird eine Ordnung.

**Die Tafeln sind dunkle Flächen** (`--ink-raise`) mit eigener Textfarbe, je
mit einer Kopfzeile für die Bezeichnung. Die Bilder laufen randlos bis an die
Tafelkante, die Bildunterschrift steht darunter auf der Tafel – eine gefasste
Bildtafel statt frei stehender Karten.

**Der Abschnitt liegt jetzt auf dem cremefarbenen Band.** Vorher war er
schwarz und schloss direkt an den ebenfalls schwarzen Auftakt an; mit der
grösseren Höhe wären das über 2000 px Schwarz am Stück gewesen.

**Die Zuschnitte sind deckungsgleich ausgerichtet.** Die sechs Aufnahmen sind
unterschiedlich gerahmt – ohne Ausgleich springt der Kopf, sobald man den
Regler zieht. Für jedes Einzelbild sind Kopfoberkante, Kinn und Gesichtsmitte
abgelesen; daraus berechnet `zuschnitt.py` einen Ausschnitt, in dem der Kopf
überall gleich gross an derselben Stelle sitzt (4:3, aus den Originalen mit
bis zu 2560 px Breite).

**Der Reglergriff** war ein halbdurchsichtiger Kreis mit einer Klip-Form, die
als Blitz statt als zwei Pfeile erschien. Neu ist er eine massive Goldscheibe
mit einem echten SVG-Doppelpfeil in Warmschwarz – auf hellem wie dunklem Foto
sofort als Bedienelement erkennbar.

### Der vierte Fall

Bis die vierte Aufnahme vorliegt, steht in der Männer-Tafel dasselbe Bildpaar
zweimal, damit die Tafel ihre endgültige Höhe und Gliederung zeigt. Der Fall
trägt die Marke **„Platzhalter"**. Beim Einbau sind Bildpaar, Beschriftung und
diese Marke zu ersetzen; im Quelltext steht ein entsprechender Kommentar.

## Annahmen und offene Punkte

* **Das Hero-Video** war im Abzug nicht enthalten. An seiner Stelle steht das
  vorhandene Bild „Frau hält Dose“ mit einer Abspielschaltfläche. Beim Einbau
  das echte Video-Widget einsetzen.
* **Preis Präzisions-Applikator CHF 29.90** ist aus dem Starter-Set abgeleitet
  (CHF 58.80 regulär minus CHF 28.90). Auf der Startseite war der Preis im
  Abzug nicht sichtbar.
* **Die Prüfsiegel** sind neu gezeichnet, siehe oben. Wenn die Originalbilder
  gewünscht sind, die sechs `<svg class="seal">` durch `<img>` ersetzen.
* **Bewertungstexte** sind wörtlich übernommen, einschliesslich Mundart. Ein
  Tippfehler im Original („Sternter-Set“) ist zu „Starter-Set“ korrigiert.
* Die Umsetzung für Elementor steht noch aus.

## Barrierefreiheit

Auf allen Seiten dieser Reihe geprüft und behoben: goldener Text erreichte auf
hellem Grund nur 2.91:1 – dafür gibt es jetzt das Token `--gold-text`
(#7D6F45, 4.96:1), während das helle Gold auf dunklen Bändern bleibt, wo es
6.0:1 trägt. `--text-faint` lag bei 3.27:1 und trug Datumsangaben und
Feldbeschriftungen, neu 5.23:1. Dazu: Dokumentsprache, Menü für schmale
Geräte, Artikelzahl im Namen des Warenkorb-Knopfs, dekorative Symbole aus dem
Accessibility-Tree genommen, sanftes Scrollen nur ohne Bewegungsreduzierung.

Ein Messskript prüft jeden Textknoten jeder Seite gegen den tatsächlich
gerenderten Hintergrund; alle neun Seiten sind ohne Befund.
