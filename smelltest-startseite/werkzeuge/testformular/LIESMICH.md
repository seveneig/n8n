# Ausfüllbares Testformular erzeugen

Inhalt wie «WIP Smell-QMS Olfaction_Test Formular D 261007», Layout neu auf A4-Raster.
Texte, Bilder und Dokumentnummer werden in `formular.py` gepflegt.

```sh
python3 -I werkzeuge/testformular/formular.py      /tmp/formular.html
node       werkzeuge/testformular/drucken.mjs      /tmp/formular.html /tmp/layout.pdf /tmp/felder.json
python3 -I werkzeuge/testformular/felder_setzen.py /tmp/layout.pdf /tmp/felder.json downloads/SMELL_Olfaction_Test_Formular_D_ausfuellbar.pdf
```

1. `formular.py` – HTML mit Ebrima. Zweites Argument `klinisch` erzeugt die Variante
   ohne Farbcode (Kennbuchstaben B/R/L); Standard ist `farbig` (Original-Farben).
   Ebrima (aus `/root/.fonts`, Einbettung in Dokumente lizenziert).
   Felder sind mit `data-feld` / `data-wert` markiert.
2. `drucken.mjs` – Chromium druckt das PDF und misst die Lage jedes Felds.
   Warnt, wenn der Inhalt eine Seite überläuft oder Ebrima fehlt.
3. `felder_setzen.py` – legt die Formularfelder an den gemessenen Stellen an
   (Optionsgruppen mit Kreuz, automatische Punktezählung, Datum vereinheitlichen).

Feldnamen (für Auswertungen stabil halten): `Name`, `Vorname`, `Geburtsdatum`,
`Diskette1_beide` … `Diskette8_links` (Wert = Bildname), `Getestet_beide|rechts|links` (Wert `Ja`),
`Punkte_beide|rechts|links`, `Pruefer_Name`, `Pruefer_Datum`.
