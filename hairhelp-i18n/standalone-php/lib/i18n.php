<?php
/**
 * Minimale i18n-Bibliothek fuer eine reine PHP-Website (kein CMS).
 *
 * URL-Schema:
 *   /                    -> Deutsch, Startseite
 *   /streuhaar           -> Deutsch, Seite "streuhaar"
 *   /fr/                 -> Franzoesisch, Startseite
 *   /fr/streuhaar        -> Franzoesisch, Seite "streuhaar"
 *
 * Kein Framework, keine Datenbank, keine Session. Ein Include, fertig.
 */

declare( strict_types=1 );

const I18N_LANGS = array(
	'de' => array( 'prefix' => '',   'hreflang' => 'de-CH', 'label' => 'Deutsch',  'short' => 'DE' ),
	'fr' => array( 'prefix' => 'fr', 'hreflang' => 'fr-CH', 'label' => 'Français', 'short' => 'FR' ),
	'it' => array( 'prefix' => 'it', 'hreflang' => 'it-CH', 'label' => 'Italiano', 'short' => 'IT' ),
	// 'en' => array( 'prefix' => 'en', 'hreflang' => 'en', 'label' => 'English', 'short' => 'EN' ),
);

const I18N_DEFAULT_LANG = 'de';

/**
 * Basis-URL der Website ohne abschliessenden Slash, z. B. "https://www.example.ch".
 */
function i18n_base_url(): string {
	$scheme = ( ! empty( $_SERVER['HTTPS'] ) && 'off' !== $_SERVER['HTTPS'] ) ? 'https' : 'http';
	$host   = $_SERVER['HTTP_HOST'] ?? 'localhost';

	return $scheme . '://' . $host;
}

/**
 * Zerlegt die aktuelle URL in Sprache und Seiten-Slug.
 *
 * @return array{lang:string, page:string}
 */
function i18n_route(): array {
	static $route = null;

	if ( null !== $route ) {
		return $route;
	}

	$path     = (string) parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH );
	$segments = array_values( array_filter( explode( '/', trim( $path, '/' ) ), 'strlen' ) );
	$lang     = I18N_DEFAULT_LANG;

	if ( isset( $segments[0] ) ) {
		foreach ( I18N_LANGS as $code => $cfg ) {
			if ( '' !== $cfg['prefix'] && strtolower( $segments[0] ) === $cfg['prefix'] ) {
				$lang = $code;
				array_shift( $segments );
				break;
			}
		}
	}

	$page = $segments[0] ?? 'home';
	// Nur sichere Slugs zulassen (kein Directory Traversal beim Einbinden von Templates).
	$page = preg_replace( '/[^a-z0-9\-]/', '', strtolower( $page ) );

	return $route = array(
		'lang' => $lang,
		'page' => '' !== $page ? $page : 'home',
	);
}

function i18n_lang(): string {
	return i18n_route()['lang'];
}

function i18n_page(): string {
	return i18n_route()['page'];
}

/**
 * Baut eine URL in der gewuenschten Sprache.
 */
function i18n_url( string $page = '', ?string $lang = null ): string {
	$lang   = $lang ?? i18n_lang();
	$prefix = I18N_LANGS[ $lang ]['prefix'] ?? '';
	$page   = trim( $page, '/' );

	if ( 'home' === $page ) {
		$page = '';
	}

	$path = '/' . ( '' !== $prefix ? $prefix . '/' : '' ) . $page;

	return i18n_base_url() . rtrim( $path, '/' ) . ( '' === $page ? '/' : '' );
}

/**
 * Laedt das Sprachwoerterbuch (mit Rueckfall auf die Standardsprache).
 */
function i18n_dict( ?string $lang = null ): array {
	static $cache = array();

	$lang = $lang ?? i18n_lang();

	if ( isset( $cache[ $lang ] ) ) {
		return $cache[ $lang ];
	}

	$dir      = __DIR__ . '/../lang/';
	$fallback = is_readable( $dir . I18N_DEFAULT_LANG . '.php' ) ? (array) require $dir . I18N_DEFAULT_LANG . '.php' : array();
	$current  = is_readable( $dir . $lang . '.php' ) ? (array) require $dir . $lang . '.php' : array();

	return $cache[ $lang ] = array_replace( $fallback, $current );
}

/**
 * Uebersetzt einen Schluessel. Platzhalter: t( 'greeting', array( 'name' => 'Anna' ) ).
 * Mit $lang laesst sich gezielt eine andere Sprache abfragen (z. B. fuer den Sprachhinweis).
 */
function t( string $key, array $vars = array(), ?string $lang = null ): string {
	$dict  = i18n_dict( $lang );
	$value = $dict[ $key ] ?? $key;

	foreach ( $vars as $name => $replacement ) {
		$value = str_replace( '{' . $name . '}', (string) $replacement, $value );
	}

	return $value;
}

/**
 * Uebersetzt und escaped fuer die HTML-Ausgabe (Standardfall im Template).
 */
function e( string $key, array $vars = array(), ?string $lang = null ): string {
	return htmlspecialchars( t( $key, $vars, $lang ), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

/**
 * hreflang-Tags fuer den <head>. Nur Sprachen ausgeben, die es fuer diese Seite wirklich gibt.
 */
function i18n_hreflang_tags(): string {
	$page = i18n_page();
	$out  = '';

	foreach ( I18N_LANGS as $code => $cfg ) {
		if ( ! i18n_page_exists( $page, $code ) ) {
			continue;
		}

		$out .= sprintf(
			'<link rel="alternate" hreflang="%s" href="%s">' . "\n",
			htmlspecialchars( $cfg['hreflang'], ENT_QUOTES, 'UTF-8' ),
			htmlspecialchars( i18n_url( $page, $code ), ENT_QUOTES, 'UTF-8' )
		);
	}

	$out .= sprintf(
		'<link rel="alternate" hreflang="x-default" href="%s">' . "\n",
		htmlspecialchars( i18n_url( $page, I18N_DEFAULT_LANG ), ENT_QUOTES, 'UTF-8' )
	);

	return $out;
}

/**
 * Gibt es ein Template fuer diese Seite in dieser Sprache?
 * Konvention: pages/<seite>.<sprache>.php, Rueckfall pages/<seite>.php
 */
function i18n_page_exists( string $page, string $lang ): bool {
	$dir = __DIR__ . '/../pages/';

	return is_readable( $dir . $page . '.' . $lang . '.php' ) || is_readable( $dir . $page . '.php' );
}

/**
 * Pfad zum Template der aktuellen Seite (oder null fuer 404).
 */
function i18n_template( string $page, string $lang ): ?string {
	$dir = __DIR__ . '/../pages/';

	foreach ( array( $dir . $page . '.' . $lang . '.php', $dir . $page . '.php' ) as $candidate ) {
		if ( is_readable( $candidate ) ) {
			return $candidate;
		}
	}

	return null;
}

/**
 * Sprachumschalter als fertiges HTML.
 */
function i18n_switcher(): string {
	$page    = i18n_page();
	$current = i18n_lang();
	$items   = '';

	foreach ( I18N_LANGS as $code => $cfg ) {
		$url   = i18n_page_exists( $page, $code ) ? i18n_url( $page, $code ) : i18n_url( '', $code );
		$class = $code === $current ? ' class="is-current"' : '';

		$items .= sprintf(
			'<li%s><a href="%s" hreflang="%s" lang="%s" rel="alternate">%s</a></li>',
			$class,
			htmlspecialchars( $url, ENT_QUOTES, 'UTF-8' ),
			htmlspecialchars( $cfg['hreflang'], ENT_QUOTES, 'UTF-8' ),
			htmlspecialchars( $cfg['hreflang'], ENT_QUOTES, 'UTF-8' ),
			htmlspecialchars( $cfg['short'], ENT_QUOTES, 'UTF-8' )
		);
	}

	return '<nav class="lang-switcher" aria-label="' . e( 'lang_switcher_label' ) . '"><ul>' . $items . '</ul></nav>';
}

/**
 * Vorschlag fuer die Browsersprache - bewusst OHNE automatische Weiterleitung
 * (Auto-Redirects verwirren Nutzer und behindern das Crawling durch Suchmaschinen).
 * Rueckgabe: Sprachcode oder null, wenn er ohnehin der aktuellen Sprache entspricht.
 */
function i18n_suggested_lang(): ?string {
	$header = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';

	if ( '' === $header ) {
		return null;
	}

	foreach ( explode( ',', $header ) as $part ) {
		$code = strtolower( substr( trim( explode( ';', $part )[0] ), 0, 2 ) );

		if ( isset( I18N_LANGS[ $code ] ) ) {
			return $code === i18n_lang() ? null : $code;
		}
	}

	return null;
}
