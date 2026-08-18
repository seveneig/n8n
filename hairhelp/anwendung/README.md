# HairHelp – Seite „Anwendung“

Neugestaltung von `hairhelp-haarverdichter.ch/streuhaar-anwendung/` im Stil der
übrigen neuen Seiten. Der Inhalt ist übernommen – Schritte, Regeln und
Applikator-Anleitung stammen wörtlich von der bestehenden Seite.

## Dateien

| Datei | Zweck |
| --- | --- |
| `anwendung.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert; Jost-Webfont, Logo, Siegel und Garantiesymbole aus `../frauen/`. |
| `build.py` | Erzeugt `ausgabe/anwendung.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was uneinheitlich war

* **Die Do’s & Don’ts waren ein einziger Fliesstext-Klumpen.** Acht Regeln in
  einem Absatz, ohne Trennung zwischen „so machen“ und „so nicht“ – gerade der
  Abschnitt, den man beim Auftragen überfliegt.
* **Die Applikator-Anleitung war ein einzelnes breites Bild** mit fünf
  Feldern und eingebranntem Text. Auf dem Telefon war die Schrift darin nicht
  mehr lesbar, vorlesen liess sie sich gar nicht.
* **Zwei Trennlinien-Überschriften** („Anwendung Haarfasern“, „Anleitung
  Präzisions-Applikator“) neben normalen Überschriften – zwei Systeme auf
  einer Seite.
* **Bilder ohne gemeinsame Fassung**, jedes mit eigenem Rahmen und eigener
  Grösse.

## Was die neue Fassung macht

**Die drei Schritte** stehen als nummeriertes Raster mit gleich grossen
Illustrationen. Die Unterpunkte zum Auftragen (Scheitel, Vertex, Konturen)
sind eine Aufzählung statt einer Aneinanderreihung im Fliesstext.

**Do’s und Don’ts** stehen sich als zwei Kästen gegenüber, grün gegen
braun, mit Plus- und Minuszeichen. Der Hinweis zur Farbwahl steht als eigenes
Hinweisfeld darunter.

**Die Applikator-Anleitung** ist in fünf Einzelbilder zerlegt; die Bildunter‑
schriften sind echter Text. Die Fassung der Bilder nimmt den hellgrauen
Eigenhintergrund der Fotos auf (`#E1E4E6`), damit Bild und Rahmen nicht
springen.

**Die Illustrationen** hatten einen eigenen dunklen Rahmen, der neben dem
Rahmen der Fassung als doppelte Linie erschien – er ist entfernt.

**Alternativtexte** für alle 16 Bilder.

## Annahmen und offene Punkte

* **Das Video zur Applikator-Montage war im Seitenabzug nicht enthalten.** An
  seiner Stelle steht das Standbild aus dem Original mit einer
  Abspielschaltfläche; der Knopf sagt beim Klick, dass das Video beim Einbau
  einzusetzen ist.
* **Der Abschnittstitel „In fünf Handgriffen aufgesetzt“** und die beiden
  erklärenden Absätze daneben sind Zutat – im Original stand an dieser Stelle
  nur das Bild. Sie fassen zusammen, was die fünf Bilder zeigen.
* **Die Don’ts** sind aus denselben Sätzen gebildet wie die Do’s: Was das
  Original als „Nur auf trockenem Haar“ formuliert, erscheint hier zusätzlich
  als „Nicht auf feuchtes Haar“. Inhaltlich ist nichts hinzugekommen.
* **Die Kopfzeile blendet die Navigation unter 1080 px in ein Menü um.**
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
