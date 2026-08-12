# Landing Page – ADITI LIGHTS · Performance Max

Eigenständige Landing Page für die Google-Performance-Max-Kampagne von
[aditi-lights.ch](https://www.aditi-lights.ch).

Eine einzige Datei, `index.html`: HTML, CSS, JavaScript und Grafiken sind
eingebettet. **Keine externen Requests** – keine Web Fonts, keine Bilder-CDN,
keine Frameworks. Das ist Absicht: Performance Max bewertet die Landing-Page-
Erfahrung mit, und jede externe Abhängigkeit kostet Ladezeit und Anzeigenrang.

Deployment: Datei auf den Webspace legen (z. B. als `/pmax/index.html`), fertig.
Kein Build, kein Node, keine Abhängigkeiten.

---

## 1 · Vor dem Livegang zwingend ersetzen

Alle betroffenen Stellen sind im Quelltext mit `[ANPASSEN]` markiert
(`grep -n "ANPASSEN" index.html`).

| # | Stelle | Aktuell im Code | Zu tun |
|---|--------|-----------------|--------|
| 1 | Shop-Links (11×) | `https://www.aditi-lights.ch/shop` | Echte Kategorie-/Shop-URL |
| 2 | Produkte | Jaipur, Udaipur, Goa, Kerala, Varanasi, Rajasthan | Echte Namen, Masse, Preise, Deep-Links |
| 3 | Preise | `CHF 149.–` usw. | Echte Preise – müssen mit dem Shop übereinstimmen |
| 4 | Produktbilder | SVG-Platzhalter | Echte Fotos (siehe Abschnitt 3) |
| 5 | Bewertungen | 3 leere Platzhalter | Nur echte, freigegebene Zitate – oder Sektion löschen |
| 6 | Versand | «ab CHF 100.– gratis», «2–4 Werktage» | Gegen die eigenen Bedingungen prüfen |
| 7 | Rückgabe | «14 Tage» | Frist aus den AGB übernehmen |
| 8 | Leuchtmittel | «E14/E27, 2200–2700 K» | Technisch prüfen |
| 9 | Schweizer Norm | FAQ-Eintrag zur Zulassung | Nur behalten, wenn belegbar |
| 10 | Telefon | `+41 00 000 00 00` | Echte Nummer oder Zeile entfernen |
| 11 | E-Mail | `info@aditi-lights.ch` | Bestätigen |
| 12 | Rechtliche Links | `/impressum`, `/agb`, `/datenschutz`, `/versand` | Müssen erreichbar sein – Google prüft das |
| 13 | `og:image` | `/assets/og-image.jpg` | Bild 1200×630 px hinterlegen |
| 14 | `canonical` | `/pmax` | Auf die tatsächliche URL setzen |
| 15 | Google Tag | auskommentiert | IDs einsetzen, einkommentieren (Abschnitt 4) |
| 16 | `EXTRA_HOSTS` | leeres Array | Nur nötig, wenn der Shop auf einer fremden Domain liegt |

> **Wichtig:** Preise, Versandkosten und Lieferfristen müssen mit dem Shop
> übereinstimmen. Abweichungen sind ein häufiger Ablehnungsgrund bei Google Ads
> und in der Schweiz zusätzlich ein UWG-Thema. Erfundene Bewertungen sind
> unzulässig – deshalb stehen dort bewusst leere Platzhalter.

---

## 2 · Aufbau der Seite

| Abschnitt | Zweck |
|-----------|-------|
| Header | Marke + permanenter Shop-Button |
| Hero | Nutzenversprechen, 3 USPs, Haupt-CTA. Auf Mobile steht das Produktbild zuoberst |
| Trust-Bar | Handarbeit · Unikate · Versand · Schweizer Firma |
| Kollektion | 6 Produkte, jedes verlinkt in den Shop |
| Handwerk | Story in 3 Schritten – begründet den Preis |
| Kundenstimmen | Social Proof (Platzhalter) |
| FAQ | Nimmt Kaufhürden weg, liefert zugleich FAQ-Rich-Snippets |
| Abschluss-CTA | Letzte Conversion-Chance |
| Footer | Adresse, Kontakt, Rechtliches |
| Sticky-CTA | Auf Mobile ab Ende des Heros dauerhaft sichtbar |

Technisch enthalten: Meta-/Open-Graph-Tags, JSON-LD (`Organization` +
`FAQPage`), `prefers-reduced-motion`, sichtbare Fokus-Ringe, semantisches
Markup, responsive ab 320 px.

---

## 3 · Bilder einsetzen

Die Lampen sind aktuell Inline-SVG-Platzhalter. Echte Fotos konvertieren
deutlich besser. Pro Produktkarte das `<svg>` ersetzen durch:

```html
<img src="bilder/jaipur.webp" width="800" height="1000" loading="lazy"
     alt="Mosaik-Tischlampe Jaipur, warm leuchtendes Glasmosaik">
```

Für das Hero-Bild `loading="lazy"` **weglassen** und stattdessen
`fetchpriority="high"` setzen – es ist das LCP-Element.

Empfehlungen:

- Format WebP, Hero ≈ 1200×1500 px, Produktkarten ≈ 800×1000 px
- Lampen leuchtend und in dunkler Umgebung fotografieren – dafür ist das
  Farbschema der Seite gebaut
- Ein Wohnraum-Bild schlägt ein freigestelltes Produktfoto; ideal ist beides
- `width`/`height` immer angeben, sonst springt das Layout (CLS)

---

## 4 · Conversion-Tracking

Im Quelltext liegt am Seitenende ein auskommentierter Google-Tag-Block.
`AW-XXXXXXXXX` (Google-Ads-Conversion-ID) und `G-XXXXXXXXXX` (GA4) eintragen
und den Block einkommentieren.

Bereits aktiv, sobald der Tag geladen wird:

- **Klick-Tracking:** Jeder CTA trägt ein `data-cta`-Attribut
  (`hero-primary`, `produkt-jaipur`, `sticky` …). Bei Klick geht ein
  `select_content`-Event an gtag und ein `lp_cta_click`-Event in den
  `dataLayer` – damit ist im GTM ohne weitere Konfiguration auswertbar,
  welcher Abschnitt trägt.
- **Attribution-Weitergabe:** `gclid`, `gbraid`, `wbraid`, `gad_source` und
  alle `utm_*`-Parameter werden automatisch an jeden internen Link angehängt.
  Ohne das reisst die Attribution beim Sprung in den Shop ab.

**Die Kauf-Conversion selbst gehört in den Shop** (Danke-Seite bzw.
`purchase`-Event), nicht auf diese Seite. Die Landing Page misst nur den
Übergang. Wer sie als eigenständige Conversion zählt, optimiert die Kampagne
auf Klicks statt auf Umsatz.

---

## 5 · Einsatz in Performance Max

- **Final URL:** die veröffentlichte Adresse dieser Seite, z. B.
  `https://www.aditi-lights.ch/pmax`
- **URL-Erweiterung:** Für diese Kampagne besser deaktivieren, sonst schickt
  Google Nutzer auf beliebige Unterseiten und diese Landing Page wird umgangen.
- **Asset-Gruppe:** Headlines und Descriptions am besten direkt aus den
  Textbausteinen dieser Seite ableiten – konsistente Botschaft zwischen Anzeige
  und Landing Page verbessert die Anzeigenrelevanz.
- **Zielgruppensignale:** «Wohnen & Einrichten», «Kunsthandwerk», «Geschenke»
  sowie Website-Besucher als Signal, nicht als harte Eingrenzung.
- **Merchant Center:** Bei aktivem Produktfeed werden Shopping-Anzeigen
  ausgespielt und diese Seite seltener genutzt. Dann entweder ohne Feed fahren
  oder die Seite gezielt als Final URL der Asset-Gruppe setzen.
- **Vor dem Start prüfen:** Seite auf dem Handy über Mobilfunk laden, alle
  CTAs durchklicken, rechtliche Links testen, Preise gegen den Shop abgleichen.

---

## 6 · Lokal ansehen

```bash
# einfach im Browser öffnen
open landingpages/aditi-lights-pmax/index.html

# oder über einen lokalen Server
python3 -m http.server 8000 --directory landingpages/aditi-lights-pmax
```
