# HairHelp – neue Produktseite

Neugestaltung der Produktseite `hairhelp-haarverdichter.ch/shop/streuhaar-kaufen/`.
Farben, Schrift, Logo und alle Bilder stammen unverändert von der bestehenden Website.

## Dateien

| Datei | Zweck |
| --- | --- |
| `produktseite.html` | Quelle. Fotos per Live-URL, Kleinassets als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus der Website extrahierte Assets: Jost-Webfont, Logo, Farbmuster, Zahlarten-Leiste, Anleitungsbilder, plus alle Fotos als Rückfallebene. |
| `build.py` | Erzeugt beide Ausgaben nach `ausgabe/`. |
| `ausgabe/produktseite.html` | Produktion: Schrift und Kleinassets eingebettet, Fotos vom CDN der Website. |
| `ausgabe/vorschau.html` | Vorschau: alles eingebettet, läuft ohne Netzwerkzugriff. |

Bauen:

```
python3 build.py
```

## Einbau in Elementor und WooCommerce

Der Ordner `elementor/` enthält die Umsetzung für die bestehende Website:
einen CSS-Layer über den vorhandenen Aufbau und fünf HTML-Widgets für die
Abschnitte, die es bisher nicht gibt. Einbauanleitung dort in `README.md`.

Die eigenständige Seite in diesem Ordner bleibt als Entwurf und Referenz
bestehen – sie zeigt das Ziel, `elementor/` bringt es auf die Website.


## Markensystem

Übernommen aus der bestehenden Website, nicht neu erfunden.

| Rolle | Wert | Herkunft |
| --- | --- | --- |
| Gold | `#A39772` | Akzentfarbe der Website |
| Helles Gold | `#D1BC92` | Elementor-Akzent, Sterne |
| Warmes Schwarz | `#1A1A18` | Fusszeile der Website |
| Creme | `#FAF9F6` | Flächen der Website |
| Warme Linie | `#EBE6DB` | aus `#F0EDE6` |
| Fliesstext | `#6E6959` | wärmer als das bisherige `#7A7A7A` |
| Schrift | Jost 300–700 | Hausschrift, als WOFF2 eingebettet |

Die Seite ist hell wie dunkel angelegt. Alle Farben laufen über Tokens in `:root`
und werden in `@media (prefers-color-scheme: dark)` sowie `:root[data-theme="dark"]`
neu belegt – die Marke bleibt in beiden Fällen Gold auf warmem Grund.

## Was sich gegenüber der alten Seite ändert

**Reihenfolge.** Bisher kamen direkt nach dem Kaufmodul die 82 Rezensionen, die
Produktbeschreibung stand erst danach. Neu folgt auf das Kaufmodul der Beweis
(Vorher/Nachher), dann die Anwendung, die Technologie, die Garantie – und erst
dann die Rezensionen.

**Kaufmodul.** Die Rabattstufen sind wählbare Karten mit Preis pro Dose; der
Gesamtpreis steht auf dem Button. Ein Hinweis zeigt, wie viele Dosen bis zur
nächsten Stufe fehlen. Farbwahl mit Namensanzeige, wechselndem Dosenbild und
mitlaufender Artikelnummer. Die Galerie bleibt beim Scrollen stehen.

**Vorher/Nachher.** Statt drei statischer Bildreihen drei ziehbare Vergleiche mit
Tastaturbedienung, auf schwarzem Grund mit goldenem Griff.

**Technologievergleich.** Die bisher als Bild eingebundene Tabelle ist als
Markup neu aufgebaut: scharfe Schrift, vorlesbar, und unter 760 px als gestapelte
Karten statt als seitwärts scrollende Tabelle.

**Anwendung.** Die dreiteilige Anleitungsgrafik ist in drei nummerierte Schritte
zerlegt.

**Kaufleiste.** Blendet sich ein, sobald das Kaufmodul aus dem Bild scrollt.

## Annahmen

* **5 % ab 3 Dosen.** Die Website nennt „Ab 2 Dosen: 5 % Rabatt“ und „Ab 3 Dosen:
  Gratis Versand plus 1 Dose oder den Präzisions-Applikator gratis“. Die alte
  Stufenkarte für 3 Dosen wies die 5 % nicht aus. Hier gilt „ab 2“ wörtlich, die
  5 % laufen also auch bei 3+ Dosen mit. Falls das nicht gewollt ist, `pricing()`
  im Skript anpassen.
* **Versandschwelle CHF 35.–** nach dem Text der alten Seite. Die Grafik dazu
  heisst `ab-40CHF-kostenlose-Lieferung.webp`; die beiden widersprechen sich
  bereits auf der bestehenden Seite.
* **Haltbarkeit** steht in der Produktbeschreibung mit 4–6 Wochen, im FAQ mit
  6–8 Wochen. Beide Angaben sind übernommen, wo sie standen.
* **Bewertungsverteilung** wird in Prozent gezeigt (79 / 17 / 3 / 0 / 0), weil die
  absoluten Zahlen der alten Seite in der Summe nicht auf 82 kommen.
* **Dosenbilder der übrigen fünf Farben** sind im gespeicherten Seiten-Dump nicht
  enthalten. Die Produktion verweist auf die korrekten Live-URLs; nur die
  Vorschau zeigt ersatzweise das Dunkelbraun-Bild.
* Der Warenkorb-Button ist eine Demo-Meldung – die Anbindung an WooCommerce
  fehlt noch.

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
