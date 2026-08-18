# HairHelp – Seite „Streuhaar für Männer“

Neugestaltung von `esidekew.myhostpoint.ch/streuhaar-maenner/` im Stil der
übrigen neuen Seiten. Der Inhalt ist übernommen – Überschriften, Fliesstexte,
Hinweise und Anwendungstipps stammen wörtlich von der bestehenden Seite.

## Dateien

| Datei | Zweck |
| --- | --- |
| `maenner.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert; Jost-Webfont und Logo aus `../produktseite/`. |
| `build.py` | Erzeugt `ausgabe/maenner.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was uneinheitlich war

* **Vorher/Nachher in drei Formen.** Zwei Sammelbilder standen als Einzelbild
  im Text, eines lief als Karussell. Alle drei zeigten Vorher und Nachher
  nebeneinander in einem einzigen Bild, jeweils auf einem beigen Passepartout
  mit Schlagschatten – ein zweiter Rahmen im Rahmen.
* **Bilder ohne gemeinsame Fassung.** Fotos, Strichzeichnungen und Sammelbilder
  lagen direkt auf dem Seitengrund, in wechselnden Grössen und Formaten.
* **Hintergründe ohne Ordnung** – Weiss, Beige und Grau im Wechsel, ohne dass
  der Wechsel einen Abschnitt markiert hätte.
* **Fast keine Alternativtexte.** Von 30 `<img>`-Elementen der alten Seite
  tragen drei ein `alt`-Attribut; die Vorher/Nachher-Bilder sind zusätzlich als
  Hintergrundbilder eingebunden und damit für Screenreader gar nicht vorhanden.
* **Der Angebotsblock kam zweimal** in fast gleichem Wortlaut, einmal oben,
  einmal unten – beides ist übernommen, aber unterschiedlich ausgeführt.

## Was die neue Fassung macht

**Eine Bandfolge:** Schwarz für den Auftakt, Weiss und Creme im Wechsel,
Schwarz erneut für Ergebnisse und Garantie – dieselbe Reihenfolge wie auf
Start-, Produkt- und Haarverdichter-Seite.

**Eine Überschriftenform:** Goldlinie, Vorspann in Gold, Titel zweifarbig.

**Drei ziehbare Vergleiche.** Die drei Sammelbilder sind in sechs Einzelbilder
zerlegt (`recrop`-Schritt, siehe unten) und liegen jetzt im selben
Vergleichsbauteil wie auf den übrigen Seiten: ziehbar, mit Pfeiltasten
bedienbar, goldener Griff, Beschriftung „Vorher“ und „Nachher“. Das Karussell
entfällt.

**Eine Bildfassung für alles:** 1 px warme Linie, heller Passepartout, Format
3/2, Bild eingepasst statt beschnitten. Die Strichzeichnungen behalten ihren
hellen Grund auch im dunklen Modus, sonst verschwinden sie.

**Der Hinweis zu kahlen Stellen** steht nicht mehr als letzter Satz im
Fliesstext, sondern in einem abgesetzten Hinweisfeld – einmal beim Abschnitt
Tonsur, einmal über den Anwendungstipps.

**Alternativtexte** für alle 18 Bilder.

## Die Vorher/Nachher-Bilder

Die Originale sind Sammelbilder: zwei Fotos nebeneinander auf beigem
Passepartout, teils mit schwarzen Trennlinien und Schlagschatten. Für die
Vergleiche mussten daraus sechs Einzelbilder werden.

Der Zuschnitt erkennt den Rand daran, dass das Passepartout deutlich wärmer ist
als die Fotos (Rot minus Blau grösser 18) beziehungsweise dass eine Zeile fast
vollständig schwarz ist. Beide Hälften eines Paares werden anschliessend auf
dasselbe Seitenverhältnis gebracht, damit der Regler nicht springt. Die
Quellbilder liegen unverändert im Seiten-Dump; die zugeschnittenen Fassungen
stehen in `assets.json`.

## Annahmen und offene Punkte

* **Die Zuordnung der Sammelbilder** zu den drei Mustern stammt aus dem Bild,
  nicht aus dem Text: vorderer Haaransatz zu „Geheimratsecken“, Wirbel zu
  „Tonsur am Hinterkopf“, Hinterkopf von hinten zu „Dünnes Haar gesamt“.
* **Ein Grammatikfehler im Original** ist stillschweigend korrigiert: „Es muss
  noch feines Resthaar vorhanden sind“ heisst jetzt „… vorhanden sein“.
* **Die Kopfzeile blendet die Navigation unter 1080 px aus**, wie auf den
  übrigen Entwurfsseiten. Ein Menü für schmale Geräte gehört in die
  Elementor-Umsetzung, nicht in diesen Entwurf.
* Die Umsetzung für Elementor steht noch aus.
