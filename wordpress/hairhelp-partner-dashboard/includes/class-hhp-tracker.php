<?php
/**
 * Erfassung der QR-Code-Besuche und Speicherung im Cookie.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Nimmt den Kampagnencode aus der Adresszeile entgegen und haelt ihn 30 Tage vor.
 */
class HHP_Tracker {

	/**
	 * Registriert alle Hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_rewrite_rules' ) );
		add_filter( 'query_vars', array( __CLASS__, 'register_query_var' ) );

		// Frueh genug, damit das Cookie vor der ersten Ausgabe gesetzt werden kann.
		add_action( 'init', array( __CLASS__, 'capture_from_request' ), 5 );
		add_action( 'template_redirect', array( __CLASS__, 'handle_landing' ) );
	}

	/**
	 * Legt die sprechende Adresse /qr/CODE an.
	 *
	 * @return void
	 */
	public static function register_rewrite_rules() {
		if ( ! HHP_Settings::get( 'pretty_urls' ) ) {
			return;
		}

		add_rewrite_rule( '^qr/([^/]+)/?$', 'index.php?hhp_qr=$matches[1]', 'top' );
	}

	/**
	 * Meldet die eigene Abfragevariable an.
	 *
	 * @param array $vars Bestehende Variablen.
	 *
	 * @return array
	 */
	public static function register_query_var( $vars ) {
		$vars[] = 'hhp_qr';

		return $vars;
	}

	/**
	 * Liest den Code aus der Adresszeile und legt ihn im Cookie ab.
	 *
	 * @return void
	 */
	public static function capture_from_request() {
		$code = self::code_from_request();

		if ( '' === $code ) {
			return;
		}

		self::remember( $code );
	}

	/**
	 * Ermittelt den Kampagnencode aus Permalink oder Abfrageparameter.
	 *
	 * @return string
	 */
	protected static function code_from_request() {
		$param = sanitize_key( HHP_Settings::get( 'param', 'qr' ) );

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Oeffentlicher Einstiegspunkt ohne Formularverarbeitung.
		if ( '' !== $param && isset( $_GET[ $param ] ) ) {
			return self::sanitize_code( wp_unslash( $_GET[ $param ] ) );
		}

		// Sprechende Adresse /qr/CODE, ausgewertet noch vor dem Aufloesen der Abfrage.
		$request = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$path = wp_parse_url( $request, PHP_URL_PATH );

		if ( is_string( $path ) ) {
			// Basispfad der Installation abziehen, damit Unterverzeichnisse
			// ebenso funktionieren wie eine Installation im Wurzelverzeichnis.
			$base = (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH );
			$base = rtrim( $base, '/' );

			if ( '' !== $base && 0 === strpos( $path, $base ) ) {
				$path = substr( $path, strlen( $base ) );
			}

			// Bewusst streng verankert: nur /qr/CODE zaehlt, damit regulaere
			// Seitenadressen nicht versehentlich als Kampagne gelesen werden.
			if ( preg_match( '#^/qr/([^/?]+)/?$#i', $path, $matches ) ) {
				return self::sanitize_code( rawurldecode( $matches[1] ) );
			}
		}

		return '';
	}

	/**
	 * Bereinigt einen Kampagnencode.
	 *
	 * @param string $code Rohwert.
	 *
	 * @return string
	 */
	public static function sanitize_code( $code ) {
		$code = strtolower( trim( (string) $code ) );
		$code = preg_replace( '/[^a-z0-9_\-]/', '', $code );

		return substr( (string) $code, 0, 40 );
	}

	/**
	 * Schreibt den Code in Cookie und Sitzung.
	 *
	 * @param string $code Kampagnencode.
	 *
	 * @return void
	 */
	public static function remember( $code ) {
		$code = self::sanitize_code( $code );

		if ( '' === $code ) {
			return;
		}

		$existing = self::current_code();

		// Bei Erstkontakt-Zuordnung bleibt der zuerst erfasste Code bestehen.
		if ( 'first' === HHP_Settings::get( 'attribution' ) && '' !== $existing ) {
			return;
		}

		$name    = self::cookie_name();
		$days    = max( 1, (int) HHP_Settings::get( 'cookie_days', 30 ) );
		$expires = time() + ( $days * DAY_IN_SECONDS );

		if ( ! headers_sent() ) {
			setcookie(
				$name,
				$code,
				array(
					'expires'  => $expires,
					'path'     => COOKIEPATH ? COOKIEPATH : '/',
					'domain'   => COOKIE_DOMAIN,
					'secure'   => is_ssl(),
					// Bewusst lesbar fuer JavaScript: der Wert ist ein reiner
					// Kampagnenschluessel ohne Personenbezug und wird auch von
					// der eigenstaendigen Skriptvariante ausgewertet.
					'httponly' => false,
					'samesite' => 'Lax',
				)
			);

			setcookie(
				$name . '_ts',
				(string) time(),
				array(
					'expires'  => $expires,
					'path'     => COOKIEPATH ? COOKIEPATH : '/',
					'domain'   => COOKIE_DOMAIN,
					'secure'   => is_ssl(),
					'httponly' => false,
					'samesite' => 'Lax',
				)
			);
		}

		// Damit die Zuordnung auch innerhalb der laufenden Sitzung greift.
		$_COOKIE[ $name ] = $code;

		if ( function_exists( 'WC' ) && WC() && WC()->session ) {
			WC()->session->set( 'hhp_ref', $code );
			WC()->session->set( 'hhp_ref_time', time() );
		}

		/**
		 * Wird ausgeloest, sobald ein Kampagnencode erfasst wurde.
		 *
		 * @param string $code Kampagnencode.
		 */
		do_action( 'hhp_code_captured', $code );
	}

	/**
	 * Liefert den Namen des Tracking-Cookies.
	 *
	 * @return string
	 */
	public static function cookie_name() {
		$name = HHP_Settings::get( 'cookie_name', 'hhp_ref' );
		$name = preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $name );

		return '' !== $name ? $name : 'hhp_ref';
	}

	/**
	 * Liefert den aktuell hinterlegten Kampagnencode.
	 *
	 * @return string
	 */
	public static function current_code() {
		$name = self::cookie_name();

		if ( isset( $_COOKIE[ $name ] ) ) {
			$code = self::sanitize_code( wp_unslash( $_COOKIE[ $name ] ) );

			if ( '' !== $code ) {
				return $code;
			}
		}

		// WC() liefert null, solange WooCommerce nicht vollstaendig geladen ist.
		if ( function_exists( 'WC' ) && WC() && WC()->session ) {
			return self::sanitize_code( (string) WC()->session->get( 'hhp_ref', '' ) );
		}

		return '';
	}

	/**
	 * Leitet Besucher der QR-Adresse auf die Zielseite weiter.
	 *
	 * @return void
	 */
	public static function handle_landing() {
		$code = get_query_var( 'hhp_qr' );

		if ( '' === $code || null === $code ) {
			return;
		}

		$code = self::sanitize_code( $code );

		if ( '' === $code ) {
			return;
		}

		self::remember( $code );

		$target = HHP_Settings::get( 'landing_url' );
		$target = $target ? esc_url_raw( $target ) : home_url( '/' );

		// Zusaetzliche Parameter wie utm_* bleiben erhalten.
		$extra = array();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reine Weiterleitung ohne Formularverarbeitung.
		foreach ( (array) $_GET as $key => $value ) {
			$key = sanitize_key( $key );

			if ( '' === $key || 'hhp_qr' === $key || is_array( $value ) ) {
				continue;
			}

			$extra[ $key ] = sanitize_text_field( wp_unslash( $value ) );
		}

		if ( ! empty( $extra ) ) {
			$target = add_query_arg( $extra, $target );
		}

		/**
		 * Erlaubt das Anpassen der Zieladresse nach einem QR-Scan.
		 *
		 * @param string $target Zieladresse.
		 * @param string $code   Kampagnencode.
		 */
		$target = apply_filters( 'hhp_landing_url', $target, $code );

		wp_safe_redirect( $target, 302 );
		exit;
	}

	/**
	 * Baut die vollstaendige QR-Adresse fuer einen Kampagnencode.
	 *
	 * @param string $code Kampagnencode.
	 *
	 * @return string
	 */
	public static function build_qr_url( $code ) {
		$code = self::sanitize_code( $code );

		if ( '' === $code ) {
			return '';
		}

		if ( HHP_Settings::get( 'pretty_urls' ) && get_option( 'permalink_structure' ) ) {
			return home_url( '/qr/' . $code );
		}

		$param = sanitize_key( HHP_Settings::get( 'param', 'qr' ) );

		return add_query_arg( $param, $code, home_url( '/' ) );
	}
}
