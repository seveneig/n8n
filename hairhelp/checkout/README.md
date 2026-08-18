# HairHelp – Checkout

Neugestaltung von `esidekew.myhostpoint.ch/checkout/` nach der bewährten
Shopify-Konvention, in den Farben und der Schrift von HairHelp.
Referenz war der beigelegte Shopify-Checkout von Kmax Schweiz.

## Dateien

| Datei | Zweck |
| --- | --- |
| `checkout.html` | Quelle. Bilder und Schrift als `ASSET:name`-Platzhalter. |
| `assets.json` | Logo, Zahlarten, Produktbilder, Siegel, Jost-Webfont. |
| `build.py` | Erzeugt `ausgabe/checkout.html` mit eingebetteten Assets. |

```
python3 build.py
```

## Was der bestehende Checkout anders macht als übliche Checkouts

| | Bestehend | Konvention |
| --- | --- | --- |
| Kopfzeile | volle Navigation samt „Jetzt bestellen“ | nur Logo und Warenkorb |
| Erster Block | „Rechnungsadresse“ | Express-Bezahlung, dann Kontakt |
| E-Mail | ganz unten im Formular | zuerst, als eigener Block |
| Express-Bezahlung | fehlt | TWINT, PayPal, Apple Pay zuoberst |
| Versandart | fehlt als Schritt | eigener Schritt vor der Zahlung |
| Zahlung | eigener Kasten unter der Übersicht | Schritt im Formular |
| Rabattcode | Link „Hier klicken und eingeben“ | Feld in der Übersicht |
| Bestellübersicht | Tabelle ohne Bilder | Positionen mit Bild und Mengen-Abzeichen |
| Felder | Beschriftung darüber, Sternchen | schwebende Beschriftung |
| Fusszeile | volles Seitenmenü | nur Rechtslinks |

## Aufbau der neuen Fassung

Links das Formular, rechts die Übersicht auf ruhigem Grund, klebend.
Unter 1000 px wandert die Übersicht nach oben und klappt auf Wunsch auf –
mit der Gesamtsumme immer sichtbar.

1. **Express-Bezahlung** – TWINT, PayPal, Apple Pay, darunter der Trenner
   „oder mit E-Mail bezahlen“
2. **Kontakt** – E-Mail, „Bereits Kunde? Anmelden“, Newsletter-Häkchen
3. **Lieferung** – Land, Vor- und Nachname, Firma, Strasse, Zusatz,
   PLZ und Ort, Kanton, Telefon, „Informationen speichern“
4. **Versandart** – Kostenloser Versand, als Auswahlzeile
5. **Zahlung** – PostFinance Pay, TWINT, Kredit-/Debitkarte, PayPal.
   Die gewählte Zeile hebt sich ab und klappt ihren Bereich auf; bei der
   Karte erscheinen Nummer, Gültigkeit, Prüfziffer und Name.
6. **Rechnungsadresse** – gleich wie Lieferadresse oder abweichend
7. **Bestellhinweise**, AGB-Häkchen, „Zahlungspflichtig bestellen“
8. Rechtslinks statt Seitenmenü

Die Feldnamen entsprechen den WooCommerce-Namen der bestehenden Seite
(`billing_first_name`, `billing_address_1`, `order_comments`, `terms` …),
damit die Umsetzung später ohne Umbenennen auskommt.

## Sicherheit und Vertrauen

* Schloss-Symbol auf dem Bestellknopf
* „Alle Transaktionen sind sicher und verschlüsselt.“ über der Zahlungswahl
* in der Übersicht: SSL-Hinweis mit dem Zusatz, dass Kartendaten beim
  Zahlungsanbieter liegen; 30 Tage Rückgaberecht; Versand in 24 Stunden
* keine Navigation, die aus dem Vorgang herausführt

## Annahmen und offene Punkte

* **Apple Pay** ist als Express-Schaltfläche vorgesehen. Ob es im Shop
  verfügbar ist, war aus dem Abzug nicht ablesbar – gegebenenfalls
  entfernen oder durch Google Pay ersetzen.
* Die **Kartenfelder** sind Platzhalter. In der Umsetzung liefert der
  Zahlungsanbieter eigene, eingebettete Felder; Kartendaten dürfen den
  Shop nie berühren.
* **Versanddauer „1–3 Werktage“** ist ergänzt; im Abzug stand nur
  „Kostenloser Versand (Gratis)“.
* Die **Lieferadresse** aus dem Abzug ist nicht übernommen; die Felder
  sind leer, damit der Erstzustand sichtbar ist.
* Die Umsetzung für WooCommerce steht noch aus. Sie braucht mehr als
  einen CSS-Layer: Reihenfolge und Gruppierung der Felder ändern sich,
  dafür sind `woocommerce_checkout_fields` und die Vorlagen unter
  `checkout/` anzupassen.
