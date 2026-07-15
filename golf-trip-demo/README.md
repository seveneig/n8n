# ⛳ Seniorenreise 2027 – Anmeldung (Öschberghof)

Anmeldeseite für die **Seniorenreise 2027** ins Severin\*Resort & Spa Öschberghof
(Donaueschingen, 5.–9. Juni 2027) – Anmeldung **per QR-Code**:

- **Startseite** mit Reise-Infos, inbegriffenen Leistungen und einem **QR-Code** zum Aushängen/Weitergeben
- **Anmeldeformular** – bewusst kurz gehalten: nur **Vorname, Name und Adresse**
- **Organisator-Dashboard** mit Live-Statistiken (Plätze, freie Plätze, Umsatz, Countdown), Suche, Detailansicht und CSV-Export

Design im Clubhaus-Stil (Fairway-Grün, Sand, dezentes Gold) mit echtem Resort-Foto und kleinen Animationen.

**Eckdaten:** 4 Nächte mit Frühstück · Spa · 4× Nachtessen · 5× 18-Loch Golf ·
CHF 1'690 p. P. · max. 20 Personen · Anmeldeschluss 10. August 2026.

## Ansehen ohne Installation (einfachste Variante)

Die Datei **`standalone.html`** ist die komplette Demo in einer einzigen Datei –
Startseite, Anmeldeformular und Dashboard zusammen. Einfach **doppelklicken**,
sie öffnet sich im Browser. Kein Node.js, kein Terminal nötig.

Die Anmeldungen werden dabei direkt **im Browser** gespeichert (localStorage).
Praktisch zum Vorführen und Durchklicken – die Daten bleiben aber auf dem
jeweiligen Gerät und werden **nicht** zwischen mehreren Geräten synchronisiert.
Im Dashboard gibt es einen Button **„✨ Demo-Daten"**, der Beispiel-Anmeldungen anlegt.

> Für einen echten Ablauf, bei dem viele Teilnehmer per Handy den QR-Code scannen
> und der Organisator **alle** Anmeldungen zentral sieht, ist die Server-Variante
> unten gedacht (die speichert die Daten gemeinsam auf einem Server).

## Server-Variante (echte, geräteübergreifende Anmeldungen)

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

Das Formular ist bewusst minimal (seniorenfreundlich):

- **Vorname**
- **Name**
- **Adresse:** Strasse und Nr., PLZ, Ort
- **Verbindliche Anmeldung** (Bestätigung)

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
