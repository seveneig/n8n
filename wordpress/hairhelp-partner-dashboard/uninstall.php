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

delete_option( 'hhp_settings' );
delete_option( 'hhp_partners' );
delete_option( 'hhp_cache_version' );
delete_transient( 'hhp_dashboard_page' );

// Zwischengespeicherte Auswertungen entfernen.
global $wpdb;

$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_hhp_rep_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_hhp_rep_' ) . '%'
	)
);
