<?php
/**
 * Das Vermittler-Dashboard im Frontend.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Stellt den Shortcode bereit und regelt den Zugang ueber das Token.
 */
class HHP_Dashboard {

	const SHORTCODE = 'hhp_partner_dashboard';

	/**
	 * Registriert Shortcode und Skripte.
	 *
	 * @return void
	 */
	public static function init() {
		add_shortcode( self::SHORTCODE, array( __CLASS__, 'render' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
		add_filter( 'wp_robots', array( __CLASS__, 'noindex_dashboard' ) );
	}

	/**
	 * Registriert das Stylesheet.
	 *
	 * @return void
	 */
	public static function register_assets() {
		wp_register_style( 'hhp-dashboard', HHP_URL . 'assets/css/dashboard.css', array(), HHP_VERSION );

		$post = get_post();

		if ( $post instanceof WP_Post && has_shortcode( (string) $post->post_content, self::SHORTCODE ) ) {
			wp_enqueue_style( 'hhp-dashboard' );
		}
	}

	/**
	 * Haelt die Dashboard-Seite aus dem Suchmaschinenindex heraus.
	 *
	 * @param array $robots Robots-Anweisungen.
	 *
	 * @return array
	 */
	public static function noindex_dashboard( $robots ) {
		$post = get_post();

		if ( $post instanceof WP_Post && has_shortcode( (string) $post->post_content, self::SHORTCODE ) ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
		}

		return $robots;
	}

	/**
	 * Gibt das Dashboard aus.
	 *
	 * @param array $atts Shortcode-Attribute.
	 *
	 * @return string
	 */
	public static function render( $atts ) {
		wp_enqueue_style( 'hhp-dashboard' );

		$atts = shortcode_atts(
			array(
				'partner' => '',
			),
			$atts,
			self::SHORTCODE
		);

		$partner = self::resolve_partner( $atts['partner'] );

		if ( ! $partner ) {
			return self::render_template( 'token-form', array( 'fehler' => self::$auth_error ) );
		}

		list( $from, $to, $range ) = self::resolve_range();

		$report = HHP_Repository::get_report( $partner, $from, $to );

		return self::render_template(
			'dashboard',
			array(
				'partner'  => $partner,
				'report'   => $report,
				'von'      => $from,
				'bis'      => $to,
				'zeitraum' => $range,
				'token'    => self::$active_token,
				'ist_admin' => current_user_can( 'manage_woocommerce' ),
			)
		);
	}

	/**
	 * Fehlermeldung der Zugangspruefung.
	 *
	 * @var string
	 */
	protected static $auth_error = '';

	/**
	 * Token des aktuellen Zugriffs.
	 *
	 * @var string
	 */
	protected static $active_token = '';

	/**
	 * Ermittelt den anzuzeigenden Vermittler.
	 *
	 * @param string $forced Im Shortcode fest hinterlegter Vermittler.
	 *
	 * @return array|null
	 */
	protected static function resolve_partner( $forced = '' ) {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Zugang erfolgt ueber das Token, nicht ueber ein Formular mit Sitzungsbezug.
		$token = isset( $_REQUEST['hhp_token'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['hhp_token'] ) ) : '';

		if ( '' !== $token ) {
			if ( ! self::throttle_ok() ) {
				self::$auth_error = __( 'Zu viele Versuche. Bitte in einer Minute erneut versuchen.', 'hairhelp-partner' );

				return null;
			}

			$partner = HHP_Settings::get_partner_by_token( $token );

			if ( $partner ) {
				self::$active_token = $partner['token'];

				return $partner;
			}

			self::register_failed_attempt();
			self::$auth_error = __( 'Dieser Zugangslink ist ungueltig oder wurde zurueckgezogen.', 'hairhelp-partner' );

			return null;
		}

		// Shop-Verantwortliche duerfen jeden Vermittler einsehen.
		if ( current_user_can( 'manage_woocommerce' ) ) {
			$requested = isset( $_GET['hhp_partner'] ) ? sanitize_key( wp_unslash( $_GET['hhp_partner'] ) ) : '';
			// phpcs:enable WordPress.Security.NonceVerification.Recommended

			if ( '' !== $requested ) {
				$partner = HHP_Settings::get_partner( $requested );

				if ( $partner ) {
					return $partner;
				}
			}

			if ( '' !== $forced ) {
				$partner = HHP_Settings::get_partner( $forced );

				if ( $partner ) {
					return $partner;
				}
			}

			$partners = HHP_Settings::partners( true );

			if ( ! empty( $partners ) ) {
				return $partners[0];
			}
		}

		if ( '' !== $forced ) {
			// Fest zugewiesene Seite, etwa fuer einen einzelnen Vermittler.
			$partner = HHP_Settings::get_partner( $forced );

			if ( $partner && ! empty( $partner['active'] ) ) {
				return $partner;
			}
		}

		return null;
	}

	/**
	 * Prueft, ob von dieser Adresse noch Versuche zulaessig sind.
	 *
	 * @return bool
	 */
	protected static function throttle_ok() {
		return (int) get_transient( self::throttle_key() ) < 10;
	}

	/**
	 * Vermerkt einen fehlgeschlagenen Zugangsversuch.
	 *
	 * @return void
	 */
	protected static function register_failed_attempt() {
		$key = self::throttle_key();
		set_transient( $key, (int) get_transient( $key ) + 1, MINUTE_IN_SECONDS );
	}

	/**
	 * Bildet den Schluessel der Versuchszaehlung.
	 *
	 * @return string
	 */
	protected static function throttle_key() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unbekannt';

		return 'hhp_try_' . md5( $ip );
	}

	/**
	 * Ermittelt den ausgewaehlten Zeitraum.
	 *
	 * @return array{0:string,1:string,2:string}
	 */
	public static function resolve_range() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Reine Filterparameter ohne Datenaenderung.
		$range = isset( $_GET['hhp_zeitraum'] ) ? sanitize_key( wp_unslash( $_GET['hhp_zeitraum'] ) ) : '30';
		$from  = isset( $_GET['hhp_von'] ) ? sanitize_text_field( wp_unslash( $_GET['hhp_von'] ) ) : '';
		$to    = isset( $_GET['hhp_bis'] ) ? sanitize_text_field( wp_unslash( $_GET['hhp_bis'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$today = current_time( 'Y-m-d' );

		switch ( $range ) {
			case '7':
				$from = gmdate( 'Y-m-d', strtotime( $today . ' -6 days' ) );
				$to   = $today;
				break;
			case '90':
				$from = gmdate( 'Y-m-d', strtotime( $today . ' -89 days' ) );
				$to   = $today;
				break;
			case 'monat':
				$from = gmdate( 'Y-m-01', strtotime( $today ) );
				$to   = $today;
				break;
			case 'vormonat':
				$from = gmdate( 'Y-m-01', strtotime( $today . ' first day of last month' ) );
				$to   = gmdate( 'Y-m-t', strtotime( $from ) );
				break;
			case 'jahr':
				$from = gmdate( 'Y-01-01', strtotime( $today ) );
				$to   = $today;
				break;
			case 'alles':
				$from = '2000-01-01';
				$to   = $today;
				break;
			case 'eigen':
				$from = self::valid_date( $from, gmdate( 'Y-m-d', strtotime( $today . ' -29 days' ) ) );
				$to   = self::valid_date( $to, $today );

				if ( $from > $to ) {
					list( $from, $to ) = array( $to, $from );
				}
				break;
			case '30':
			default:
				$range = '30';
				$from  = gmdate( 'Y-m-d', strtotime( $today . ' -29 days' ) );
				$to    = $today;
				break;
		}

		return array( $from, $to, $range );
	}

	/**
	 * Prueft ein Datum im Format Y-m-d.
	 *
	 * @param string $value    Eingabe.
	 * @param string $fallback Rueckfallwert.
	 *
	 * @return string
	 */
	protected static function valid_date( $value, $fallback ) {
		$value = trim( (string) $value );

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) && strtotime( $value ) ) {
			return $value;
		}

		return $fallback;
	}

	/**
	 * Bindet eine Vorlage ein und gibt deren Ausgabe zurueck.
	 *
	 * @param string $name Dateiname ohne Endung.
	 * @param array  $vars Variablen fuer die Vorlage.
	 *
	 * @return string
	 */
	public static function render_template( $name, $vars = array() ) {
		$file = HHP_PATH . 'templates/' . $name . '.php';

		/**
		 * Erlaubt eigene Vorlagen im Theme.
		 *
		 * @param string $file Pfad zur Vorlage.
		 * @param string $name Name der Vorlage.
		 */
		$file = apply_filters( 'hhp_template', $file, $name );

		if ( ! file_exists( $file ) ) {
			return '';
		}

		// phpcs:ignore WordPress.PHP.DontExtract.extract_extract -- Bewusste Uebergabe an die Vorlage.
		extract( $vars, EXTR_SKIP );

		ob_start();
		include $file;

		return (string) ob_get_clean();
	}

	/**
	 * Liefert die Markenfarben als CSS-Variablen.
	 *
	 * Schriftarten werden bewusst nicht gesetzt: Das Dashboard uebernimmt die
	 * Typografie des aktiven Themes und fuegt sich damit von selbst in das
	 * bestehende Erscheinungsbild ein.
	 *
	 * @return string
	 */
	public static function brand_style() {
		$primary = sanitize_hex_color( HHP_Settings::get( 'brand_primary' ) );
		$accent  = sanitize_hex_color( HHP_Settings::get( 'brand_accent' ) );
		$dark    = sanitize_hex_color( HHP_Settings::get( 'brand_dark' ) );

		return sprintf(
			'--hhp-primary:%s;--hhp-accent:%s;--hhp-dark:%s;',
			$primary ? $primary : '#2f6f62',
			$accent ? $accent : '#c8a04a',
			$dark ? $dark : '#1c2b28'
		);
	}

	/**
	 * Liefert das Logo fuer den Dashboard-Kopf.
	 *
	 * Standardmaessig wird das in WordPress hinterlegte Website-Logo verwendet,
	 * damit das Dashboard ohne weitere Pflege zum Auftritt der Seite passt.
	 *
	 * @return string HTML des Logos oder leerer String.
	 */
	public static function brand_logo() {
		$custom = HHP_Settings::get( 'brand_logo' );

		if ( $custom ) {
			return sprintf(
				'<img src="%s" alt="%s" class="hhp-logo" />',
				esc_url( $custom ),
				esc_attr( get_bloginfo( 'name' ) )
			);
		}

		if ( ! HHP_Settings::get( 'use_site_logo' ) ) {
			return '';
		}

		$logo_id = (int) get_theme_mod( 'custom_logo' );

		if ( $logo_id ) {
			$src = wp_get_attachment_image_url( $logo_id, 'medium' );

			if ( $src ) {
				return sprintf(
					'<img src="%s" alt="%s" class="hhp-logo" />',
					esc_url( $src ),
					esc_attr( get_bloginfo( 'name' ) )
				);
			}
		}

		return '';
	}

	/**
	 * Baut ein Balkendiagramm als SVG.
	 *
	 * Bewusst serverseitig erzeugt: kein zusaetzliches Skript, kein externer
	 * Dienst, und im Ausdruck sauber dargestellt.
	 *
	 * @param array  $series   Datenreihe.
	 * @param string $currency Waehrung.
	 *
	 * @return string
	 */
	public static function chart( $series, $currency ) {
		$series = array_values( (array) $series );

		if ( empty( $series ) ) {
			return '';
		}

		$max = 0.0;

		foreach ( $series as $point ) {
			$max = max( $max, (float) $point['umsatz'] );
		}

		if ( $max <= 0 ) {
			return '<p class="hhp-empty">' . esc_html__( 'Im gewaehlten Zeitraum wurden keine Umsaetze erfasst.', 'hairhelp-partner' ) . '</p>';
		}

		$count   = count( $series );
		$width   = 1000;
		$height  = 260;
		$pad_b   = 34;
		$pad_t   = 12;
		$slot    = $width / $count;
		$bar_w   = min( 46, max( 3, $slot * 0.62 ) );
		$bars    = '';
		$labels  = '';
		$every   = (int) max( 1, ceil( $count / 12 ) );

		foreach ( $series as $index => $point ) {
			$value  = (float) $point['umsatz'];
			$bar_h  = $max > 0 ? ( $value / $max ) * ( $height - $pad_b - $pad_t ) : 0;
			$x      = ( $index * $slot ) + ( ( $slot - $bar_w ) / 2 );
			$y      = $height - $pad_b - $bar_h;

			$bars .= sprintf(
				'<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f" rx="3" class="hhp-bar"><title>%s</title></rect>',
				$x,
				$y,
				$bar_w,
				max( 0, $bar_h ),
				esc_html(
					sprintf(
						/* translators: 1: Zeitpunkt, 2: Umsatz, 3: Anzahl Bestellungen */
						__( '%1$s: %2$s aus %3$d Bestellungen', 'hairhelp-partner' ),
						$point['label'],
						html_entity_decode( wp_strip_all_tags( wc_price( $value, array( 'currency' => $currency ) ) ), ENT_QUOTES, 'UTF-8' ),
						(int) $point['bestellungen']
					)
				)
			);

			if ( 0 === $index % $every || $index === $count - 1 ) {
				$labels .= sprintf(
					'<text x="%.2f" y="%d" text-anchor="middle" class="hhp-axis">%s</text>',
					( $index * $slot ) + ( $slot / 2 ),
					$height - 12,
					esc_html( $point['label'] )
				);
			}
		}

		return sprintf(
			'<svg class="hhp-chart" viewBox="0 0 %d %d" preserveAspectRatio="none" role="img" aria-label="%s"><line x1="0" y1="%d" x2="%d" y2="%d" class="hhp-axis-line"/>%s%s</svg>',
			$width,
			$height,
			esc_attr__( 'Umsatzverlauf im gewaehlten Zeitraum', 'hairhelp-partner' ),
			$height - $pad_b,
			$width,
			$height - $pad_b,
			$bars,
			$labels
		);
	}
}
