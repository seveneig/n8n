<?php
/**
 * Plugin Name:       HairHelp Vermittler-Dashboard
 * Plugin URI:        https://www.hairhelp-haarverdichter.ch/
 * Description:       QR-Code-Tracking mit 30-Tage-Cookie und Gutschein-Erfassung fuer WooCommerce. Vermittler melden sich mit Benutzername und Passwort an und sehen ihre vermittelten Verkaeufe im eigenen Erscheinungsbild, ganz ohne WordPress-Zugang.
 * Version:           1.2.1
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            HairHelp
 * Text Domain:       hairhelp-partner
 * Domain Path:       /languages
 * License:           GPL-2.0-or-later
 *
 * WC requires at least: 7.0
 * WC tested up to:      9.4
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

define( 'HHP_VERSION', '1.2.1' );
define( 'HHP_FILE', __FILE__ );
define( 'HHP_PATH', plugin_dir_path( __FILE__ ) );
define( 'HHP_URL', plugin_dir_url( __FILE__ ) );

require_once HHP_PATH . 'includes/class-hhp-qr-code.php';
require_once HHP_PATH . 'includes/class-hhp-settings.php';
require_once HHP_PATH . 'includes/class-hhp-auth.php';
require_once HHP_PATH . 'includes/class-hhp-tracker.php';
require_once HHP_PATH . 'includes/class-hhp-attribution.php';
require_once HHP_PATH . 'includes/class-hhp-repository.php';
require_once HHP_PATH . 'includes/class-hhp-dashboard.php';
require_once HHP_PATH . 'includes/class-hhp-export.php';
require_once HHP_PATH . 'includes/class-hhp-admin.php';

/**
 * Meldet die Kompatibilitaet mit der Bestelltabellen-Speicherung (HPOS) an.
 *
 * Bewusst eine benannte Funktion statt einer anonymen: WordPress bildet den
 * Schluessel eines Rueckrufs bei benannten Funktionen aus dem Funktionsnamen.
 * Anonyme Funktionen erhalten stattdessen eine Objektkennung, die je nach
 * WordPress-Fassung als Zahl in der Hookliste steht. Fremde Erweiterungen, die
 * diese Liste durchsuchen und dabei einen Text erwarten, laufen daran in einen
 * Fehler - genau das ist der bekannte Fall bei WP Rocket unter WordPress 7.1.
 *
 * @return void
 */
function hhp_declare_compatibility() {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', HHP_FILE, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', HHP_FILE, true );
	}
}
add_action( 'before_woocommerce_init', 'hhp_declare_compatibility' );

/**
 * Startet das Plugin, sobald WooCommerce bereitsteht.
 *
 * @return void
 */
function hhp_bootstrap() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', 'hhp_missing_woocommerce_notice' );

		return;
	}

	HHP_Settings::init();

	// Ergaenzt nach einer Aktualisierung fehlende Felder in bestehenden Daten.
	HHP_Settings::maybe_upgrade();

	HHP_Auth::init();
	HHP_Tracker::init();
	HHP_Attribution::init();
	HHP_Repository::init();
	HHP_Dashboard::init();
	HHP_Export::init();

	// Bewusst ausserhalb der Backend-Pruefung: Seiten werden im Block-Editor
	// ueber die REST-Schnittstelle gespeichert, wo is_admin() nicht greift.
	add_action( 'save_post_page', array( 'HHP_Admin', 'flush_page_cache' ) );

	if ( is_admin() ) {
		HHP_Admin::init();
	}
}
add_action( 'plugins_loaded', 'hhp_bootstrap' );

/**
 * Weist im Backend darauf hin, dass WooCommerce fehlt.
 *
 * @return void
 */
function hhp_missing_woocommerce_notice() {
	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html__( 'Das HairHelp Vermittler-Dashboard benötigt WooCommerce. Bitte WooCommerce aktivieren.', 'hairhelp-partner' )
	);
}

/**
 * Laedt die Uebersetzungsdateien.
 *
 * @return void
 */
function hhp_load_textdomain() {
	load_plugin_textdomain( 'hairhelp-partner', false, dirname( plugin_basename( HHP_FILE ) ) . '/languages' );
}
add_action( 'init', 'hhp_load_textdomain' );

/**
 * Legt Standardwerte an und richtet die Permalinks fuer die QR-Landeadresse ein.
 *
 * @return void
 */
function hhp_activate() {
	HHP_Settings::install_defaults();
	HHP_Tracker::register_rewrite_rules();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'hhp_activate' );

/**
 * Raeumt die Permalink-Regeln beim Deaktivieren wieder auf.
 *
 * @return void
 */
function hhp_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'hhp_deactivate' );
