# Bilder für die Lärchi-Trophy-Seite

Hier kommen Logo und Fotos hinein. Ich lese die Dateien aus diesem Ordner und
baue sie **fest in `Index.html` ein** (als eingebettete Daten). Damit bleibt die
Seite in einer Datei, funktioniert ohne Internet-Zugriff auf fremde Server und
läuft unverändert in Google Apps Script — unabhängig davon, ob dieses Repo
öffentlich oder privat ist.

## Hochladen

Auf GitHub in diesem Ordner: **Add file → Upload files** — oder direkt

<https://github.com/seveneig/n8n/upload/claude/laerchenhof-golf-registration-wpf94f/laerchiwoche-2027/assets>

Wichtig: als Branch `claude/laerchenhof-golf-registration-wpf94f` auswählen
(ist über den Link schon voreingestellt), **nicht** `master`.

## Erwartete Dateinamen

Bitte genau so benennen, dann finde ich sie ohne Rückfrage:

| Datei | Wofür | Format |
|---|---|---|
| `logo-weiss.png` | Kopfzeile und Fußzeile (dunkler Hintergrund) | PNG mit Transparenz |
| `logo-gold.png` | helle Flächen, Druck, Reserve | PNG mit Transparenz |
| `hero.jpg` | großes Bild im Kopfbereich der Startseite | JPG, quer, mind. 1600 px breit |
| `platz-d1.jpg` … `platz-d7.jpg` | *optional* je ein Foto pro Golfplatz (d1 = Sonntag … d7 = Samstag) | JPG, quer |
| `hotel.jpg` | *optional* Bild vom Lärchenhof | JPG, quer |

Nichts davon ist Pflicht — lade hoch, was du hast. Solange `logo-weiss.png`
fehlt, steht im Kopf der SVG-Nachbau des Wappens.

## Größen

- **Logos:** beliebig groß, je schärfer desto besser. Ideal wäre zusätzlich
  eine **SVG-Datei** (`logo.svg`) — die bleibt in jeder Größe gestochen scharf
  und ist nur ein paar Kilobyte groß.
- **Fotos:** höchstens ca. **2000 px** breit und **500 KB** pro Bild. Größere
  rechne ich herunter; die Seite wird sonst unnötig schwer, weil die Bilder
  fest eingebettet werden.

## Danach

Kurz Bescheid geben. Ich binde die Dateien ein, prüfe das Ergebnis im Browser
auf hellem und dunklem Design und schiebe die fertige `Index.html` auf den Branch.
