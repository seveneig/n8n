# HairHelp – Shopseite

Neugestaltung von `hairhelp-haarverdichter.ch/shop/` im Stil der übrigen
neuen Seiten. Produktnamen, Preise, Wertungen und Zusicherungen sind
unverändert übernommen.

## Dateien

| Datei | Zweck |
| --- | --- |
| `shop.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert; Jost-Webfont, Logo und Zahlarten-Leiste aus `../frauen/`. |
| `build.py` | Erzeugt `ausgabe/shop.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was uneinheitlich war

* **Kein Seitenkopf.** Die Seite begann ohne Titel direkt mit dem
  Produktraster – weder eine Überschrift noch ein Hinweis auf Versand,
  Rückgabe oder Zahlarten.
* **Der WooCommerce-Standardtext stand sichtbar in der Karte:** „Dieses Produkt
  weist mehrere Varianten auf. Die Optionen können auf der Produktseite gewählt
  werden.“ – zweimal, in voller Länge.
* **Der Sonderpreis erschien als Rohtext** („Ursprünglicher Preis war: CHF
  58.80CHF 49.90Aktueller Preis ist: CHF 49.90.“) statt als durchgestrichener
  alter Preis.
* **Der Vertrauensblock** stand als drei lose Bild-Text-Paare unter einer
  Trennlinien-Überschrift, ohne Fassung.

## Was die neue Fassung macht

**Ein Seitenkopf auf schwarzem Grund** mit Titel und den drei Zusicherungen,
die vorher nur unten standen.

**Drei Produktkarten in einem Raster** mit gemeinsamer Fassung: Bild auf
weissem Grund (dem Eigenhintergrund der Produktfotos), Wertung mit Sternen und
Zahl, Beschreibung, Preis, Hinweis zur Farbwahl, Knopf. Die Karten fluchten,
weil die Titelzeile auf zwei Zeilen festgelegt ist.

**Der Sonderpreis** steht als neuer Preis, durchgestrichener alter Preis und
Ersparnis in Prozent. Die Marke „Set-Preis“ liegt auf dem Bild.

**Der Variantenhinweis** ist auf einen Satz gekürzt: „In sechs Farbtönen
erhältlich – Farbe auf der Produktseite wählen.“

**Der Vertrauensblock** liegt im selben Rasterbauteil wie die Produktkarten,
mit Strichsymbolen in der Sprache der übrigen Seiten.

## Annahmen und offene Punkte

* **Die Produktbeschreibungen sind Zutat.** Das Original zeigt in der Karte
  nur Name, Kategorie, Wertung und Preis. Die je zwei Sätze fassen zusammen,
  was auf Produkt- und Anwendungsseite steht.
* **„15 % sparen“** ist aus den beiden Preisen gerechnet
  (58.80 → 49.90 entspricht 15,1 %).
* **Die Kategorie „Haarverdichtung“**, die im Original unter jedem Produktnamen
  stand, ist entfallen – sie war bei allen drei Produkten dieselbe.
* **Die Wertungen** (4.76 / 4.90 / 5.00) sind unverändert übernommen; die
  Anzahl der Bewertungen nennt die Shopseite nicht.
* Die Umsetzung für Elementor und WooCommerce steht noch aus. Für diese Seite
  genügt ein CSS-Layer über das bestehende Produktraster; die Karten sind
  Standard-WooCommerce-Markup.

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
