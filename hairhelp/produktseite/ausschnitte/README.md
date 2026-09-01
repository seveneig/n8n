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

## Im fremden Theme

Drei Dinge, die beim Einbau in Elementor auffielen und behoben sind:

* **Farben stehen ausdrücklich da, nicht geerbt.** Ein geerbter Wert verliert
  gegen jede Theme-Regel – die Regel des Themes auf `h2` färbte den zweiten
  Titelteil dunkel. Betroffen waren `h2`, `strong` und `li`.
* **Die Wurzelklasse steht doppelt** (`.hh-garantie.hh-garantie`). Das hebt die
  Spezifität über die üblichen Theme-Regeln, ohne dass irgendwo `!important`
  nötig wäre. Im Markup bleibt es eine einzige Klasse.
* **Nur die Hintergrundfarbe bricht aus der Spalte aus** und läuft über die
  volle Breite; der Inhalt bleibt in der Spalte. Das macht ein
  `::before`-Element mit `left:calc(50% - 50vw); width:100vw`. Läuft die Seite
  dadurch waagrecht über, braucht die Gastseite `overflow-x:hidden` am body –
  oder der Elementor-Container wird auf volle Breite gestellt.

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
aktiv, kein Querlauf, keine Kontrastbefunde, keine Konsolenfehler. Das Siegel
steht einspaltig mittig (gemessen: Bildmitte gleich Spaltenmitte).

Zusätzlich gegen eine Testseite geprüft, die eigene Regeln auf `h2`, `strong`
und `li` setzt und den Block in einen 700 px breiten Container legt: Titel und
Fettdruck bleiben hell, der Hintergrund misst die volle Fensterbreite, der
Inhalt bleibt in der Spalte, und es entsteht kein Querlauf.
