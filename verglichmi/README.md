# Verglichmi – Vergleichs- & Test-Template

Erste Version des allgemeinen Seitentemplates für Produktvergleiche auf **Verglichmi**.
Demo-Inhalt ist ein Vergleich von **8 Haartrocknern**.

Aufbau der Seite entspricht dem redaktionellen Ablauf:

1. **Artikelkopf** – Kicker, Titel, Autor, Testkennzahlen, Affiliate-Hinweis, Inhaltsverzeichnis
2. **Bestenliste** – alle Produkte als Boxen mit Testnote, Kurz-Messwerten, **+ / –** und drei Shop-Buttons
3. **Einzeltests** – pro Produkt ein ausführlicher Test: Fliesstext, Einzelwertungen als Balken, vollständige Spezifikationen, Empfehlung, Wiederholungs-Box mit Kaufbuttons
4. **So testen wir** – Testkriterien mit Gewichtung
5. **Direktvergleich** – grosse Tabelle mit allen Messwerten (horizontal scrollbar, fixierte erste Spalte)
6. **Fazit** – Zusammenfassung, Redaktions-Zitat, kompakte Rangliste
7. **FAQ** – aufklappbare Fragen (inkl. `FAQPage`-Markup für Google)

## Öffnen

```
verglichmi/index.html im Browser öffnen – kein Build, kein Server nötig.
```

## Dateien

```
verglichmi/
├── index.html                  Seitenhülle: Meta-Tags, Font, Einbindung
├── data/
│   └── haartrockner.js         → HIER stehen alle Inhalte
├── assets/
│   ├── css/template.css        Designsystem (Light/Dark), alle Bausteine
│   └── js/template.js          Renderer: baut die Seite aus der Datendatei
└── README.md
```

Der Renderer und das Stylesheet sind **kategorieunabhängig**. Ein neuer Vergleich
braucht nur eine neue Datendatei.

## Neuen Vergleich anlegen

```bash
cp verglichmi/data/haartrockner.js verglichmi/data/kaffeemaschinen.js
```

Werte in der Kopie ersetzen, danach in `index.html` die eine Zeile umbiegen:

```html
<script src="data/kaffeemaschinen.js"></script>
```

Kategoriespezifisch sind nur vier Felder:

| Feld          | Bedeutung                                                                 |
|---------------|---------------------------------------------------------------------------|
| `meta`        | Titel, Kicker, Lead, Autor, Testkennzahlen                                 |
| `criteria`    | Testkriterien + Gewichtung (Summe muss 100 ergeben)                        |
| `specFields`  | Zeilen der Vergleichstabelle, gruppiert über `group`                       |
| `quickSpecs`  | welche `specFields` als Chips direkt in der Produktbox erscheinen          |

## Datenschema (Auszug)

```js
products: [{
  id:      'dyson-nural',            // eindeutig, wird zu Anker #test-dyson-nural
  brand:   'Dyson',
  model:   'Supersonic Nural HD16',
  badge:   'Testsieger',             // oder null
  grade:   1.1,                      // Note 1–6, bestimmt Farbe + Label automatisch
  accent:  '#c94f7c',                // Farbe der Platzhalter-Illustration
  claim:   'Kurzsatz in der Kopfzeile der Box',
  price:   { current: 519, uvp: 549 },// Ersparnis wird berechnet
  pros:    ['…'],                    // erscheint als „+"
  cons:    ['…'],                    // erscheint als „–"
  specs:   { leistung: '1600 W', … },// Schlüssel = specFields[].key
  scores:  { trocknung: 97, … },     // 0–100, Schlüssel = criteria[].key
  offers:  {                         // je Shop SKU + Preis
    amazon:  { sku: 'B0CTHM5QW3', price: 519 },
    galaxus: { sku: '48219733',   price: 529 },
    brack:   { sku: 'dyson-…',    price: 535 },
  },
  review: {                          // der ausführliche Einzeltest
    kicker, headline, verdict, bestFor,
    paragraphs: ['…'],               // <strong> und <em> sind hier erlaubt
    imageCaption: '…',
  },
}]
```

Produkte werden **in der Reihenfolge des Arrays** ausgegeben – also nach Testnote sortiert
einpflegen. Platznummer, Notenfarbe (`sehr gut` … `mangelhaft`), Ersparnis in Prozent und
die Markierung „Bester Preis" berechnet der Renderer selbst.

**Bilder:** Ohne `image`-Feld zeichnet der Renderer eine Platzhalter-Illustration in
`accent`-Farbe. Sobald echte Fotos vorliegen:

```js
image: 'assets/img/dyson-nural.jpg',
```

## Affiliate-Links

Alle Shop-Links sind aktuell **Staging** – `data/…js`:

```js
affiliate: {
  staging: true,     // true  = Klick öffnet keinen Shop, sondern zeigt die Ziel-URL
                     // false = echte Deeplinks werden aufgerufen
  shops: {
    amazon:  { label:'Amazon',   pattern:'https://www.amazon.de/dp/{sku}/?tag={tag}',           tag:'verglichmi-21' },
    galaxus: { label:'Galaxus',  pattern:'https://www.galaxus.ch/de/s1/product/{sku}?utm_source={tag}', tag:'verglichmi' },
    brack:   { label:'Brack.ch', pattern:'https://www.brack.ch/{sku}?utm_source={tag}',         tag:'verglichmi' },
  },
  shopOrder: ['amazon','galaxus','brack'],   // Reihenfolge der Buttons
}
```

Die SKUs und Partner-Tags sind Platzhalter und müssen vor dem Livegang durch die echten
Werte aus den jeweiligen Partnerprogrammen ersetzt werden.

Für den Livegang:

1. `staging: false` setzen
2. echte Partner-Tags eintragen
3. `<meta name="robots" content="noindex, nofollow">` in `index.html` entfernen

Alle Links tragen `rel="sponsored nofollow noopener"` und `target="_blank"`.

**Klick-Tracking:** Vor dem Öffnen ruft der Renderer `window.vgTrackOffer(payload)` auf,
falls definiert – Anbindungspunkt für Analytics:

```js
window.vgTrackOffer = ({ shop, product, url }) => { /* … */ };
```

## Design

Alle Farben, Abstände und Radien liegen als CSS-Custom-Properties in `:root`
(`assets/css/template.css`, Abschnitt 1). Markenfarbe ändern:

```css
--vg-brand: #d81f26;
```

Dark Mode folgt dem Systemschema und lässt sich über den Schalter in der Kopfzeile
umstellen (gespeichert in `localStorage`). Shop-Buttons behalten in beiden Modi ihre
Markenfarben.

## Geprüft

* Rendering in Chromium (1280 px und 390 px), kein horizontales Überlaufen
* Light und Dark Mode
* Tastaturbedienbar, sichtbarer Fokus, Sprungmarke zur Bestenliste
* `ItemList`- und `FAQPage`-JSON-LD werden erzeugt
* Druckansicht ohne Navigation und Kaufbuttons

## Offen für die Produktivversion

* **Serverseitiges Rendering** – aktuell baut JavaScript die Seite im Browser auf. Für SEO
  sollte das HTML vorgerendert ausgeliefert werden; die Datenstruktur ist dafür bereits
  vorbereitet.
* **Preise** – derzeit fest in der Datendatei. Live sollte ein Preis-Feed die Werte und
  den Zeitstempel „Günstigster Preis am …" füllen.
* **Produktbilder** – Platzhalter-Illustrationen ersetzen (`image`-Feld).
* **Rechtliches** – Impressum, Datenschutz und Affiliate-Hinweis im Footer verlinken.
