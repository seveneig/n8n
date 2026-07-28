# HairHelp – neue Startseite

Eine eigenständige Startseite für [hairhelp-haarverdichter.ch](https://hairhelp-haarverdichter.ch/):
`index.html` enthält Markup, CSS und JavaScript in einer einzigen Datei. Keine externen
Schriften, keine CDN-Skripte, keine Bilddateien — die Hero-Grafik wird per Canvas gezeichnet.

## Einbinden

**Statisch hosten:** Datei als `index.html` hochladen, fertig.

**WordPress:** den Inhalt zwischen `<style>…</style>` in ein Custom-CSS-Feld, den Inhalt von
`<body>` in einen Custom-HTML-Block und das `<script>` ans Ende. Alternativ die Datei als
Landingpage-Template im Child-Theme ablegen.

## Was du anpassen solltest

Alle inhaltlichen Werte stehen gebündelt im `<script>` unter der Konstante `INHALT`:

| Schlüssel | Inhalt |
| --- | --- |
| `farben` | Die sechs Farbtöne. `hex` steuert Swatch, Farbkarte **und** die Hero-Simulation. Namen und Hex-Werte ans echte Sortiment angleichen. |
| `stimmen` | **Platzhalter.** Bewusst leer gelassen — hier gehören echte, belegbare Bewertungen hinein. |
| `faq` | Sieben Fragen und Antworten. |
| `ratgeber` | Verlinkung der bestehenden Ratgeberseiten. |

Ausserdem prüfen:

- **Footer, Rechtliches:** `/kontakt/`, `/impressum/`, `/agb/`, `/datenschutz/` sind geraten —
  durch die echten URLs ersetzen.
- **Preis und Konditionen:** CHF 49.90, Gratisversand ab CHF 35, 30 Tage Geld-zurück stehen im
  Markup (Hero, Faktenband, Produktkarte, Schluss-CTA).
- **Warenkorb-Links:** zeigen aktuell auf `/hair-fibers/`.

## Bewusste Entscheidungen

- **Keine Vorher-/Nachher-Fotos.** Die Hero-Grafik ist eine schematische Simulation der
  Faserdichte und ist im Bild als solche beschriftet. Erfundene Ergebnisbilder wären
  lauterkeitsrechtlich heikel.
- **Keine erfundenen Kundenstimmen** und keine erfundene Sterne-Bewertung.
- **Nur belegte Produktaussagen:** pflanzliches Keratin, elektrostatische Haftung,
  Anwendung unter 30 Sekunden, Resthaar als Voraussetzung.

## Technik

- Hell- und Dunkelmodus über Farb-Token, folgt der Systemeinstellung.
- Animationen: Hero-Einlauf, Scroll-Reveal, Aufbau der Faserdichte, Akkordeon, Hover-Zustände.
  Alle respektieren `prefers-reduced-motion`.
- Tastaturbedienbar, sichtbarer Fokus, Sprungmarke zum Inhalt.
- Getestet in Chromium bei 1440 px, 390 px, hell und dunkel — kein horizontaler Überlauf,
  keine Konsolenfehler.
