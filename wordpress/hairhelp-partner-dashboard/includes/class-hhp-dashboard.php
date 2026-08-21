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
		add_action( 'template_redirect', array( __CLASS__, 'prevent_caching' ), 1 );
	}

	/**
	 * Nimmt die Dashboard-Seite vom Seiten-Cache aus.
	 *
	 * Die Seite ist persoenlich: Sie zeigt die Zahlen des angemeldeten
	 * Vermittlers und enthaelt ein Formular mit einem zeitlich begrenzten
	 * Pruefwert. Wird sie zwischengespeichert, bekaeme jeder Besucher dieselbe
	 * Fassung - mit fremden Zahlen und einem abgelaufenen Pruefwert, an dem
	 * jede Anmeldung mit "Formular abgelaufen" scheitert.
	 *
	 * DONOTCACHEPAGE wird von WP Rocket, WP Super Cache, W3 Total Cache und
	 * weiteren Erweiterungen ausgewertet.
	 *
	 * @return void
	 */
	public static function prevent_caching() {
		if ( ! self::page_has_dashboard() ) {
			return;
		}

		foreach ( array( 'DONOTCACHEPAGE', 'DONOTCACHEOBJECT', 'DONOTCACHEDB' ) as $konstante ) {
			if ( ! defined( $konstante ) ) {
				define( $konstante, true );
			}
		}

		if ( ! headers_sent() ) {
			nocache_headers();
		}
	}

	/**
	 * Prueft, ob eine Seite das Dashboard enthaelt.
	 *
	 * Der Shortcode steht nicht zwingend in post_content: Seitenbaukaesten wie
	 * Elementor legen den Inhalt in eigenen Metaangaben ab und lassen
	 * post_content leer. Eine Pruefung allein auf post_content wuerde das
	 * Dashboard dort nicht erkennen - mit der Folge, dass die Seite weder auf
	 * noindex gesetzt noch vom Seiten-Cache ausgenommen wird.
	 *
	 * @param WP_Post|int|null $post Beitrag oder Kennung.
	 *
	 * @return bool
	 */
	public static function page_has_dashboard( $post = null ) {
		$post = get_post( $post );

		if ( ! $post instanceof WP_Post ) {
			return false;
		}

		if ( has_shortcode( (string) $post->post_content, self::SHORTCODE ) ) {
			return true;
		}

		// Inhalte aus Seitenbaukaesten: dort steht der Shortcode in den
		// Metaangaben, teils mit maskierten Anfuehrungszeichen.
		foreach ( array( '_elementor_data', 'panels_data', '_et_pb_use_builder' ) as $feld ) {
			$wert = get_post_meta( $post->ID, $feld, true );

			if ( is_string( $wert ) && '' !== $wert && false !== strpos( $wert, '[' . self::SHORTCODE ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Registriert das Stylesheet.
	 *
	 * @return void
	 */
	public static function register_assets() {
		wp_register_style( 'hhp-dashboard', HHP_URL . 'assets/css/dashboard.css', array(), HHP_VERSION );

		if ( self::page_has_dashboard() ) {
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
		if ( self::page_has_dashboard() ) {
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
				'breite'  => '',
			),
			$atts,
			self::SHORTCODE
		);

		$partner = HHP_Auth::current_partner( $atts['partner'] );

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Reine Anzeige der Rueckmeldung nach der Umleitung.
		$fehler  = isset( $_GET['hhp_fehler'] ) ? sanitize_key( wp_unslash( $_GET['hhp_fehler'] ) ) : '';
		$hinweis = isset( $_GET['hhp_hinweis'] ) ? sanitize_key( wp_unslash( $_GET['hhp_hinweis'] ) ) : '';
		$token   = isset( $_REQUEST['hhp_token'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['hhp_token'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( ! $partner ) {
			// Ein mitgeschickter, aber ungueltiger Zugangslink wird benannt,
			// damit der Vermittler den Grund erkennt.
			if ( '' === $fehler && '' !== $token && HHP_Auth::token_allowed() ) {
				$fehler = 'kein_zugang';
			}

			// Vor der Anmeldung ist der Vermittler unbekannt. Nennt der Shortcode
			// einen, traegt schon die Anmeldemaske dessen Erscheinungsbild.
			$marke = '' !== $atts['partner'] ? HHP_Settings::get_partner( $atts['partner'] ) : null;

			if ( ! $marke ) {
				// Gibt es nur einen aktiven Vermittler, gehoert die Seite ihm.
				$aktive = HHP_Settings::partners( true );

				if ( 1 === count( $aktive ) ) {
					$marke = $aktive[0];
				}
			}

			return self::render_template(
				'login',
				array(
					'fehler'  => HHP_Auth::message( $fehler ),
					'hinweis' => HHP_Auth::notice( $hinweis ),
					'marke'   => $marke,
					'stil'    => self::brand_style( $marke ) . self::width_style( $atts['breite'] ),
				)
			);
		}

		list( $from, $to, $range ) = self::resolve_range();

		$report      = HHP_Repository::get_report( $partner, $from, $to );
		$angemeldet  = HHP_Auth::is_logged_in();

		return self::render_template(
			'dashboard',
			array(
				'partner'    => $partner,
				'report'     => $report,
				'von'        => $from,
				'bis'        => $to,
				'zeitraum'   => $range,
				// Der Token wird nur weitergereicht, wenn der Zugriff auch
				// darueber erfolgt ist; bei Anmeldung traegt ihn die Sitzung.
				'token'      => ( ! $angemeldet && HHP_Auth::token_allowed() ) ? $token : '',
				'angemeldet' => $angemeldet,
				'ist_admin'  => current_user_can( 'manage_woocommerce' ),
				'hinweis'    => HHP_Auth::notice( $hinweis ),
				'fehler'     => HHP_Auth::message( $fehler ),
				'stil'       => self::brand_style( $partner ) . self::width_style( $atts['breite'] ),
			)
		);
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
	 * Liefert die Markenwerte eines Vermittlers mit Rueckfall auf die Shopwerte.
	 *
	 * @param array|null $partner Vermittler oder null fuer die Shopwerte.
	 *
	 * @return array
	 */
	public static function brand( $partner = null ) {
		$shop = HHP_Settings::all();

		$werte = array(
			'thema'   => 'hell',
			'primary' => sanitize_hex_color( $shop['brand_primary'] ) ? $shop['brand_primary'] : '#a39772',
			'accent'  => sanitize_hex_color( $shop['brand_accent'] ) ? $shop['brand_accent'] : '#d1bc92',
			'grund'   => '',
			'font'    => '',
			'name'    => '',
			'logo'    => '',
		);

		if ( is_array( $partner ) ) {
			if ( 'shop' !== $partner['brand_theme'] ) {
				$werte['thema'] = $partner['brand_theme'];
			}

			foreach ( array( 'primary', 'accent', 'grund', 'font', 'name', 'logo' ) as $feld ) {
				if ( ! empty( $partner[ 'brand_' . $feld ] ) ) {
					$werte[ $feld ] = $partner[ 'brand_' . $feld ];
				}
			}
		}

		if ( 'dunkel' === $werte['thema'] && '' === $werte['grund'] ) {
			$werte['grund'] = '#0b0b0f';
		}

		return $werte;
	}

	/**
	 * Liefert die CSS-Klasse des gewaehlten Farbschemas.
	 *
	 * @param array|null $partner Vermittler.
	 *
	 * @return string
	 */
	public static function theme_class( $partner = null ) {
		$brand = self::brand( $partner );

		return 'dunkel' === $brand['thema'] ? 'hhp-thema-dunkel' : '';
	}

	/**
	 * Liefert die Markenwerte als CSS-Variablen.
	 *
	 * Die Schriftart wird bewusst nur als Stapel gesetzt und nie nachgeladen:
	 * ein externer Schriftdienst wuerde bei jedem Aufruf die Adresse des
	 * Besuchers an einen Dritten uebermitteln.
	 *
	 * @param array|null $partner Vermittler.
	 *
	 * @return string
	 */
	public static function brand_style( $partner = null ) {
		$brand  = self::brand( $partner );
		$dunkel = 'dunkel' === $brand['thema'];
		$grund  = $dunkel ? $brand['grund'] : '#ffffff';

		$css = sprintf(
			'--hhp-primary:%s;--hhp-accent:%s;--hhp-primary-text:%s;--hhp-accent-text:%s;',
			$brand['primary'],
			$brand['accent'],
			// Fuer Text wird die Farbe so weit aufgehellt oder abgedunkelt, bis
			// sie auf dem jeweiligen Grund lesbar ist.
			self::readable( $brand['primary'], $grund ),
			self::readable( $brand['accent'], $grund )
		);

		if ( $dunkel ) {
			$css .= sprintf( '--hhp-grund:%s;', $grund );
		} else {
			$dark = sanitize_hex_color( HHP_Settings::get( 'brand_dark' ) );
			$css .= sprintf( '--hhp-dark:%s;', $dark ? $dark : '#292929' );
		}

		if ( '' !== $brand['font'] ) {
			$css .= sprintf( '--hhp-schrift-titel:%1$s;--hhp-schrift-text:%1$s;', $brand['font'] );
		}

		return $css;
	}

	/**
	 * Liefert die Breitenvorgabe als CSS-Variable.
	 *
	 * Standardmaessig ist das Dashboard auf 1180 Pixel begrenzt und zentriert.
	 * In einem Seitenaufbau ueber die volle Breite wirkt das wie ein Kasten in
	 * der Mitte; dort hilft breite="voll" im Shortcode.
	 *
	 * @param string $breite 'voll', 'standard' oder eine CSS-Laenge.
	 *
	 * @return string
	 */
	public static function width_style( $breite ) {
		$breite = strtolower( trim( (string) $breite ) );

		if ( '' === $breite || 'standard' === $breite ) {
			return '';
		}

		if ( in_array( $breite, array( 'voll', 'full', '100%', 'none' ), true ) ) {
			return '--hhp-max:none;';
		}

		// Eigene Laenge, etwa breite="1400px" - nur unbedenkliche Zeichen zulassen.
		if ( preg_match( '/^\d{2,5}(px|%|rem|em|vw)$/', $breite ) ) {
			return '--hhp-max:' . $breite . ';';
		}

		return '';
	}

	/**
	 * Liefert das Logo fuer den Dashboard-Kopf.
	 *
	 * Hat der Vermittler ein eigenes Logo hinterlegt, wird dieses verwendet,
	 * sonst das in WordPress hinterlegte Website-Logo.
	 *
	 * @param array|null $partner Vermittler.
	 *
	 * @return string HTML des Logos oder leerer String.
	 */
	public static function brand_logo( $partner = null ) {
		$brand = self::brand( $partner );
		$name  = '' !== $brand['name'] ? $brand['name'] : get_bloginfo( 'name' );

		if ( '' !== $brand['logo'] ) {
			return sprintf( '<img src="%s" alt="%s" class="hhp-logo" />', esc_url( $brand['logo'] ), esc_attr( $name ) );
		}

		$custom = HHP_Settings::get( 'brand_logo' );

		if ( $custom && ! is_array( $partner ) ) {
			return sprintf( '<img src="%s" alt="%s" class="hhp-logo" />', esc_url( $custom ), esc_attr( $name ) );
		}

		// Ein Vermittler mit eigener Marke bekommt nicht das Shoplogo, sondern
		// seinen Namen als Schriftzug.
		if ( '' !== $brand['name'] ) {
			return sprintf( '<span class="hhp-wortmarke">%s</span>', esc_html( $brand['name'] ) );
		}

		if ( ! HHP_Settings::get( 'use_site_logo' ) ) {
			return '';
		}

		$logo_id = (int) get_theme_mod( 'custom_logo' );

		if ( $logo_id ) {
			$src = wp_get_attachment_image_url( $logo_id, 'medium' );

			if ( $src ) {
				return sprintf( '<img src="%s" alt="%s" class="hhp-logo" />', esc_url( $src ), esc_attr( $name ) );
			}
		}

		return '';
	}

	/**
	 * Passt eine Farbe an, bis sie auf dem Grund lesbar ist.
	 *
	 * Im Backend darf jede Farbe gewaehlt werden. Ohne diese Absicherung wuerde
	 * etwa Cyan auf Weiss nur ein Kontrastverhaeltnis von rund 1,7 zu 1
	 * erreichen und die Zahlen waeren praktisch unlesbar. Aufgehellt oder
	 * abgedunkelt wird schrittweise, bis der Wert 4,5 zu 1 erreicht ist.
	 *
	 * @param string $farbe  Wunschfarbe.
	 * @param string $grund  Hintergrundfarbe.
	 * @param float  $ziel   Angestrebtes Kontrastverhaeltnis.
	 *
	 * @return string
	 */
	public static function readable( $farbe, $grund, $ziel = 4.5 ) {
		$vorne  = self::to_rgb( $farbe );
		$hinten = self::to_rgb( $grund );

		if ( null === $vorne || null === $hinten ) {
			return (string) $farbe;
		}

		// Auf hellem Grund abdunkeln, auf dunklem Grund aufhellen.
		$aufhellen = self::luminance( $hinten ) < 0.5;

		for ( $schritt = 0; $schritt < 40; $schritt++ ) {
			if ( self::contrast( $vorne, $hinten ) >= $ziel ) {
				break;
			}

			foreach ( $vorne as $i => $wert ) {
				$vorne[ $i ] = $aufhellen
					? min( 255, (int) round( $wert + ( ( 255 - $wert ) * 0.12 ) + 3 ) )
					: max( 0, (int) round( $wert * 0.88 ) );
			}
		}

		return sprintf( '#%02x%02x%02x', $vorne[0], $vorne[1], $vorne[2] );
	}

	/**
	 * Wandelt einen Hexwert in RGB-Anteile.
	 *
	 * @param string $hex Farbwert.
	 *
	 * @return array|null
	 */
	protected static function to_rgb( $hex ) {
		$hex = ltrim( (string) $hex, '#' );

		if ( 3 === strlen( $hex ) ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		if ( 6 !== strlen( $hex ) || ! ctype_xdigit( $hex ) ) {
			return null;
		}

		return array(
			hexdec( substr( $hex, 0, 2 ) ),
			hexdec( substr( $hex, 2, 2 ) ),
			hexdec( substr( $hex, 4, 2 ) ),
		);
	}

	/**
	 * Relative Helligkeit nach WCAG.
	 *
	 * @param array $rgb Farbanteile.
	 *
	 * @return float
	 */
	protected static function luminance( $rgb ) {
		$teile = array();

		foreach ( $rgb as $wert ) {
			$anteil  = $wert / 255;
			$teile[] = $anteil <= 0.03928 ? $anteil / 12.92 : pow( ( $anteil + 0.055 ) / 1.055, 2.4 );
		}

		return ( 0.2126 * $teile[0] ) + ( 0.7152 * $teile[1] ) + ( 0.0722 * $teile[2] );
	}

	/**
	 * Kontrastverhaeltnis zweier Farben nach WCAG.
	 *
	 * @param array $a Farbe.
	 * @param array $b Farbe.
	 *
	 * @return float
	 */
	public static function contrast( $a, $b ) {
		$la = self::luminance( $a );
		$lb = self::luminance( $b );

		return ( max( $la, $lb ) + 0.05 ) / ( min( $la, $lb ) + 0.05 );
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

		// Auch ohne Umsatz wird das Diagramm gezeichnet: Der Vermittler soll den
		// gewählten Zeitraum sehen und nicht nur einen Satz, der aussieht, als
		// müsse er erst einen Filter setzen.
		$leer = $max <= 0;

		if ( $leer ) {
			$max = 1.0;
		}

		$count   = count( $series );
		$width   = 1000;
		$height  = 260;
		$pad_b   = 34;
		$pad_t   = 12;
		// Seitlicher Rand, damit die erste und die letzte Beschriftung nicht
		// am Rand des Diagramms abgeschnitten werden.
		$pad_x   = 46;
		$nutz    = $width - ( 2 * $pad_x );
		$slot    = $nutz / $count;
		$bar_w   = min( 46, max( 3, $slot * 0.62 ) );
		$bars    = '';
		$labels  = '';
		$every   = (int) max( 1, ceil( $count / 12 ) );

		foreach ( $series as $index => $point ) {
			$value  = (float) $point['umsatz'];
			$bar_h  = $max > 0 ? ( $value / $max ) * ( $height - $pad_b - $pad_t ) : 0;
			$x      = $pad_x + ( $index * $slot ) + ( ( $slot - $bar_w ) / 2 );
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
					$pad_x + ( $index * $slot ) + ( $slot / 2 ),
					$height - 12,
					esc_html( $point['label'] )
				);
			}
		}

		$svg = sprintf(
			'<svg class="hhp-chart" viewBox="0 0 %d %d" role="img" aria-label="%s"><line x1="0" y1="%d" x2="%d" y2="%d" class="hhp-axis-line"/>%s%s</svg>',
			$width,
			$height,
			esc_attr__( 'Umsatzverlauf im gewählten Zeitraum', 'hairhelp-partner' ),
			$height - $pad_b,
			$width,
			$height - $pad_b,
			$leer ? '' : $bars,
			$labels
		);

		if ( $leer ) {
			$svg .= '<p class="hhp-empty">' . esc_html__( 'In diesem Zeitraum sind noch keine Umsätze eingegangen.', 'hairhelp-partner' ) . '</p>';
		}

		return $svg;
	}
}
