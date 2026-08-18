# HairHelp – Seite „Streuhaar für Frauen“

Neugestaltung von `hairhelp-haarverdichter.ch/streuhaar-frauen/` im Stil der
übrigen neuen Seiten. Der Inhalt ist übernommen – Überschriften, Fliesstexte,
Aufzählungen und Tipps stammen wörtlich von der bestehenden Seite.

## Dateien

| Datei | Zweck |
| --- | --- |
| `frauen.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert; Jost-Webfont, Logo und Zahlarten-Leiste aus `../maenner/`. |
| `build.py` | Erzeugt `ausgabe/frauen.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Bilder und Hintergründe

Die beiden Vorgaben für diese Seite waren: Bilder müssen mit ihrem
Hintergrund übereinstimmen, und die Hintergründe wechseln harmonisch von
Abschnitt zu Abschnitt.

**Bandfolge ohne zwei gleiche Nachbarn:**
Schwarz (Auftakt) · Weiss (Vorteile) · Creme (Angebot) · Weiss (Problemzonen,
Scheitel, Schläfen) · Creme (Aufsatz, Volumen) · Schwarz (Ergebnisse) ·
Creme (Farbwahl) · Weiss (Beauty-Tool) · Schwarz (Fusszeile).

**Jede Bildfassung trägt die gemessene Eigenhintergrundfarbe ihres Bildes
als Matte.** Die Hintergründe wurden aus den Randpixeln der Originalbilder
gemessen: Produktfotos `#FDFDFD`/`#FEFEFE` → weisse Matte, Farbdosenbild
`#FAFAF8` → eigene Matte, Auftaktbild `#DFE0E2` → graue Matte. So gibt es
keinen sichtbaren Sprung zwischen Bildrand und Fassung. Fotos ohne
Studiohintergrund laufen randlos (`object-fit: cover`), dort stellt sich die
Frage nicht. Der Präzisionsaufsatz liegt als freigestelltes Bild (transparenter
Hintergrund) auf einer Goldton-Karte.

**Die Vorher/Nachher-Kompositionen sind zerlegt.** Im Original liegen alle
Vergleichsbilder als Sammelbilder vor: zwei Fotos nebeneinander oder
übereinander auf beigem oder schwarzem Passepartout mit Schlagschatten –
ein Rahmen im Rahmen, je nach Abschnitt anders. Der Zuschnitt entfernt die
Passepartouts (Erkennung über Farbtemperatur und Varianz der Randlinien,
Nacharbeit von Hand); beide Hälften eines Paares erhalten dasselbe
Seitenverhältnis. Auf der Seite stehen sie in einer gemeinsamen Fassung als
beschriftete „Vorher/Nachher“-Duos.

**Kein ziehbarer Vergleich auf dieser Seite:** Anders als beim Material der
Produkt- und Männerseite sind die Vorher/Nachher-Fotos hier nicht
deckungsgleich aufgenommen (Kopfhaltung und Ausschnitt weichen ab). Ein
Schieberegler würde an der Nahtstelle springen; die Duos zeigen die Paare
ehrlicher.

## Aufbau gegenüber dem Original

* **Das Bilder-Karussell** (6 Vorher/Nachher-Sammelbilder, Swiper) ist eine
  seitlich blätterbare Galerie mit Wischen, Pfeilknöpfen und
  Tastaturbedienung. Die Höhe der Karten ist einheitlich, die Breite folgt
  dem Bildformat. Ein siebtes Paar (Nahaufnahme Haarlinie) stammt aus dem
  Schläfen-Abschnitt des Originals, wo es als zweites Sammelbild lag.
* **Die Parallax-Hintergrundbilder des Originals haben feste Plätze:** Das
  Foto „Frau mit Handspiegel“ (Hintergrund des Angebots-Abschnitts) ist das
  Bild des Angebotsbands, mit dem Garantie-Siegel überlappt. Der
  freigestellte Pumpaufsatz (Hintergrund des Schläfen-Abschnitts) illustriert
  den Präzisionsaufsatz-Abschnitt.
* **Die sechs Farbtöne** sind als runde Chips direkt aus dem
  Farbdosen-Foto geschnitten – kein Farbwert ist erfunden.
* **Der Styling-Tipp** (Zickzack-Scheitel) und der Farb-Tipp stehen in
  abgesetzten Hinweisfeldern statt im Fliesstext.
* **Alternativtexte für alle 42 Bilder.** Im Original trugen 3 von 30
  `<img>` ein `alt`; die Karussellbilder waren als Hintergrundbilder für
  Screenreader nicht vorhanden.

## Annahmen und offene Punkte

* **Zwei Zwischentitel sind Zutat:** „Vorher und nachher“ über der Galerie
  (das Karussell hatte keine Überschrift) und die Eyebrows („Die Vorteile“,
  „Farbwahl“, „Vielseitiges Beauty-Tool“). Alle übrigen Überschriften und
  Zwischenzeilen stammen vom Original.
* **Die Galerie-Bildunterschriften** (z. B. „Rückansicht“, „Profil“) sind aus
  den Dateinamen und Motiven der Originalbilder abgeleitet.
* **Die Kopfzeile klappt die Navigation unter 1080 px in ein Menü**, wie auf
  allen Entwurfsseiten – mit Tastaturbedienung und Escape zum Schliessen.
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
