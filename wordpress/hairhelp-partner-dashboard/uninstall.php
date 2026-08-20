<?php
/**
 * Aufraeumen beim Deinstallieren.
 *
 * Die Bestell-Metadaten bleiben bewusst erhalten: Sie gehoeren zur
 * Bestellhistorie und werden fuer die Nachvollziehbarkeit einer bereits
 * abgerechneten Provision benoetigt.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$hhp_einstellungen = get_option( 'hhp_settings', array() );

// Standardmaessig bleibt alles erhalten. Wer das Plugin zum Aktualisieren
// kurz loescht, verliert sonst Vermittler, Passwoerter und Zugangslinks.
// Das Entfernen muss unter Einstellungen ausdruecklich erlaubt werden.
if ( ! is_array( $hhp_einstellungen ) || empty( $hhp_einstellungen['purge_on_delete'] ) ) {
	return;
}

delete_option( 'hhp_settings' );
delete_option( 'hhp_partners' );
delete_option( 'hhp_cache_version' );
delete_transient( 'hhp_dashboard_page' );

// Zwischengespeicherte Auswertungen entfernen.
global $wpdb;

delete_option( 'hhp_version' );

$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_hhp_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_hhp_' ) . '%',
		$wpdb->esc_like( 'hhp_sessions_' ) . '%'
	)
);
