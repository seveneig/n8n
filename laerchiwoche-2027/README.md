# Lärchi-Trophy 2027 · Golfplanung

Anmelde- und Planungsseite für die Lärchiwoche **17. – 24. Juli 2027**
(Samstag bis Samstag) im Hotel **Der Lärchenhof**, Erpfendorf (Tirol).
Gespielt wird von Sonntag, 18., bis Samstag, 24. Juli.

Teilnehmer melden sich einmalig an und tragen sich anschließend für die sieben
Golfplätze der Woche ein — je Tag wahlweise **9 oder 18 Loch**. Wer wann wo
spielt, ist in einer **öffentlichen Live-Ansicht** für alle sichtbar. Bearbeiten
kann die eigene Auswahl nur, wem sie gehört (persönlicher Zugangscode).

---

## Dateien

| Datei | Zweck |
|---|---|
| `Index.html` | Die komplette Web-App — eine Datei, alles inline (CSS + JS), keine externen Abhängigkeiten. Läuft **direkt im Browser** (Vorschau, Speicher lokal) **und** als Google-Apps-Script-Oberfläche (zentrale Speicherung). |
| `Code.gs` | Apps-Script-Backend: speichert Teilnehmer und Auswahl in einer Google-Tabelle, prüft Zugangscodes und das Organisator-Passwort. |
| `ANLEITUNG.md` | **Schritt für Schritt zum öffentlichen Link** — ausführlich, mit Fehlerbehebung. |

---

## Aufbau der Seite

**Startseite** — dunkler Hero mit den Eckdaten der Woche und drei Buttons:

1. **Anmeldung** — wer schon angemeldet ist, wird direkt zum Auswahlbereich geführt
   (der Button beschriftet sich dann selbst als „Meine Golfplätze wählen“).
2. **Golfplätze wählen** — die eigene Auswahl, bis Ende September änderbar.
3. **Live-Ansicht** — öffentliche Übersicht aller Anmeldungen.

**Anmeldung** — Pflichtfelder: Vorname, Nachname, Handicap (−10 bis 54),
Heimatclub. Danach Erfolgs-Screen mit **Referenznummer** und **6-stelligem
Zugangscode**. Der Code ist der Schlüssel zum Bearbeiten der eigenen Auswahl —
er wird im Browser gespeichert, sodass ein erneutes Einloggen auf demselben
Gerät entfällt.

**Meine Golfplätze** — je Tag ein Umschalter „Nicht dabei / 9 Loch / 18 Loch“.
Eine Leiste am unteren Rand zeigt laufend, wie viele Tage gewählt sind und ob
noch ungespeicherte Änderungen offen sind.

**Live-Ansicht** — Matrix wie in der bisherigen Excel-Planung: Teilnehmer als
Zeilen (mit HCP und Heimatclub), die sieben Plätze als Spalten, dazu Summen je
Platz und Kennzahlen oben. Die eigene Zeile ist golden umrandet. Aktualisiert
sich automatisch alle 60 Sekunden.

**Organisator-Bereich** (Fußzeile → „Organisation“ oder Link mit `#admin`) —
passwortgeschützt. Teilnehmerliste inklusive Zugangscodes (falls jemand seinen
vergisst), Löschfunktion und CSV-Export.

---

## Die sieben Golfplätze

| Tag | Datum | Platz |
|---|---|---|
| Sonntag | 18. Juli 2027 | Golfclub Wilder Kaiser Ellmau |
| Montag | 19. Juli 2027 | Golfclub Kitzbühel-Schwarzsee-Reith |
| Dienstag | 20. Juli 2027 | Kaiserwinkl Golf Kössen-Lärchenhof |
| Mittwoch | 21. Juli 2027 | Golfclub Kitzbühel – Platz Kaps |
| Donnerstag | 22. Juli 2027 | Golfclub Reit im Winkl-Kössen |
| Freitag | 23. Juli 2027 | Golfclub Eichenheim Kitzbühel |
| Samstag | 24. Juli 2027 | Golf & Countryclub Lärchenhof |

Änderungen an dieser Liste: die Konstante `COURSES` **in beiden Dateien**
anpassen (gleiche Reihenfolge und gleiche IDs `d1` … `d7`).

---

## Ausprobieren (ohne Google)

`Index.html` doppelklicken. Die Seite läuft vollständig, die Daten liegen dabei
nur im jeweiligen Browser (`localStorage`) — ideal zum Zeigen, **nicht** für den
echten Einsatz. Organisator-Passwort in der Vorschau: `banfhold15`.

---

## Veröffentlichen mit Google-Tabelle (echter Einsatz)

> Ausführlich, mit Bildbeschreibungen und Fehlerbehebung: **[ANLEITUNG.md](ANLEITUNG.md)**.
> Hier nur die Kurzfassung.

1. Neue **Google-Tabelle** anlegen → [sheets.new](https://sheets.new)
2. **Erweiterungen → Apps Script** öffnen.
3. Inhalt von **`Code.gs`** hineinkopieren (bestehenden Inhalt ersetzen), speichern.
   Dabei gleich `ADMIN_PASSWORT` oben ändern.
4. Links **+ → HTML** — die Datei exakt **`Index`** nennen (ohne `.html`),
   Inhalt von `Index.html` einfügen, speichern.
5. **Bereitstellen → Neue Bereitstellung → Web-App**
   · Ausführen als: *Ich*
   · Zugriff: **Jeder** → **Bereitstellen**
6. Einmal **autorisieren** („Erweitert → Zulassen“).
7. Die angezeigte **Web-App-URL** ist der öffentliche Link — der kann geteilt werden.
8. Testen: Link öffnen → anmelden → die Zeile erscheint im Tabellenblatt
   **„Anmeldungen“**; Plätze wählen → die Spalten füllen sich mit `9` bzw. `18`.

**Nach jeder Code-Änderung neu bereitstellen:**
*Bereitstellen → Bereitstellungen verwalten → Bearbeiten (Stift) → Version:
„Neue Version“ → Bereitstellen*. Die Adresse bleibt dabei gleich.

> Große Dateien zum Kopieren bitte **als Text öffnen** (Rechtsklick → Öffnen mit
> → Editor/TextEdit), nicht doppelklicken.

---

## Logo und Bilder

Die Bilder sind **fest in `Index.html` eingebettet** (als `data:`-Adressen im
Block zwischen `/* ASSETS-START */` und `/* ASSETS-ENDE */`). Damit bleibt die
Seite eine einzige Datei und lädt ohne Zugriff auf fremde Server — Voraussetzung
für den Betrieb in Google Apps Script.

Im Einsatz sind:

| Bild | wo |
|---|---|
| Wappen der Lärchi-Trophy (weiß) | Kopfzeile |
| Vollständiges Logo mit Schriftzug (weiß) | Fußzeile |
| Foto des Golfhotels | Hintergrund des Kopfbereichs, mit warmem Dunkelfilter |

**Bilder austauschen:** neue Dateien nach `assets/` legen (Namen siehe
`assets/README.md`) und einmal

```
pip install pillow
python3 assets/build-embed.py
```

ausführen. Das Skript verkleinert die Bilder, rechnet sie um und schreibt den
Assets-Block in `Index.html` neu. Danach die Datei wieder in Apps Script
einfügen und neu bereitstellen.

Für einen schnellen Test ohne Skript nehmen `CONFIG.logoBild` und
`CONFIG.heroBild` ganz oben in `Index.html` auch eine normale Bild-Adresse
entgegen — die hat Vorrang vor dem eingebetteten Bild.

---

## Technische Hinweise

- **Alles self-contained:** keine externen Schriften, Skripte oder Bild-URLs.
  Läuft deshalb auch in Sandboxes und iFrames.
- **Kein `alert()` / `confirm()`** — die sind im iFrame blockiert (und Apps
  Script läuft im iFrame). Stattdessen ein eigenes Modal plus Toast-Meldungen.
- **Datenschicht gekapselt** (`DB.list / register / login / save / admList /
  admDelete`): dieselbe Oberfläche läuft mit `localStorage` **oder** mit der
  Google-Tabelle, je nachdem ob `google.script.run` verfügbar ist.
- **Schreibzugriffe sind gesperrt** (`LockService`), damit gleichzeitige
  Anmeldungen keine Zeile überschreiben.
- **Berechtigung:** `apiSave` prüft serverseitig den Zugangscode. Ohne den
  passenden Code lässt sich eine fremde Auswahl nicht verändern. Die öffentliche
  Liste (`apiList`) gibt die Codes nie heraus.
- **Hell/Dunkel** über CSS-Variablen, umschaltbar oben rechts; die Wahl wird gemerkt.
