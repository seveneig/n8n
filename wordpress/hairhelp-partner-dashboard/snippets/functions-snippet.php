<?php
/**
 * QR-Code-Tracking fuer www.hairhelp-haarverdichter.ch - schlanke Variante ohne Plugin.
 *
 * Diese Datei wird nur gebraucht, wenn das Tracking ohne das Plugin laufen soll.
 * Sie setzt das Cookie fuer 30 Tage und schreibt den Code in die Bestellung,
 * bietet aber kein Dashboard, keine Provisionsrechnung und keinen Zugangslink.
 *
 * Einbau: Inhalt in die Datei functions.php des Child-Themes kopieren oder als
 * eigenes Mini-Plugin unter wp-content/plugins/ ablegen.
 *
 * @package HairHelp
 */

defined( 'ABSPATH' ) || exit;

const HAIRHELP_COOKIE = 'hhp_ref';
const HAIRHELP_PARAM  = 'qr';
const HAIRHELP_TAGE   = 30;

/**
 * Liest den Kampagnencode aus der Adresszeile und legt ihn im Cookie ab.
 *
 * @return void
 */
function hairhelp_qr_erfassen() {
	$code = '';

	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Oeffentlicher Einstiegspunkt.
	if ( isset( $_GET[ HAIRHELP_PARAM ] ) ) {
		$code = wp_unslash( $_GET[ HAIRHELP_PARAM ] );
	} elseif ( isset( $_SERVER['REQUEST_URI'] ) ) {
		$pfad = wp_parse_url( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH );

		if ( is_string( $pfad ) && preg_match( '#^/qr/([^/?]+)/?$#i', $pfad, $treffer ) ) {
			$code = rawurldecode( $treffer[1] );
		}
	}
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	$code = substr( (string) preg_replace( '/[^a-z0-9_\-]/', '', strtolower( trim( $code ) ) ), 0, 40 );

	if ( '' === $code || headers_sent() ) {
		return;
	}

	setcookie(
		HAIRHELP_COOKIE,
		$code,
		array(
			'expires'  => time() + ( HAIRHELP_TAGE * DAY_IN_SECONDS ),
			'path'     => '/',
			// Fuehrender Punkt: gilt fuer www und die Adresse ohne www.
			'domain'   => '.hairhelp-haarverdichter.ch',
			'secure'   => is_ssl(),
			'httponly' => false,
			'samesite' => 'Lax',
		)
	);

	$_COOKIE[ HAIRHELP_COOKIE ] = $code;
}
add_action( 'init', 'hairhelp_qr_erfassen', 5 );

/**
 * Schreibt den Kampagnencode in die Bestellung.
 *
 * @param WC_Order $order Bestellung.
 *
 * @return void
 */
function hairhelp_qr_in_bestellung( $order ) {
	if ( ! $order instanceof WC_Order || empty( $_COOKIE[ HAIRHELP_COOKIE ] ) ) {
		return;
	}

	$code = substr( (string) preg_replace( '/[^a-z0-9_\-]/', '', strtolower( wp_unslash( $_COOKIE[ HAIRHELP_COOKIE ] ) ) ), 0, 40 );

	if ( '' !== $code ) {
		$order->update_meta_data( '_hhp_ref', $code );
	}
}
add_action( 'woocommerce_checkout_create_order', 'hairhelp_qr_in_bestellung' );
add_action( 'woocommerce_store_api_checkout_update_order_from_request', 'hairhelp_qr_in_bestellung' );

/**
 * Zeigt die Herkunft in der Bestellansicht im Backend an.
 *
 * @param WC_Order $order Bestellung.
 *
 * @return void
 */
function hairhelp_qr_anzeigen( $order ) {
	$code = $order->get_meta( '_hhp_ref' );

	if ( $code ) {
		printf(
			'<p><strong>%s</strong> %s</p>',
			esc_html__( 'QR-Kampagne:', 'hairhelp' ),
			esc_html( $code )
		);
	}
}
add_action( 'woocommerce_admin_order_data_after_billing_address', 'hairhelp_qr_anzeigen' );
