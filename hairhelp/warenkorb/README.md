# HairHelp – Warenkorb

Neugestaltung von `esidekew.myhostpoint.ch/wk/` im Stil der Produkt- und
Haarverdichter-Seite, mit Gewicht auf den üblichen Warenkorb-Konventionen
und auf sichtbaren Sicherheitssignalen.

## Dateien

| Datei | Zweck |
| --- | --- |
| `warenkorb.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Logo, Zahlarten-Leiste, Produktbilder, Siegel, Jost-Webfont – aus dem Produktseiten-Bündel übernommen. |
| `build.py` | Erzeugt `ausgabe/warenkorb.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was der bestehende Warenkorb nicht leistet

Aufgenommen aus dem Abzug vom 18. August:

* **Keine Seitenüberschrift, kein Schritt.** Die Seite beginnt mit den
  Rabattstufen. Wer hier landet, sieht nicht, wo im Bestellvorgang er steht
  und ob schon etwas verbindlich ist.
* **Die Rabattstufen schweben oben links** ohne Rahmen und ohne Beschriftung.
* **Kein einziges Sicherheitssignal.** Keine Aussage zur Verschlüsselung,
  keine Rückgabefrist, kein Hinweis auf die Schweizer Herkunft, keine
  Kontaktmöglichkeit. Die Zahlungslogos stehen unbeschriftet unter dem Kasten.
* **Kein „Weiter einkaufen“**, kein Hinweis, dass Änderungen übernommen werden.
* **Die Schaltfläche zur Kasse** ist mattes Oliv statt der Markenfarbe und
  trägt kein Schloss-Symbol.
* **Artikel entfernen** ist ein blosses `×` ohne Beschriftung.

## Was die neue Fassung tut

**Schrittanzeige.** `Warenkorb → Adresse & Versand → Zahlung` mit „Schritt 1
von 3“. Die häufigste Sorge im Warenkorb ist, versehentlich verbindlich zu
bestellen; die Anzeige beantwortet das, bevor sie entsteht.

**Positionen als Karten.** Bild in fester Fassung, Name, Variante, Grundpreis,
Verfügbarkeit, Mengenwähler, Zeilensumme und ein beschriftetes „Entfernen“.

**Zusammenfassung mit Hierarchie.** Zwischensumme, Rabatt, Versand, dann die
Gesamtsumme deutlich abgesetzt, mit `inkl. MwSt.` darunter.

**Sicherheitssignale an drei Stellen:**

1. Am Knopf – Schloss-Symbol, direkt darunter „SSL-verschlüsselte
   Übertragung · Sicher bezahlen mit“ und die Zahlungslogos.
2. Darunter drei Zusicherungen: 30 Tage Rückgaberecht, Versand in 24 Stunden,
   und ausdrücklich „Zahlung erst im nächsten Schritt – hier entstehen noch
   keine Kosten“.
3. Eine Karte mit Telefon, E-Mail und Garantiesiegel. Erreichbare Menschen
   sind das stärkste Vertrauenssignal, das ein Shop zeigen kann.

Am Seitenende ein Band „Sicher einkaufen bei HairHelp“ mit vier Punkten:
verschlüsselte Zahlung, Schweizer Unternehmen, 30 Tage Rückgabe,
persönlicher Kontakt.

**Rabattstufen gerahmt und beschriftet**, mit Fortschrittsbalken und dem
Hinweis auf die nächste Stufe.

**Leerer Zustand** ist gestaltet statt undefiniert.

## Rechenregeln im Prototyp

Nach den Regeln des Shops, live umgesetzt:

* ab 2 Dosen: 5 % Rabatt und Gratis Versand
* ab 3 Dosen: zusätzlich 1 Dose oder der Präzisions-Applikator gratis
* darunter: Versandkosten CHF 6.90

Der Rabatt wird auf Rappen gerundet, **bevor** die Gesamtsumme gebildet wird –
sonst weichen die angezeigten Zeilen um einen Rappen von der Summe ab.

## Annahmen und offene Punkte

* **Versandkosten CHF 6.90** unterhalb der Schwelle sind angenommen; im Abzug
  war der Versand gratis, der reguläre Satz also nicht ablesbar. In `build`
  bzw. im Skript über `BASE_SHIPPING` anpassen.
* **Zweite Position** (Präzisions-Applikator, CHF 29.90) ist ergänzt, damit
  die Darstellung mehrerer Positionen sichtbar wird. Der Preis ist aus dem
  Starter-Set abgeleitet: CHF 58.80 regulär minus CHF 28.90 für die Dose.
* **Das Applikator-Bild** ist aus dem Starter-Set-Foto zugeschnitten. Für den
  Einbau bitte durch das echte Produktbild aus der Mediathek ersetzen.
* **Die Lieferadresse** aus dem Abzug ist bewusst nicht übernommen; an ihrer
  Stelle steht ein allgemeiner Hinweis auf die Schweiz und Liechtenstein.
* Die Umsetzung für Elementor (CSS-Layer auf das Widget
  `woocommerce-cart` plus ein HTML-Widget für das Sicherheitsband) ist noch
  nicht gebaut. Die Selektoren dafür stehen unten.

## Selektoren für den späteren CSS-Layer

Der Warenkorb ist ein einzelnes Elementor-Pro-Widget
`woocommerce-cart` im Layout `e-cart-layout-two-column`:

```
.e-cart__container
  .e-cart__column-start
    form.woocommerce-cart-form
      .hhch-vd-wrap.hhch-vd-on-cart      Rabattstufen
      .e-shop-table.e-cart-section--no-coupon
        table.woocommerce-cart-form__contents
          td.product-remove / .product-thumbnail / .product-name
             .product-price / .product-quantity / .product-subtotal
      .hhch-vd-update-stash button.hhch-vd-relocated
  .e-cart__column-end
    .e-cart__column-inner.e-sticky-right-column
      .e-cart-totals .cart_totals
        tr.cart-subtotal / tr.woocommerce-shipping-totals / tr.fee / tr.order-total
        .wc-proceed-to-checkout a.checkout-button
```

Der Gutscheinbereich ist im Widget abgeschaltet
(`e-cart-section--no-coupon`).
