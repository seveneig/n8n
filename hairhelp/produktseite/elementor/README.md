# Einbau in Elementor und WooCommerce

Diese Fassung legt sich über den bestehenden Aufbau, statt ihn zu ersetzen.
Nicht angefasst werden: das WooCommerce-Formular, die Variations-Logik, die
`hhch`-Rabattstufen samt PHP-Hooks, die Swatches und Customer Reviews.

Ermittelt aus dem gespeicherten Seiten-Dump der Produktivseite:

| | |
| --- | --- |
| Theme, Builder | Hello Elementor, Elementor Pro 4.2.2, Theme-Builder-Template „Single Product“, Container-Layout |
| WooCommerce-Widgets | `product-images`, `product-price`, `product-add-to-cart`, `short-description`, `product-meta`, `data-tabs`, `product-content` |
| Add-ons | Premium Addons (Image Comparison ×3, Dual Header ×3, Testimonials), Nested Accordion |
| Plugins | Variation Swatches (`cfvsw`), Customer Reviews (`cr-`/ivole), WP Rocket, Complianz |
| Eigener Code | `hhch-*` – Rabattstufen, Mengenwähler, Farb-Label, Sticky-Buy-Bar |

## Dateien

| Datei | Zweck |
| --- | --- |
| `hairhelp-produktseite.css` | Gestaltungs-Layer über den Bestand |
| `widget-1-leistungen.html` | Leistungsband, vier Punkte |
| `widget-2-anwendung.html` | Anwendung in drei Schritten |
| `widget-3-technologievergleich.html` | Vergleichstabelle als Markup statt als Bild |
| `widget-4-merkmale.html` | Merkmalraster, sechs Karten |
| `widget-5-schlussaufruf.html` | Schlussaufruf, gibt es bisher nicht |
| `bilder/anleitung-schritt-*.webp` | Optional, siehe Schritt 3 |

## Schritt 1 – Stylesheet einbinden

Inhalt von `hairhelp-produktseite.css` einfügen unter **Elementor → Website-Einstellungen
→ Benutzerdefiniertes CSS**. Damit gilt es für die ganze Seite und wird von Elementor
selbst ausgeliefert.

Alternativ ins Child-Theme als eigene Datei. Dann in **WP Rocket → CSS-Dateien
optimieren → Ungenutztes CSS entfernen** auf die Ausschlussliste setzen, sonst
räumt Rocket Regeln weg, deren Klassen erst per JavaScript entstehen –
betroffen wären die aktive Stufe, der Swatch-Rahmen und die Sticky-Bar.

Alles ist auf `body.single-product` begrenzt. Läuft das Template auch auf anderen
Seitentypen, den Scope entsprechend austauschen.

## Schritt 2 – Reihenfolge im Theme Builder

Im Template „Single Product“ die Container in diese Reihenfolge bringen. Bisher
standen die 82 Rezensionen direkt hinter dem Kaufmodul und haben die
Produktgeschichte nach unten gedrückt.

| # | Container | Inhalt |
| --- | --- | --- |
| 1 | Kaufmodul, zweispaltig | links `product-images`, rechts Titel, `product-price`, Bewertungs-Shortcode, `product-add-to-cart`, Zusicherungen, Zahlarten, Starter-Set, `short-description`, `product-meta` |
| 2 | Vollbreite | **Widget 1** Leistungsband |
| 3 | Dunkles Band | Dual Header „Sehen Sie / den Unterschied“, drei Image-Comparison-Widgets |
| 4 | Standard | Dual Header „So / funktionierts“, **Widget 2** |
| 5 | Cremefarben | Dual Header „Eine Generation / voraus“, **Widget 3**, **Widget 4** |
| 6 | Dunkles Band | Garantie, Siegelbild |
| 7 | Standard | `product-data-tabs` mit den Rezensionen |
| 8 | Cremefarben | Testimonial Barbara Zollinger |
| 9 | Standard | Dual Header „Häufige / Fragen“, Nested Accordion |
| 10 | Vollbreite | **Widget 5** Schlussaufruf |

Dem Kaufmodul-Container unter **Erweitert → CSS-ID** den Wert `kaufen` geben – darauf
springt der Button in Widget 5.

Den dunklen Bändern (3 und 6) die CSS-Klasse `hh-band-ink` geben, damit die
Überschriften darin hell werden.

## Schritt 3 – HTML-Widgets einsetzen

Je ein **HTML-Widget** anlegen und den kompletten Dateiinhalt einfügen, CSS-Block
eingeschlossen. Jeder Block bringt seine eigenen Farbwerte mit und ist über eine
eigene Klasse gekapselt, greift also nicht in andere Widgets.

Die Bildpfade sind root-relativ (`/wp-content/uploads/…`) und funktionieren auf
Staging wie Produktiv, solange die Mediathek dieselben Dateien enthält.

**Widget 2** schneidet die vorhandene Anleitungsgrafik per `background-position` in
ihre drei Felder – nichts hochzuladen, der Browser lädt das Bild nur einmal. Wer
saubere Einzelbilder bevorzugt: die drei Dateien aus `bilder/` hochladen und die
Regeln `.hh-steps__art--1/2/3` durch die neuen Pfade ersetzen.

**Widget 5** zieht sich mit `margin:0 calc(50% - 50vw)` über die volle Breite. Sitzt
es in einem Container mit Innenabstand, entweder den Container auf volle Breite
und ohne Abstand stellen oder diese Zeile entfernen.

## Schritt 4 – Was ersetzt wird

Beim Umbau entfallen diese bestehenden Widgets, deren Inhalt jetzt in den
HTML-Widgets steckt:

* vier Bild- und Text-Paare des Leistungsbands → Widget 1
* Anleitungsbild plus drei Textblöcke → Widget 2
* Bild `hairhelp-vs-andere-light-1.webp` → Widget 3
* sechs Bild- und Text-Paare der Merkmale → Widget 4

## Bekannte Stellen, die zu prüfen sind

Der Layer ist gegen den Dump der Produktivseite getestet, nicht gegen die
Staging-Site – die Umgebung dieser Sitzung blockiert die Domain auf Proxy-Ebene.
Nach dem Einbau bitte gezielt ansehen:

* **Aktive Rabattstufe.** Das Original setzt `.chip.on .chip-mid` per `!important`
  auf Weiss. Der Layer hält die aktive Karte deshalb bewusst dunkel. Sollte eine
  Stufe unlesbar wirken, liegt es an dieser Regel.
* **Galerie-Miniaturen.** FlexSlider schreibt Breiten per Inline-Style; der Layer
  überschreibt sie mit `!important`. Bei anderer Spaltenzahl im Widget
  `grid-template-columns` anpassen.
* **Swatch-Grösse.** 66 × 52 px werden mit `!important` gesetzt, weil das Plugin
  die Masse inline schreibt.
* **Sticky-Buy-Bar.** Nur die Optik ist angepasst. Das Markup entsteht per
  JavaScript und war im Dump nicht enthalten – die Regeln stützen sich auf die
  Klassennamen im Stylesheet.
* **Sterne.** Customer Reviews setzt `#FFBC00` inline auf jedes SVG; der Layer
  zieht sie mit `!important` auf das Marken-Gold.
