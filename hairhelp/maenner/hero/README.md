# Auftakt der Männerseite mit Studiofoto

Neue Fassung der Auftaktsektion von `../maenner.html`. Statt des gerahmten
Hochformats (`.hero-media`, 4:5, Passepartout, Radius) liegt jetzt das
Studiofoto als Hintergrund über der ganzen Fläche – klassische
Hero-Struktur: Foto, darüber ein Schleier, darüber der Satz.

Bildaufbereitung in zwei Schritten, dann der Satz:

```
mann-hero-original.webp   wie geliefert, 2000 x 1116, mit Vignette
  → grund-glaetten.py  →  mann-hero.webp        1500 x 837, Grund überall #131410
  → breit-machen.py    →  mann-hero-breit.webp  2000 x 881, Mann rechts
  → build.py           →  die drei Dateien unten
```

| Endung | Zweck |
| --- | --- |
| `hero-mann.html` | Eigenständig, alles eingebettet – zum Ansehen. |
| `hero-mann.css` | Zum Einbau: Elementor → Website-Einstellungen → Benutzerdefiniertes CSS. |
| `hero-mann-widget.html` | Zum Einbau: ins HTML-Widget. |

```
python3 build.py
```

Wurzelklasse: `hh-auftakt`. Sie steht doppelt (`.hh-auftakt.hh-auftakt`), das
hebt die Spezifität über die üblichen Theme-Regeln, ohne dass `!important`
nötig wird. Im Markup bleibt es eine einzige Klasse.

## Der Schleier hat die Farbe des Fotos

Abgedunkelt wird nicht mit einem fremden Schwarz, sondern mit genau dem Ton,
den der Studiogrund des Fotos schon trägt. Der Schleier verstärkt den Grund,
statt ihn zu überdecken – links, wo der Satz steht, dicht; rechts, wo der
Mann steht, licht. Fläche, Schleier und Foto laufen dadurch ineinander, es
gibt keine sichtbare Kante zwischen ihnen.

Woher der Ton kommt:

1. **Gemessen.** Der Studiogrund des Fotos wurde über die personenfreien
   Randspalten ausgemessen: Median `#131410`, 577'530 Bildpunkte.
2. **Geglättet.** Das Original trug eine deutliche Vignette – Ecken `#0f100f`,
   Mitte `#171713`, acht Stufen Unterschied. `grund-glaetten.py` schätzt das
   Grundfeld über ein Raster, wäscht die Lücken hinter der Person aus den
   Rändern ein und zieht die Abweichung ab, gewichtet nach Dunkelheit. Danach
   liegt die Streuung bei 1,8 Stufen – unter der Sichtbarkeitsschwelle.
3. **Übernommen.** `--auftakt-grund:#131410` trägt Fläche und Schleier.

## Das Bild wird nach links verbreitert

Als Hintergrund über die ganze Fläche stünde der Mann in der Mitte – also
genau unter der Schrift. `breit-machen.py` setzt darum links Grund an.

Angesetzt wird kein Farbklecks, sondern die **gespiegelte linke Randspalte
des Fotos selbst**: an der Spiegelachse ist der Verlauf stetig, und die
Körnung des Films läuft mit. Eine glatt gefüllte Fläche würde sich daneben
durch ihre fehlende Körnung verraten. Nachgemessen an der Nahtstelle:
`#131412` links davon wie rechts davon.

Danach steht der Mann bei 46,0 – 78,3 % der Bildbreite (vorher 31,6 – 72,6 %),
Kopfoberkante bei 5,6 %.

`mann-hero-breit.webp`, 2000 × 881, 51 KB. Für den Einbau in die Mediathek
laden; das Widget erwartet sie unter
`/wp-content/uploads/hairhelp/mann-hero-breit.webp` (Adresse im Markup
anpassen, falls sie abweicht).

## Der Ausschnitt

* **Ab 1281 px** zeigt `object-position:0%` den linken Bildteil – dort liegt
  der angesetzte Grund, und der Mann rückt dadurch nach rechts, aus dem
  Satzspiegel heraus.
* **Unter 1281 px** wird der Ausschnitt schmaler als der angesetzte Grund;
  `object-position` rückt darum auf 62 % ins Foto hinein, damit sein Gesicht
  sichtbar bleibt.
* **Unter 901 px** steht der Satz über dem ganzen Bild statt daneben. Der
  Schleier wird dort gleichmässig statt seitlich verlaufend – ein Verlauf
  würde je nach Textlänge mitten im Gesicht liegen.

## Wie stark abgedunkelt wird

Die Deckung ist nicht geschätzt, sondern aus der Lesbarkeit zurückgerechnet
und danach nachgemessen. Massgebend ist die Augenbraue: kleines Gold
(`#A39772`) auf der hellsten Stelle des Fotos. Bei einem Wangenwert von 200
braucht es Deckung 0,87, damit 5:1 stehen bleibt – daher rund 0,9 im
einspaltigen Fall. Der Mann bleibt darunter als Gestalt erkennbar, sein
Shirt hebt sich mit 35 gegen 19 vom Grund ab.

## Geprüft

Gemessen über 15 Fensterbreiten von 320 bis 1920 px, jeweils mit dem Satz
unsichtbar geschaltet, damit unter jeder Zeile der tatsächliche Grund
sichtbar wird:

* **Kontrast je Textzeile.** Für jeden einzelnen Zeilenkasten (über
  `Range.getClientRects`, nicht über den Blockkasten) wurde der **hellste**
  Bildpunkt darunter gesucht und gegen die berechnete Textfarbe gestellt.
  Schlechtester Wert über alle Breiten: **5,47:1** – überall über 4,5:1.
* **Kein Querlauf** in keiner Breite.
* Der Knopf bringt seinen eigenen deckenden Grund mit und liegt nie auf dem
  Foto; separat gerechnet trägt er 6,00:1 (`#1A1A18` auf `#A39772`).

## Im fremden Theme

Geprüft gegen eine Testseite, die eigene Regeln auf `section`, `h1`, `p`, `a`,
`img`, `figure` und `svg` setzt und den Block in einen Elementor-Container
legt. Zwei Befunde, beide behoben:

* **Die Theme-Schrift schlug bei `h1` durch.** Der Block setzt Jost auf der
  Wurzel, vererbt wird sie aber nicht mehr, sobald das Theme `h1{font-family:…}`
  schreibt. Deshalb steht jetzt `.hh-auftakt.hh-auftakt *{font-family:inherit}`.
* **Die Symbole wuchsen zu schwarzen Riesenflächen** – dieselbe Erscheinung wie
  beim WP-Rocket-Vorfall an der Produktseite. Dort war die Ursache das
  entfernte Stylesheet; hier genügte schon eine Theme-Regel `svg{width:100%;
  fill:#000}`. **Attribute allein reichen dagegen nicht**: `width="15"` steht
  in der Rangfolge unter jeder CSS-Regel. Masse und Fülle stehen darum
  zusätzlich im `style`-Attribut, das über allen Regeln steht. Die Farbe kommt
  über `color`, weil das Attribut `stroke:currentColor` setzt – so bleibt das
  Gold über die Token steuerbar.

Ohne Stylesheet (WP Rocket entfernt es) bleibt ein schlichter, lesbarer Block
stehen: Foto, Überschrift, Text, Verweis und kleine Strichsymbole. Deshalb
setzt das Markup den dunklen Grund auch nicht per `style`-Attribut – ohne
Stylesheet wäre die Schrift des Themes darauf nicht mehr lesbar.

### In WP Rocket

* **Werkzeuge → Gespeichertes CSS leeren.**
* **Datei-Optimierung → Ungenutztes CSS entfernen → CSS-Sicherheitsliste:**
  `hh-auftakt` eintragen.

## Volle Breite

Anders als bei den Ausschnitten der Produktseite bricht hier **der ganze
Abschnitt** aus der Spalte aus (`margin-left/right:calc(50% - 50vw)`), nicht
nur die Hintergrundfarbe – das Foto muss bis an den Bildschirmrand reichen.
Läuft die Seite dadurch waagrecht über, braucht die Gastseite
`overflow-x:hidden` am body, oder der Elementor-Container wird auf volle
Breite gestellt.

## Gekapselt

Alles liegt unter `.hh-auftakt`. Keine Regel auf `body`, `*` oder `:root`,
kein Skript. Die Dokumentsprache steht als `lang="de"` am Abschnitt selbst –
ein Schnipsel hat kein `<html>`-Element, und ein Skript würde die Sprache der
Gastseite überschreiben.

## Text

Der Fliesstext im Vorspann ist gegenüber `../maenner.html` um einen Satzteil
gekürzt („Haarausfall verändert das Erscheinungsbild und kann am
Selbstbewusstsein nagen" und „oder über radikale Schritte nachdenken"), damit
die Spalte neben dem Foto nicht zu lang wird. Inhalt und Aussage bleiben
gleich.
