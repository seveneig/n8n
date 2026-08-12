# Smell Discettes – Projektregeln

Gilt für **alle** Seiten dieses Webauftritts, auch für die, die erst noch entstehen
(Französisch, Italienisch, Unterseiten).

## Inhaltliche Verbote

Diese Aussagen dürfen auf keiner Seite vorkommen – weder im Text, noch in
Überschriften, Kennzahlen, Bildunterschriften, Alt-Texten oder Meta-Angaben:

1. **Keine Dauer-Angabe für die Testdurchführung.**
   Verboten: „fünf Minuten", „< 5 Min.", „in wenigen Minuten", „in 3 Minuten",
   jede konkrete Zeitangabe.
   Stattdessen unbestimmt formulieren: *rasch*, *schnell*, *unkompliziert*,
   *geringer Zeitaufwand*, *ohne Terminverlängerung*.

2. **Keine Aussage, dass die Disketten wiederverwendbar sind.**
   Verboten: „wiederverwendbar", „mehrfach verwendbar", „für X Anwendungen",
   „Refills nach ca. 12 Monaten" (impliziert dasselbe).
   Zulässig bleibt: „Refills sind einzeln nachbestellbar" – ohne Zeitraum und
   ohne Hinweis auf Mehrfachnutzung.

Wenn eine dieser Aussagen aus einer Vorlage, der alten Website oder einem
Übersetzungstext stammt: **ersatzlos streichen oder unbestimmt umformulieren**,
nicht übernehmen. Beim Übersetzen gilt das sinngemäss auch für
*réutilisable* / *riutilizzabile* und *cinq minutes* / *cinque minuti*.

## Publikationen

Die vier Validierungsarbeiten (Titel gemäss der bestehenden Website):

1. Olfaction in rhinology – methods of assessing the sense of smell
2. Olfaction after endoscopic sinus surgery: long-term results
3. Impaired sense of smell in patients with nasal surgery *(Briner, Simmen & Jones, Clinical Otolaryngology, 2003)*
4. Smell diskettes as screening test of olfaction *(Briner & Simmen, Rhinology, 1999)*

Für 1 und 2 sind Journal und Jahr **nicht bekannt** – nicht erfinden, sondern
offen lassen, bis die Angaben vorliegen.

## Weiterhin zulässige Kennzahlen

Diese stammen aus den Publikationen und dürfen genannt werden:

- **99,74 %** statistische Sicherheit bei Score 7 oder 8 (Briner & Simmen 1999, n = 124)
- **10,3 %** präoperativ eingeschränkte Riechfunktion (Briner, Simmen & Jones 2003)
- **8** überschwellige Riechstoffe, Format 5 × 6 cm
- **3** Schritte im Ablauf
- **4** Validierungspublikationen in *Rhinology* und *Clinical Otolaryngology*

## Gestaltung

- Markenfarben unverändert: `#407BA0`, `#00102E`, `#BCD3E5`, Flächen `#F5F9FC`
- Schrift Lato, eingebettet über `assets/fonts/lato.css` (kein Google-Fonts-Aufruf)
- Aufbau, Bausteine und CSS-Kapselung wie in `index.html` – neue Seiten davon ableiten

## Technik

- Bestehende Seiten: `index.html` (Startseite), `produkt.html`, `ueber-uns.html`
- **Das Design liegt gemeinsam in `assets/css/sd.css`** – neue Seiten binden dieses
  Stylesheet ein und verwenden die vorhandenen Bausteine, statt eigenes CSS zu
  erfinden. Nur wirklich neue Komponenten kommen dort ergänzend hinzu.
- Danach `node build-elementor.mjs` ausführen – erzeugt alle Elementor-Fassungen neu.
  Neue Seiten in der Liste `PAGES` im Build-Script eintragen.
- Alles bleibt im Wrapper `.sdx` gekapselt, kein Selektor greift nach aussen
- Header-Navigation und Footer sind auf allen Seiten identisch zu halten
