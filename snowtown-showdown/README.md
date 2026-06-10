# Snowtown Showdown ❄️

Ein Cartoon-Ego-Shooter im Retro-Raycasting-Stil (à la Wolfenstein 3D), der komplett
offline im Browser läuft — keine Abhängigkeiten, keine Assets, alles wird zur Laufzeit
prozedural gezeichnet und vertont.

## Story & Figuren (alle original)

Der fiese **Eis-Yeti Knut** hat die Schneemänner der verschneiten Kleinstadt **Snowtown**
verhext: Als **Frostgrummel** watscheln sie durch die Gassen und wollen die Stadt einfrieren.
**Bruno Bommel** — der Junge mit der roten Bommelmütze — schnappt sich den legendären
Schneeball-Blaster von **Bürgermeisterin Frieda Flocke** und räumt auf.

| Figur | Rolle |
|---|---|
| Bruno Bommel | Spielfigur, Held mit Schneeball-Blaster |
| Frostgrummel | Verhexte Schneemänner (Standardgegner, 3 Treffer) |
| Eis-Yeti Knut | Boss-Yeti (2× im Level, 16 Treffer, viel Schaden) |
| Frieda Flocke | Bürgermeisterin, erwähnt in Story und Abspann |

## Spielen

**Variante A — Installer (Windows):**
Führe `dist/Snowtown-Showdown-Setup.exe` aus. Der Installer installiert das Spiel
pro Benutzer (kein Admin nötig) nach `%LOCALAPPDATA%\Snowtown Showdown`, legt
Verknüpfungen auf Desktop und im Startmenü an und registriert einen Deinstaller
unter „Apps & Features". Die Verknüpfung öffnet das Spiel im Standardbrowser.

**Variante B — direkt:**
Einfach `game/index.html` in einem modernen Browser (Chrome, Edge, Firefox) öffnen.

## Steuerung

| Taste | Aktion |
|---|---|
| `W A S D` / Pfeiltasten | Laufen / drehen |
| Maus | Umsehen (Pointer Lock) |
| Linksklick | Schneeball feuern |
| Shift | Rennen |
| Esc | Pause |

Ziel: Alle 16 Gegner auftauen. Kakao-Tassen geben +30 Leben, Schneeball-Säcke +15 Munition.

## Installer selbst bauen

Benötigt [NSIS](https://nsis.sourceforge.io) (`makensis`):

```bash
./build-installer.sh        # Linux / macOS
build-installer.bat         # Windows
```

Ergebnis: `dist/Snowtown-Showdown-Setup.exe`

## Technik

- Raycasting-Engine (DDA) in reinem Vanilla-JavaScript auf einem `<canvas>`
- Prozedurale Wandtexturen und Figuren-Sprites (zur Laufzeit auf Offscreen-Canvases gezeichnet)
- Sprite-Rendering mit Z-Buffer, Sichtlinien-Checks für KI und Hitscan
- Synthetisierte Soundeffekte über die Web Audio API
- Eine einzige HTML-Datei, läuft von `file://` ohne Server
