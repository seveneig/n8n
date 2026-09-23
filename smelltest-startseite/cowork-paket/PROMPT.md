# Was du Cowork gibst

> **Die Website ist schon angelegt?** Dann nimm den Auftragstext unter
> **„Runde 2: Aktualisierung"** weiter unten – nicht den Text für den Erstaufbau.

## 1. Mitgeben

- dieses Paket (`cowork-paket.zip`, entpackt)
- Zugang zur WordPress-Installation: Administrator-Login, und falls vorhanden
  SSH oder WP-CLI
- die Angabe, ob **Elementor Pro** installiert ist (für die globale Kopf- und
  Fusszeile nötig)

## 2. Auftragstext zum Kopieren

---

Du baust die neue Website der Smell Discettes GmbH in WordPress mit Elementor auf.
Alle Inhalte liegen fertig im beigefügten Paket. **Es ist nichts zu texten und
nichts zu gestalten.**

Lies zuerst `AUFTRAG.md` vollständig – dort steht das Verfahren im Detail – und
`seiten.json` als verbindliche Liste der Seiten. Arbeite dann in dieser Reihenfolge:

1. **Prüfen und sichern.** Elementor-Version feststellen, prüfen ob Elementor Pro
   vorhanden ist, prüfen ob dein Benutzer die Berechtigung `unfiltered_html` hat.
   Datenbank sichern. Falls eine der drei Voraussetzungen fehlt: melden und
   stoppen, nicht umgehen.
2. **Zehn Seiten anlegen**, Titel und Slug exakt gemäss `seiten.json`, Status
   zunächst **Entwurf**. Seitenvorlage `elementor_header_footer`.
3. **Interne Links ersetzen** – die Zuordnung steht in `seiten.json` unter
   `interne_links.ersetzungen`. `index.html` wird zu `/`, nicht zu `/startseite/`.
4. **Je Seite genau ein Container mit einem HTML-Widget**, Container auf volle
   Breite, Padding und Margin und Gap auf 0. Den Blockinhalt unverändert
   einsetzen. `_elementor_data` mit `wp_slash( wp_json_encode( … ) )` schreiben,
   sonst bleibt die Seite leer.
5. **Kopf- und Fusszeile** als Theme-Builder-Vorlagen aus `bloecke/_kopfzeile.html`
   und `bloecke/_fusszeile.html`, Anzeigebedingung „Gesamte Website". Elementors
   eigene Sticky-Funktion für die Kopfzeile **nicht** einschalten.
6. **Hauptmenü** anlegen (Produkt, SMELL Test, Online-Test, Über uns, FAQ, Kontakt),
   Startseite unter Einstellungen → Lesen setzen, 301-Weiterleitungen von den alten
   Adressen gemäss `alte_url` einrichten.
7. **Abnahme** nach der Liste in `AUFTRAG.md` auf jeder Seite. Erst danach
   veröffentlichen.

Besonders wichtig:

- **Texte nicht umschreiben, nicht kürzen, nicht ergänzen.** Die Inhalte sind über
  ein Claim Sheet rechtlich abgesichert. Jede Änderung kann eine unzulässige
  Aussage erzeugen. Bei Zweifeln fragen statt anpassen.
- Die Blöcke **nicht** in einzelne Elementor-Widgets oder Gutenberg-Blöcke
  zerlegen. Sie funktionieren nur als ein zusammenhängendes HTML-Widget, weil das
  CSS im selben Block steckt.
- **Bestehende Seiten, Beiträge und Vorlagen nicht verändern und nicht löschen.**
- Die Seite **Online-Test** (`/test/`) ist ein Sonderfall: Sie enthält
  JavaScript. Das `<script>`-Element unverändert übernehmen, die Seite auf
  `noindex` setzen und Inline-JavaScript dieser Seite von Cache- und
  Optimierungs-Plugins (WP Rocket, Autoptimize, LiteSpeed, SiteGround Optimizer)
  ausnehmen – sonst funktioniert der Test nicht mehr. Danach einmal komplett
  durchspielen: anmelden, Patient erfassen, acht Disketten beantworten,
  abschliessen, Ergebnis drucken. Die Browser-Konsole muss dabei fehlerfrei sein.

Drei Inhalte fehlen noch und dürfen **nicht erfunden** werden. Lege die Seiten
trotzdem an und melde die Lücken zurück:

- der Datenschutztext (liegt auf der bestehenden Website unter `/policies/`)
- die vertretungsberechtigte Person für das Impressum
- die Vertriebspartner nach Ländern

Melde zum Schluss zurück: die angelegten Seiten mit IDs und URLs, die
Elementor-Version und ob Pro vorhanden war, welche Abnahmepunkte du geprüft hast
und mit welchem Ergebnis, und alles, was nicht wie beschrieben funktioniert hat.

---

## 3. Womit du danach rechnen musst

Der Login des Online-Tests prüft den Produktcode nur auf seine Form. Das ist keine
echte Zugangssperre – dafür braucht es eine Serverkomponente. Cowork soll daran
nichts „verbessern"; falls es das vorschlägt, ist das eine eigene Aufgabe.

---

## Runde 2: Aktualisierung (Korrekturen, Online-Test mit Unterlagen)

Mitgeben: dieses Paket in der neuen Fassung und denselben WordPress-Zugang.

---

Die Website der SMELL Discettes GmbH ist bereits mit Elementor aufgebaut. Du
aktualisierst sie jetzt mit dem beigefügten Paket. **Nichts neu anlegen, was es
schon gibt** – vorhandene Seiten und Vorlagen werden ersetzt.

Lies zuerst `AUFTRAG.md`, besonders die Abschnitte **„Aktualisierung einer
bestehenden Installation"** und **„Sonderfall Online-Test"**, und `seiten.json`.
Dann in dieser Reihenfolge:

1. **Sichern.** Datenbank-Backup. Prüfen, dass du `unfiltered_html` hast.
2. **Bestand aufnehmen.** Die Adresse des Videos notieren, das auf der Startseite
   läuft. Notieren, ob die Kontaktseite ein eigenes Elementor-Formular hat.
   Nichts löschen, was nicht aus dem Paket stammt.
3. **PDFs hochladen.** Die vier Dateien aus `downloads/` in die Mediathek laden.
4. **Online-Test vorbereiten.** In `bloecke/test.html` die vier Pfade
   `downloads/…pdf` durch die Mediathek-Adressen ersetzen und
   `VIDEO-URL-DER-STARTSEITE` durch die Adresse des Startseiten-Videos.
5. **Interne Links ersetzen** – nur am Anfang eines `href`-Werts, wie in
   `AUFTRAG.md` beschrieben (`href="test.html` darf nicht in
   `href="smelltest.html` greifen).
6. **Zehn Seiten aktualisieren:** Seite über den Slug finden, im vorhandenen
   HTML-Widget nur den Inhalt austauschen, Container und IDs lassen. Mit
   `wp_slash( wp_json_encode( … ) )` speichern. Fehlt eine Seite, anlegen.
7. **Kopfzeile global** und **Fusszeile global** genauso aktualisieren.
8. Seite `smelltest` in **SMELL Test** umbenennen, auch im Hauptmenü.
9. Hat die Kontaktseite ein eigenes Elementor-Formular: dem Formular-Widget die
   CSS-ID `formular` geben.
10. `wp elementor flush-css`, dann die komplette **Abnahme** aus `AUFTRAG.md`
    (Punkte 1–10) auf jeder Seite.

Besonders wichtig:

- **Texte nicht umschreiben, kürzen oder ergänzen.** Sie sind über ein Claim Sheet
  abgesichert. Das gilt auch für die PDFs – sie werden unverändert hochgeladen.
- Die Schrift ist jetzt **Ebrima** (`font-family: ebrima, sans-serif`). Sie wird
  nicht eingebettet. Auf dem Mac erscheint die serifenlose Systemschrift – das
  ist richtig so, nicht „reparieren".
- Die Sprachumschalter EN / FR / IT haben absichtlich noch kein Ziel. Nicht
  selbst verlinken.
- Auf `/test/`: `<script>` unverändert übernehmen, Seite auf `noindex`,
  Inline-JavaScript von Cache-Plugins ausnehmen. Das Video-iframe im
  Cookie-Plugin nicht blockieren lassen.

Melde zurück: die aktualisierten Seiten mit IDs und URLs, die eingetragene
Video-Adresse, die vier PDF-Adressen, das Ergebnis jedes Abnahmepunkts und alles,
was nicht wie beschrieben funktioniert hat.

---
