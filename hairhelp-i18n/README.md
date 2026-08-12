# HairHelp – Mehrsprachigkeit (DE / FR / IT / EN) ohne schweres Plugin

Ziel: `www.hairhelp-haarverdichter.ch` zusätzlich auf Französisch und Italienisch (optional Englisch)
ausliefern – schlank, ohne Übersetzungs-Plugin mit eigenen Datenbanktabellen, SEO-korrekt.

Zwei Varianten liegen hier:

| Ordner | Wofür |
|---|---|
| `wordpress/hairhelp-i18n.php` | Die Website läuft auf WordPress / WooCommerce (sehr wahrscheinlich, wegen `/shop/…`) |
| `standalone-php/` | Die Website ist reines PHP/HTML ohne CMS |

---

## Das Grundprinzip (bei beiden Varianten gleich)

Die Sprache steckt **im URL-Pfad**, nicht in einem Cookie und nicht in einem Parameter:

```
https://www.hairhelp-haarverdichter.ch/streuhaar/        → Deutsch  (Standard, ohne Präfix)
https://www.hairhelp-haarverdichter.ch/fr/streuhaar/     → Französisch
https://www.hairhelp-haarverdichter.ch/it/streuhaar/     → Italienisch
```

Warum so und nicht per Cookie/Browsersprache-Weiterleitung:

* Jede Sprachversion hat eine **eigene, teilbare, indexierbare URL** – Voraussetzung dafür, dass du
  in der Romandie und im Tessin überhaupt gefunden wirst.
* Google kann alle Versionen crawlen; automatische Weiterleitungen nach Browsersprache verhindern das
  und sind der häufigste SEO-Fehler bei mehrsprachigen Schweizer Seiten.
* Kein Consent-Thema, weil kein Cookie nötig ist.

Statt einer Weiterleitung zeigt der Code (optional) einen dezenten Hinweis
„Cette page est aussi disponible en français" mit Link – Nutzer entscheiden selbst.

---

## Variante A – WordPress / WooCommerce

### 1. Snippet installieren

**Empfohlen (schnellster Weg, kein Plugin nötig):** Datei per FTP/Dateimanager ablegen unter

```
wp-content/mu-plugins/hairhelp-i18n.php
```

Den Ordner `mu-plugins` ggf. anlegen. „Must-Use"-Plugins werden von WordPress automatisch
geladen, lassen sich nicht versehentlich deaktivieren und laden früher als normale Plugins –
das ist wichtig, damit das Umschalten der Sprache (Punkt 2) sauber greift.

**Alternative:** Inhalt der Datei ohne das einleitende `<?php` in *Code Snippets* / *WPCode*
einfügen, Ausführung „Everywhere", Priorität `1`.

### 2. Sprachpakete installieren

Damit sich WordPress-Core, Theme und **WooCommerce (Warenkorb, Kasse, Bestellbestätigungen)**
automatisch übersetzen, müssen die Sprachdateien vorhanden sein:

* *Einstellungen → Allgemein → Sprache der Website* kurz auf „Français" stellen, speichern,
  dasselbe mit „Italiano", danach wieder auf „Deutsch (Schweiz)" zurückstellen.
  WordPress lädt dabei die Sprachpakete herunter und behält sie.
* Mit WP-CLI (falls beim Hoster verfügbar): `wp language core install fr_FR it_IT`
  sowie `wp language plugin install woocommerce fr_FR it_IT`.

Danach genügt der URL-Präfix `/fr/`, und alle Standardtexte von WooCommerce erscheinen französisch –
ganz ohne dass du sie selbst übersetzt.

Im Snippet ist `hreflang` bewusst von `locale` entkoppelt: WordPress lädt `fr_FR`
(Schweizer Französisch-Pakete gibt es nicht), gegenüber Google deklarierst du aber `fr-CH`
und zielst damit auf die Schweiz.

### 3. Seitenstruktur anlegen

1. Neue Seite **„Français"** mit Permalink-Titelform (Slug) `fr` anlegen, veröffentlichen.
   Dasselbe für `it`.
2. Für jede zu übersetzende Seite eine neue Seite anlegen und im Block
   *Seiten-Attribute → Übergeordnete Seite* die Seite `fr` bzw. `it` wählen.
   Der Slug bleibt gleich → die URL wird automatisch `/fr/streuhaar-anwendung/`.
   Elementor/Gutenberg-Layouts kannst du dabei ganz normal duplizieren
   (Elementor: *Als Vorlage speichern* → in der neuen Seite einfügen) und nur die Texte ersetzen.
3. In der rechten Seitenleiste erscheint durch das Snippet die Box **„Sprache / Übersetzung"**:
   * *Sprache*: Deutsch / Français / Italiano
   * *Übersetzungs-Gruppe*: derselbe frei gewählte Schlüssel auf allen Sprachversionen
     derselben Seite, z. B. `streuhaar-anwendung`.

   Über diese Gruppe weiß das Snippet, welche Seiten zusammengehören – daraus entstehen
   automatisch die `hreflang`-Tags und die Ziel-URLs des Sprachumschalters.
   Setze die Gruppe **auch auf der deutschen Originalseite**.

### 4. Sprachumschalter einbauen

* Elementor: Widget *Shortcode* → `[hh_lang_switcher]`
* Gutenberg: Block *Shortcode* → `[hh_lang_switcher]`
* Direkt im Theme (`header.php`): `<?php echo hh_lang_switcher(); ?>`

Optionen: `[hh_lang_switcher style="inline" labels="full" hide_current="1"]`
(`labels="short"` = DE/FR/IT, `labels="full"` = Deutsch/Français/Italiano).

Fehlt eine Übersetzung der aktuellen Seite, verlinkt der Umschalter auf die Startseite
der jeweiligen Sprache statt ins Leere.

### 5. Menüs pro Sprache

*Design → Menüs*: bestehendes Menü duplizieren und den Slug mit Sprachsuffix versehen –
z. B. `hauptmenue` → `hauptmenue-fr` und `hauptmenue-it`. Das Snippet tauscht das Menü
auf `/fr/`- und `/it/`-Seiten automatisch aus. Kein weiterer Eingriff nötig.

### 6. Fest verdrahtete Texte im Theme

Texte, die weder in einer Seite noch in WooCommerce stehen (Buttons, Badges, Footer-Claims),
kommen aus dem Wörterbuch in Abschnitt 7 des Snippets:

```php
hh_t( 'free_shipping' );     // im Theme
[hh_t key="free_shipping"]   // in Elementor/Gutenberg
```

Neue Schlüssel einfach im Array `hh_strings()` ergänzen.

### 7. Shop / Produkte

WooCommerce-Produkttexte sind einsprachig gespeichert. Der schlankeste Weg ohne Plugin:

1. Produkt in der Produktliste über *Duplizieren* kopieren, Titel/Beschreibung übersetzen,
   Slug z. B. `poudre-cheveux-brun-fonce` setzen.
2. In der Box „Sprache / Übersetzung" die Sprache setzen und **dieselbe Übersetzungs-Gruppe**
   wie beim deutschen Produkt eintragen.
3. Damit der Lagerbestand nicht auseinanderläuft, in der `wp-config.php` ergänzen:

   ```php
   define( 'HH_SYNC_STOCK', true );
   ```

   Das Snippet spiegelt Bestand und Lagerstatus dann automatisch auf alle Produkte
   derselben Gruppe.

Bei wenigen SKUs (dein Fall) ist das deutlich weniger Aufwand und Last als eine
Übersetzungsebene über der gesamten Produktdatenbank. Ab ca. 30+ Produkten mit häufigen
Preis-/Bestandsänderungen wird Duplizieren unpraktisch – dann siehe „Ehrliche Einordnung".

### 8. SEO-Abschluss

* **Yoast/RankMath**: Für jede Sprachversion Titel und Meta-Description in der Zielsprache
  pflegen – bloß übersetzte Fließtexte reichen für gutes Ranking nicht.
* **Sitemap**: Yoast/RankMath nehmen die neuen Seiten automatisch auf; die `hreflang`-Tags
  liefert das Snippet im `<head>`.
* **Google Search Console**: Nach dem Livegang die Sitemap neu einreichen und unter
  *Seiten* prüfen, ob `/fr/` und `/it/` indexiert werden.
* **Canonical**: Jede Sprachversion zeigt auf sich selbst (Standardverhalten von
  Yoast/RankMath) – nicht auf die deutsche Version, sonst wird die Übersetzung nie ranken.
* **Übersetzungsqualität**: Maschinell vorübersetzen ist für den Start in Ordnung, aber die
  Produkt- und Verkaufsseiten sollte eine muttersprachliche Person gegenlesen –
  gerade im Beauty-Bereich entscheidet Sprachgefühl über die Conversion.

### Was das Snippet konkret tut

| Abschnitt | Funktion |
|---|---|
| 1–2 | Sprachkonfiguration, Spracherkennung aus der URL (inkl. WooCommerce-AJAX über den Referer) |
| 3 | `determine_locale` umschalten → Core, Theme, WooCommerce übersetzen sich selbst; `<html lang="fr-CH">`; Body-Klasse `hh-lang-fr` |
| 4–5 | Übersetzungen über `_hh_group` verknüpfen, `hreflang` + `x-default` ausgeben |
| 6 | Sprachumschalter als Shortcode und PHP-Funktion |
| 7 | Wörterbuch `hh_t()` für fest verdrahtete Theme-Texte |
| 8 | Menü pro Sprache |
| 9 | Website-Suche auf die aktuelle Sprache einschränken |
| 10 | Redaktionsbox „Sprache / Übersetzung" im Editor |
| 11 | Optionale Lagerbestand-Synchronisation zwischen Produktduplikaten |

Keine eigenen Datenbanktabellen, keine zusätzlichen Queries auf jeder Seite außer einer
kleinen Meta-Abfrage für die `hreflang`-Tags. Damit ist der Overhead praktisch null,
im Gegensatz zu WPML.

---

## Variante B – reines PHP ohne CMS

```
standalone-php/
├── .htaccess          Alle URLs auf index.php leiten
├── index.php          Front Controller: Sprache + Seite bestimmen, Template rendern
├── lib/i18n.php       Die komplette Logik (~200 Zeilen, keine Abhängigkeiten)
├── lang/de.php        Wörterbuch Deutsch (Referenzsprache)
├── lang/fr.php        Wörterbuch Französisch
├── lang/it.php        Wörterbuch Italienisch
└── pages/home.php     Beispielseite: ein Template bedient alle Sprachen
```

Nutzung im Template:

```php
<h1><?php echo e( 'hero_title' ); ?></h1>                      <!-- übersetzt + escaped -->
<a href="<?php echo i18n_url( 'shop' ); ?>">…</a>              <!-- URL in aktueller Sprache -->
<?php echo i18n_switcher(); ?>                                  <!-- Sprachumschalter -->
```

Fehlt ein Schlüssel in `fr.php`, greift automatisch der deutsche Wert – die Seite bleibt
immer funktionsfähig, auch wenn eine Übersetzung noch nicht fertig ist.

Braucht eine Sprache eine abweichende Seitenstruktur, legst du neben `pages/home.php`
einfach `pages/home.fr.php` an; die sprachspezifische Datei gewinnt.

---

## Ehrliche Einordnung

Der hier gewählte Weg ist bewusst schlank und läuft ohne Plugin-Overhead. Zwei Dinge sollst du
vorher wissen:

* **Die Inhalte pflegst du doppelt bzw. dreifach.** Änderst du die deutsche Verkaufsseite,
  musst du daran denken, die französische und italienische Version nachzuziehen. Das ist der
  Preis für „kein Plugin". Bei einer Website mit einer überschaubaren Zahl an Seiten – wie deiner –
  ist das völlig handhabbar.
* **Wenn der Shop stark wächst** (viele Produkte, häufige Preis- und Bestandsänderungen,
  mehrere Redaktionen), ist *Polylang* in der kostenlosen Version die vernünftigere Wahl.
  Es ist deutlich leichter als WPML und übernimmt genau die Buchführung, die du hier
  von Hand machst. Der Umstieg wäre auch später problemlos möglich: Die URL-Struktur
  `/fr/`, `/it/` ist bei Polylang identisch, deine Links und dein Ranking bleiben also erhalten.

Meine Empfehlung: mit diesem Snippet starten. Es kostet dich nichts, blockiert nichts und
deckt deinen aktuellen Umfang sauber ab.
