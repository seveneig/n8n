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

**Ein Vorher/Nachher-Bauteil:** drei gleich grosse, ziehbare Vergleiche mit
Tastaturbedienung – dieselbe Behandlung wie auf Produkt- und
Haarverdichter-Seite. Das Karussell entfällt.

**Karten mit Fassung:** Bewertungen, „Für wen“, Qualität, Produkte und
Prüfsiegel liegen in demselben Rasterbauteil mit warmer Linie.

**Prüfsiegel als Inline-SVG** in der Strichsprache der übrigen Seiten. Die
sechs Original-Siegelbilder waren im Abzug nicht enthalten (unterhalb des
sichtbaren Bereichs, nie nachgeladen).

**Alternativtexte** für alle 34 Bilder.

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
