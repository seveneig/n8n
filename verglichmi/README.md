# Verglichmi – Vergleichs- & Test-Template

Seitentemplate für Produktvergleiche auf **Verglichmi**.
Demo-Inhalt ist ein Vergleich von **8 Schlauchbooten fürs Böötle**.

## Öffnen

```
verglichmi/index.html im Browser öffnen – kein Build, kein Server nötig.
```

## Seitenaufbau

| # | Abschnitt | Zweck |
|---|-----------|-------|
| – | **Artikelkopf** | Kicker, Titel, Autor, Testkennzahlen, Vertrauens-Hinweis, Begriffs-Glossar |
| 01 | **Schnellwahl** | Zwei Angaben (Gruppengrösse, Nutzungshäufigkeit) → ein konkreter Vorschlag |
| 02 | **Bestenliste** | Alle Produkte als Boxen, filterbar nach Eigenschaften |
| 03 | **Einzeltests** | Pro Produkt: Fliesstext, Einzelwertungen, volle Spezifikationen, Kaufbox |
| 04 | **Ausstattung & Gadgets** | Matrix: Punkt = an Bord, Ring = Aufpreis, Strich = nicht vorgesehen |
| 05 | **So testen wir** | Testkriterien mit Gewichtung |
| 06 | **Sicher unterwegs** | Kategoriespezifische Sicherheitshinweise |
| 07 | **Datenvergleich** | Grosse Tabelle, Kopfzeile und Merkmalsspalte bleiben stehen |
| 08 | **Fazit** | Zusammenfassung, Redaktions-Zitat, kompakte Rangliste |
| 09 | **Häufige Fragen** | Aufklappbar, inkl. `FAQPage`-Markup |

Links begleitet eine **Sticky-Rail** mit Abschnittsnavigation, aktiver Markierung
und Lesefortschritt. Unter 1080 px Breite entfällt sie; die Seite bleibt einspaltig.

## Dateien

```
verglichmi/
├── index.html                 Seitenhülle: Meta-Tags, Schriften, Einbindung
├── data/
│   ├── flussboote.js          → aktive Demo: alle Inhalte stehen hier
│   └── haartrockner.js        zweiter Datensatz (ältere Demo)
├── assets/
│   ├── css/template.css       Designsystem (Light/Dark), alle Bausteine
│   └── js/template.js         Renderer: baut die Seite aus der Datendatei
└── README.md
```

## Neuen Vergleich anlegen

```bash
cp verglichmi/data/flussboote.js verglichmi/data/kaffeemaschinen.js
```

Werte ersetzen, dann in `index.html` die eine Zeile umbiegen:

```html
<script src="data/kaffeemaschinen.js"></script>
```

Kategoriespezifisch sind sechs Felder:

| Feld          | Bedeutung                                                       |
|---------------|------------------------------------------------------------------|
| `meta`        | Titel, Kicker, Lead, Autor, Testkennzahlen, optionales Glossar    |
| `criteria`    | Testkriterien + Gewichtung (Summe muss 100 ergeben)               |
| `specFields`  | Zeilen der Datentabelle, gruppiert über `group`                   |
| `quickSpecs`  | welche `specFields` als Messwert-Streifen in der Produktbox stehen |
| `gadgets`     | Zeilen der Ausstattungsmatrix                                     |
| `filters`     | Filter-Chips über der Bestenliste, greifen auf `product.tags` zu  |

### Optionale Blöcke

Fehlt einer dieser Blöcke, entfällt der Abschnitt ersatzlos – Rail-Navigation
und Nummerierung passen sich automatisch an:

`meta.glossary` · `quickPicker` · `filters` · `gadgets` · `safety`

Deshalb rendert auch `data/haartrockner.js` weiterhin, obwohl dieser Datensatz
weder Gadget-Matrix noch Schnellwahl kennt.

## Datenschema (Auszug)

```js
products: [{
  id:      'grabner-riverstar',      // eindeutig, wird zu Anker #test-grabner-riverstar
  brand:   'Grabner',
  model:   'Riverstar',
  badge:   'Testsieger',             // oder null
  grade:   1.2,                      // Note 1–6, bestimmt Farbe + Wort automatisch
  accent:  '#0E5A6E',                // Farbe der Platzhalter-Illustration
  claim:   'Kurzsatz in der Kopfzeile der Box',
  price:   { current: 2690, uvp: 2890 },  // Ersparnis wird berechnet
  tags:    ['selbstlenzer','ab4'],   // steuert die Filter-Chips
  pros:    ['…'], cons: ['…'],       // erscheinen als + und –
  specs:   { gewicht: '32,0 kg', … },// Schlüssel = specFields[].key
  scores:  { fahrverhalten: 96, … }, // 0–100, Schlüssel = criteria[].key
  gadgets: { kuehlbox: true, sonnendach: 'option', angel: false, becherhalter: '4×' },
  offers:  { galaxus: { sku: '41220988', price: 2690 }, … },
  review:  { kicker, headline, verdict, bestFor, paragraphs: ['…'], imageCaption },
}]
```

Produkte werden **in Array-Reihenfolge** ausgegeben – also nach Testnote sortiert
einpflegen. Platznummer, Notenfarbe, Ersparnis in Prozent und die Markierung
„Bester Preis" berechnet der Renderer selbst.

**Gadget-Werte:** `true` → voller Punkt · `'option'` → Ring · `false` → Strich ·
jeder andere String (z. B. `'4×'`) wird direkt als Text gesetzt.

**Bilder:** Ohne `image`-Feld zeichnet der Renderer eine Platzhalter-Illustration
in `accent`-Farbe. Sobald echte Fotos vorliegen: `image: 'assets/img/xy.jpg'`.

## Affiliate-Links

Alle Shop-Links sind **Staging** – in der Datendatei:

```js
affiliate: {
  staging: true,     // true  = Klick öffnet keinen Shop, sondern zeigt die Ziel-URL
                     // false = echte Deeplinks werden aufgerufen
  shops: {
    galaxus: { label:'Galaxus',  pattern:'https://www.galaxus.ch/de/s7/product/{sku}?utm_source={tag}', tag:'verglichmi' },
    brack:   { label:'Brack.ch', pattern:'https://www.brack.ch/{sku}?utm_source={tag}',                 tag:'verglichmi' },
    amazon:  { label:'Amazon',   pattern:'https://www.amazon.de/dp/{sku}/?tag={tag}',                   tag:'verglichmi-21' },
  },
  shopOrder: ['galaxus','brack','amazon'],   // Reihenfolge der Buttons
}
```

SKUs und Partner-Tags sind Platzhalter und müssen vor dem Livegang durch die
echten Werte aus den Partnerprogrammen ersetzt werden.

**Für den Livegang:** `staging: false` setzen · echte Partner-Tags eintragen ·
`<meta name="robots" content="noindex, nofollow">` aus `index.html` entfernen.

Alle Links tragen `rel="sponsored nofollow noopener"`.

**Klick-Tracking:** Vor dem Öffnen ruft der Renderer `window.vgTrackOffer(payload)`
auf, falls definiert:

```js
window.vgTrackOffer = ({ shop, product, url }) => { /* … */ };
```

## Design

Farben, Abstände, Radien und Schriften liegen als CSS-Custom-Properties in
`:root` (`assets/css/template.css`, Abschnitt 1).

**Farbe** – Flusspetrol als Marke, Bernstein ausschliesslich für Auszeichnungen
(Testsieger-Badge, Fazit-Kasten im Einzeltest). Die Neutraltöne haben einen
leichten Petrolstich, damit sie zur Marke gehören statt daneben zu stehen.

```css
--brand:  #0E5A6E;   /* Marke */
--accent: #E7913C;   /* nur Auszeichnungen */
```

Die Notenskala `--grade-1` … `--grade-5` läuft von Teal über Oliv und Bernstein
nach Terrakotta und wird anhand von `grade` automatisch zugewiesen.

**Schriften** – drei Rollen, über Google Fonts geladen:

| Token       | Schrift              | Einsatz                                    |
|-------------|----------------------|--------------------------------------------|
| `--display` | Bricolage Grotesque  | Titel, Testnoten, Preise, Kennzahlen        |
| `--sans`    | IBM Plex Sans        | Fliesstext und Bedienelemente               |
| `--mono`    | IBM Plex Mono        | ausschliesslich **gemessene** Werte         |

Die Mono-Schrift markiert visuell, was aus dem Testlabor stammt – Aufbauzeit,
Kippwinkel, Druckverlust. Herstellerangaben laufen in der Textschrift.

Dark Mode folgt dem Systemschema und lässt sich über den Schalter in der
Kopfzeile umstellen (gespeichert in `localStorage`, mit try/catch für den
Privatmodus). Shop-Buttons behalten in beiden Modi ihre Markenfarben.

## Geprüft

* Rendering in Chromium bei 320, 390, 768, 1024 und 1440 px
* **Kein seitliches Scrollen** – gemessen über `window.scrollX` an jedem
  Abschnitt, nicht über `scrollWidth` (siehe Hinweis unten)
* Light und Dark Mode
* Schnellwahl, Filter, Rail-Markierung und Staging-Klick funktionsgeprüft
* Keine JS-Fehler, keine doppelten IDs, alle Sprungmarken auflösbar
* 81 Affiliate-Links, alle mit `rel="sponsored nofollow noopener"` und `aria-label`
* `ItemList`- und `FAQPage`-JSON-LD werden erzeugt

> **Hinweis zu breiten Tabellen:** `.tablewrap` trägt `contain: paint`. Ohne das
> rechnet Chromium die volle Tabellenbreite in die Scrollbreite des Dokuments
> ein, und die ganze Seite lässt sich seitwärts ziehen, sobald man weit genug
> nach unten gescrollt hat. `document.documentElement.scrollWidth` meldet den
> Fehler nicht zuverlässig – prüfen Sie mit `window.scrollX` nach einem
> `scrollTo(9999, y)`.

## Offen für die Produktivversion

* **Serverseitiges Rendering** – aktuell baut JavaScript die Seite im Browser
  auf. Für SEO sollte das HTML vorgerendert ausgeliefert werden; die
  Datenstruktur ist dafür vorbereitet.
* **Preise** – derzeit fest in der Datendatei. Live sollte ein Preis-Feed die
  Werte und den Zeitstempel „Bestpreis am …" füllen.
* **Produktbilder** – Platzhalter-Illustrationen durch Fotos ersetzen.
* **Rechtliches** – Impressum, Datenschutz und Affiliate-Hinweis verlinken.
