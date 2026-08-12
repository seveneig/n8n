# Smell Discettes – Neue Startseite

Neugestaltung der Startseite (bisher: `https://tazazehi.myhostpoint.ch/de/`).
Sprache: **Deutsch**. Markenfarben unverändert übernommen.

## Dateien

| Datei | Zweck |
|---|---|
| **`elementor-embed.html`** | **Das Ergebnis zum Einfügen.** Kompletter Block mit eingebetteter Schrift und allen Bildern – in ein Elementor-HTML-Widget kopieren. 561 KB. |
| `index.html` | Quelldatei zum Bearbeiten (normale Bildpfade, gut lesbar). Lässt sich direkt im Browser öffnen. |
| `build-elementor.mjs` | Baut aus `index.html` die Elementor-Version: `node build-elementor.mjs` |
| `EINBAU-ELEMENTOR.md` | **Einbauanleitung** inkl. Container-Einstellungen und offener Links |
| `assets/` | Aufbereitete Bilder, Piktogramme und die eingebettete Schrift |
| `assets/_originale/` | Die hochgeladenen Originaldateien, unverändert |
| `referenz/` | Die alte Startseite als HTML plus die daraus extrahierten Bestandsbilder |

## Aufbau der Seite

1. **Header** – Logo, Navigation, Sprachumschaltung DE/FR/IT, Bestellen-Button
2. **Hero** – Produktbild über die volle Breite, Text links, Badge „Wieder verfügbar", zwei Handlungsaufrufe, Swiss-Made-Signet
3. **Kennzahlen** – dunkelblaues Band: 99,74 % · 3 Schritte · 8 Riechstoffe · 4 Publikationen
4. **Die wichtigsten Punkte** – drei Karten mit den Piktogrammen: Evidenz, Effizienz, Präoperative Relevanz
5. **Anwendung** – die drei Schritte mit den Illustrationen aus der Gebrauchsanweisung
6. **Präoperative Dokumentation** – Praxisfoto mit hervorgehobener 10,3-%-Kennzahl und drei Argumenten
7. **Evidenz** – dunkler Abschnitt mit den beiden Publikationen
8. **Bestellen** – Abschluss-Handlungsaufruf mit dem Nasen-Maskottchen
9. **Footer** – Logo, drei Linkspalten, Kontakt, Sprachen, Rechtliches

## Gestaltung

Die Markenfarben sind unverändert; hinzugekommen sind abgestufte Zwischentöne für
Flächen und Ränder, damit die Seite hochwertiger wirkt.

| | Wert | Verwendung |
|---|---|---|
| Primärblau | `#407BA0` | Handlungsaufrufe, Auszeichnungen, Akzente |
| Blau dunkel | `#31637F` | Hover-Zustände |
| Navy | `#00102E` | Überschriften, dunkle Bänder, Footer |
| Blau hell | `#BCD3E5` | Linien, Piktogramm-Flächen |
| Blaudunst | `#EDF4F9` | Flächen hinter Illustrationen |
| Fläche | `#F5F9FC` | Abschnittshintergründe |
| Text | `#16233A` / `#5C6E85` | Fliesstext / Sekundärtext |

Schrift: **Lato** (wie bisher), Gewichte 400/700/900, als Base64 eingebettet –
dadurch keine Anfrage an Google Fonts und garantiert gleiche Darstellung.

## Inhaltliche Anpassungen

Die Aussagen der alten Seite sind erhalten, aber geschärft:

- **Hero deutlich ausgebaut** – statt nur „À nouveau disponible pour vous" jetzt ein
  Nutzenversprechen („Riechvermögen objektiv testen. Direkt in der Praxis.") mit
  Erklärabsatz und Vertrauensmerkmalen.
- **Neue Kennzahlen-Leiste** – die vier stärksten Zahlen sofort sichtbar,
  statt sie im Fliesstext zu verstecken.
- **Titel konkreter** – „Ein Riechtest, der in den Praxisalltag passt",
  „Eine Baseline, die im Zweifelsfall zählt", „Publiziert und peer-reviewed".
- **Neuer Abschnitt zur präoperativen Dokumentation** mit dem Praxisfoto und der
  10,3-%-Kennzahl als eigenständiges Argument.
- **Neuer Evidenz-Abschnitt** mit den beiden Publikationen einzeln aufgeführt.

### Bitte gegenlesen

- Die Publikationen sind mit **Autor, Journal und Jahr** angegeben, ohne genauen
  Titel und Seitenzahlen – die vollständigen Angaben bitte ergänzen. Es sind
  zwei von vier Studien benannt; die beiden übrigen fehlen mir.
- Kontaktadresse und Firmenzeile im Footer sind Platzhalter.
- „Wieder verfügbar" im Hero stammt sinngemäss aus der alten Seite – bitte
  prüfen, ob das noch aktuell ist.
- **Keine Zeitangabe mehr.** Die Fünf-Minuten-Aussage der alten Seite ist überall
  entfernt und durch unbestimmte Formulierungen ersetzt („rasch", „unkompliziert",
  „geringer Zeitaufwand"). In der Kennzahlen-Leiste steht an dieser Stelle nun
  „3 Schritte" statt einer Dauer.

## Kontrolle

Die Seite wurde bei 1440 px, 768 px und 390 px Breite gerendert: kein horizontales
Überlaufen, keine gebrochenen Bilder, Schrift lädt. Zusätzlich gegen ein bewusst
störendes Test-Theme geprüft – dort **pixelidentisch** zur Standalone-Version.
