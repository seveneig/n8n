<?php
/**
 * CSV-Export der vermittelten Bestellungen.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Liefert die Bestellliste als Tabellendatei aus.
 */
class HHP_Export {

	/**
	 * Registriert die Endpunkte.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_post_hhp_export', array( __CLASS__, 'handle' ) );
		add_action( 'admin_post_nopriv_hhp_export', array( __CLASS__, 'handle' ) );
	}

	/**
	 * Baut die Adresse fuer den Export.
	 *
	 * @param array  $partner Vermittler.
	 * @param string $from    Startdatum.
	 * @param string $to      Enddatum.
	 * @param string $token   Zugangstoken, falls ohne Anmeldung zugegriffen wird.
	 *
	 * @return string
	 */
	public static function url( $partner, $from, $to, $token = '' ) {
		$args = array(
			'action'   => 'hhp_export',
			'hhp_von'  => $from,
			'hhp_bis'  => $to,
		);

		if ( '' !== $token ) {
			$args['hhp_token'] = $token;
		} else {
			$args['hhp_partner'] = $partner['id'];
			$args['_wpnonce']    = wp_create_nonce( 'hhp_export_' . $partner['id'] );
		}

		return add_query_arg( $args, admin_url( 'admin-post.php' ) );
	}

	/**
	 * Prueft die Berechtigung und gibt die Datei aus.
	 *
	 * @return void
	 */
	public static function handle() {
		$token   = isset( $_GET['hhp_token'] ) ? sanitize_text_field( wp_unslash( $_GET['hhp_token'] ) ) : '';
		$partner = null;

		if ( '' !== $token ) {
			$partner = HHP_Settings::get_partner_by_token( $token );
		} elseif ( current_user_can( 'manage_woocommerce' ) ) {
			$id    = isset( $_GET['hhp_partner'] ) ? sanitize_key( wp_unslash( $_GET['hhp_partner'] ) ) : '';
			$nonce = isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ) : '';

			if ( wp_verify_nonce( $nonce, 'hhp_export_' . $id ) ) {
				$partner = HHP_Settings::get_partner( $id );
			}
		}

		if ( ! $partner ) {
			wp_die(
				esc_html__( 'Kein Zugriff auf diesen Export.', 'hairhelp-partner' ),
				esc_html__( 'Zugriff verweigert', 'hairhelp-partner' ),
				array( 'response' => 403 )
			);
		}

		$from = isset( $_GET['hhp_von'] ) ? sanitize_text_field( wp_unslash( $_GET['hhp_von'] ) ) : '';
		$to   = isset( $_GET['hhp_bis'] ) ? sanitize_text_field( wp_unslash( $_GET['hhp_bis'] ) ) : '';

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$from = gmdate( 'Y-m-d', strtotime( '-29 days' ) );
		}

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$to = current_time( 'Y-m-d' );
		}

		$report   = HHP_Repository::get_report( $partner, $from, $to );
		$filename = sprintf( 'vermittelte-verkaeufe-%s-%s-bis-%s.csv', $partner['id'], $from, $to );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );

		$out = fopen( 'php://output', 'w' );

		// Byte-Reihenfolge-Markierung, damit Excel die Umlaute korrekt anzeigt.
		fwrite( $out, "\xEF\xBB\xBF" );

		$separator = ';';

		// Ab PHP 8.4 muss das Escape-Zeichen ausdruecklich angegeben werden.
		$escape = '';

		fputcsv(
			$out,
			array(
				__( 'Datum', 'hairhelp-partner' ),
				__( 'Bestellnummer', 'hairhelp-partner' ),
				__( 'Status', 'hairhelp-partner' ),
				__( 'Herkunft', 'hairhelp-partner' ),
				__( 'Kampagnencode', 'hairhelp-partner' ),
				__( 'Gutscheine', 'hairhelp-partner' ),
				__( 'Artikel', 'hairhelp-partner' ),
				__( 'Umsatzbasis', 'hairhelp-partner' ),
				__( 'Provision', 'hairhelp-partner' ),
				__( 'Währung', 'hairhelp-partner' ),
				__( 'Gezählt', 'hairhelp-partner' ),
			),
			$separator,
			'"',
			$escape
		);

		foreach ( $report['reihen'] as $row ) {
			fputcsv(
				$out,
				array(
					$row['datum'] ? date_i18n( 'Y-m-d H:i', $row['datum'] ) : '',
					$row['nummer'],
					$row['status_text'],
					self::source_label( $row['quelle'] ),
					$row['code'],
					implode( ', ', $row['gutscheine'] ),
					implode( ' | ', $row['artikel'] ),
					number_format( (float) $row['umsatz'], 2, '.', '' ),
					number_format( (float) $row['provision'], 2, '.', '' ),
					$report['waehrung'],
					$row['gezaehlt'] ? __( 'ja', 'hairhelp-partner' ) : __( 'nein', 'hairhelp-partner' ),
				),
				$separator,
				'"',
				$escape
			);
		}

		fputcsv( $out, array(), $separator, '"', $escape );
		fputcsv(
			$out,
			array(
				__( 'Summe', 'hairhelp-partner' ),
				(string) $report['summen']['orders'],
				'',
				'',
				'',
				'',
				'',
				number_format( (float) $report['summen']['revenue'], 2, '.', '' ),
				number_format( (float) $report['summen']['commission'], 2, '.', '' ),
				$report['waehrung'],
				'',
			),
			$separator,
			'"',
			$escape
		);

		fclose( $out );
		exit;
	}

	/**
	 * Uebersetzt den Herkunftsschluessel.
	 *
	 * @param string $source Schluessel.
	 *
	 * @return string
	 */
	public static function source_label( $source ) {
		switch ( $source ) {
			case 'qr+coupon':
				return __( 'QR-Code und Gutschein', 'hairhelp-partner' );
			case 'coupon':
				return __( 'Gutscheincode', 'hairhelp-partner' );
			case 'qr':
				return __( 'QR-Code', 'hairhelp-partner' );
			default:
				return __( 'unbekannt', 'hairhelp-partner' );
		}
	}
}
