# ⛳ Golfreise-Anmeldung – Demo

Eine kleine, in sich geschlossene Demo für **Anmeldungen zu einer Golfreise per QR-Code**:

- **Startseite** mit Event-Infos und einem **QR-Code** zum Aushängen/Weitergeben
- **Anmeldeformular** (mehrstufiger Assistent) mit allen relevanten Golf- & Reisefragen
- **Organisator-Dashboard** mit Live-Statistiken, Suche/Filter, Detailansicht und CSV-Export

Design im Clubhaus-Stil (Fairway-Grün, Sand, dezentes Gold) mit kleinen Animationen und Übergängen.

## Schnellstart

```bash
cd golf-trip-demo
npm install
npm start
```

Dann im Browser öffnen:

| Seite | URL | Zweck |
|-------|-----|-------|
| Start / QR-Aushang | http://localhost:3000/ | QR-Code zeigen & ausdrucken |
| Anmeldung | http://localhost:3000/register | Formular für Teilnehmer |
| Dashboard | http://localhost:3000/dashboard | Anmeldungen ansehen |

Im Dashboard auf **„✨ Demo-Daten"** klicken, um Beispiel-Anmeldungen zu erzeugen.

## So funktioniert der QR-Ablauf

1. Auf der Startseite hängt ein QR-Code. Er verweist standardmäßig auf `<host>/register`.
2. Teilnehmer scannen den Code mit dem Smartphone und füllen das Formular aus.
3. Neue Anmeldungen erscheinen **automatisch** (Auto-Refresh alle 5 s) im Dashboard.

> **Damit ein Smartphone den QR-Code erreichen kann,** muss die Seite unter einer
> vom Handy erreichbaren Adresse laufen (nicht `localhost`). Beim lokalen Testen
> entweder die LAN-IP des Rechners verwenden oder die App über einen Tunnel/Server
> öffentlich bereitstellen und die Ziel-URL des QR-Codes setzen:
>
> ```bash
> PUBLIC_URL="https://deine-oeffentliche-adresse.example" npm start
> ```

## Erfasste Angaben

- **Person:** Vor-/Nachname, E-Mail, Telefon, Geburtsdatum
- **Golf:** Heimatclub, Handicap, DGV-Ausweis, Schlaghand, Leihschläger, Fortbewegung (E-Cart/Trolley/Tragen)
- **Reise:** Paket (Standard/Premium/Nur Turnier), Zimmerkategorie, Zimmerpartner, Anreise
- **Sonstiges:** Ernährung/Allergien, Notfallkontakt, Anmerkungen, Einwilligung

## Technik

- Reines **Node.js** (`http`-Modul) – nur eine Abhängigkeit: [`qrcode`](https://www.npmjs.com/package/qrcode)
- Speicherung in `data/registrations.json` (kein externer Dienst, keine Datenbank nötig)
- Konfiguration über Umgebungsvariablen: `PORT` (Standard `3000`), `PUBLIC_URL`

## Konfiguration

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `PORT` | `3000` | Port des Servers |
| `PUBLIC_URL` | – | Öffentliche Basis-URL, auf die der QR-Code zeigt |

## API (für Neugierige)

| Methode | Pfad | Zweck |
|---------|------|-------|
| `POST` | `/api/register` | Anmeldung speichern |
| `GET` | `/api/registrations` | Alle Anmeldungen (JSON) |
| `GET` | `/api/registrations.csv` | Export als CSV (Excel-kompatibel) |
| `GET` | `/api/qr.svg` | QR-Code als SVG |
| `POST` | `/api/seed` | Demo-Anmeldungen erzeugen |

---

*Demo zu Präsentationszwecken. Anmeldedaten werden nur lokal in einer JSON-Datei gespeichert.*
