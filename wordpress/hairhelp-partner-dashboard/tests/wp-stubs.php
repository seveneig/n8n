<?php
/**
 * Minimale WordPress-Attrappe fuer die Logikpruefung auf der Kommandozeile.
 *
 * Nachgebildet wird nur, was die geprueften Klassen tatsaechlich aufrufen.
 * Aufruf:  php tests/logic-test.php
 *
 * @package HairHelp_Partner_Dashboard
 */
define( 'ABSPATH', __DIR__ );
define( 'DAY_IN_SECONDS', 86400 );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['optionen']   = array();
$GLOBALS['transients'] = array();
$GLOBALS['aktionen']   = array();

function get_option( $name, $default = false ) { return $GLOBALS['optionen'][ $name ] ?? $default; }
function update_option( $name, $wert, $autoload = null ) { $GLOBALS['optionen'][ $name ] = $wert; return true; }
function delete_option( $name ) { unset( $GLOBALS['optionen'][ $name ] ); return true; }
function get_transient( $k ) { return $GLOBALS['transients'][ $k ] ?? false; }
function set_transient( $k, $v, $t = 0 ) { $GLOBALS['transients'][ $k ] = $v; return true; }
function add_action( $hook, $cb, $prio = 10, $args = 1 ) { $GLOBALS['aktionen'][ $hook ][] = $cb; }
function add_filter( $hook, $cb, $prio = 10, $args = 1 ) { $GLOBALS['aktionen'][ $hook ][] = $cb; }
function do_action( $hook, ...$a ) {}
function apply_filters( $hook, $wert, ...$a ) { return $wert; }
function sanitize_key( $k ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $k ) ); }
function sanitize_text_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function esc_url_raw( $u ) { return (string) $u; }
function wp_unslash( $v ) { return $v; }
function wp_parse_url( $u, $c = -1 ) { return parse_url( $u, $c ); }
function wp_generate_password( $l = 12, $s = true, $x = false ) { return bin2hex( random_bytes( (int) ceil( $l / 2 ) ) ); }
function wp_json_encode( $d ) { return json_encode( $d ); }
function wp_parse_args( $a, $d ) { return array_merge( $d, (array) $a ); }
function current_time( $f ) { return date( $f ); }
function date_i18n( $f, $t = null ) { return date( $f, $t ?? time() ); }
function home_url( $p = '/' ) { return 'https://www.hairhelp-haarverdichter.ch' . $p; }
function add_query_arg( $args, $url = '' ) {
    $sep = strpos( $url, '?' ) === false ? '?' : '&';
    return $url . $sep . http_build_query( $args );
}
function is_ssl() { return true; }
function __( $t, $d = null ) { return $t; }
function esc_html__( $t, $d = null ) { return $t; }
function number_format_i18n( $n, $d = 0 ) { return number_format( $n, $d ); }
function sanitize_hex_color( $c ) { return preg_match( '/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', (string) $c ) ? $c : null; }
function get_woocommerce_currency() { return 'CHF'; }
function wc_get_order_statuses() { return array( 'wc-pending'=>'Ausstehend','wc-processing'=>'In Bearbeitung','wc-completed'=>'Abgeschlossen','wc-cancelled'=>'Storniert','wc-refunded'=>'Rueckerstattet','wc-failed'=>'Fehlgeschlagen','wc-on-hold'=>'Wartend' ); }
function WC() { return null; }

// Sehr einfache Bestell-Attrappe.
class WC_Order {
    private $meta = array(); private $coupons = array(); private $id;
    public function __construct( $id, $coupons = array(), $meta = array() ) { $this->id = $id; $this->coupons = $coupons; $this->meta = $meta; }
    public function get_id() { return $this->id; }
    public function get_meta( $k ) { return $this->meta[ $k ] ?? ''; }
    public function update_meta_data( $k, $v ) { $this->meta[ $k ] = $v; }
    public function delete_meta_data( $k ) { unset( $this->meta[ $k ] ); }
    public function save() { return true; }
    public function get_coupon_codes() { return $this->coupons; }
}

require __DIR__ . '/../includes/class-hhp-settings.php';
require __DIR__ . '/../includes/class-hhp-tracker.php';
require __DIR__ . '/../includes/class-hhp-attribution.php';
require __DIR__ . '/../includes/class-hhp-dashboard.php';
