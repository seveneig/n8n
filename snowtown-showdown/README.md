# Snowtown Showdown 2 ❄️🌞

Ein Cartoon-Ego-Shooter mit Quests, Fahrzeugen und zwei Universen — komplett offline
im Browser, keine Abhängigkeiten, keine Assets: Texturen, Figuren und Sounds werden
zur Laufzeit prozedural erzeugt.

## Story & Figuren (alle original)

**Bruno Bommel** muss Snowtown gleich dreifach retten: Erst verschwindet der Stadt-Kakao,
dann randaliert **Eis-Yeti Knut** in seiner verschlossenen Höhle — und schließlich öffnet
sich ein Portal ins sonnige Parallel-Universum **Sommerhausen**, wo **Onkel Helmut** von
**Blubber, der lebenden Brause-Flasche**, im Käfig gefangen gehalten wird.

| Figur | Rolle |
|---|---|
| Bruno Bommel | Spielfigur, Held mit Bommelmütze |
| Frostgrummel | Verhexte Schneemänner (Snowtown) |
| Eis-Yeti Knut | Boss von Quest 2, haust hinter dem Höhlentor |
| Zitronen-Glibber | Schleim-Gegner in Sommerhausen |
| Blubber | Boss von Quest 3 — eine lebende Brause-Flasche |
| Onkel Helmut | Muss aus Blubbers Käfig befreit werden |
| Frieda Flocke | Bürgermeisterin, spendiert am Ende ein Schnee-Denkmal |

## Die 3 Quests

1. **Operation Kakao** — Sammle die 5 gestohlenen Kakao-Kisten, die überall in Snowtown versteckt sind.
2. **Knut muss weg** — Finde den Höhlenschlüssel, öffne das Höhlentor (E) und besiege Eis-Yeti Knut (Boss-Lebensleiste!).
3. **Das Brause-Portal** — Spring ins Portal am Marktplatz, besiege Blubber im Parallel-Universum Sommerhausen, befreie Onkel Helmut (E) und kehre durchs Portal zurück.

## Die 4 Waffen

| Slot | Waffe | Eigenschaft |
|---|---|---|
| 1 | Schneeball-Blaster | Allrounder, von Anfang an dabei |
| 2 | Eiszapfen-MG | Dauerfeuer (Maustaste halten) — als Pickup in Snowtown |
| 3 | Karotten-Schrotflinte | 6 Schrot-Karotten, brutal auf kurze Distanz — Pickup in Snowtown |
| 4 | Bommel-Bomben-Werfer | Explosive Flächenwirkung — Pickup in Sommerhausen |

## Fahrzeuge

In Snowtown steht ein **Schneemobil**, in Sommerhausen ein **Gokart**: mit `E` einsteigen,
W/S = Gas/Bremse, A/D = lenken, mit Schwung kannst du Gegner **rammen**. `E` zum Aussteigen.

## Spielen

**Variante A — Installer (Windows):** `dist/Snowtown-Showdown-Setup.exe` ausführen.
Installiert pro Benutzer (kein Admin nötig), legt Desktop-/Startmenü-Verknüpfungen an
und registriert einen Deinstaller. Die Verknüpfung öffnet das Spiel im Standardbrowser.

**Variante B — direkt:** `game/index.html` in Chrome, Edge oder Firefox öffnen.

## Steuerung

| Taste | Aktion |
|---|---|
| `W A S D` / Pfeiltasten | Laufen / fahren |
| Maus | Umsehen (Pointer Lock) |
| Linksklick (halten) | Feuern / Dauerfeuer |
| `1`–`4` / Mausrad | Waffe wechseln |
| `E` | Einsteigen, Tor öffnen, Helmut befreien |
| Shift | Rennen |
| `M` | Minikarte ein/aus |
| Esc | Pause |

## Installer selbst bauen

Benötigt [NSIS](https://nsis.sourceforge.io) (`makensis`):

```bash
./build-installer.sh        # Linux / macOS
build-installer.bat         # Windows
```

## Technik

- Raycasting-Engine (DDA) mit **per-Pixel-Wand- und Boden-Texturierung** und Distanznebel auf einem 480×270-Framebuffer (`Uint32Array`), hochskaliert auf 960×540
- Zwei Welten mit eigenen Texturen, Himmel, Wetter und Gegnern; Portal-Mechanik wechselt zur Laufzeit
- Sprite-Rendering mit Z-Buffer, Sichtlinien-Checks, Hitscan- und Projektil-Waffen mit AoE-Explosionen
- Türen, Quest-Trigger, NPC-Dialog, Boss-Lebensleisten, Minikarte mit Quest-Markern
- Fahrzeug-Physik mit Beschleunigung, Lenkung, Ramm-Schaden und synthetisiertem Motorsound
- Web Audio API für alle Sounds; eine einzige HTML-Datei, läuft von `file://`
