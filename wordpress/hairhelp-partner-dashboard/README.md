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

Der Vermittler meldet sich mit **Benutzername und Passwort** auf der
Dashboard-Seite an – ohne WordPress-Konto und ohne Backend-Zugriff.

Er sieht **ausschliesslich** seine eigenen vermittelten Verkäufe. Was er
**nicht** sieht: andere Bestellungen, Kundenadressen, E-Mail-Adressen,
Telefonnummern, Umsätze des Shops insgesamt, Einstellungen.

### Drei Zugangsarten zur Wahl

Unter **Einstellungen → Zugang für den Vermittler**:

| Modus | Bedeutung |
|---|---|
| **Anmeldung** (Standard) | Benutzername und Passwort. Der Zugangslink funktioniert nicht. |
| Nur Zugangslink | Geheimer Link ohne Passwort. Bequem, aber ungeschützt, sobald jemand ihn weiterleitet. |
| Beides | Link und Anmeldung parallel zulässig. |

Ein geheimer Link schützt nur so lange, wie er nicht weitergegeben wird –
einmal in einer Nachricht weitergeleitet, sieht ihn jeder Empfänger. Deshalb
ist die Anmeldung der Standard.

### Wie die Anmeldung abgesichert ist

* Passwörter werden mit den WordPress-Funktionen gehasht (`wp_hash_password`),
  im Klartext wird nichts gespeichert
* Mindestlänge 10 Zeichen
* Die Sitzung liegt **serverseitig**; im Browser steht nur eine 64-stellige
  Zufallskennung in einem `HttpOnly`-Cookie, für JavaScript unlesbar
* In der Datenbank steht nur der Hash dieser Kennung – wer Datenbankzugriff
  hat, kann daraus keine gültige Sitzung bauen
* Nach **8 Fehlversuchen** ist die IP-Adresse 15 Minuten gesperrt
* Bei unbekanntem Benutzernamen wird trotzdem ein Hash geprüft, damit die
  Antwortzeit nicht verrät, ob es den Zugang gibt
* Anmeldung gilt 12 Stunden, mit „Angemeldet bleiben“ 30 Tage (beides einstellbar)
* Ein Passwortwechsel beendet alle bestehenden Sitzungen auf allen Geräten
* Wird ein Vermittler auf inaktiv gesetzt, greifen Anmeldung und Link sofort nicht mehr

Der Zugangslink bleibt für den Modus *Nur Link* oder *Beides* verfügbar: 48
Hexadezimalzeichen (192 Bit Zufall), zeitkonstant verglichen, jederzeit im
Backend neu erzeugbar.

---

## 2. Installation

Am einfachsten über das fertige Paket `hairhelp-partner-dashboard.zip`
(liegt eine Ebene höher):

1. Backend → **Plugins → Installieren → Plugin hochladen** → ZIP auswählen
2. **Aktivieren**
3. Unter **Einstellungen → Permalinks** einmal auf *Speichern* klicken
   (damit die kurze Adresse `/qr/loopx13` greift)

Alternativ den Ordner `hairhelp-partner-dashboard` direkt nach
`wp-content/plugins/` hochladen. Das Paket lässt sich nach Änderungen mit
`./build-zip.sh` neu erzeugen.

### Auf eine neuere Fassung aktualisieren

Ist das Plugin bereits installiert, erkennt WordPress das beim Hochladen und
bietet **„Plugin ersetzen und mit Hochgeladenem aktualisieren"** an. Diesen
Weg nehmen – Einstellungen und Vermittler bleiben erhalten.

> **Das Plugin nicht zum Aktualisieren löschen.** Beim Löschen läuft
> `uninstall.php`. Ab Fassung 1.1.0 bleiben die Daten dabei standardmässig
> erhalten; entfernt wird nur, wenn das unter *Einstellungen → Beim Löschen
> des Plugins* ausdrücklich erlaubt ist.

Nach dem Ersetzen ergänzt das Plugin fehlende Felder in bestehenden Daten
selbst: Vermittler ohne Benutzernamen bekommen ihre Kennung als
Benutzernamen, und LoopX13 erhält sein Erscheinungsbild, sofern noch keines
hinterlegt wurde. Eigene Einstellungen werden dabei nie überschrieben.

**Prüfen, ob die neue Fassung wirklich läuft:** Unter *Plugins* muss bei
*HairHelp Vermittler-Dashboard* die Version **1.1.0** stehen. Steht dort
noch 1.0.0, wurde das Paket nicht übernommen.

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

### Schritt 3: Zugangsdaten vergeben

Unter **WooCommerce → Vermittler-Dashboard → Vermittler** ist *Loop X* mit dem
Code `loopx13` und dem Benutzernamen `loopx13` bereits vorangelegt. Dort:

1. **Passwort setzen** – mindestens 10 Zeichen. Das Feld ist beim Speichern
   wieder leer; daneben steht, ob ein Passwort hinterlegt ist. Ein leeres Feld
   lässt das bisherige Passwort unverändert.
2. Provisionssatz und Berechnungsgrundlage einstellen.

Benutzername und Passwort dem Vermittler auf getrennten Wegen zukommen lassen
(z. B. Benutzername per E-Mail, Passwort per Telefon oder SMS). Er kann das
Passwort danach im Dashboard selbst ändern.

Im Modus *Nur Link* oder *Beides* steht daneben zusätzlich der fertige
Zugangslink mit Kopieren-Knopf.

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

### Versandkosten werden immer abgezogen

Ab 35 Franken liefert der Shop gratis – die Kosten fallen aber trotzdem an.
Bei der Grundlage *Warenwert* wird der Versand deshalb bei **jeder** Bestellung
abgezogen, auch bei Gratislieferung. Massgebend ist der höhere der beiden
Werte:

| Fall | Berechneter Versand | Abzug |
|---|---|---|
| Gratislieferung ab 35 CHF | 0.00 | **4.95** |
| Standardversand darunter | 4.95 | 4.95 |
| Teurerer Versand gewählt | 9.90 | **9.90** |

Beispiel: Bestellung über 89.80 CHF mit Gratislieferung, 10 % Provision →
Umsatzbasis 84.85 CHF, Provision **8.49 CHF**.

Betrag und Ein-/Ausschalter stehen unter **Einstellungen → Versandkosten**.
Bei der Grundlage *Bestellsumme gesamt* wird nichts abgezogen.

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

### Gespeicherte Optionen zur Anmeldung

| Option | Inhalt |
|---|---|
| `hhp_partners[].username` | Benutzername, klein geschrieben |
| `hhp_partners[].password_hash` | Passwort-Hash, nie Klartext |
| `hhp_sessions_<vermittler>` | Liste der offenen Sitzungen zum gemeinsamen Beenden |
| Transient `hhp_sess_<hash>` | Die Sitzung selbst, verfällt automatisch |
| Transient `hhp_try_<hash-der-ip>` | Zähler der Fehlversuche |

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

### Eigenes Erscheinungsbild je Vermittler

Ein Vermittler mit eigener Marke bekommt sein Dashboard in **seinem** Design,
ohne dass sich am Shop etwas ändert. Unter **Vermittler → Eigenes
Erscheinungsbild**:

| Feld | Wirkung |
|---|---|
| Anzeigename | Wortmarke im Kopf, ersetzt das Shop-Logo |
| Farbschema | *wie der Shop*, *hell* oder *dunkel* |
| Leitfarbe | Diagramm, Provisionswert, Beschriftungen, Buttons |
| Zweitfarbe | Kennzeichnung der Gutscheinbestellungen |
| Hintergrund | Grundton, nur beim dunklen Schema |
| Logo-Adresse | eigenes Bildlogo statt Wortmarke |
| Schriftstapel | gewünschte Schrift, falls vorhanden |

Leere Felder übernehmen die Shopwerte. Für **LoopX13** ist das Design bereits
hinterlegt, entnommen der Website des Vermittlers:

| Rolle | Wert |
|---|---|
| Grund | `#030712` |
| Leitfarbe | `#00E5FF` (Cyan) |
| Zweitfarbe | `#FF007A` (Magenta) |
| Schrift | Inter, Helvetica Neue, Arial |

Im dunklen Schema erbt das Dashboard bewusst **nichts** mehr vom Theme: Auf
dunklem Grund wäre die dunkle Textfarbe des Themes unlesbar. Es bringt daher
alle Farben selbst mit und zeichnet seinen eigenen Hintergrund.

> **Kontrastsicherung:** Für Text wird jede Farbe automatisch so weit
> nachgedunkelt oder aufgehellt, bis sie auf dem jeweiligen Grund ein
> Kontrastverhältnis von 4,5:1 erreicht. Ohne das käme Cyan auf Weiss auf
> rund 1,7:1 und die Zahlen wären praktisch unlesbar. Flächen, Rahmen und
> Diagrammbalken behalten den Originalton.

> **Schriften werden nie nachgeladen.** Angegeben wird nur, welche Schrift
> verwendet werden soll, wenn sie auf dem Gerät vorhanden ist. Ein externer
> Schriftdienst würde bei jedem Aufruf die Adresse des Besuchers an einen
> Dritten übermitteln – in der Schweiz und der EU ein Datenschutzproblem.

Damit schon die **Anmeldemaske** im Design des Vermittlers erscheint, muss
klar sein, wem die Seite gehört. Gibt es nur einen aktiven Vermittler, wird
dessen Design automatisch verwendet. Bei mehreren Vermittlern den Shortcode
entsprechend setzen:

```
[hhp_partner_dashboard partner="loopx13"]
```

### Volle Breite im Seitenbaukasten

Standardmässig ist das Dashboard auf 1180 Pixel begrenzt und zentriert. In
einem Abschnitt über die volle Breite wirkt das wie ein Kasten in der Mitte.
Dann:

```
[hhp_partner_dashboard breite="voll"]
```

Möglich sind `voll`, `standard` (Vorgabe) oder eine eigene Länge wie
`breite="1400px"`. Beides lässt sich kombinieren:
`[hhp_partner_dashboard partner="loopx13" breite="voll"]`

> Hinweis zum Kontrast: Das Markengold erreicht auf Weiss nur ein
> Kontrastverhältnis von rund 2,6:1. Es wird deshalb für Flächen, Linien und
> grosse Zahlen eingesetzt, nie für Fliesstext – dort steht Anthrazit.

---

## 10. Unterlage für den Vermittler

Im Ordner `handout/` liegt ein einseitiges Merkblatt, das dem Vermittler
zusammen mit dem Zugangslink übergeben wird:

| Datei | Zweck |
|---|---|
| `vermittler-anleitung.pdf` | druckfertig, eine A4-Seite |
| `vermittler-anleitung.html` | Quelle, falls der Text angepasst werden soll |

Es erklärt den Zugangslink, beide Wege einer Vermittlung, was zur Provision
zählt und was nicht, enthält den QR-Code samt Druckgrössen und einen kurzen
Datenschutzhinweis. **Vor dem Versand den Platzhalter im Feld
„Dein persönlicher Link" durch den echten Zugangslink ersetzen** – er steht
im Backend unter *Vermittler*.

Nach einer Textänderung wird das PDF neu erzeugt mit:

```bash
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=handout/vermittler-anleitung.pdf \
  handout/vermittler-anleitung.html
```

---

## 11. Sprachen

Der Ordner `languages/` enthält die Übersetzungsvorlage
`hairhelp-partner.pot` mit allen 145 Oberflächentexten. Die Ausgangssprache
ist Deutsch; das Plugin läuft ohne weitere Datei.

Für eine zusätzliche Sprache – etwa die französische oder italienische
Schweiz – die Vorlage kopieren, als `hairhelp-partner-fr_CH.po` übersetzen
und die daraus erzeugte `.mo`-Datei daneben ablegen.

---

## 12. Ordner `snippets/`

Nur für den Fall, dass das Tracking **ohne** dieses Plugin laufen soll:

* `cookie-tracking.js` – reine Skriptvariante, z. B. für den Google Tag Manager
* `functions-snippet.php` – schlanke PHP-Variante für die `functions.php`

Beide setzen dasselbe Cookie für 30 Tage, bieten aber weder Dashboard noch
Provisionsrechnung. Bei aktivem Plugin werden sie **nicht** gebraucht.

---

## 13. Bekanntes Umfeldproblem: WP Rocket unter WordPress 7.1

Tritt beim Aufruf einer Seite ein kritischer Fehler auf und nennt der
Wiederherstellungsmodus **WP Rocket**, liegt es an einer bekannten
Unverträglichkeit von WP Rocket 3.23 mit WordPress 7.1 – nicht an diesem
Plugin.

Fehlerbild:

```
Uncaught TypeError: substr(): Argument #1 ($string) must be of type string,
int given in .../wp-rocket/inc/ThirdParty/Plugins/CDN/Cloudflare.php:562
```

WP Rocket durchsucht dort die Rückruflisten der Hooks `deleted_post` und
`transition_post_status` und erwartet für jeden Schlüssel einen Text. Unter
WordPress 7.1 kann ein Schlüssel eine Zahl sein – dann bricht `substr()` ab.
Das Modul läuft bei jedem Aufruf, auch ohne Cloudflare.

**Lösung: WP Rocket auf 3.23.2.2 oder neuer aktualisieren.** Dort ist die
Umwandlung in einen Text enthalten.

Dieses Plugin ist nicht beteiligt: Es registriert keinen Rückruf auf
`deleted_post` oder `transition_post_status` und verwendet seit Fassung 1.1.1
ausschliesslich benannte Funktionen und Klassenmethoden – anonyme Funktionen
sind genau die Art von Rückruf, die solche Zahlenschlüssel erzeugt.

### Seiten-Cache und die Dashboard-Seite

Die Dashboard-Seite ist persönlich und enthält ein Formular mit einem
zeitlich begrenzten Prüfwert. Würde sie zwischengespeichert, bekäme jeder
Besucher dieselbe Fassung – mit fremden Zahlen und einem abgelaufenen
Prüfwert, an dem jede Anmeldung mit „Formular abgelaufen" scheitert.

Das Plugin setzt deshalb ab Fassung 1.2.0 auf dieser Seite `DONOTCACHEPAGE`
und sendet passende Kopfzeilen. WP Rocket, WP Super Cache und W3 Total Cache
werten das aus; ein Eintrag in deren Ausschlusslisten ist nicht nötig.

---

## 14. Tests

Zwei Prüfungen lassen sich ohne WordPress-Installation direkt ausführen:

```bash
php tests/qr-test.php      # QR-Encoder gegen hinterlegte Referenzwerte
php tests/logic-test.php   # Zuordnung, Token-Prüfung, Zeiträume
php tests/auth-test.php    # Anmeldung, Passwörter, Sitzungen
```

Der QR-Encoder wurde gegen eine unabhängige Referenzumsetzung abgeglichen:
über die Versionen 1 bis 40 und alle vier Fehlerkorrekturstufen stimmten die
Modulmatrizen bei gleicher Maske Modul für Modul überein. Die erzeugten Bilder
wurden zusätzlich mit dem Decoder ZXing wieder eingelesen – jener Bibliothek,
die auch hinter den meisten Handy-Scannern steckt.
