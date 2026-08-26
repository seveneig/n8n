# Resultate – fünf Entwurfsrichtungen

Entwürfe für den Abschnitt „Resultate" der Startseite, bevor einer davon
eingebaut wird. Alle fünf benutzen dieselben Aufnahmen und dieselben
deckungsgleich ausgerichteten Zuschnitte.

| Datei | Zweck |
| --- | --- |
| `build.py` | Baut `resultate-entwuerfe.html` aus CSS, JS und den Zuschnitten. |
| `entwuerfe.css` | Gestaltung aller fünf Richtungen, je Richtung ein eigener Block. |
| `entwuerfe.js` | Einzelregler und die durchlaufende Achse. |

Die Zuschnitte entstehen mit `../zuschnitt.py`; `build.py` erwartet sie im
Arbeitsordner der Sitzung. Wird eine Richtung gewählt, wandert ihr Block in
`../startseite.html` und dieser Ordner kann entfallen.

## Die fünf Richtungen

| | Name | Kern |
| --- | --- | --- |
| A | Die Achse | Ein Regler zieht über alle vier Aufnahmen; wo die Goldlinie vorbei ist, sind die Fasern aufgetragen. |
| B | Der Schnitt | Die Seite zerfällt in zwei Hälften in den Farben der beiden Studios; die Aufnahmen haben keine Fassung mehr. |
| C | Die Wand | Zwei Reihen ohne Bedienung: oben alle vier ohne Fasern und gedämpft, unten alle vier mit. |
| D | Die Kolonnade | Vier Bogenfenster auf einer Goldlinie, dazwischen ein höherer Pfeiler als Trennung. |
| E | Die Fallakte | Nummerierte Akten mit Kenndaten – der Ton einer Dokumentation. |

## Was in allen fünf gilt

* **Das Geschlecht trennt optisch**, weil es zugleich die beiden Studiogründe
  trennt: die hellen Aufnahmen gruppieren sich, die dunklen ebenso.
* **Auf schmalen Geräten** stapeln die Raster. Dann stimmen zwei
  nebeneinanderstehende Spaltenlabels nicht mehr – deshalb trägt dort jeder
  Fall sein Gruppenwort selbst.
* **Wer den Grund wechselt, nimmt die Farbtoken mit.** Der Studiogrund von
  Entwurf B und die Goldwaschung von Entwurf D sind dunkler als Weiss; dort
  ist das Textgold eine Stufe dunkler gesetzt, sonst fällt es unter 4.5:1.
* **Der vierte Fall ist noch nicht fotografiert.** Bis dahin steht dasselbe
  Bildpaar zweimal, gekennzeichnet mit „Platzhalter".
