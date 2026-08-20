# HairHelp Vermittler-Dashboard

Ein WordPress-Plugin für **www.hairhelp-haarverdichter.ch**, mit dem ein Vermittler
seine vermittelten Verkäufe einsehen kann – **ohne WordPress-Zugang**.

Gezählt werden zwei Arten von Verkäufen:

1. Verkäufe, die über den **QR-Code** hereinkommen (30-Tage-Cookie)
2. Verkäufe, bei denen der **Gutscheincode `loopx13`** verwendet wurde

Kommt beides zusammen, wird die Bestellung als Doppelquelle gekennzeichnet und
trotzdem nur **einmal** gezählt.

---

## 1. Wie der Zugang ohne WordPress funktioniert

Jeder Vermittler bekommt einen geheimen Link:

```
https://www.hairhelp-haarverdichter.ch/vermittler/?hhp_token=<48-stelliges-Token>
```

Wer diesen Link öffnet, sieht **ausschliesslich** seine eigenen vermittelten
Verkäufe. Kein Benutzerkonto, kein Passwort, kein Backend-Zugriff.

Was der Vermittler **nicht** sieht: andere Bestellungen, Kundenadressen,
E-Mail-Adressen, Telefonnummern, Umsätze des Shops insgesamt, Einstellungen.

Das Token ist 48 Hexadezimalzeichen lang (192 Bit Zufall) und wird
zeitkonstant verglichen. Zusätzlich sind pro IP-Adresse maximal 10 Fehlversuche
pro Minute erlaubt. Ein Token lässt sich jederzeit im Backend neu erzeugen –
der alte Link wird damit sofort ungültig.

---

## 2. Installation

1. Den Ordner `hairhelp-partner-dashboard` nach `wp-content/plugins/` hochladen
2. Im Backend unter **Plugins** aktivieren
3. Unter **Einstellungen → Permalinks** einmal auf *Speichern* klicken
   (damit die kurze Adresse `/qr/loopx13` greift)

Voraussetzungen: WordPress 6.0+, WooCommerce 7.0+, PHP 7.4+.
Die Bestelltabellen-Speicherung (HPOS) wird unterstützt, ebenso der
Block-Checkout.

---

## 3. Einrichtung in fünf Schritten

### Schritt 1: Gutschein `loopx13` anlegen

In WooCommerce unter **Marketing → Gutscheine** den Code `loopx13` anlegen
(z. B. 10 % Rabatt). Ohne diesen Gutschein funktioniert nur der QR-Weg.

### Schritt 2: Dashboard-Seite erstellen

Eine neue Seite anlegen, z. B. mit dem Titel *Vermittler*, und ausschliesslich
diesen Shortcode einfügen:

```
[hhp_partner_dashboard]
```

Die Seite wird automatisch auf `noindex` gesetzt und erscheint damit nicht bei
Google. Sie sollte **nicht** ins Menü aufgenommen werden.

### Schritt 3: Vermittler prüfen

Unter **WooCommerce → Vermittler-Dashboard → Vermittler** ist *Loop X* mit dem
Code `loopx13` bereits vorangelegt. Dort werden Provisionssatz und
Berechnungsgrundlage eingestellt. Der fertige Zugangslink steht direkt daneben
und lässt sich mit einem Klick kopieren.

### Schritt 4: QR-Code verteilen

Unter **WooCommerce → Vermittler-Dashboard → QR-Codes** stehen drei Downloads
bereit: SVG (Druck), PNG (Bildschirm) und eine fertige Druckvorlage.
Fertig erzeugte Dateien liegen ausserdem im Ordner `qr/` (siehe Abschnitt 6).

### Schritt 5: Bestehende Bestellungen nachtragen

Unter **Werkzeuge → Abgleich starten** werden vorhandene Bestellungen auf den
Gutscheincode geprüft und nachträglich zugeordnet. Der Vorgang läuft
seitenweise und kann jederzeit wiederholt werden.

---

## 4. Der QR-Code und das Cookie

### Die Adresse hinter dem QR-Code

```
https://www.hairhelp-haarverdichter.ch/qr/loopx13
```

Diese kurze Form ergibt einen kleineren, besser scannbaren Code. Der Aufruf
setzt das Cookie und leitet sofort auf die Zielseite weiter (einstellbar,
standardmässig die Startseite). Der Besucher merkt davon nichts.

Alternative ohne Permalink-Regel, falls gewünscht:

```
https://www.hairhelp-haarverdichter.ch/?qr=loopx13
```

### Was beim Scan passiert

| Schritt | Vorgang |
|---|---|
| 1 | Besucher scannt den QR-Code |
| 2 | WordPress liest den Code `loopx13` aus der Adresse |
| 3 | Cookie `hhp_ref=loopx13` wird für **30 Tage** gesetzt |
| 4 | Weiterleitung auf die Zielseite |
| 5 | Kauf innerhalb der 30 Tage → Code wird in die Bestellung geschrieben |
| 6 | Bestellung erscheint im Dashboard des Vermittlers |

### Der Cookie im Detail

| Eigenschaft | Wert | Warum |
|---|---|---|
| Name | `hhp_ref` | zusätzlich `hhp_ref_ts` mit dem Zeitpunkt |
| Wert | `loopx13` | reiner Kampagnenschlüssel, kein Personenbezug |
| Laufzeit | **30 Tage** | wie vereinbart, im Backend änderbar |
| Pfad | `/` | gilt für die gesamte Website |
| Domain | `.hairhelp-haarverdichter.ch` | gilt für `www` **und** die Adresse ohne `www` |
| SameSite | `Lax` | wird auch beim Klick aus fremden Quellen mitgeschickt |
| Secure | ja (bei HTTPS) | wird nur verschlüsselt übertragen |
| HttpOnly | nein | damit Auswertungsskripte den Wert lesen können |

Das Cookie wird **serverseitig** gesetzt. Das ist deutlich zuverlässiger als
eine reine Skriptlösung, weil Skriptblocker und strenge Browsereinstellungen
nicht greifen.

### Zuordnung bei mehreren Besuchen

Standard ist **letzter Kontakt zählt**: Scannt jemand später den QR-Code eines
anderen Vermittlers, überschreibt dieser die Zuordnung. Umstellbar auf
*erster Kontakt zählt*.

---

## 5. Was im Dashboard steht

* **Kennzahlen**: vermittelte Bestellungen, Umsatz, Provision, durchschnittlicher Bestellwert
* **Aufschlüsselung**: wie viele Bestellungen über QR-Code, Gutschein oder beides kamen
* **Verlauf**: Balkendiagramm über den gewählten Zeitraum (ab 62 Tagen monatsweise)
* **Bestellliste**: Datum, Bestellnummer, Herkunft, Status, Umsatz, Provision
* **Zeitraumfilter**: 7/30/90 Tage, dieser Monat, letzter Monat, dieses Jahr, gesamter Zeitraum, eigener Zeitraum
* **CSV-Export** für die Abrechnung (Semikolon-getrennt, öffnet direkt in Excel)

Stornierte und zurückerstattete Bestellungen werden ausgewiesen, zählen aber
nicht zur Provision. Welche Bestellstatus als Umsatz gelten, ist einstellbar
(Standard: *In Bearbeitung* und *Abgeschlossen*).

### Provisionsberechnung

Zwei Grundlagen stehen zur Wahl:

* **Warenwert ohne Versand und Steuer** (Standard) – `Bestellsumme − Versand − Steuer − Rückerstattungen`
* **Bestellsumme gesamt** – `Bestellsumme − Rückerstattungen`

> Hinweis zu Teilrückerstattungen: Der erstattete Betrag wird vollständig von
> der Umsatzbasis abgezogen. Betrifft eine Teilrückerstattung anteilig Versand
> oder Steuer, fällt die Basis dadurch geringfügig zu niedrig aus – zugunsten
> des Shops, nie zulasten.

---

## 6. Fertige QR-Dateien

Im Ordner `qr/` liegen die druckfertigen Dateien für `loopx13`:

| Datei | Zweck |
|---|---|
| `hairhelp-loopx13.svg` | Druck, beliebig skalierbar |
| `hairhelp-loopx13.png` | Bildschirm und Social Media, 900 × 900 px |
| `hairhelp-loopx13-druckvorlage.svg` | fertiges Plakat mit Aufruf und Code |
| `hairhelp-loopx13-parameter.svg/.png` | Variante mit `?qr=loopx13` |

Technische Daten: Version 5, 37 × 37 Module, Fehlerkorrektur **Q** –
bis zu 30 % der Fläche dürfen beschädigt oder überdeckt sein.

### Druckhinweise

| Einsatz | Empfohlene Kantenlänge | Scanabstand |
|---|---|---|
| Visitenkarte, Flyer | 2,5 – 3 cm | bis 30 cm |
| Aufsteller, Broschüre | 4 – 6 cm | bis 60 cm |
| Plakat A3 | 10 – 15 cm | 1 – 2 m |
| Schaufenster | ab 20 cm | ab 2 m |

Faustregel: **Kantenlänge ≈ Scanabstand ÷ 10**.

Die Druckvorlage wurde gerendert und wieder eingelesen: Der Code bleibt bis zu einer Kantenlänge von rund 83 Pixeln maschinenlesbar – deutlich unter jeder realistischen Druckgrösse.

Wichtig für die Druckerei:

* Die weisse Ruhezone rundherum **nicht** wegschneiden (mindestens 4 Module)
* Dunkler Code auf hellem Grund, nie umgekehrt
* Kein Bild hinter dem Code
* SVG verwenden, nicht das PNG hochskalieren

---

## 7. Datenschutz

* Das Cookie enthält **keinen Personenbezug**, nur den Kampagnenschlüssel `loopx13`
* Es werden keine Daten an Dritte übermittelt; die QR-Codes werden lokal auf
  dem eigenen Server erzeugt, ohne Aufruf eines externen Dienstes
* Der Vermittler sieht standardmässig nur **Initialen** statt Kundennamen
  (umstellbar auf gar nichts oder vollständigen Namen)
* Für die Cookie-Einwilligung: Es handelt sich um ein Marketing-Cookie mit
  30 Tagen Laufzeit; es gehört in die Datenschutzerklärung und in das
  Einwilligungsbanner

---

## 8. Funktionsprüfung

1. Ein **privates Browserfenster** öffnen
2. `https://www.hairhelp-haarverdichter.ch/qr/loopx13` aufrufen
3. In den Entwicklerwerkzeugen unter *Anwendung → Cookies* prüfen:
   `hhp_ref` = `loopx13`, Ablauf in 30 Tagen
4. Eine Testbestellung ausführen
5. Den Zugangslink des Vermittlers öffnen – die Bestellung muss erscheinen,
   Herkunft *QR-Code*
6. Gegenprobe: Neues privates Fenster, ohne QR-Aufruf bestellen und dabei
   `loopx13` an der Kasse eingeben – Herkunft *Gutscheincode*

Unter **Werkzeuge** zeigt das Backend ausserdem an, welcher Code im aktuellen
Browser gesetzt ist.

---

## 9. Technische Details

### Bestell-Metadaten

| Schlüssel | Inhalt |
|---|---|
| `_hhp_ref` | Kampagnencode aus dem Cookie |
| `_hhp_ref_time` | Zeitpunkt der Erfassung |
| `_hhp_partner` | zugeordneter Vermittler |
| `_hhp_source` | `qr`, `coupon` oder `qr+coupon` |

`_hhp_partner` dient als Index: Das Dashboard braucht damit **eine** indizierte
Abfrage, statt bei jedem Aufruf alle Bestellungen nach Gutscheinen zu
durchsuchen. Auswertungen werden zusätzlich fünf Minuten zwischengespeichert.

### Filter für eigene Anpassungen

| Filter/Aktion | Zweck |
|---|---|
| `hhp_landing_url` | Zieladresse nach dem Scan ändern |
| `hhp_orders_query_args` | Bestellabfrage anpassen |
| `hhp_cache_ttl` | Dauer des Zwischenspeichers |
| `hhp_template` | eigene Vorlage aus dem Theme laden |
| `hhp_code_captured` | eigene Aktion beim Erfassen eines Codes |

### Erscheinungsbild

Das Dashboard ist auf das Erscheinungsbild von
www.hairhelp-haarverdichter.ch abgestimmt. Die Werte stammen aus dem
Elementor-Kit der Website und dem dort verwendeten eigenen Token
`--hhch-gold`:

| Rolle | Wert | Verwendung im Dashboard |
|---|---|---|
| Markengold | `#A39772` | Diagramm, Provisionswert, Herkunftsmarken, Linienakzente |
| Champagner | `#D1BC92` | Rahmen der Gutschein-Kennzeichnung |
| Anthrazit | `#292929` | Überschriften, Zahlen, Buttons |
| Tiefschwarz | `#1A1A1A` | QR-Module im Druck |
| Grau | `#7A7A7A` | Nebentexte |
| Linien | `#EAEAEA` | Tabellen- und Kachelraster |
| Warmes Off-White | `#FAF9F6` | Tabellenkopf, Provisionskachel |

Übernommen wird ausserdem die Formsprache der Website: durchgehend eckige
Kanten, Haarlinien statt Rahmen, Eingabefelder nur mit Unterstrich, Buttons
weiss mit dunkler Kontur, Beschriftungen in Grossbuchstaben mit weiter
Laufweite.

Die Schriften bezieht das Dashboard über die globalen Elementor-Variablen und
fällt auf die Hausschriften **Jost** (Überschriften) und **Heebo**
(Fliesstext) zurück. Ändert ihr die Schriften im Elementor-Kit, zieht das
Dashboard automatisch mit. Das Logo kommt aus dem WordPress-Customizer.

Die drei Hauptfarben stehen unter **Einstellungen → Erscheinungsbild** und
sind dort jederzeit änderbar; die neutralen Grautöne liegen im Stylesheet.

> Hinweis zum Kontrast: Das Markengold erreicht auf Weiss nur ein
> Kontrastverhältnis von rund 2,6:1. Es wird deshalb für Flächen, Linien und
> grosse Zahlen eingesetzt, nie für Fliesstext – dort steht Anthrazit.

---

## 10. Ordner `snippets/`

Nur für den Fall, dass das Tracking **ohne** dieses Plugin laufen soll:

* `cookie-tracking.js` – reine Skriptvariante, z. B. für den Google Tag Manager
* `functions-snippet.php` – schlanke PHP-Variante für die `functions.php`

Beide setzen dasselbe Cookie für 30 Tage, bieten aber weder Dashboard noch
Provisionsrechnung. Bei aktivem Plugin werden sie **nicht** gebraucht.

---

## 11. Tests

Zwei Prüfungen lassen sich ohne WordPress-Installation direkt ausführen:

```bash
php tests/qr-test.php      # QR-Encoder gegen hinterlegte Referenzwerte
php tests/logic-test.php   # Zuordnung, Token-Prüfung, Zeiträume
```

Der QR-Encoder wurde gegen eine unabhängige Referenzumsetzung abgeglichen:
über die Versionen 1 bis 40 und alle vier Fehlerkorrekturstufen stimmten die
Modulmatrizen bei gleicher Maske Modul für Modul überein. Die erzeugten Bilder
wurden zusätzlich mit dem Decoder ZXing wieder eingelesen – jener Bibliothek,
die auch hinter den meisten Handy-Scannern steckt.
