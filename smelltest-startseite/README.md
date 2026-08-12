# Smell Discettes – Neue Startseite

Arbeitsverzeichnis für die Neugestaltung der Startseite (aktuell: `https://tazazehi.myhostpoint.ch/de/`).

## 📁 Hier Logo und Bilder hochladen

```
smelltest-startseite/
└── assets/
    ├── logo/                  ← Logo (alle Varianten)
    ├── bilder/
    │   ├── hero/              ← Grosses Titelbild oben (Packung, Freisteller, Hintergrund)
    │   ├── produkt/           ← Packung, Disketten, Refills, Auswertungsbogen
    │   ├── anwendung/         ← Die 3 Schritte: öffnen / riechen / auswählen
    │   ├── personen/          ← Ärzte, Praxis, Anwendung am Patienten
    │   └── partner/           ← Logos Universität Zürich, Kliniken, Vertriebspartner
    ├── icons/                 ← Einzelne Icons (SVG bevorzugt)
    ├── downloads/             ← PDFs: Studien, Anleitung, Datenblatt, Preisliste
    └── fonts/                 ← Nur falls eigene Schriftdateien vorhanden (sonst leer lassen)
```

### So lädst du hoch

**Variante A – GitHub Weboberfläche (am einfachsten)**
1. Repo auf GitHub öffnen, Branch `claude/smell-test-startseite-dd93l7` wählen
2. In den gewünschten Ordner navigieren, z. B. `smelltest-startseite/assets/logo/`
3. `Add file` → `Upload files` → Dateien reinziehen → `Commit changes`

**Variante B – Direkt im Chat**
Du kannst die Dateien auch einfach hier im Chat anhängen, dann lege ich sie am richtigen Ort ab.

---

## 📷 Was ich brauche (Wunschliste)

| Ordner | Datei | Beschreibung | Format |
|---|---|---|---|
| `logo/` | `logo.svg` | Hauptlogo, am besten als Vektor | SVG (sonst PNG ≥ 1000 px) |
| `logo/` | `logo-weiss.svg` | Weisse Variante für dunkle Flächen | SVG / PNG transparent |
| `logo/` | `favicon.png` | Quadratisch, nur die Rauch-Signatur | PNG 512 × 512 |
| `bilder/hero/` | `hero.jpg` | Titelbild, quer, viel freier Raum links für Text | JPG/WebP ≥ 2400 px breit |
| `bilder/produkt/` | `packung-*.jpg` | Packung freigestellt, Disketten einzeln, Set | JPG/WebP ≥ 1600 px |
| `bilder/anwendung/` | `schritt-1.jpg`, `schritt-2.jpg`, `schritt-3.jpg` | Diskette öffnen / riechen / auswählen | JPG/WebP ≥ 1200 px, gleiches Seitenverhältnis |
| `bilder/personen/` | `*.jpg` | Arzt/MPA in der Praxis, Anwendung | JPG ≥ 1600 px |
| `bilder/partner/` | `*.svg` / `*.png` | Logos Uni Zürich, Kliniken, Partner | SVG / PNG transparent |
| `downloads/` | `*.pdf` | Publikationen (Briner & Simmen 1999, Briner/Simmen/Jones 2003), Anleitung | PDF |

**Hinweise**
- Bitte Originalauflösung hochladen – ich optimiere und skaliere selbst (WebP + responsive Grössen).
- Freisteller (transparenter Hintergrund) am liebsten als PNG.
- Wenn zu einem Bild ein bestimmter Platz auf der Seite gedacht ist: kurz dazuschreiben, oder Dateiname sprechend wählen.
- Dateinamen: klein, ohne Umlaute/Leerzeichen, mit Bindestrich (z. B. `packung-freisteller.png`).

---

## 🎨 Was ich aus der bestehenden Seite bereits übernommen habe

In `referenz/` liegt die Analyse der aktuellen Seite:

- `referenz/aktuelle-startseite.html` – die bestehende Seite (Base64-Bilder entfernt, zur Struktur-Referenz)
- `referenz/bestand-alte-seite/` – die aus der alten Seite extrahierten Bilder in Originalqualität:
  - `logo-smell-discettes.webp` – aktuelles Logo
  - `icon-diskette.svg` – Diskette-Icon (Vektor)
  - `hero-packung.webp` – Packung mit Diskettenreihe, Laborhintergrund
  - `foto-arzt.jpg` – Arzt mit Packung in der Praxis
  - `img02.png`, `img04–img07.webp` – weitere Bestandsbilder

**Erkanntes Design der aktuellen Seite**

| | |
|---|---|
| Primärblau | `#407BA0` |
| Dunkelblau / Navy | `#00102E` |
| Sekundärblau | `#324A6D` |
| Hellblau (Icon) | `#BCD3E5` |
| Schrift | Lato |
| Sprachen | DE / FR / IT |

**Inhalt der aktuellen Startseite**
1. Hero: „Smell Discettes Olfaction Test – À nouveau disponible pour vous" + Buttons *SmellTest starten* / *Vertriebspartner werden*
2. „Die wichtigsten Punkte" – 3 Karten: **Evidenz** (4 Publikationen, Studie Briner & Simmen 1999, n = 124, 99,74 %), **Effizienz** (3 Schritte, 5 Minuten, 8 Gerüche), **Präoperative Relevanz** (10,3 % mit Riechstörung vor OP)
3. „Anwendung – Einfach und rasch" – 3 Schritte mit Bildern
4. Bestellen / Footer mit Sprachumschaltung

---

## ➡️ Nächster Schritt

Bilder hochladen, dann von dir die Gestaltungswünsche (Stil, Struktur, Texte, Zielgruppe) – danach baue ich die neue Startseite.
