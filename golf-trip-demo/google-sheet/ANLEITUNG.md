# 📋 Anleitung: Anmeldungen in einer Google-Tabelle (Option 2)

Damit landen **alle Anmeldungen zentral in einer Google-Tabelle**, die du von
Handy und PC überall öffnen kannst – und die Seite behält ihr Design. Du brauchst
nur ein **Google-Konto** und ca. **10 Minuten**. Kein Programmieren – nur klicken
und zweimal Text einfügen.

> Am Ende bekommst du **eine Internet-Adresse (Link)**. Genau dieser Link steckt im
> QR-Code. Wer ihn scannt, kommt aufs Anmeldeformular; jede Anmeldung erscheint als
> neue Zeile in deiner Tabelle.

---

## Schritt 1 – Google-Tabelle anlegen

1. Öffne **https://sheets.new** (oder Google Drive → Neu → Google Tabellen).
2. Gib der Tabelle oben links einen Namen, z. B. **„Seniorenreise 2027 – Anmeldungen"**.

*(Ein Tabellenblatt „Anmeldungen" mit Überschriften wird später automatisch angelegt –
du musst nichts vorbereiten.)*

## Schritt 2 – Apps Script öffnen

1. In der Tabelle im Menü auf **Erweiterungen → Apps Script** klicken.
2. Es öffnet sich ein neuer Tab (der „Code-Editor"). Dort ist links eine Datei
   **`Code.gs`** mit ein bisschen Beispielcode.

## Schritt 3 – Backend-Code einfügen (`Code.gs`)

1. Markiere im Editor **den gesamten** vorhandenen Inhalt von `Code.gs` und lösche ihn.
2. Öffne in diesem Projekt die Datei **`google-sheet/Code.gs`**, kopiere ihren
   **kompletten** Inhalt und füge ihn in den Editor ein.
3. 💾 Speichern (Disketten-Symbol oder Strg/Cmd + S).

## Schritt 4 – Die Seite als HTML-Datei einfügen (`Index`)

1. Im Editor oben neben „Dateien" auf das **`+`** klicken → **HTML** wählen.
2. Als Namen exakt **`Index`** eingeben (ohne „.html", genau so geschrieben).
3. Den vorgeschlagenen Inhalt der neuen Datei **komplett löschen**.
4. Öffne in diesem Projekt die Datei **`google-sheet/Index.html`**, kopiere ihren
   **kompletten** Inhalt und füge ihn in die Datei `Index` ein.
   *(Die Datei ist groß – das Einfügen kann einen Moment dauern, das ist normal.)*
5. 💾 Speichern.

## Schritt 5 – Veröffentlichen (Deploy)

1. Oben rechts auf **Bereitstellen → Neue Bereitstellung**.
2. Beim Zahnrad neben „Bereitstellungstyp" **Web-App** auswählen.
3. Einstellungen:
   - **Ausführen als:** *Ich* (dein Konto)
   - **Wer hat Zugriff:** **Jeder** (damit Teilnehmer ohne Google-Login anmelden können)
4. Auf **Bereitstellen** klicken.

## Schritt 6 – Einmalig autorisieren

Beim ersten Mal fragt Google nach der Erlaubnis (weil das Skript in deine Tabelle
schreiben darf):

1. **Zugriff autorisieren** → dein Google-Konto wählen.
2. Falls „Google hat diese App nicht überprüft" erscheint:
   **Erweitert → „Zu … (unsicher)" wechseln → Zulassen.**
   *(Das ist dein eigenes Skript – das ist in Ordnung.)*

## Schritt 7 – Deinen Link kopieren

Nach dem Bereitstellen zeigt Google eine **Web-App-URL** an
(sie sieht so aus: `https://script.google.com/macros/s/…/exec`).

👉 **Diese URL ist deine öffentliche Adresse.** Kopiere sie.

- **Startseite / QR-Aushang:** einfach die URL öffnen.
- **QR-Code:** wird auf der Startseite **automatisch** erzeugt und zeigt aufs Formular –
  du kannst die Startseite ausdrucken/aushängen oder den Link weitergeben.

## Schritt 8 – Testen ✅

1. Öffne die URL, klicke **„Jetzt anmelden"**, fülle das Formular aus und sende es ab.
2. Schau in deine **Google-Tabelle** → im Blatt **„Anmeldungen"** steht eine neue Zeile. 🎉
3. **Organisator-Dashboard** (mit Löschen): oben rechts **„Organisator-Dashboard →"**
   klicken oder die URL mit `?p=admin` am Ende öffnen, dann Passwort **`2512`** eingeben.
4. **Nur ansehen** (für alle, ohne Löschen): Button **„Anmeldungen ansehen"**.

---

## Gut zu wissen

- **Passwort ändern:** in `Code.gs` ganz oben die Zeile `var ADMIN_PW = '2512';`
  auf dein Wunschpasswort ändern, speichern – und wie unten beschrieben neu bereitstellen.
- **Nach Änderungen am Code neu veröffentlichen:** *Bereitstellen → Bereitstellungen
  verwalten → (Stift/Bearbeiten) → Version: „Neue Version" → Bereitstellen.*
  Nur dann werden Änderungen live. **Die URL bleibt dabei gleich.**
- **Daten ansehen/bearbeiten:** Du kannst jederzeit direkt in der Google-Tabelle
  arbeiten (z. B. sortieren, filtern, eine Spalte ergänzen). Lösche aber nicht die
  Kopfzeile und nicht die letzte Spalte „ID".
- **Wer kann was:** Jeder mit dem Link kann sich anmelden und die Liste ansehen
  (so ist „Anmeldungen ansehen" gedacht). **Löschen** geht nur mit dem Passwort.
  Für eine kleine Vereinsreise ist das passend; es ist kein Hochsicherheits-Login.

## Wenn etwas klemmt

- **„Skript nicht autorisiert" / Fehler beim Absenden:** Schritt 6 (Autorisieren)
  wurde übersprungen – Bereitstellung noch einmal öffnen und autorisieren.
- **QR zeigt „erscheint nach der Veröffentlichung":** Die Seite wurde nicht über die
  `…/exec`-Web-App-URL geöffnet. Immer die Web-App-URL aus Schritt 7 verwenden.
- **Änderungen sind nicht sichtbar:** Du hast gespeichert, aber nicht **neu bereitgestellt**
  (siehe „Nach Änderungen neu veröffentlichen").

Wenn du möchtest, gehe ich die Schritte gern mit dir zusammen durch.
