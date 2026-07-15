# ⛳ Seniorenreise 2027 – Anmeldung (Öschberghof)

Anmeldeseite für die **Seniorenreise 2027** ins Severin\*Resort & Spa Öschberghof
(Donaueschingen, 5.–9. Juni 2027) – Anmeldung **per QR-Code**:

- **Startseite** mit Reise-Infos, inbegriffenen Leistungen und einem **QR-Code** zum Aushängen/Weitergeben
- **Anmeldeformular** – kurz gehalten: **Vorname, Name, E-Mail, Telefon und Adresse**
- **Warteliste:** die ersten **20** (nach Anmeldezeit) sind fest angemeldet, ab Nr. 21 geht es auf die Warteliste
- **Anmeldungen ansehen** (öffentlich) – Liste aller Anmeldungen mit Status, nur lesen
- **Organisator-Dashboard** (per **Passwort `2512`**) – zusätzlich mit **Löschfunktion**
- Live-Statistiken (angemeldet / Warteliste), Status je Zeile, Suche, Detailansicht und CSV-Export

Design im Clubhaus-Stil (Fairway-Grün, Sand, dezentes Gold) mit echtem Resort-Foto,
kleinen Animationen und **dunklem Design als Standard** (hell als Alternative, umschaltbar über ◐).

**Eckdaten:** 4 Nächte mit Frühstück · Spa · 4× Nachtessen · 5× 18-Loch Golf ·
CHF 1'690 p. P. · max. 20 Personen · Anmeldeschluss 10. August 2026.

## Ansehen ohne Installation (einfachste Variante)

Die Datei **`standalone.html`** ist die komplette Demo in einer einzigen Datei –
Startseite, Anmeldeformular und Dashboard zusammen. Einfach **doppelklicken**,
sie öffnet sich im Browser. Kein Node.js, kein Terminal nötig.

Die Anmeldungen werden dabei direkt **im Browser** gespeichert (localStorage).
Praktisch zum Vorführen und Durchklicken – die Daten bleiben aber auf dem
jeweiligen Gerät und werden **nicht** zwischen mehreren Geräten synchronisiert.

> Für einen echten Ablauf, bei dem viele Teilnehmer per Handy den QR-Code scannen
> und der Organisator **alle** Anmeldungen zentral sieht, gibt es zwei Varianten:
> die **Google-Tabellen-Variante** (unten, ohne eigenen Server) oder die Server-Variante.

## 🌍 Zentrale Anmeldungen ohne eigenen Server (Google-Tabelle)

Die einfachste Art, dass **alle Anmeldungen von überall sichtbar** sind: Der Ordner
**[`google-sheet/`](./google-sheet/)** enthält dieselbe Seite als
**Google-Apps-Script-Web-App**. Jede Anmeldung landet als Zeile in einer
**Google-Tabelle** in deinem Google-Konto – kein Server, kein Hosting nötig,
eine öffentliche Adresse für den QR-Code.

👉 Schritt-für-Schritt-Anleitung (ca. 10 Min.): **[`google-sheet/ANLEITUNG.md`](./google-sheet/ANLEITUNG.md)**

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
| Anmeldungen ansehen | http://localhost:3000/dashboard | öffentliche Liste (nur ansehen) |
| Organisator-Dashboard | http://localhost:3000/admin | Passwort `2512`, mit Löschfunktion |

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

Das Formular ist bewusst kurz (seniorenfreundlich):

- **Vorname**
- **Name**
- **E-Mail**
- **Telefon**
- **Adresse:** Strasse und Nr., PLZ, Ort
- **Verbindliche Anmeldung** (Bestätigung)

## Warteliste

Maßgeblich ist die **Anmeldezeit**:

- Die **ersten 20** Anmeldungen sind **fest angemeldet**.
- Ab **Nr. 21** landet man automatisch auf der **Warteliste** (im Dashboard mit
  Trennlinie und gelber „Warteliste"-Markierung gekennzeichnet).
- Wird eine der ersten 20 Anmeldungen **gelöscht/storniert**, rückt automatisch
  die nächste Person von der Warteliste nach – die Positionen berechnen sich neu.
- Nach dem Absenden sieht die Person direkt, ob sie fest dabei ist oder auf der
  Warteliste steht (mit Platznummer).

Die Kapazität (20) lässt sich im Code anpassen (`CAPACITY`).

## Ansehen vs. Organisator-Bereich

- **`/dashboard`** – für alle: Anmeldungen ansehen, **ohne** Löschen.
- **`/admin`** – für Organisatoren: mit **Passwort** (`2512`, änderbar über `ADMIN_PW`)
  freigeschaltet; zusätzlich mit **Löschfunktion** (Zeile öffnen → „löschen", oder das
  Papierkorb-Symbol in der Aktion-Spalte).

> Hinweis: Der Passwortschutz ist für eine kleine Vereinsreise gedacht und einfach
> gehalten. Für höhere Sicherheitsanforderungen wäre eine echte Server-Anmeldung nötig.

## Technik

- Reines **Node.js** (`http`-Modul) – nur eine Abhängigkeit: [`qrcode`](https://www.npmjs.com/package/qrcode)
- Speicherung in `data/registrations.json` (kein externer Dienst, keine Datenbank nötig)
- Konfiguration über Umgebungsvariablen: `PORT` (Standard `3000`), `PUBLIC_URL`

## Konfiguration

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `PORT` | `3000` | Port des Servers |
| `PUBLIC_URL` | – | Öffentliche Basis-URL, auf die der QR-Code zeigt |
| `ADMIN_PW` | `2512` | Passwort für das Organisator-Dashboard |

## API (für Neugierige)

| Methode | Pfad | Zweck |
|---------|------|-------|
| `POST` | `/api/register` | Anmeldung speichern |
| `GET` | `/api/registrations` | Alle Anmeldungen (JSON) |
| `GET` | `/api/registrations.csv` | Export als CSV (Excel-kompatibel) |
| `DELETE` | `/api/registrations/<id>?pw=…` | Eintrag löschen (Passwort nötig) |
| `POST` | `/api/admin/check` | Passwort prüfen (Organisator-Login) |
| `GET` | `/api/qr.svg` | QR-Code als SVG |

---

*Demo zu Präsentationszwecken. Anmeldedaten werden nur lokal in einer JSON-Datei gespeichert.*
