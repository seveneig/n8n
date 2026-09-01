# Ausschnitte aus der Produktseite

Einzelne Abschnitte, aus `../produktseite.html` herausgelöst und für sich
lauffähig gemacht.

| Datei | Zweck |
| --- | --- |
| `build.py` | Löst den Garantie-Abschnitt heraus und bettet alles Nötige ein. |
| `garantie-ohne-risiko.html` | Ergebnis: „Ohne Risiko / Ihre 30-Tage-Sorglos-Garantie". |

```
python3 build.py
```

## Was die Datei enthält

Schrift (Jost, 10 Schnitte), alle Farbtoken, sämtliche benutzten Regeln und
das Siegelbild sind eingebettet. Die Datei braucht keinen Netzwerkzugriff –
im Test werden null externe Adressen abgerufen.

## Gekapselt

Alles liegt unter `.hh-garantie`. Es gibt keine Regel auf `body`, `*` oder
`:root`, und kein Skript. Der Block lässt sich damit unverändert in ein
HTML-Widget einsetzen, ohne die Gastseite zu verändern; geprüft ist das
gegen eine Testseite mit eigener Schrift, Schriftgrösse und `box-sizing`
(Hintergrund, Schrift, Grössen und Kastenmasse bleiben unverändert).

Die Dokumentsprache steht als `lang="de"` am Abschnitt selbst – ein Schnipsel
hat kein `<html>`-Element, und ein Skript würde die Sprache der Gastseite
überschreiben.

## Geprüft

Hell, dunkel und auf 390 px: Bild geladen, Alternativtext vorhanden, Jost
aktiv, kein Querlauf, keine Kontrastbefunde, keine Konsolenfehler.
