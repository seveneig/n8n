<?php
/**
 * Zuordnung von Bestellungen zu Vermittlern.
 *
 * Jede Bestellung erhaelt beim Anlegen einen kleinen Index in den Bestell-Metadaten.
 * Dadurch laesst sich das Dashboard mit einer einzigen indizierten Abfrage
 * aufbauen, statt bei jedem Aufruf saemtliche Bestellungen nach Gutscheinen zu
 * durchsuchen.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Schreibt Herkunft und Vermittler in die Bestellung.
 */
class HHP_Attribution {

	const META_CODE    = '_hhp_ref';
	const META_PARTNER = '_hhp_partner';
	const META_SOURCE  = '_hhp_source';
	const META_TIME    = '_hhp_ref_time';

	/**
	 * Bereits in diesem Aufruf verarbeitete Bestellungen.
	 *
	 * @var array<int,bool>
	 */
	protected static $processed = array();

	/**
	 * Registriert alle Hooks.
	 *
	 * @return void
	 */
	public static function init() {
		// Klassischer Bestellabschluss.
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'attach_code' ), 10, 1 );

		// Bestellabschluss ueber die Block-Variante (Store-API).
		add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( __CLASS__, 'attach_code' ), 10, 1 );

		// Endgueltige Zuordnung, sobald die Bestellung samt Gutscheinen vorliegt.
		add_action( 'woocommerce_new_order', array( __CLASS__, 'index_order' ), 20, 1 );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'index_order' ), 20, 1 );
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'index_order' ), 20, 1 );
	}

	/**
	 * Uebertraegt den Kampagnencode aus dem Cookie in die Bestellung.
	 *
	 * @param WC_Order $order Bestellung.
	 *
	 * @return void
	 */
	public static function attach_code( $order ) {
		if ( ! $order instanceof WC_Order ) {
			return;
		}

		$code = HHP_Tracker::current_code();

		if ( '' === $code ) {
			return;
		}

		$order->update_meta_data( self::META_CODE, $code );
		$order->update_meta_data( self::META_TIME, time() );
	}

	/**
	 * Ermittelt Vermittler und Herkunft und schreibt sie in die Bestellung.
	 *
	 * @param int|WC_Order $order_id Bestellnummer oder Bestellobjekt.
	 *
	 * @return array|null Zuordnung oder null, wenn keine vorliegt.
	 */
	public static function index_order( $order_id ) {
		$order = $order_id instanceof WC_Order ? $order_id : wc_get_order( $order_id );

		if ( ! $order instanceof WC_Order ) {
			return null;
		}

		$id = $order->get_id();

		if ( isset( self::$processed[ $id ] ) ) {
			return null;
		}

		self::$processed[ $id ] = true;

		$result = self::resolve( $order );

		$current_partner = (string) $order->get_meta( self::META_PARTNER );
		$current_source  = (string) $order->get_meta( self::META_SOURCE );

		if ( null === $result ) {
			// Zuordnung entfernen, falls ein Gutschein nachtraeglich geloescht wurde.
			if ( '' !== $current_partner || '' !== $current_source ) {
				$order->delete_meta_data( self::META_PARTNER );
				$order->delete_meta_data( self::META_SOURCE );
				$order->save();
			}

			return null;
		}

		if ( $current_partner === $result['partner'] && $current_source === $result['source'] ) {
			return $result;
		}

		$order->update_meta_data( self::META_PARTNER, $result['partner'] );
		$order->update_meta_data( self::META_SOURCE, $result['source'] );

		if ( '' !== $result['code'] ) {
			$order->update_meta_data( self::META_CODE, $result['code'] );
		}

		$order->save();

		return $result;
	}

	/**
	 * Bestimmt Vermittler und Herkunft einer Bestellung.
	 *
	 * Beruecksichtigt werden der ueber den QR-Code gesetzte Kampagnencode und
	 * die in der Bestellung verwendeten Gutscheine. Treffen beide zu, wird die
	 * Bestellung als Doppelquelle gekennzeichnet und trotzdem nur einmal gezaehlt.
	 *
	 * @param WC_Order $order Bestellung.
	 *
	 * @return array|null
	 */
	public static function resolve( $order ) {
		if ( ! $order instanceof WC_Order ) {
			return null;
		}

		$code            = HHP_Tracker::sanitize_code( (string) $order->get_meta( self::META_CODE ) );
		$partner_by_code = '' !== $code ? HHP_Settings::get_partner_by_code( $code ) : null;

		$partner_by_coupon = null;
		$matched_coupon    = '';

		foreach ( $order->get_coupon_codes() as $coupon ) {
			$candidate = HHP_Settings::get_partner_by_coupon( $coupon );

			if ( $candidate ) {
				$partner_by_coupon = $candidate;
				$matched_coupon    = HHP_Settings::normalize_code( $coupon );
				break;
			}
		}

		if ( ! $partner_by_code && ! $partner_by_coupon ) {
			return null;
		}

		// Der Gutschein ist der belastbarere Nachweis und hat bei Konflikten Vorrang.
		$partner = $partner_by_coupon ? $partner_by_coupon : $partner_by_code;

		if ( $partner_by_code && $partner_by_coupon && $partner_by_code['id'] === $partner_by_coupon['id'] ) {
			$source = 'qr+coupon';
		} elseif ( $partner_by_coupon ) {
			$source = 'coupon';
		} else {
			$source = 'qr';
		}

		return array(
			'partner' => $partner['id'],
			'source'  => $source,
			'code'    => $code,
			'coupon'  => $matched_coupon,
		);
	}

	/**
	 * Ordnet bestehende Bestellungen nachtraeglich zu.
	 *
	 * @param array $args {
	 *     Optionen.
	 *
	 *     @type string $after  Startdatum (Y-m-d), leer fuer alle.
	 *     @type int    $limit  Anzahl Bestellungen pro Durchlauf.
	 *     @type int    $page   Seite, beginnend bei 1.
	 * }
	 *
	 * @return array Statistik mit den Schluesseln geprueft, zugeordnet, fertig.
	 */
	public static function reindex( $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'after' => '',
				'limit' => 50,
				'page'  => 1,
			)
		);

		$query = array(
			'limit'    => max( 1, (int) $args['limit'] ),
			'page'     => max( 1, (int) $args['page'] ),
			'orderby'  => 'date',
			'order'    => 'DESC',
			'status'   => array_keys( wc_get_order_statuses() ),
			'type'     => 'shop_order',
			'return'   => 'objects',
		);

		if ( '' !== $args['after'] ) {
			$query['date_created'] = '>=' . $args['after'];
		}

		$orders  = wc_get_orders( $query );
		$matched = 0;

		foreach ( $orders as $order ) {
			unset( self::$processed[ $order->get_id() ] );

			if ( self::index_order( $order ) ) {
				++$matched;
			}
		}

		return array(
			'geprueft'   => count( $orders ),
			'zugeordnet' => $matched,
			'fertig'     => count( $orders ) < $query['limit'],
		);
	}
}
