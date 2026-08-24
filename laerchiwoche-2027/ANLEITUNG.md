# Lärchi-Trophy 2027 online stellen — Schritt für Schritt

Die Seite läuft ohne eigenen Server. Google Apps Script liefert sie aus, eine
Google-Tabelle speichert die Anmeldungen. Beides ist kostenlos und an dein
Google-Konto gebunden.

**Zeitaufwand:** etwa 15 Minuten. **Was du brauchst:** ein Google-Konto und die
beiden Dateien `Code.gs` und `Index.html` aus diesem Ordner.

---

## Vorbereitung: die beiden Dateien öffnen

Beide Dateien sind reiner Text, aber `Index.html` ist mit rund 450 KB groß —
sie enthält Logo und Foto fest eingebettet.

- **Nicht doppelklicken.** Sonst öffnet der Browser die Seite, statt den Text zu zeigen.
- Stattdessen: **Rechtsklick → Öffnen mit → Editor** (Windows) bzw.
  **TextEdit** (Mac). Unter macOS ggf. Rechtsklick → *Öffnen mit* → *Andere* →
  TextEdit und dort *Alle Programme* auswählen.
- Im Editor **Strg + A** (Mac: **Cmd + A**) und **Strg + C** (Cmd + C) — damit
  hast du den kompletten Inhalt in der Zwischenablage.

Falls dein Editor bei der großen Datei ins Stocken gerät: Notepad++ (Windows)
oder BBEdit/VS Code kommen problemlos damit zurecht.

---

## Schritt 1 — Google-Tabelle anlegen

1. [sheets.new](https://sheets.new) im Browser öffnen. Es entsteht eine leere Tabelle.
2. Oben links den Namen vergeben, z. B. **Lärchi-Trophy 2027**.

Das Tabellenblatt für die Anmeldungen legt das Skript später selbst an — hier
musst du nichts vorbereiten.

---

## Schritt 2 — Apps Script öffnen

In der Tabelle: **Erweiterungen → Apps Script**.

Es öffnet sich ein neuer Tab mit dem Skript-Editor. Links siehst du unter
*Dateien* eine Datei namens `Code.gs` mit einer leeren Beispielfunktion.

Oben links kannst du dem Projekt einen Namen geben (auf *Unbenanntes Projekt*
klicken) — etwa **Lärchi-Trophy 2027**.

---

## Schritt 3 — `Code.gs` einfügen

1. Im Editor in die Datei `Code.gs` klicken.
2. **Alles markieren und löschen** (Strg/Cmd + A, dann Entf).
3. Den Inhalt unserer Datei `Code.gs` einfügen (Strg/Cmd + V).
4. **Speichern** mit Strg/Cmd + S oder dem Disketten-Symbol.

**Prüfen:** ganz oben in Zeile 15 steht das Passwort für den Organisator-Bereich:

```js
var ADMIN_PASSWORT = 'banfhold15';
```

Wenn du ein anderes willst, ändere es jetzt — und speichere erneut.

---

## Schritt 4 — die HTML-Datei anlegen

Das ist der Schritt, bei dem am häufigsten etwas schiefgeht. Der Name muss
**exakt** stimmen.

1. Links neben *Dateien* auf das **+** klicken → **HTML** wählen.
2. Als Name **`Index`** eingeben — **großes I, kein `.html` anhängen.**
   Apps Script ergänzt die Endung selbst, in der Liste steht danach `Index.html`.
3. Die neue Datei enthält ein leeres HTML-Gerüst. **Alles markieren und löschen.**
4. Den Inhalt unserer `Index.html` einfügen. Bei der Größe kann der Editor ein
   paar Sekunden hängen — warten, nicht mehrfach einfügen.
5. **Speichern.**

> Warum `Index`? In `Code.gs` steht `HtmlService.createHtmlOutputFromFile('Index')`.
> Heißt die Datei anders, findet das Skript sie nicht und die Seite bleibt leer.

---

## Schritt 5 — bereitstellen

1. Oben rechts auf **Bereitstellen → Neue Bereitstellung**.
2. Links neben *Typ auswählen* auf das **Zahnrad** klicken → **Web-App**.
3. Die Felder ausfüllen:

   | Feld | Einstellung |
   |---|---|
   | Beschreibung | z. B. `Version 1` (frei wählbar) |
   | Ausführen als | **Ich (deine@adresse)** |
   | Zugriff | **Jeder** |

   **„Jeder“ ist wichtig.** Bei *Jeder mit Google-Konto* müssten sich alle
   Teilnehmer erst bei Google anmelden. Bei *Jeder* genügt der Link.

   Keine Sorge: „Ausführen als: Ich“ heißt nur, dass das Skript mit deinen
   Rechten in **deine** Tabelle schreibt. Niemand bekommt dadurch Zugriff auf
   dein Google-Konto oder deine anderen Dateien.

4. Auf **Bereitstellen** klicken.

---

## Schritt 6 — einmalig autorisieren

Beim ersten Mal fragt Google nach Berechtigungen:

1. **Zugriff autorisieren** → dein Google-Konto wählen.
2. Es erscheint **„Google hat diese App nicht überprüft“**. Das ist normal — die
   App bist du selbst, sie wurde nie bei Google zur Prüfung eingereicht.
3. Unten links auf **Erweitert** klicken.
4. Auf **Zu „Lärchi-Trophy 2027“ (unsicher) wechseln** klicken.
5. **Zulassen**.

---

## Schritt 7 — den Link holen und testen

Nach dem Bereitstellen zeigt Google die **Web-App-URL**. Sie sieht so aus:

```
https://script.google.com/macros/s/AKfycb…sehr-lang…/exec
```

Das ist der öffentliche Link. Kopieren und aufbewahren.

> Die Adresse muss auf **`/exec`** enden. Eine URL mit `/dev` am Ende ist nur
> für dich sichtbar und funktioniert für andere nicht.

**Jetzt testen:**

1. Link öffnen — am besten in einem **privaten Fenster** (Inkognito), damit du
   siehst, was ein Gast sieht.
2. *Jetzt anmelden* → Vorname, Nachname, Handicap, Heimatclub eintragen →
   abschicken. Du bekommst Referenznummer und Zugangscode.
3. Zurück in die Google-Tabelle wechseln: dort ist jetzt ein Blatt
   **„Anmeldungen“** mit deiner Zeile.
4. Auf der Seite die Golfplätze wählen und speichern → in der Tabelle füllen
   sich die sieben Tages-Spalten mit `9` bzw. `18`.
5. *Live-Ansicht* öffnen → die Zeile steht in der Übersicht.
6. Fußzeile → *Organisation* → Passwort eingeben → Teilnehmerliste, Codes,
   Löschen und CSV-Export prüfen.

Danach kannst du die Testanmeldung im Organisator-Bereich wieder löschen.

---

## Schritt 8 — Link verteilen

Den `/exec`-Link kannst du per WhatsApp, Mail oder QR-Code weitergeben. Wer ihn
öffnet, braucht **kein** Google-Konto.

Die Seite merkt sich im Browser, wer angemeldet ist. Auf einem neuen Gerät
meldet man sich mit Namen und dem 6-stelligen Zugangscode wieder an. Wer den
Code vergisst, findet ihn bei dir im Organisator-Bereich.

---

## Später etwas ändern

Änderst du `Code.gs` oder `Index.html`, wird das **nicht automatisch** online
sichtbar. Du musst eine neue Version bereitstellen:

1. **Bereitstellen → Bereitstellungen verwalten**
2. Beim vorhandenen Eintrag rechts auf das **Stift-Symbol** (Bearbeiten)
3. Bei *Version* auf **Neue Version** umstellen
4. **Bereitstellen**

**Die Adresse bleibt dabei gleich** — bereits verteilte Links funktionieren weiter.

> Häufiger Fehler: statt *Bereitstellungen verwalten* wird *Neue Bereitstellung*
> gewählt. Das erzeugt eine **zweite** Web-App mit einer **anderen** Adresse,
> während der alte Link auf dem alten Stand stehen bleibt.

---

## Wenn etwas nicht klappt

| Problem | Ursache und Lösung |
|---|---|
| Seite bleibt weiß | Die HTML-Datei heißt nicht exakt `Index`. Umbenennen (Rechtsklick auf die Datei → *Umbenennen*). |
| „Script function not found: doGet“ | Beim Bereitstellen war der Typ nicht **Web-App**. Neu bereitstellen und über das Zahnrad *Web-App* wählen. |
| „Sie benötigen die Berechtigung, um auf diese Datei zuzugreifen“ | *Zugriff* steht nicht auf **Jeder**. Unter *Bereitstellungen verwalten* bearbeiten und umstellen. |
| Änderungen sind nicht sichtbar | Keine neue Version bereitgestellt — siehe Abschnitt oben. Notfalls den Browser-Cache mit Strg + F5 umgehen. |
| Anmeldung schlägt fehl, Tabelle bleibt leer | Im Skript-Editor einmal die Funktion `setup` ausführen (oben Funktion auswählen → *Ausführen*). Sie legt das Blatt „Anmeldungen“ mit den Spaltenüberschriften an. |
| Statt des Handicaps steht ein Datum oder eine Zeitzone da | Google Tabellen hat Werte wie `5.5` als 5. Mai gelesen. Einmal die Funktion `setup` ausführen — sie rechnet betroffene Zellen zurück und stellt die Spalte auf Text. |
| Beim Einfügen hängt der Editor | Die Datei ist groß. Einmal einfügen, warten, nicht abbrechen. Notfalls Browser-Tab schließen, Apps Script neu öffnen und noch einmal versuchen. |

---

## Gut zu wissen

- **Die Tabelle ist die Wahrheit.** Alles, was auf der Seite passiert, landet im
  Blatt „Anmeldungen“. Du kannst dort auch von Hand korrigieren — nur die
  Spaltenüberschriften und die Spalte `ID` bitte in Ruhe lassen.
- **Sichtbarkeit:** Die Tabelle selbst bleibt privat. Die Teilnehmer sehen nur
  das, was die Seite anzeigt — Zugangscodes gibt die öffentliche Ansicht nie heraus.
- **Sicherung:** vor der Reise einmal *Datei → Herunterladen → Excel* in der
  Tabelle, oder im Organisator-Bereich auf *CSV exportieren*.
- **Grenzen:** Apps Script erlaubt bei einem normalen Google-Konto reichlich
  Aufrufe für eine Gruppe dieser Größe. Gleichzeitige Anmeldungen sind
  abgesichert, es kann keine Zeile überschrieben werden.
