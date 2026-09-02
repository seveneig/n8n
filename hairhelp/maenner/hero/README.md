# Auftakt der Männerseite mit Studiofoto

Neue Fassung der Auftaktsektion von `../maenner.html`. Statt des gerahmten
Hochformats (`.hero-media`, 4:5, Passepartout, Radius) steht jetzt das
Studiofoto des lächelnden Mannes – randlos, ohne Fassung.

`grund-glaetten.py` erzeugt `mann-hero.webp` aus `mann-hero-original.webp`.
`build.py` erzeugt daraus drei Dateien:

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

## Der Grundgedanke: eine einzige Oberfläche

Gewünscht war, dass der Hintergrund der Herofläche mit dem des Fotos
übereinstimmt. Erreicht ist das nicht durch Angleichen, sondern dadurch, dass
es dieselbe Farbe ist:

1. **Gemessen.** Der Studiogrund des Fotos wurde über die personenfreien
   Randspalten ausgemessen: Median `#131410`, 577'530 Bildpunkte.
2. **Geglättet.** Das Original trug eine deutliche Vignette – Ecken `#0f100f`,
   Mitte `#171713`, acht Stufen Unterschied. `grund-glaetten.py` schätzt das
   Grundfeld über ein Raster, wäscht die Lücken hinter der Person aus den
   Rändern ein und zieht die Abweichung ab, gewichtet nach Dunkelheit. Danach
   liegt die Streuung bei 1,8 Stufen – unter der Sichtbarkeitsschwelle.
3. **Übernommen.** `--auftakt-grund:#131410` trägt die Fläche.

Foto und Fläche sind damit dieselbe Oberfläche. Es gibt keine Bildkante,
keinen Rahmen und keinen Radius; der Mann steht direkt auf der Seite.

Zwei kurze Verläufe in genau dieser Farbe lösen die verbliebenen Kanten auf:
links die Bildkante (sie überdeckt nur den leeren Teil des Fotos – die Person
beginnt erst bei rund 35 % der Bildbreite), unten den Übergang, damit der
Oberkörper weich ausläuft, statt an der Abschnittskante abgeschnitten zu
werden.

## Das Bild

`mann-hero.webp`, 1500 × 837, 51 KB. Erzeugt aus dem gelieferten Foto
(2000 × 1116) mit `grund-glaetten.py`.

Für den Einbau in die Mediathek laden; das Widget erwartet sie unter
`/wp-content/uploads/hairhelp/mann-hero.webp` (Adresse im Markup anpassen,
falls sie abweicht).

## Der Ausschnitt

Der Mann steht im Foto bei 31,6 – 72,6 % der Breite, Kopfoberkante bei 5,5 %
der Höhe. Daraus ergibt sich die Platzierung:

* **Ab 1181 px** liegt das Foto rechts hinter dem Satz, `width:min(82%,1240px)`,
  `object-position:0%`. Der Nullwert zeigt den linken Bildteil und rückt den
  Mann dadurch nach rechts, aus dem Satzspiegel heraus.
* **Unter 1181 px** steht das Foto über dem Satz. Je schmaler das Fenster,
  desto hochformatiger der Ausschnitt (16:10 → 3:2 → 1:1), damit der Mann
  gross genug bleibt, statt in der Breite zu verschwinden.
* **Ab 1400 px abwärts** gibt der Satz Breite ab (52 % → 48 %), damit die
  Schulter frei bleibt.

## Geprüft

Gemessen über 17 Fensterbreiten von 320 bis 1920 px:

* **Kein Querlauf** in keiner Breite.
* **Keine Kante.** Die hellste Stelle an allen vier Rändern des Abschnitts
  liegt bei Helligkeit 19 – 26 (der Grund selbst liegt bei 19). Die Person
  wird also nirgends angeschnitten, oben, unten oder seitlich.
* **Kein Text über dem Bild.** Für jede einzelne Textzeile (über
  `Range.getClientRects`, nicht über den Blockkasten) wurde der Grund
  darunter gemessen: höchstens 27,4 statt 19. Der Satz liegt überall auf der
  ruhigen Fläche.
* **Kontrast** auf `#131410`: Titel 16,25:1 · Vorspann 9,97:1 · Fliesstext
  8,04:1 · Augenbraue 6,37:1 · Knopfschrift auf Gold 6,00:1. Alles über
  4,5:1, auch im dunklen Erscheinungsbild.

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
