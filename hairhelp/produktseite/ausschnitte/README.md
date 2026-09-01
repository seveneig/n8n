# Ausschnitte aus der Produktseite

Einzelne Abschnitte, aus `../produktseite.html` herausgelöst und für sich
lauffähig gemacht.

`build.py` erzeugt je Abschnitt drei Dateien:

| Endung | Zweck |
| --- | --- |
| `.html` | Eigenständig, alles eingebettet – zum Ansehen und Archivieren. |
| `.css` | Zum Einbau: unter Elementor → Website-Einstellungen → Benutzerdefiniertes CSS. |
| `-widget.html` | Zum Einbau: ins HTML-Widget. |

| Abschnitt | Wurzelklasse | Band |
| --- | --- | --- |
| `garantie-ohne-risiko` | `hh-garantie` | schwarz |
| `kundengeschichte-barbara` | `hh-stimme` | creme |
| `haeufige-fragen` | `hh-faq` | weiss |
| `schlussaufruf` | `hh-schluss` | Foto mit Verlauf |

Jeder Abschnitt hat eine **eigene** Wurzelklasse. Es lassen sich also
beliebig viele davon auf derselben Seite einsetzen, ohne dass sie sich in die
Quere kommen. Die Stylesheets können hintereinander in dasselbe
Benutzerdefinierte CSS.

```
python3 build.py
```

## Was die Datei enthält

Schrift (Jost, 10 Schnitte), alle Farbtoken, sämtliche benutzten Regeln und
das Siegelbild sind eingebettet. Die Datei braucht keinen Netzwerkzugriff –
im Test werden null externe Adressen abgerufen.

## Warum es zerlegt ist: WP Rocket

Die erste Fassung war eine einzige Datei mit `<style>`-Block. Im
Elementor-Editor sah sie richtig aus, auf der Live-Seite nicht: weisser Grund,
dunkle Schrift, und die Symbole wuchsen als schwarze Flächen über die ganze
Spaltenbreite. Ursache war **WP Rocket mit „Ungenutztes CSS entfernen"** – der
Block wurde weggeräumt.

Dass ausgerechnet die Symbole so auffällig kaputtgingen, liegt daran, dass ihre
Grösse (`20 × 20`) und ihre Strichdarstellung (`fill:none`) nur aus dem
Stylesheet kamen. Ohne CSS ist ein SVG so gross wie sein Container und
schwarz gefüllt.

**Drei Konsequenzen:**

1. **Getrennte Dateien.** Das Stylesheet gehört unter Elementor →
   Website-Einstellungen → Benutzerdefiniertes CSS, nicht in das Widget.
2. **Schrift und Bild fallen weg.** Die eigenständige Datei schleppt 284 KB
   Schrift und ein 121 KB grosses Siegelbild mit sich. Die Website hat beides
   längst: Jost ist ihre Hausschrift, das Siegel liegt in der Mediathek. Damit
   schrumpft der Einbau von 417 KB auf 6,3 KB CSS und 2,5 KB Markup.
3. **Die Symbole tragen ihre Masse jetzt als Attribut** (`width`, `height`,
   `fill="none"`, `stroke="currentColor"`). Attribute stehen unter jeder
   CSS-Regel, ändern also nichts, solange das Stylesheet greift. Fällt es
   wieder einmal weg, bleibt eine schlichte, lesbare Liste stehen statt eines
   schwarzen Klotzes.

### In WP Rocket

* **Werkzeuge → Gespeichertes CSS leeren**, sonst wird weiter das alte
  „benutzte CSS" ausgeliefert, das die neuen Regeln nicht kennt.
* **Datei-Optimierung → Ungenutztes CSS entfernen → CSS-Sicherheitsliste:**
  `hh-garantie` eintragen. Dann lässt Rocket die Regeln in Ruhe, auch bei
  jeder späteren Analyse.

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
* **Beim Schlussaufruf bricht der ganze Abschnitt aus**, nicht nur die Farbe:
  sein Grund ist ein Foto mit Verlauf, das mitlaufen muss. Dort steht darum
  `margin-left/right:calc(50% - 50vw)` am Abschnitt selbst.
* **Auf hellem Band gilt das dunklere Textgold.** Das helle Gold trägt dort
  nur 2.9:1. Betrifft die Kundengeschichte und die häufigen Fragen.

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

Jeder Abschnitt eigenständig: Bilder geladen, Alternativtexte vorhanden, Jost
aktiv, keine externen Abrufe, kein Querlauf, keine Konsolenfehler. Beim
Garantie-Abschnitt steht das Siegel einspaltig mittig (gemessen: Bildmitte
gleich Spaltenmitte).

Jeder Abschnitt zusätzlich gegen eine Testseite geprüft, die eigene Regeln auf
`h2`, `h3`, `h4`, `strong`, `b`, `p`, `li` und `summary` setzt und den Block in
einen 900 px breiten Container legt: keine Kontrastbefunde, kein Querlauf, die
Gastseite bleibt in Schrift und Kastenmassen unverändert.
