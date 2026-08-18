# HairHelp – Seite „NextGen Haarverdichter“

Neugestaltung von `esidekew.myhostpoint.ch/haarverdichter/` im Stil der
Produktseite. **Der Inhalt ist unverändert** – Überschriften, Fliesstext,
Aufzählungen und Schaltflächen stammen wörtlich von der bestehenden Seite.
Geändert wurden Anordnung, Bildfassung, Bandfolge und Typografie.

## Dateien

| Datei | Zweck |
| --- | --- |
| `haarverdichter.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert: alle Bilder, die sechs zugeschnittenen Farbmuster, Jost-Webfont, Logo. |
| `build.py` | Erzeugt `ausgabe/haarverdichter.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was die Seite uneinheitlich wirken liess

Aufgenommen aus dem Abzug vom 18. August:

* **Bildeinbettung.** Sieben verschiedene Behandlungen auf einer Seite: das
  Auftaktbild randlos, das Ladungs-Diagramm freigestellt schwebend, das
  Produktfoto auf einem hellgrauen Kasten, zwei Abschnitte ganz ohne Bild,
  die Männer- und Frauen-Blöcke mit je zwei ungerahmten Einzelbildern.
* **Seitenverhältnisse.** Zwölf Bilder, zwölf verschiedene Formate –
  von 800 × 356 bis 1226 × 1294.
* **Hintergründe.** Weiss, kaltes Grau, weiss, weiss, kaltes Grau, weiss,
  schwarz – ohne erkennbare Ordnung. Das Grau war zudem ein kaltes `#EEE`
  statt der warmen Markencreme `#FAF9F6`.
* **Sechs Farbtöne als Wortliste.** Die Farben standen als Aufzählung da,
  obwohl das Bild mit allen sechs Farbtöpfen bereits auf der Seite lag.
* **Vorher/Nachher ungenutzt.** Bei Männern und Frauen lagen je zwei Bilder
  untereinander, ohne dass der Vergleich erkennbar war.
* **Kein einziger Alternativtext.** Alle 17 Bilder hatten `alt=""`.

## Was die neue Fassung daraus macht

**Eine Bildfassung für alles.** Jedes Bild sitzt in derselben Fassung:
1 px warme Linie, 4 px Radius, Seitenverhältnis 3∶2, cremefarbener Grund,
Inhalt eingepasst statt beschnitten. Nur das Auftaktbild füllt seinen Rahmen.
Die Fassung bleibt in beiden Erscheinungsbildern hell, weil die Diagramme
schwarze Strichzeichnungen auf Weiss sind und auf dunklem Grund verschwänden.

**Eine Bandfolge mit Bedeutung.** Schwarz für den Auftakt, dann Weiss und
Creme im Wechsel, Schwarz wieder für die Ergebnisse, Creme für die Garantie.
Die zwei schwarzen Bänder klammern die Seite, statt zufällig aufzutauchen.

**Wechselnde Text-Bild-Reihen.** Die fünf Technologie-Abschnitte laufen als
Zweispalter mit wechselnder Bildseite statt als lose Folge.

**Sechs echte Farbmuster.** Das vorhandene Bild der sechs Farbtöpfe ist in
sechs runde Einzelmuster zerlegt, jedes mit seinem Namen – wie die Swatches
auf der Produktseite.

**Vorher/Nachher als Vergleich.** Die vier vorhandenen Bilder sind zu zwei
ziehbaren Vergleichen zusammengefasst, mit Tastaturbedienung, auf schwarzem
Grund mit goldenem Griff – dieselbe Behandlung wie auf der Produktseite.

**Drei Schritte als Karten.** Aus der verschachtelten Nummernliste werden
drei nummerierte Karten.

**Alternativtexte.** Alle 20 Bilder sind beschriftet.

## Bewusste Abweichung

Die drei Garantie-Icons (`icon-geld`, `icon-30tage`, `icon-etikette`) waren
abstrakte Goldformen mit sehr grossen weissen Rändern und liessen sich in
Icon-Grösse kaum lesen. Sie sind durch Inline-SVG in derselben Strichsprache
ersetzt, die Kopfzeile, Produktseite und Fusszeile bereits verwenden.
Die Originalbilder liegen weiterhin in `assets.json` – wer sie zurückhaben
möchte, ersetzt die drei `<svg class="gicon">` wieder durch `<img>`.

## Offen

* Die Bild-URLs der Mediathek liessen sich aus dem Abzug nicht rekonstruieren
  (SingleFile hatte sie durch eingebettete Daten ersetzt). Für den Einbau in
  Elementor bleiben die Bilder in ihren bestehenden Bild-Widgets; für die
  eigenständige Fassung sind sie eingebettet.
* Der Farbton heisst auf dieser Seite **Hellgrau**, im Shop **Grau**. So
  belassen, weil der Inhalt unverändert bleiben sollte – wäre aber eine
  sinnvolle Vereinheitlichung.
* Die Elementor-Umsetzung (CSS-Layer plus HTML-Widgets, wie in
  `../produktseite/elementor/`) ist noch nicht gebaut.

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
