# Smell Discettes – Website

Neugestaltung des Webauftritts (bisher: `https://tazazehi.myhostpoint.ch/`).
Sprache: **Deutsch**. Markenfarben unverändert übernommen.

## Die drei Seiten

| Seite | Quelldatei | Zum Einfügen in Elementor |
|---|---|---|
| Startseite | `index.html` | **`elementor-startseite.html`** (569 KB) |
| Produkt | `produkt.html` | **`elementor-produkt.html`** (464 KB) |
| Über uns | `ueber-uns.html` | **`elementor-ueber-uns.html`** (383 KB) |

Die `elementor-*.html` sind die fertigen Copy-Paste-Blöcke: Schrift und alle Bilder
sind eingebettet, es werden keine externen Dateien benötigt. Im Ordner
**`zum-kopieren/`** liegen dieselben drei Blöcke als `.txt`, damit sie sich per
Doppelklick in Notepad öffnen lassen statt im Browser. Anleitung in
**`EINBAU-ELEMENTOR.md`**.

## Weitere Dateien

| Datei | Zweck |
|---|---|
| `assets/css/sd.css` | **Gemeinsames Stylesheet aller drei Seiten** – hier wird das Design gepflegt |
| `assets/fonts/lato.css` | Lato als Base64 (SIL OFL), kein Google-Fonts-Aufruf |
| `build-elementor.mjs` | Baut alle drei Elementor-Fassungen: `node build-elementor.mjs` |
| `CLAUDE.md` | Inhaltsregeln, gelten auch für künftige Seiten und Übersetzungen |
| `assets/_originale/` | Die hochgeladenen Originaldateien, unverändert |
| `referenz/` | Die alte Startseite als HTML plus daraus extrahierte Bestandsbilder |

## Aufbau der Seiten

**Startseite** – Hero mit Produktbild über die volle Breite · Kennzahlenband
(99,74 % · 3 Schritte · 8 Riechstoffe · 4 Publikationen) · drei Karten mit den
Piktogrammen · Anwendung in drei Schritten · präoperative Dokumentation mit
Praxisfoto · Evidenz · Bestellen · Footer

**Produkt** – Seitenkopf mit geöffneter TestBox · Kennzahlen (8 · 3 · CE · CH) ·
drei Einsatzkarten · zwei Detailaufnahmen · Artikeltabelle Set · Artikeltabelle
der acht Ersatzdisketten mit Art-Nr., UDI-ID und Duft · Bezugsquellen · Footer

**Über uns** – Seitenkopf mit Packshot · «Warum» als Fliesstext mit den Begriffen
Normosmie/Hyposmie/Anosmie · Zeitstrahl der Geschichte (25+ Jahre → 2023 → 2024 →
2025) · Team mit vier Porträts · die vier wissenschaftlichen Publikationen · Footer

## Gestaltung

Die Markenfarben sind unverändert; hinzugekommen sind abgestufte Zwischentöne für
Flächen und Ränder.

| | Wert | Verwendung |
|---|---|---|
| Primärblau | `#407BA0` | Handlungsaufrufe, Auszeichnungen, Akzente |
| Blau dunkel | `#31637F` | Hover-Zustände |
| Navy | `#00102E` | Überschriften, dunkle Bänder, Footer |
| Blau hell | `#BCD3E5` | Linien, Piktogramm-Flächen |
| Blaudunst | `#EDF4F9` | Flächen hinter Illustrationen |
| Fläche | `#F5F9FC` | Abschnittshintergründe |
| Text | `#16233A` / `#5C6E85` | Fliesstext / Sekundärtext |

Schrift: **Lato**, Gewichte 400/700/900. Alle drei Seiten teilen sich dieselben
Bausteine (Karten, Kennzahlenband, Seitenkopf, Tabellen, Zeitstrahl, Team,
Publikationen) und dieselbe Navigation, damit sie zusammengehören.

## Inhaltliche Anpassungen

Die Aussagen der bestehenden Seiten sind erhalten, aber geschärft und ins Deutsche
übertragen. Neu strukturiert: Kennzahlen-Bänder auf allen Seiten, ein Zeitstrahl für
die Geschichte statt Fliesstext, und die Artikelangaben als Tabelle, die auf dem
Handy in Karten umbricht.

### Bitte gegenlesen

- **Publikationen 1 und 2** («Olfaction in rhinology…» und «Olfaction after
  endoscopic sinus surgery…») stehen ohne Journal und Jahr – die Angaben fehlen mir.
  Im Quelltext ist die Stelle mit `<!-- Journal und Jahr bitte ergänzen -->` markiert.
- **Funktionen im Team**: Für Prof. Simmen und KD Dr. Briner steht «Mitautor der
  Validierungsstudien» (aus der Autorenschaft der beiden Studien abgeleitet).
  Für Dr. Reize und Hans Spichiger habe ich keine Angabe und deshalb keine erfunden –
  die Stellen sind im Quelltext auskommentiert.
- **Länderkarte** auf der Produktseite fehlt: Auf der alten Seite konnte man ein Land
  anklicken, um den Vertriebspartner zu finden. Ich habe an dieser Stelle einen
  Button gesetzt und die Stelle im Quelltext markiert.
- **Kontaktadresse** `info@smelldiscettes.ch` ist ein Platzhalter – die alte Seite
  nennt `info@tazazehi.myhostpoint.ch`, was eine Hosting-Adresse ist.
- **Zwei Aussagen sind bewusst entfernt** – siehe `CLAUDE.md`, die Regeln gelten
  auch für alle künftigen Seiten:
  - **Keine Zeitangabe.** Die Fünf-Minuten-Aussage ist überall ersetzt durch
    „rasch", „unkompliziert", „geringer Zeitaufwand".
  - **Keine Wiederverwendbarkeit.** „Disketten wiederverwendbar" ist gestrichen,
    ebenso „Refills nach ca. 12 Monaten". Geblieben ist „einzeln ersetzbar" bzw.
    „einzeln nachbestellbar" – beides betrifft den Ersatz, nicht die Mehrfachnutzung.

## Kontrolle

Alle drei Seiten wurden bei 1440 px und 390 px gerendert: kein horizontales
Überlaufen, keine gebrochenen Bilder, Schrift lädt. Zusätzlich jede Seite gegen ein
bewusst störendes Test-Theme geprüft – in allen sechs Kombinationen
**pixelidentisch** zur Standalone-Fassung.
