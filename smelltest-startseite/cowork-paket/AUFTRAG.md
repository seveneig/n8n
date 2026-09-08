# Auftrag: Website Smell Discettes in WordPress mit Elementor anlegen

## Ziel

Lege in der bestehenden WordPress-Installation **zehn Seiten** an, befülle jede mit
einem fertigen HTML-Block über ein **Elementor-HTML-Widget**, und richte
**Kopf- und Fusszeile** einmalig als globale Theme-Builder-Vorlagen ein. Danach
Hauptmenü setzen und Startseite festlegen.

Alle Inhalte liegen in diesem Paket. **Es ist nichts zu texten und nichts zu
gestalten** – die Blöcke bringen ihr eigenes CSS, ihre Schrift und alle Bilder
eingebettet mit.

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
| SmellTest | `smelltest` | `bloecke/smelltest.html` | Position 3 |
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

## Vorgehen je Seite

### 1. Interne Links ersetzen

In den Blöcken stehen relative Pfade wie `produkt.html`. Diese **vor dem Speichern**
durch die echten Adressen ersetzen – die Zuordnung steht in `seiten.json` unter
`interne_links.ersetzungen`. Reine Textersetzung im HTML-String, zum Beispiel
`href="produkt.html"` → `href="/produkt/"`.

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
- Die Prüfung des Produktcodes ist eine reine Formatprüfung im Browser und
  **kein Zugangsschutz**. Wer echte Codes prüfen will, braucht eine
  Serverkomponente; bis dahin nichts anderes behaupten.

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

- Menü **Hauptmenü** anlegen mit: Produkt, SmellTest, Online-Test, Über uns, FAQ,
  Kontakt (Reihenfolge gemäss `menue_reihenfolge` in `seiten.json`).
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
4. Die Schrift ist **Lato**, nicht die Theme-Schrift. Sieht es nach Serifen oder
   nach Arial aus, wurde der `<style>`-Block beim Speichern gefiltert → fehlende
   `unfiltered_html`-Berechtigung.
5. Keine kaputten Bilder. Alle Bilder sind eingebettet, es gibt keine externen
   Bildpfade.
6. Auf dem Handy (390 px): Burger-Menü öffnet und schliesst, kein horizontales
   Scrollen.
7. Alle Links in Navigation und Fusszeile führen auf existierende Seiten.
8. Auf `/test/`: einmal komplett durchspielen. Anmelden, Patient erfassen, alle acht
   Disketten beantworten, abschliessen. Der Score muss erscheinen, „Ergebnis drucken"
   muss den Druckdialog mit dem Ergebnisblatt öffnen. Die Browser-Konsole bleibt
   dabei fehlerfrei.

## Was nicht zu tun ist

- **Keine Inhalte umschreiben, kürzen oder ergänzen.** Die Texte sind über ein
  Claim Sheet rechtlich abgesichert; jede Änderung kann eine unzulässige Aussage
  erzeugen. Bei inhaltlichen Zweifeln nachfragen statt anpassen.
- Bestehende Seiten, Beiträge oder Vorlagen **nicht** verändern oder löschen.
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
| Editor wird sehr langsam | Blöcke sind 130–650 KB gross | normal; im Editor nicht scrollen, Änderungen an den Quelldateien vornehmen |
| Online-Test reagiert nicht auf Klicks | Inline-JavaScript wurde vom Cache-Plugin verschoben oder minifiziert | Seite `/test/` von der JS-Optimierung ausnehmen |
| Online-Test zeigt keine Bilder | Block wurde beim Einfügen abgeschnitten | vollständige Datei übernehmen, sie ist rund 650 KB gross |

## Rückmeldung

Melde nach Abschluss zurück:
- Liste der angelegten Seiten mit ihren IDs und URLs
- Elementor-Version und ob Elementor Pro vorhanden war
- welche Abnahmepunkte geprüft wurden und mit welchem Ergebnis
- alles, was nicht wie beschrieben funktioniert hat
