<?php
/**
 * Einstellungen und Vermittlerverwaltung.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Kapselt Optionen, Standardwerte und den Zugriff auf die Vermittlerliste.
 */
class HHP_Settings {

	const OPTION_SETTINGS = 'hhp_settings';
	const OPTION_PARTNERS = 'hhp_partners';
	const OPTION_VERSION  = 'hhp_version';

	/**
	 * Zwischenspeicher der Einstellungen.
	 *
	 * @var array|null
	 */
	protected static $cache = null;

	/**
	 * Registriert die Optionen.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'update_option_' . self::OPTION_SETTINGS, array( __CLASS__, 'flush_cache' ) );
	}

	/**
	 * Leert den Zwischenspeicher.
	 *
	 * @return void
	 */
	public static function flush_cache() {
		self::$cache = null;
	}

	/**
	 * Liefert die Standardeinstellungen.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			// Tracking.
			'param'            => 'qr',
			'cookie_name'      => 'hhp_ref',
			'cookie_days'      => 30,
			'attribution'      => 'last',
			'landing_url'      => '',
			'pretty_urls'      => 1,

			// Auswertung.
			'statuses'         => array( 'processing', 'completed' ),
			'refunded_status'  => array( 'refunded', 'cancelled', 'failed' ),
			'customer_data'    => 'initials',

			// Zugang: 'login' (Benutzername und Passwort), 'token' (geheimer
			// Link) oder 'both'. Standard ist der Login, weil ein Link durch
			// blosses Weiterleiten seine Schutzwirkung verliert.
			'access_mode'      => 'login',
			'session_hours'    => 12,
			'remember_days'    => 30,
			'show_products'    => 1,

			// Der Shop liefert ab 35 Franken gratis, die Versandkosten fallen
			// aber trotzdem an. Sie werden daher immer abgezogen.
			'shipping_deduct'  => 1,
			'shipping_flat'    => 4.95,
			'currency_note'    => '',

			// Darstellung.
			// Markenwerte von www.hairhelp-haarverdichter.ch: das Gold aus dem
			// eigenen Token --hhch-gold, der Champagnerton des Elementor-Kits
			// und die dunkle Ueberschriftenfarbe.
			'brand_primary'    => '#a39772',
			'brand_accent'     => '#d1bc92',
			'brand_dark'       => '#292929',
			'brand_logo'       => '',
			'use_site_logo'    => 1,
			'dashboard_title'  => '',
			'poster_name'      => '',

			// Beim Loeschen des Plugins bleiben die Daten standardmaessig erhalten.
			'purge_on_delete'  => 0,
		);
	}

	/**
	 * Legt die Standardwerte an, ohne bestehende Werte zu ueberschreiben.
	 *
	 * @return void
	 */
	public static function install_defaults() {
		$existing = get_option( self::OPTION_SETTINGS, array() );

		if ( ! is_array( $existing ) ) {
			$existing = array();
		}

		update_option( self::OPTION_SETTINGS, array_merge( self::defaults(), $existing ) );

		if ( false === get_option( self::OPTION_PARTNERS, false ) ) {
			// Vorbelegung mit dem bereits vereinbarten Vermittlercode.
			update_option(
				self::OPTION_PARTNERS,
				array(
					array(
						'id'              => 'loopx13',
						'name'            => 'Loop X',
						'codes'           => array( 'loopx13' ),
						'coupons'         => array( 'loopx13' ),
						'commission'      => 10.0,
						'commission_base' => 'net',
						'token'           => self::generate_token(),
						'username'        => 'loopx13',
						'password_hash'   => '',

						// Erscheinungsbild von loopx13.ch.
						'brand_name'      => self::loopx13_marke()['brand_name'],
						'brand_theme'     => self::loopx13_marke()['brand_theme'],
						'brand_primary'   => self::loopx13_marke()['brand_primary'],
						'brand_accent'    => self::loopx13_marke()['brand_accent'],
						'brand_grund'     => self::loopx13_marke()['brand_grund'],
						'brand_font'      => self::loopx13_marke()['brand_font'],
						'active'          => 1,
						'note'            => '',
					),
				)
			);
		}
	}

	/**
	 * Erscheinungsbild des Vermittlers LoopX13.
	 *
	 * Entnommen der Website des Vermittlers: fast schwarzer Grund, Cyan als
	 * Leitfarbe, Magenta als Zweitfarbe.
	 *
	 * @return array
	 */
	public static function loopx13_marke() {
		return array(
			'brand_name'    => 'LoopX13',
			'brand_theme'   => 'dunkel',
			'brand_primary' => '#00e5ff',
			'brand_accent'  => '#ff007a',
			'brand_grund'   => '#030712',
			'brand_font'    => 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
		);
	}

	/**
	 * Ergaenzt bestehende Daten nach einer Aktualisierung des Plugins.
	 *
	 * Neue Felder legt install_defaults() nur bei einer Neuinstallation an.
	 * Bei einem Update bliebe ein bestehender Vermittler sonst ohne
	 * Benutzernamen und ohne Markenwerte zurueck, und die neuen Funktionen
	 * saehen aus, als haetten sie nicht gegriffen.
	 *
	 * @return void
	 */
	public static function maybe_upgrade() {
		$installiert = (string) get_option( self::OPTION_VERSION, '' );

		if ( HHP_VERSION === $installiert ) {
			return;
		}

		$partners  = self::partners();
		$geaendert = false;

		foreach ( $partners as $index => $partner ) {
			// Ohne Benutzernamen ist keine Anmeldung moeglich; die Kennung ist
			// der naheliegende Vorgabewert.
			if ( '' === $partner['username'] ) {
				$partners[ $index ]['username'] = $partner['id'];
				$geaendert                      = true;
			}

			// Der bereits vereinbarte Vermittler bekommt sein Erscheinungsbild,
			// sofern noch keines hinterlegt wurde.
			if ( 'loopx13' === $partner['id'] && 'shop' === $partner['brand_theme'] && '' === $partner['brand_primary'] ) {
				// Auf den bereits angepassten Stand aufsetzen, nicht auf den
				// urspruenglichen: sonst geht der eben gesetzte Benutzername verloren.
				$partners[ $index ] = array_merge( $partners[ $index ], self::loopx13_marke() );
				$geaendert          = true;
			}
		}

		if ( $geaendert ) {
			self::save_partners( $partners );
		}

		update_option( self::OPTION_VERSION, HHP_VERSION, false );

		// Die Permalink-Regeln koennen sich zwischen Versionen aendern.
		HHP_Tracker::register_rewrite_rules();
		flush_rewrite_rules();
	}

	/**
	 * Liefert alle Einstellungen.
	 *
	 * @return array
	 */
	public static function all() {
		if ( null === self::$cache ) {
			$stored = get_option( self::OPTION_SETTINGS, array() );

			if ( ! is_array( $stored ) ) {
				$stored = array();
			}

			self::$cache = array_merge( self::defaults(), $stored );
		}

		return self::$cache;
	}

	/**
	 * Liefert einen einzelnen Einstellungswert.
	 *
	 * @param string $key     Schluessel.
	 * @param mixed  $default Rueckfallwert.
	 *
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		$all = self::all();

		return array_key_exists( $key, $all ) ? $all[ $key ] : $default;
	}

	/**
	 * Speichert die Einstellungen.
	 *
	 * @param array $values Neue Werte.
	 *
	 * @return void
	 */
	public static function save( $values ) {
		update_option( self::OPTION_SETTINGS, array_merge( self::all(), $values ) );
		self::flush_cache();
	}

	/* --------------------------------------------------------------------- *
	 * Vermittler
	 * --------------------------------------------------------------------- */

	/**
	 * Liefert alle Vermittler.
	 *
	 * @param bool $only_active Nur aktive Vermittler zurueckgeben.
	 *
	 * @return array<int,array>
	 */
	public static function partners( $only_active = false ) {
		$partners = get_option( self::OPTION_PARTNERS, array() );

		if ( ! is_array( $partners ) ) {
			return array();
		}

		$result = array();

		foreach ( $partners as $partner ) {
			$partner = self::normalize_partner( $partner );

			if ( '' === $partner['id'] ) {
				continue;
			}

			if ( $only_active && empty( $partner['active'] ) ) {
				continue;
			}

			$result[] = $partner;
		}

		return $result;
	}

	/**
	 * Ergaenzt fehlende Felder eines Vermittlerdatensatzes.
	 *
	 * @param array $partner Rohdaten.
	 *
	 * @return array
	 */
	public static function normalize_partner( $partner ) {
		$partner = is_array( $partner ) ? $partner : array();

		return array(
			'id'              => isset( $partner['id'] ) ? sanitize_key( $partner['id'] ) : '',
			'name'            => isset( $partner['name'] ) ? sanitize_text_field( $partner['name'] ) : '',
			'codes'           => isset( $partner['codes'] ) ? array_values( array_filter( (array) $partner['codes'] ) ) : array(),
			'coupons'         => isset( $partner['coupons'] ) ? array_values( array_filter( (array) $partner['coupons'] ) ) : array(),
			'commission'      => isset( $partner['commission'] ) ? (float) $partner['commission'] : 0.0,
			'commission_base' => isset( $partner['commission_base'] ) && 'gross' === $partner['commission_base'] ? 'gross' : 'net',
			'token'           => isset( $partner['token'] ) ? preg_replace( '/[^a-f0-9]/', '', (string) $partner['token'] ) : '',
			'username'        => isset( $partner['username'] ) ? HHP_Auth::sanitize_username( $partner['username'] ) : '',

			// Eigenes Erscheinungsbild. Leere Werte fallen auf die Shopwerte
			// zurueck, damit ein Vermittler ohne eigene Marke nichts einstellen muss.
			'brand_name'      => isset( $partner['brand_name'] ) ? sanitize_text_field( $partner['brand_name'] ) : '',
			'brand_logo'      => isset( $partner['brand_logo'] ) ? esc_url_raw( $partner['brand_logo'] ) : '',
			'brand_theme'     => isset( $partner['brand_theme'] ) && in_array( $partner['brand_theme'], array( 'hell', 'dunkel' ), true ) ? $partner['brand_theme'] : 'shop',
			'brand_primary'   => isset( $partner['brand_primary'] ) ? (string) sanitize_hex_color( $partner['brand_primary'] ) : '',
			'brand_accent'    => isset( $partner['brand_accent'] ) ? (string) sanitize_hex_color( $partner['brand_accent'] ) : '',
			'brand_grund'     => isset( $partner['brand_grund'] ) ? (string) sanitize_hex_color( $partner['brand_grund'] ) : '',
			'brand_font'      => isset( $partner['brand_font'] ) ? sanitize_text_field( $partner['brand_font'] ) : '',
			'password_hash'   => isset( $partner['password_hash'] ) ? (string) $partner['password_hash'] : '',
			'active'          => ! empty( $partner['active'] ) ? 1 : 0,
			'note'            => isset( $partner['note'] ) ? sanitize_text_field( $partner['note'] ) : '',
		);
	}

	/**
	 * Speichert die vollstaendige Vermittlerliste.
	 *
	 * @param array $partners Vermittler.
	 *
	 * @return void
	 */
	public static function save_partners( $partners ) {
		$clean = array();

		foreach ( (array) $partners as $partner ) {
			$partner = self::normalize_partner( $partner );

			if ( '' === $partner['id'] ) {
				continue;
			}

			if ( '' === $partner['token'] || 32 > strlen( $partner['token'] ) ) {
				$partner['token'] = self::generate_token();
			}

			$clean[] = $partner;
		}

		update_option( self::OPTION_PARTNERS, $clean );
	}

	/**
	 * Sucht einen Vermittler anhand seiner Kennung.
	 *
	 * @param string $id Kennung.
	 *
	 * @return array|null
	 */
	public static function get_partner( $id ) {
		$id = sanitize_key( $id );

		foreach ( self::partners() as $partner ) {
			if ( $partner['id'] === $id ) {
				return $partner;
			}
		}

		return null;
	}

	/**
	 * Sucht einen Vermittler anhand seines Zugangstokens.
	 *
	 * Der Vergleich erfolgt zeitkonstant, damit sich ein gueltiges Token nicht
	 * ueber Laufzeitunterschiede erraten laesst.
	 *
	 * @param string $token Token aus der Adresszeile.
	 *
	 * @return array|null
	 */
	public static function get_partner_by_token( $token ) {
		$token = trim( (string) $token );

		// Bewusst pruefen statt bereinigen: Eingaben mit Fremdzeichen werden
		// abgewiesen, nicht stillschweigend zu einem gueltigen Token verkuerzt.
		if ( ! preg_match( '/^[a-f0-9]{32,64}$/', $token ) ) {
			return null;
		}

		foreach ( self::partners( true ) as $partner ) {
			if ( '' !== $partner['token'] && hash_equals( $partner['token'], $token ) ) {
				return $partner;
			}
		}

		return null;
	}

	/**
	 * Sucht den Vermittler, dem ein QR-Code zugeordnet ist.
	 *
	 * @param string $code Kampagnencode aus dem QR-Code.
	 *
	 * @return array|null
	 */
	public static function get_partner_by_code( $code ) {
		$code = self::normalize_code( $code );

		if ( '' === $code ) {
			return null;
		}

		foreach ( self::partners( true ) as $partner ) {
			foreach ( $partner['codes'] as $candidate ) {
				if ( self::normalize_code( $candidate ) === $code ) {
					return $partner;
				}
			}
		}

		return null;
	}

	/**
	 * Sucht den Vermittler, dem ein Gutscheincode zugeordnet ist.
	 *
	 * @param string $coupon Gutscheincode.
	 *
	 * @return array|null
	 */
	public static function get_partner_by_coupon( $coupon ) {
		$coupon = self::normalize_code( $coupon );

		if ( '' === $coupon ) {
			return null;
		}

		foreach ( self::partners( true ) as $partner ) {
			foreach ( $partner['coupons'] as $candidate ) {
				if ( self::normalize_code( $candidate ) === $coupon ) {
					return $partner;
				}
			}
		}

		return null;
	}

	/**
	 * Setzt das Passwort eines Vermittlers.
	 *
	 * Gehasht wird mit den WordPress-Funktionen, damit dieselbe Absicherung
	 * greift wie bei regulaeren Benutzerkonten.
	 *
	 * @param string $id       Kennung des Vermittlers.
	 * @param string $passwort Klartextpasswort.
	 *
	 * @return bool
	 */
	public static function set_password( $id, $passwort ) {
		$id       = sanitize_key( $id );
		$partners = self::partners();
		$gefunden = false;

		foreach ( $partners as $index => $partner ) {
			if ( $partner['id'] === $id ) {
				$partners[ $index ]['password_hash'] = wp_hash_password( $passwort );
				$gefunden                            = true;
				break;
			}
		}

		if ( ! $gefunden ) {
			return false;
		}

		self::save_partners( $partners );

		return true;
	}

	/**
	 * Vereinheitlicht Codes fuer den Vergleich.
	 *
	 * @param string $code Code.
	 *
	 * @return string
	 */
	public static function normalize_code( $code ) {
		return strtolower( trim( (string) $code ) );
	}

	/**
	 * Erzeugt ein kryptografisch sicheres Zugangstoken.
	 *
	 * @return string
	 */
	public static function generate_token() {
		if ( function_exists( 'random_bytes' ) ) {
			try {
				return bin2hex( random_bytes( 24 ) );
			} catch ( Exception $e ) {
				// Faellt unten auf die WordPress-Funktion zurueck.
				unset( $e );
			}
		}

		return substr( hash( 'sha256', wp_generate_password( 64, true, true ) . microtime() ), 0, 48 );
	}

	/**
	 * Liefert die Bestellstatus, die als vermittelter Umsatz zaehlen.
	 *
	 * @return array<int,string>
	 */
	public static function counted_statuses() {
		$statuses = (array) self::get( 'statuses', array( 'processing', 'completed' ) );

		return array_values( array_filter( array_map( 'sanitize_key', $statuses ) ) );
	}
}
