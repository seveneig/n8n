# Auftrag: Website SMELL Discettes in WordPress mit Elementor anlegen und aktualisieren

## Ziel

Lege in der bestehenden WordPress-Installation **zehn Seiten** an, befülle jede mit
einem fertigen HTML-Block über ein **Elementor-HTML-Widget**, und richte
**Kopf- und Fusszeile** einmalig als globale Theme-Builder-Vorlagen ein. Danach
Hauptmenü setzen und Startseite festlegen.

Alle Inhalte liegen in diesem Paket. **Es ist nichts zu texten und nichts zu
gestalten** – die Blöcke bringen ihr eigenes CSS und alle Bilder eingebettet mit.
Die Schrift ist **Ebrima** (`font-family: ebrima, sans-serif`), eine Systemschrift,
die nicht eingebettet wird.

> **Ist die Website bereits angelegt?** Dann gilt zuerst der Abschnitt
> **„Aktualisierung einer bestehenden Installation"** weiter unten. Nichts doppelt
> anlegen.

## Voraussetzungen

- WordPress-Adminzugang mit der Berechtigung `unfiltered_html` (Rolle Administrator).
  Ohne diese Berechtigung filtert WordPress beim Speichern `<style>`-Blöcke heraus
  und die Seiten sehen kaputt aus.
- **Elementor** aktiv. Für die globalen Kopf-/Fusszeilen-Vorlagen zusätzlich
  **Elementor Pro** (Theme Builder).
- Zugang per **WP-CLI** (bevorzugt) oder über die WordPress-REST-API.
- Ein Backup der Datenbank vor Beginn.

## Was anzulegen ist

Die verbindliche Liste steht in **`seiten.json`**. Kurzfassung:

| Titel | Slug | Block | Menü |
|---|---|---|---|
| Startseite | `startseite` | `bloecke/startseite.html` | – (wird Startseite) |
| Produkt | `produkt` | `bloecke/produkt.html` | Position 2 |
| SMELL Test | `smelltest` | `bloecke/smelltest.html` | Position 3 |
| Online-Test | `test` | `bloecke/test.html` | Position 4 |
| Über uns | `ueber-uns` | `bloecke/ueber-uns.html` | Position 5 |
| FAQ | `faq` | `bloecke/faq.html` | Position 6 |
| Kontakt | `kontakt` | `bloecke/kontakt.html` | Position 7 |
| Vertriebspartner | `vertriebspartner` | `bloecke/vertriebspartner.html` | nur Footer |
| Impressum | `impressum` | `bloecke/impressum.html` | nur Footer |
| Datenschutz | `datenschutz` | `bloecke/datenschutz.html` | nur Footer |

Dazu zwei Theme-Builder-Vorlagen: `bloecke/_kopfzeile.html` als **Header**,
`bloecke/_fusszeile.html` als **Footer**, Anzeigebedingung jeweils
**Gesamte Website**.

Ausserdem fünf PDF-Dateien in `downloads/` – die vier Gebrauchsanweisungen und das
leere Testformular (Deutsch), die im Online-Test nach der Anmeldung angeboten werden
(siehe „Sonderfall Online-Test").

## Aktualisierung einer bestehenden Installation

Sind die Seiten und Vorlagen schon vorhanden, werden sie **ersetzt, nicht neu
angelegt**:

1. Seite über den **Slug** finden (`wp post list --post_type=page --name=<slug>`).
   Fehlt eine Seite, sie wie unten beschrieben neu anlegen.
2. In der vorhandenen `_elementor_data` das **eine HTML-Widget** suchen und nur
   dessen `settings.html` durch den neuen Blockinhalt ersetzen – nach der
   Link-Ersetzung aus Schritt 1 unten. Container, Element-IDs und alle übrigen
   Einstellungen bleiben unverändert. Wieder mit
   `wp_slash( wp_json_encode( … ) )` speichern.
3. Genauso bei **Kopfzeile global** und **Fusszeile global** (Beitragstyp
   `elementor_library`).
4. Seitentitel an `seiten.json` angleichen (die Seite `smelltest` heisst jetzt
   **SMELL Test**) und im Hauptmenü die Beschriftung ebenfalls auf **SMELL Test**
   ändern.
5. Wurden auf der Live-Seite von Hand Inhalte ergänzt, die in den Blöcken nicht
   vorkommen (zum Beispiel ein Video auf der Startseite oder ein eigenes
   Elementor-Formular auf der Kontaktseite): **nicht löschen**, sondern vorher
   melden und die Adresse des Startseiten-Videos notieren – sie wird für den
   Online-Test gebraucht.
6. Danach `wp elementor flush-css` und die Abnahme unten.

## Vorgehen je Seite

### 1. Interne Links ersetzen

In den Blöcken stehen relative Pfade wie `produkt.html`. Diese **vor dem Speichern**
durch die echten Adressen ersetzen – die Zuordnung steht in `seiten.json` unter
`interne_links.ersetzungen`.

**Nur am Anfang eines `href`-Werts oder einer Zeichenkette ersetzen**, nie als
freie Textersetzung: `href="test.html` darf nicht in `href="smelltest.html`
greifen. Im Online-Test steht ein Link auch im Skript (`'kontakt.html?…'`). Sicher
ist dieser reguläre Ausdruck:

```
(href="|')(produkt|smelltest|test|ueber-uns|faq|kontakt|vertriebspartner|impressum|datenschutz|index)\.html
```

Er tauscht nur den Dateinamen aus und lässt das Anführungszeichen davor stehen. Anhänge bleiben stehen:
`href="kontakt.html?anliegen=bestellung#formular"` →
`href="/kontakt/?anliegen=bestellung#formular"`,
`href="index.html#praeoperativ"` → `href="/#praeoperativ"`.

Achtung: `index.html` wird zu `/`, nicht zu `/startseite/`.

### 2. Seite anlegen

- Beitragstyp `page`, Status zunächst **Entwurf**, Titel und Slug gemäss Tabelle.
- Seitenvorlage setzen: Postmeta `_wp_page_template` = `elementor_header_footer`.
  (Diese Vorlage zeigt die Theme-Builder-Kopf- und -Fusszeile an. **Nicht**
  `elementor_canvas` verwenden – dort fehlen Kopf und Fuss.)

### 3. Elementor-Struktur schreiben

Elementor speichert den Seitenaufbau als JSON in der Postmeta `_elementor_data`.
Für jede Seite genau **ein Container mit einem HTML-Widget**:

```json
[
  {
    "id": "aaaaaaa",
    "elType": "container",
    "isInner": false,
    "settings": {
      "content_width": "full",
      "padding":  { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": true },
      "margin":   { "unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": true },
      "flex_gap": { "unit": "px", "size": 0, "column": "0", "row": "0" }
    },
    "elements": [
      {
        "id": "bbbbbbb",
        "elType": "widget",
        "widgetType": "html",
        "settings": { "html": "HIER DER INHALT DES BLOCKS" },
        "elements": []
      }
    ]
  }
]
```

**Die Container-Einstellungen sind nicht optional.** Volle Breite und Padding 0 sind
die Bedingung dafür, dass die farbigen Bänder über die ganze Breite laufen und der
transparente Header korrekt sitzt.

Die `id`-Werte müssen **je Element eindeutig** sein: sieben Zeichen aus `[a-f0-9]`,
pro Seite neu erzeugen.

### 4. Weitere Postmeta setzen

| Meta-Key | Wert |
|---|---|
| `_elementor_edit_mode` | `builder` |
| `_elementor_template_type` | `wp-page` |
| `_elementor_version` | die installierte Elementor-Version, z. B. `3.25.0` |
| `_elementor_data` | das JSON von oben, als String |
| `_wp_page_template` | `elementor_header_footer` |

**Stolperstein `_elementor_data`:** WordPress entfernt beim Speichern von Postmeta
Backslashes. Elementor erwartet den JSON-String aber mit den Escapes. In PHP
deshalb immer so schreiben:

```php
update_post_meta( $post_id, '_elementor_data', wp_slash( wp_json_encode( $daten ) ) );
```

Nicht `wp post meta update` mit rohem JSON auf der Kommandozeile verwenden – dabei
gehen die Escapes verloren und Elementor zeigt eine leere Seite.

### 5. Nach dem Import

- Elementor-CSS neu erzeugen: `wp elementor flush-css` (oder in Elementor unter
  *Werkzeuge → Dateien und Daten → CSS neu erstellen*).
- Jede Seite im Frontend öffnen und prüfen (siehe Abnahme unten).
- Erst danach von Entwurf auf **Veröffentlicht** setzen.

## Sonderfall Online-Test

`bloecke/test.html` ist die einzige Seite, die **JavaScript** mitbringt. Sie führt
durch den Riechtest: Anmeldung, Patientendaten, acht Disketten mit je drei
Bildantworten, Score und Ergebnisblatt zum Drucken. Für diese Seite gilt zusätzlich:

- Das `<script>`-Element am Ende des Blocks **unverändert** übernehmen. Es steckt
  bewusst im selben HTML-Widget wie das Markup.
- Die Seite auf **`noindex`** setzen (Yoast, Rank Math oder das eingesetzte
  SEO-Plugin). Sie gehört nicht in den Suchindex.
- Falls ein Optimierungs- oder Cache-Plugin aktiv ist (WP Rocket, Autoptimize,
  LiteSpeed, SiteGround Optimizer): **Inline-JavaScript für diese Seite von
  Minifizierung, Zusammenfassung und „defer" ausnehmen.** Sonst funktioniert der
  Test nicht mehr.
- Der Test läuft vollständig im Browser. Es werden **keine Patientendaten** an
  einen Server gesendet oder gespeichert – das ist so gewollt und darf nicht
  „ergänzt" werden.
- Der Login prüft die **Seriennummer (SN)** über das Plugin **SMELL Online-Test**
  gegen die Datenbank. Ohne aktives Plugin ist keine Anmeldung möglich – der Test
  meldet dann „Server nicht erreichbar".
- Patientendaten bleiben im Browser (sessionStorage des Tabs). An den Server gehen
  nur Prüferin/Prüfer, Klinik und SN beim Login sowie „Test abgeschlossen" zum Zählen.

### Plugin „SMELL Online-Test" installieren

1. `plugin/smell-online-test.zip` unter *Plugins → Installieren → Plugin hochladen*
   installieren und **aktivieren**. Beim Aktivieren legt es zwei Tabellen an
   (`wp_smell_sets`, `wp_smell_anmeldungen`) und die Vorführ-SN
   **`SMELL-2026-HANS`**.
2. Im Menü **SMELL Online-Test** die echten Seriennummern eintragen – eine pro Zeile,
   zeichengenau wie auf dem Etikett. Die Liste liefert die SMELL Discettes GmbH;
   **keine Seriennummern erfinden**. Ohne Liste funktioniert nur die Vorführ-SN.
3. Einstellungen prüfen: vorgesehene Tests je Test-Set (500), Speichern der
   Anmeldedaten erlaubt, Aufbewahrung (365 Tage).
4. Die Schnittstelle prüfen:
   `curl -X POST https://<domain>/wp-json/smell/v1/anmelden -H 'Content-Type: application/json' -d '{"pruefer":"Test","klinik":"Test","sn":"SMELL-2026-HANS","speichern":false}'`
   muss `"ok":true` liefern. Liefert `/wp-json/` einen Fehler (keine „schönen"
   Permalinks), nimmt der Test automatisch `/?rest_route=` – trotzdem melden.
5. Sicherheits- oder Firewall-Plugins (Wordfence, iThemes, All-In-One Security)
   dürfen die Route `/wp-json/smell/v1/` für nicht angemeldete Besucher **nicht
   sperren**. Gegebenenfalls freigeben.
6. Das Plugin bringt das ausfüllbare Testformular und die Bibliothek `pdf-lib` mit
   (`wp-content/plugins/smell-online-test/assets/`). Daraus erstellt der Online-Test
   am Ende das **ausgefüllte Testformular als PDF** – im Browser, ohne dass
   Patientendaten den Rechner verlassen. Die Antwort von `/anmelden` muss deshalb
   auch `"formular"` und `"pdflib"` enthalten, und beide Adressen müssen im
   Browser abrufbar sein (nicht von einem Sicherheits-Plugin gesperrt).

**Aktualisieren:** Ist das Plugin schon installiert (Version 1.0.0), die neue ZIP
genauso hochladen und **„Vorhandenes durch hochgeladene Version ersetzen"** wählen.
Seriennummern, Zähler und gespeicherte Anmeldungen bleiben erhalten. Danach muss
unter *Plugins* Version **1.1.5** stehen.

### Gebrauchsanweisungen und Testformular hochladen

Die fünf PDFs aus `downloads/` in die **Mediathek** hochladen. Danach im Block
`bloecke/test.html` jeden Pfad `downloads/<Dateiname>.pdf` durch die Adresse
der hochgeladenen Datei ersetzen, zum Beispiel
`downloads/Smell-Test_Gebrauchsanweisung_D.pdf` →
`/wp-content/uploads/2026/09/Smell-Test_Gebrauchsanweisung_D.pdf`.
Die fünf Pfade stehen auch in `seiten.json` unter `downloads`.

### Instruktionsfilm eintragen

Im Skript von `bloecke/test.html` steht:

```js
var VIDEO_URL = 'VIDEO-URL-DER-STARTSEITE';
```

Den Platzhalter durch die Adresse des Videos ersetzen, das auf der **Startseite**
der Live-Website läuft (YouTube-, Vimeo- oder MP4-Adresse aus der Mediathek). Bleibt
der Platzhalter stehen, zeigt der Online-Test an dieser Stelle nur einen Hinweis.
Das Video wird erst beim Klick geladen; YouTube läuft über `youtube-nocookie.com`.
Blockiert das Cookie-Plugin (z. B. Complianz) eingebettete Videos, dieses iframe
für die Seite `/test/` freigeben oder als funktional einstufen.

### Kontaktformular als Sprungziel

Die „Bestellen"-Links führen auf `/kontakt/?anliegen=bestellung#formular`. Der
Kontakt-Block hat dafür die Sprungmarke `id="formular"` und wählt das Anliegen
„Bestellung und Bezugsquellen" automatisch vor. Wurde auf der Live-Seite ein
**eigenes Elementor-Formular** eingesetzt, diesem Formular-Widget unter
*Erweitert → CSS-ID* den Wert `formular` geben, damit der Sprung funktioniert.

## Kopf- und Fusszeile

Beide sind Beiträge vom Typ `elementor_library`:

| | Kopfzeile | Fusszeile |
|---|---|---|
| `_elementor_template_type` | `header` | `footer` |
| Titel | `Kopfzeile global` | `Fusszeile global` |
| Inhalt | `bloecke/_kopfzeile.html` | `bloecke/_fusszeile.html` |

Aufbau wie bei den Seiten: ein Container voller Breite mit Padding 0, darin ein
HTML-Widget. Die **Anzeigebedingung „Gesamte Website"** setzt du am einfachsten
einmal von Hand im Theme Builder – das ist ein Klick und weniger fehleranfällig,
als die Bedingungen programmatisch in `_elementor_conditions` zu schreiben.

**Wichtig zur Kopfzeile:** Elementors eigene Sticky-Funktion **nicht** aktivieren.
Der Block positioniert sich selbst über einen 0 px hohen Anker, damit er
transparent über dem Seiteninhalt liegt, ohne ihn nach unten zu schieben.
Elementors Sticky-Einstellung setzt eigene Positionierung und bricht das.

## Menü und Startseite

- Menü **Hauptmenü** anlegen mit: Home, Produkt, SMELL Test, Online-Test, Über uns,
  FAQ, Kontakt (Reihenfolge gemäss `menue_reihenfolge` in `seiten.json`).
- Menü der Theme-Position zuweisen, sofern das Theme eine erwartet. Die Navigation
  steckt allerdings bereits im Kopfzeilen-Block – ein zusätzliches Theme-Menü ist
  nur nötig, wenn es an anderer Stelle ausgegeben wird.
- **Startseite:** Unter *Einstellungen → Lesen* die Seite `startseite` als statische
  Startseite festlegen.

## Weiterleitungen von den alten Adressen

Die bestehende Website hat andere Pfade. In `seiten.json` steht bei jeder Seite
`alte_url`. Dafür 301-Weiterleitungen einrichten:

| Alt | Neu |
|---|---|
| `/de/product/` | `/produkt/` |
| `/de/SmellTest/` | `/smelltest/` |
| `/de/about/` | `/ueber-uns/` |
| `/de/contact_form/` | `/kontakt/` |
| `/de/distributor_form/` | `/vertriebspartner/` |

## Abnahme

Prüfe nach dem Import auf **jeder** Seite:

1. Die Seite zeigt **genau eine** Kopfzeile und **genau eine** Fusszeile.
2. Die Überschrift wird **nicht** vom Header verdeckt – die Blöcke halten oben
   Platz frei, der Header liegt darüber.
3. Die farbigen Bänder (dunkelblaues Kennzahlenband, Fusszeile) laufen über die
   **volle Bildschirmbreite**, nicht eingerückt.
4. Die Schrift ist **Ebrima** (unter Windows) bzw. die serifenlose Systemschrift
   (Mac, iPhone, Android – Ebrima gibt es dort nicht, das ist erwartet). Sieht
   es nach Serifen aus, wurde der `<style>`-Block beim Speichern gefiltert →
   fehlende `unfiltered_html`-Berechtigung.
5. Keine kaputten Bilder. Alle Bilder sind eingebettet, es gibt keine externen
   Bildpfade.
6. Auf dem Handy (390 px): Burger-Menü öffnet und schliesst, kein horizontales
   Scrollen.
7. Alle Links in Navigation und Fusszeile führen auf existierende Seiten.
8. Auf `/test/` – Login: Der Instruktionsfilm spielt ab. Leere Felder oder eine
   falsche SN (auch nur falsche Gross-/Kleinschreibung) ergeben ein Hinweisfenster.
   Mit `SMELL-2026-HANS` öffnet sich die Patienten-Anmeldung.
9. Patienten-Anmeldung: Zähler der durchgeführten Tests und der Satz zu den 500
   Tests sichtbar; alle vier Gebrauchsanweisungen lassen sich ansehen und
   herunterladen. Ohne Angaben oder ohne gewählte Nasenseite erscheint ein
   Hinweisfenster.
10. „Bestellen" in der Kopfzeile führt auf das Kontaktformular, das Anliegen
    „Bestellung und Bezugsquellen" ist vorausgewählt.
11. Kopf- und Fusszeile enthalten den Link **Home**.
12. Nach etwas Scrollen erscheint unten rechts ein runder Knopf mit Pfeil; ein
    Klick führt an den Seitenanfang. Er erscheint **genau einmal** pro Seite.
13. Auf `/test/`: Ein Klick auf eine Gebrauchsanweisung öffnet das PDF in einer
    **Lightbox** über der Seite, nicht in einem neuen Tab. Esc oder das Kreuz
    schliesst sie. (Auf Mobilgeräten ohne eingebauten PDF-Betrachter öffnet das
    PDF absichtlich normal.)
14. Einen Test komplett durchspielen: Jede Bildwahl springt zur nächsten Sequenz,
    es gibt keinen „Zurück"-Knopf. In der Zusammenfassung eine Diskette anklicken,
    anders wählen – es geht zurück zur Zusammenfassung. „Test abschliessen" zeigt
    das Testformular mit den gewählten Bildern; im Plugin steigt der Zähler der SN
    um 1. **„Testformular herunterladen (PDF)"** lädt das Testformular der TestBox
    herunter, ausgefüllt mit Name, Vorname, Geburtsdatum, den Kreuzen aller
    Durchgänge, Testauswertung (Kästchen und Punkte), Prüferin/Prüfer und Datum.
    Dateiname `SMELL-Test_<Nachname>_<Vorname>_<Testdatum>.pdf`.
15. „Test mit anderer Nasenöffnung desselben Patienten fortfahren": Die
    Patientendaten stehen schon da, die getestete Seite ist gesperrt. Nach drei
    Durchgängen verschwindet der Knopf. Das Testformular zeigt alle drei Spalten.
16. „Test mit neuem Patienten" und „Test verlassen" fragen zuerst nach, ob das
    Testformular gesichert ist.
17. Im Menü **SMELL Online-Test** erscheint die Anmeldung unter „Gespeicherte
    Anmeldungen", wenn beim Login das Häkchen gesetzt war.

## Was nicht zu tun ist

- **Keine Inhalte umschreiben, kürzen oder ergänzen.** Die Texte sind über ein
  Claim Sheet rechtlich abgesichert; jede Änderung kann eine unzulässige Aussage
  erzeugen. Bei inhaltlichen Zweifeln nachfragen statt anpassen.
- Seiten, Beiträge oder Vorlagen, die **nicht** in `seiten.json` stehen, weder
  verändern noch löschen.
- Die Blöcke nicht in Gutenberg-Blöcke oder Elementor-Widgets zerlegen. Sie
  funktionieren nur als **ein** zusammenhängendes HTML-Widget, weil das CSS im
  selben Block steckt.
- Nicht veröffentlichen, bevor die Abnahmepunkte geprüft sind.

## Bekannte Stolpersteine

| Symptom | Ursache | Lösung |
|---|---|---|
| Seite bleibt leer, Elementor zeigt „Kein Inhalt" | Escapes in `_elementor_data` verloren | mit `wp_slash( wp_json_encode( … ) )` schreiben |
| Schrift falsch, Abstände zerschossen | `<style>` beim Speichern gefiltert | als Administrator mit `unfiltered_html` importieren |
| Inhalt startet unter einem grossen Leerraum | Header läuft normal mit statt zu überlagern | Elementor-Sticky deaktivieren; alternativ den kommentierten Freiraum-Block am Anfang jedes Seitenblocks löschen |
| Farbige Bänder eingerückt | Container nicht auf volle Breite / Padding ≠ 0 | Container-Einstellungen gemäss Abschnitt 3 |
| Editor wird sehr langsam | Blöcke sind 40–560 KB gross | normal; im Editor nicht scrollen, Änderungen an den Quelldateien vornehmen |
| Online-Test reagiert nicht auf Klicks | Inline-JavaScript wurde vom Cache-Plugin verschoben oder minifiziert | Seite `/test/` von der JS-Optimierung ausnehmen |
| Online-Test zeigt keine Bilder | Block wurde beim Einfügen abgeschnitten | vollständige Datei übernehmen, sie ist rund 560 KB gross |
| Knopf „Zum Seitenanfang" verdeckt das Cookie-Symbol | Beide sitzen unten rechts | Im Cookie-Plugin das Symbol nach links setzen |
| Login meldet „Server nicht erreichbar" | Plugin inaktiv oder Route von einem Sicherheits-Plugin gesperrt | Plugin aktivieren, `/wp-json/smell/v1/` freigeben |
| Login lehnt eine echte SN ab | SN nicht im Plugin eingetragen oder abweichend geschrieben | im Menü **SMELL Online-Test** zeichengenau eintragen |
| PDF-Links im Online-Test führen ins Leere | Pfade `downloads/…` nicht ersetzt | PDFs hochladen und Pfade ersetzen (Abschnitt „Gebrauchsanweisungen und Testformular hochladen") |
| „PDF konnte nicht erstellt werden" | Plugin noch Version 1.0.0, oder `…/smell-online-test/assets/` gesperrt bzw. von einem Optimierungs-Plugin verändert | Plugin 1.1.5 installieren, den Ordner freigeben und von der Optimierung ausnehmen |

## Rückmeldung

Melde nach Abschluss zurück:
- Liste der angelegten bzw. aktualisierten Seiten mit ihren IDs und URLs
- die Adresse des Startseiten-Videos, die im Online-Test eingetragen wurde
- die Mediathek-Adressen der fünf PDFs
- Elementor-Version und ob Elementor Pro vorhanden war
- welche Abnahmepunkte geprüft wurden und mit welchem Ergebnis
- alles, was nicht wie beschrieben funktioniert hat
