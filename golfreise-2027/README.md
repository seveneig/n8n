# Ziischtigsclub — 10 Jahre Jubiläumsreise · Andalusien 2027

Anmelde-Webseite mit QR-Code, Live-Teilnehmerliste (max. 20 + Warteliste)
und Organisator-Bereich für die Golfreise nach Andalusien, 3.–7. März 2027.

Die verbindliche Buchung läuft über **Sphinx Travel**; die Seite verlinkt
darauf und führt zusätzlich die Clubliste, damit alle sehen, wer mitkommt.

---

## 1) Was drin ist

| Datei | Zweck |
|---|---|
| `dist/standalone.html` | **Vorschau.** Eine einzige Datei, einfach im Browser öffnen. Anmeldungen bleiben nur auf dem jeweiligen Gerät. |
| `dist/apps-script/Index.html` | **Für den echten Einsatz.** Wird von Google Apps Script ausgeliefert. |
| `dist/apps-script/Code.gs` | Backend dazu: speichert die Anmeldungen in einer Google-Tabelle. |
| `src/` | Quelldateien (Vorlage, Bilder, Datenschichten). |
| `build.py` | Erzeugt aus `src/` die Dateien in `dist/`. |

Beide Seiten sind **vollständig in sich geschlossen**: Bilder, Logo, Schriften
und die QR-Bibliothek stecken direkt in der Datei. Kein Internet-Abruf, keine
externen Dienste — läuft deshalb auch in iFrames und Sandboxes.

### Aufbau der Seite

- **Startseite** — Hero mit Logo, Eckdaten, den drei Buttons und dem QR-Code
  zum Teilen; danach: Anmeldung in zwei Schritten, Reise auf einen Blick,
  Hotel, Golf, Flüge, Preise, Fristen/Annullation, Kontakt.
- **Anmelden** — Kurzformular (Vorname, Name, Telefon, E-Mail) mit
  Pflichtfeld-Prüfung, Kapazitätsanzeige und Erfolgs-Screen mit Referenznummer.
- **Teilnehmer** — öffentliche Live-Liste, zeigt **nur Vorname und Name**.
- **Organisator** — passwortgeschützt: alle Angaben, Suche, CSV-Export, Löschen.

### Warteliste

Sortiert wird immer nach Anmeldezeit. Position 1–20 = **Angemeldet**,
ab 21 = **Warteliste**. Wird oben jemand gelöscht, rückt automatisch die
nächste Person nach — die Positionen werden bei jeder Anzeige neu berechnet.

---

## 2) Schnell anschauen

`dist/standalone.html` doppelklicken. Alles funktioniert sofort, aber
die Anmeldungen liegen nur im Speicher dieses einen Browsers.
Für die gemeinsame Liste braucht es Schritt 3.

---

## 3) Veröffentlichen mit Google-Tabelle

1. Neue Google-Tabelle anlegen — `sheets.new` in die Adresszeile tippen.
2. **Erweiterungen → Apps Script** öffnen.
3. Inhalt von `dist/apps-script/Code.gs` in die Datei `Code.gs` einfügen
   (den vorhandenen Inhalt ersetzen), speichern.
4. Links auf **+ → HTML**, die Datei exakt **`Index`** nennen
   (ohne `.html`, Gross-/Kleinschreibung beachten). Inhalt von
   `dist/apps-script/Index.html` einfügen, speichern.
   *Die Datei ist gross — im Explorer/Finder mit Rechtsklick → „Öffnen mit →
   Editor/TextEdit" öffnen, nicht doppelklicken.*
5. **Bereitstellen → Neue Bereitstellung → Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
   - → **Bereitstellen**
6. Einmal **autorisieren** (eigenes Google-Konto; bei der Warnung
   „Erweitert → Weiter zu … (unsicher)" → **Zulassen**).
7. Die angezeigte **Web-App-URL** ist der öffentliche Link. Diese URL steckt
   automatisch im QR-Code auf der Startseite.
8. Testen: Link öffnen → eintragen → die Zeile erscheint im Tabellenblatt
   **„Anmeldungen"**. Das Blatt wird beim ersten Eintrag automatisch angelegt.

### Nach jeder Änderung neu bereitstellen

**Bereitstellen → Bereitstellungen verwalten → Bearbeiten (Stift) →
Version: „Neue Version" → Bereitstellen.** Die Adresse bleibt dabei gleich.

---

## 4) Passwort und Einstellungen

Der Organisator-Bereich ist mit **`Augwil2027`** geschützt.

**Ändern:**

- Apps-Script-Variante: in `Code.gs` die Zeile `var ADMIN_PASSWORD = '…';`
  anpassen und neu bereitstellen. Das Passwort wird ausschliesslich auf dem
  Server geprüft und steht **nicht** im ausgelieferten HTML.
- Vorschau-Variante: in `build.py` die Zeile `ADMIN_PW = "…"` anpassen und
  `python3 build.py` ausführen. Hier steht das Passwort naturgemäss im
  HTML — die Vorschau ist nicht für den öffentlichen Einsatz gedacht.

Weitere Einstellungen stehen in `dist/*.html` ganz unten im Abschnitt
**„1) KONFIGURATION"**:

```js
maxParticipants: 20,     // fixe Plätze, danach Warteliste
sphinxUrl: '…',          // offizielles Anmeldeformular
deadline: '2026-10-11',  // Anmeldeschluss (steuert "Tage bis Schluss")
siteUrl: ''              // leer = automatisch; sonst feste URL für den QR-Code
```

`siteUrl` nur setzen, wenn der QR-Code auf eine andere Adresse zeigen soll
(z. B. eine eigene Kurz-URL, die auf die Apps-Script-Seite weiterleitet).

---

## 5) Neu bauen

```bash
python3 build.py
```

Liest `src/` und schreibt `dist/`. Bilder und Logo werden dabei als
Data-URIs eingebettet. Ohne Änderungen an `src/` ist das nicht nötig —
die fertigen Dateien in `dist/` sind eingecheckt.

---

## 6) Bilder austauschen

Alle Bilder liegen in `src/assets/`. Der Build sucht sie **nur über den
Basisnamen** — die Endung ist egal (`.png`, `.jpg`, `.jpeg`, `.webp`,
`.avif`, `.svg`, in dieser Reihenfolge). Eine neue `hero.png` ersetzt also
automatisch die alte `hero.jpg`; die alte Datei kann gelöscht werden.

| Basisname | Wo es erscheint | Empfohlene Grösse |
|---|---|---|
| `hero` | Vollbild hinter dem Hero (Desktop) | ab 1800 × 1000 px, querformat |
| `hero-portrait` | dasselbe auf Handys | ab 700 × 950 px, hochformat |
| `resort` | Hotel-Block, linke Karte | ab 1000 × 1250 px, hochformat |
| `room` | Hotel-Block, rechte Karte | ab 1000 × 1250 px, hochformat |
| `golf1` | Golf-Block, linke Karte im Stapel | ab 700 × 930 px, hochformat |
| `golf2` | Golf-Block, mittlere Karte (vorne, am grössten) | ab 850 × 1130 px, hochformat |
| `golf3` | Golf-Block, rechte Karte im Stapel | ab 700 × 930 px, hochformat |
| `logo-dark` | schwarze Wappenfassung | ab 500 px, quadratisch |
| `logo-light` | weisse Wappenfassung | ab 500 px, quadratisch |

**Wappen:** die schwarze Fassung steht auf hellen Flächen und auf dem
Hero-Foto, die weisse in Kopf- und Fusszeile des dunklen Designs. Fehlt eine
Datei, springt die andere ein; fehlen beide, greifen die SVG-Nachbauten
`emblem.svg` und `emblem-light.svg`. Liegt das Wappen mit weissem Hintergrund
vor (JPEG), muss es freigestellt werden — `build.py` tut das nicht, siehe die
Kreismaske im Verarbeitungsschritt unten.

Die Karten im Hotel-Block werden auf 4:5 zugeschnitten, die drei Golf-Karten
auf 3:4 — Motive also nicht zu knapp anschneiden.

Ein eigenes Hochformat fürs Handy ist nötig, weil `object-fit: cover` in einem
schmalen, hohen Hero ein 16:9-Bild vertikal vollständig zeigt: man sähe fast
nur Himmel.

Nach dem Austausch:

```bash
python3 build.py
```

Der Build listet auf, welche Datei er für welchen Platz genommen hat.

Die unbearbeiteten Originale liegen in `src/originale/` — von dort lassen sich
jederzeit neue Zuschnitte rechnen.

**Aktueller Stand:** Wappen und Fotos sind Originaldateien vom Verein bzw.
vom Hotel — kein Nachbau, keine hochskalierten PDF-Auszüge mehr. Alle Bilder
sind als WebP eingebettet; das Logo steckt einmal in einer CSS-Variablen und
wird an drei Stellen verwendet.

Noch offen: ein Foto von **Los Olivos**. Der Golf-Stapel zeigt derzeit
Santana Golf, Los Lagos und — als dritte Karte — eine zweite Aufnahme, die
neutral mit «Costa del Sol» beschriftet ist. Sobald ein Los-Olivos-Bild
vorliegt, ersetzt es `golf3`; dann bekommt die Karte auch die richtige
Beschriftung (in `src/page.html` bei `golfstack__card--c`).

---

## 7) Stolpersteine

- **`confirm()` / `alert()` gehen im iFrame nicht.** Die Seite nutzt deshalb
  durchgehend ein eigenes Bestätigungsfenster plus Toast-Meldungen.
- **Die HTML-Datei in Apps Script muss exakt `Index` heissen.**
- **Kein `fetch()` auf die eigene Adresse** — Datenaufrufe laufen über
  `google.script.run`.
- **Die Vorschau kann nicht zentral speichern.** Für „von überall sichtbar"
  braucht es die Google-Tabelle.
- **Doppelte E-Mail-Adressen** werden abgelehnt (Server und Vorschau).

---

## 8) Reise-Eckdaten (Stand PDF vom 22.07.2026)

- **Ziischtigsclub — 10 Jahre Jubiläumsreise**, Andalusien / Spanien
- **3.–7. März 2027**, 4 Nächte
- **La Zambra Resort ★★★★**, Mijas Costa — Deluxe-Doppelzimmer, Halbpension,
  lokale Flughafentransfers
- **Flug Swiss:** 03.03. LX 2110 ZRH → AGP 09:35–12:20 ·
  07.03. LX 2117 AGP → ZRH 19:00–21:40
- **Golf:** 2 × Los Olivos 18, 1 × Los Lagos 18, 1 × Santana 18 (inkl.
  Transfers), 1 × Los Lagos 9 — Buggy inbegriffen
- **Preise p. P.:** CHF 1'935 im Doppelzimmer / CHF 2'480 zur Einzelnutzung.
  Exkl. Golfgepäck und alle nicht aufgeführten Leistungen. Preisänderungen
  und Verfügbarkeiten vorbehalten.
- **Anmeldung:** max. 20 Personen, Anmeldeschluss **11.10.2026**,
  Sphinx-Formular: <https://www.sphinxtravel.ch/anmeldung-ziischtigsclub-golfreise-2027>
- **Annullation:** Flug 100 % Stornokosten; Landleistungen bis 15.12.2026
  kostenfrei (Bearbeitungsgebühr CHF 100.00 p. P.), danach 100 %.
  Reiseschutzversicherung empfohlen.
- **Kontakt:** Georges Müller, 058 058 18 10, gm@sphinxtravel.ch —
  Sphinx Travel GmbH, Sumpfstrasse 26, 6302 Zug
