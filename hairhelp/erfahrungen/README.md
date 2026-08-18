# HairHelp – Seite „Erfahrungen“

Neugestaltung von `hairhelp-haarverdichter.ch/streuhaar-erfahrungen/` im Stil
der übrigen neuen Seiten. Die Bewertungen sind wörtlich übernommen,
einschliesslich Mundart und Tippfehlern.

## Dateien

| Datei | Zweck |
| --- | --- |
| `erfahrungen.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Aus dem Seiten-Dump extrahiert; Jost-Webfont, Logo, Siegel und Garantiesymbole aus `../frauen/`. |
| `build.py` | Erzeugt `ausgabe/erfahrungen.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was uneinheitlich war

* **Der Bewertungsblock brachte eine eigene Schrift mit.** Der Abschnitt war
  ein eingefügter HTML-Block mit `Source Sans 3` und rund 90 `!important`-Regeln,
  die sich bewusst gegen das Theme stellten – auf einer Seite, deren
  Hausschrift Jost ist.
* **Eine zweite Formsprache:** 16 px runde Ecken, weiche Schlagschatten,
  Verlauf auf den Kürzeln, Hover-Effekt mit Anheben. Die übrigen Seiten
  arbeiten mit 4 px Radius, 1 px warmer Linie und ohne Schatten.
* **Kein Auftakt.** Die Seite begann direkt mit den Bewertungskarten.
* **Keine Gesamtwertung.** Wer wissen wollte, wie gut das Produkt bewertet ist,
  musste neun Karten zählen.

## Was die neue Fassung macht

**Ein Auftakt auf schwarzem Grund** mit den Wertungen der drei Produkte, jede
mit ihrer eigenen Zahl. Die Zahlen stammen aus dem Seitenabzug der Shopseite
(siehe Annahmen).

**Die Bewertungskarten** liegen im selben Rasterbauteil wie die Karten der
übrigen Seiten: warme Linie, kein Radius über 4 px, kein Schatten. Die Kürzel
sind dunkel auf Gold gesetzt – dieselbe Behandlung wie die Artikelzahl am
Warenkorb.

**Der Nachweis „Verifiziert“** steht als Marke neben dem Namen und ist unter
den Karten einmal erklärt.

## Annahmen und offene Punkte

* **Neun Bewertungen statt achtzehn.** Der Knopf „Weitere 9 Bewertungen
  anzeigen“ lädt die restlichen per JavaScript nach; im gespeicherten
  Seitenabzug waren sie nicht enthalten. Gezeigt sind die neun, die im Abzug
  standen. Beim Einbau kommen die übrigen aus derselben Quelle wie bisher.
* **Die drei Wertungen im Auftakt** (4.76 / 4.90 / 5.00) stammen aus dem
  Seitenabzug der Shopseite, nicht von der Erfahrungsseite selbst. Sie sind
  echte Werte der Website, aber von einer anderen Seite übernommen – beim
  Einbau bitte gegen die Live-Werte prüfen.
* **Alle neun Bewertungen tragen fünf Sterne.** Das Original zeigt keine
  Sternzahl je Bewertung an; fünf Sterne sind aus der Markup-Struktur
  übernommen.
* **Emoticons** (`:)`, `:-D`) sind gegen Zeilenumbruch geschützt, sonst
  brechen sie mitten im Zeichen um.
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
