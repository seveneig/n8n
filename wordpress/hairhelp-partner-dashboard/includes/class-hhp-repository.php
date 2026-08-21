<?php
/**
 * Abfrage und Auswertung der vermittelten Bestellungen.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Liest vermittelte Bestellungen und verdichtet sie zu Kennzahlen.
 */
class HHP_Repository {

	const CACHE_VERSION_OPTION = 'hhp_cache_version';

	/**
	 * Registriert die Hooks zur Zwischenspeicher-Invalidierung.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_new_order', array( __CLASS__, 'bump_cache_version' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'bump_cache_version' ) );
		add_action( 'woocommerce_order_refunded', array( __CLASS__, 'bump_cache_version' ) );
	}

	/**
	 * Erhoeht die Zwischenspeicher-Version, wodurch alte Eintraege verfallen.
	 *
	 * @return void
	 */
	public static function bump_cache_version() {
		update_option( self::CACHE_VERSION_OPTION, (int) get_option( self::CACHE_VERSION_OPTION, 0 ) + 1, false );
	}

	/**
	 * Liefert die vermittelten Bestellungen eines Vermittlers.
	 *
	 * @param string $partner_id Kennung des Vermittlers.
	 * @param string $from       Startdatum (Y-m-d).
	 * @param string $to         Enddatum (Y-m-d).
	 *
	 * @return array<int,WC_Order>
	 */
	public static function get_orders( $partner_id, $from, $to ) {
		$partner_id = sanitize_key( $partner_id );

		if ( '' === $partner_id ) {
			return array();
		}

		$statuses = HHP_Settings::counted_statuses();
		$all      = array_merge( $statuses, (array) HHP_Settings::get( 'refunded_status', array() ) );
		$all      = array_values( array_unique( array_filter( array_map( 'sanitize_key', $all ) ) ) );

		if ( empty( $all ) ) {
			$all = array( 'processing', 'completed' );
		}

		$args = array(
			'limit'      => -1,
			'type'       => 'shop_order',
			'status'     => $all,
			'orderby'    => 'date',
			'order'      => 'DESC',
			'return'     => 'objects',
			'meta_query' => array(
				array(
					'key'     => HHP_Attribution::META_PARTNER,
					'value'   => $partner_id,
					'compare' => '=',
				),
			),
		);

		if ( '' !== $from && '' !== $to ) {
			$args['date_created'] = $from . '...' . $to;
		} elseif ( '' !== $from ) {
			$args['date_created'] = '>=' . $from;
		} elseif ( '' !== $to ) {
			$args['date_created'] = '<=' . $to;
		}

		/**
		 * Erlaubt das Anpassen der Bestellabfrage.
		 *
		 * @param array  $args       Abfrageparameter.
		 * @param string $partner_id Vermittler.
		 */
		$args = apply_filters( 'hhp_orders_query_args', $args, $partner_id );

		$orders = wc_get_orders( $args );

		return is_array( $orders ) ? $orders : array();
	}

	/**
	 * Baut den vollstaendigen Datensatz fuer das Dashboard.
	 *
	 * @param array  $partner Vermittler.
	 * @param string $from    Startdatum (Y-m-d).
	 * @param string $to      Enddatum (Y-m-d).
	 *
	 * @return array
	 */
	public static function get_report( $partner, $from, $to ) {
		$version = (int) get_option( self::CACHE_VERSION_OPTION, 0 );
		$key     = 'hhp_rep_' . md5( wp_json_encode( array( $partner['id'], $from, $to, $version, HHP_Settings::counted_statuses(), $partner['commission'], $partner['commission_base'] ) ) );
		$cached  = get_transient( $key );

		if ( is_array( $cached ) ) {
			return $cached;
		}

		$orders   = self::get_orders( $partner['id'], $from, $to );
		$counted  = HHP_Settings::counted_statuses();
		$rows     = array();
		$series   = array();
		$currency = get_woocommerce_currency();

		$totals = array(
			'orders'      => 0,
			'revenue'     => 0.0,
			'commission'  => 0.0,
			'qr'          => 0,
			'coupon'      => 0,
			'both'        => 0,
			'open'        => 0,
			'cancelled'   => 0,
			'refunded'    => 0.0,
		);

		foreach ( $orders as $order ) {
			$status    = $order->get_status();
			$is_valid  = in_array( $status, $counted, true );
			$refunded  = (float) $order->get_total_refunded();
			$gross     = (float) $order->get_total() - $refunded;
			$shipping  = (float) $order->get_shipping_total();
			$tax       = (float) $order->get_total_tax();
			$base      = self::umsatzbasis(
				(float) $order->get_total(),
				$shipping,
				$tax,
				$refunded,
				$partner['commission_base']
			);
			$provision = $is_valid ? ( $base * (float) $partner['commission'] ) / 100 : 0.0;
			$source    = (string) $order->get_meta( HHP_Attribution::META_SOURCE );
			$date      = $order->get_date_created();
			$timestamp = $date ? $date->getTimestamp() : 0;
			$currency  = $order->get_currency() ? $order->get_currency() : $currency;

			if ( $is_valid ) {
				++$totals['orders'];
				$totals['revenue']    += $base;
				$totals['commission'] += $provision;
				$totals['refunded']   += $refunded;

				if ( 'qr+coupon' === $source ) {
					++$totals['both'];
				} elseif ( 'coupon' === $source ) {
					++$totals['coupon'];
				} else {
					++$totals['qr'];
				}

				$day = $date ? $date->date( 'Y-m-d' ) : '';

				if ( '' !== $day ) {
					if ( ! isset( $series[ $day ] ) ) {
						$series[ $day ] = array(
							'umsatz'      => 0.0,
							'bestellungen' => 0,
						);
					}

					$series[ $day ]['umsatz']       += $base;
					$series[ $day ]['bestellungen'] += 1;
				}
			} elseif ( in_array( $status, array( 'cancelled', 'failed', 'refunded' ), true ) ) {
				++$totals['cancelled'];
			} else {
				++$totals['open'];
			}

			$rows[] = array(
				'id'         => $order->get_id(),
				'nummer'     => $order->get_order_number(),
				'datum'      => $timestamp,
				'status'     => $status,
				'status_text' => wc_get_order_status_name( $status ),
				'quelle'     => $source,
				'code'       => (string) $order->get_meta( HHP_Attribution::META_CODE ),
				'gutscheine' => $order->get_coupon_codes(),
				'artikel'    => self::describe_items( $order ),
				'positionen' => $order->get_item_count(),
				'umsatz'     => $base,
				'provision'  => $provision,
				'gezaehlt'   => $is_valid,
				'kunde'      => self::describe_customer( $order ),
				'ort'        => $order->get_shipping_city() ? $order->get_shipping_city() : $order->get_billing_city(),
				'land'       => $order->get_shipping_country() ? $order->get_shipping_country() : $order->get_billing_country(),
			);
		}

		ksort( $series );

		$report = array(
			'partner'  => $partner,
			'von'      => $from,
			'bis'      => $to,
			'waehrung' => $currency,
			'summen'   => $totals,
			'reihen'   => $rows,
			'verlauf'  => self::fill_series( $series, $from, $to ),
		);

		set_transient( $key, $report, (int) apply_filters( 'hhp_cache_ttl', 300 ) );

		return $report;
	}

	/**
	 * Ermittelt die Umsatzbasis einer Bestellung.
	 *
	 * Bei der Grundlage "Warenwert" werden Versand und Steuer abgezogen. Der
	 * Versand wird dabei mindestens mit der hinterlegten Pauschale angesetzt,
	 * auch wenn dem Kunden nichts berechnet wurde: Ab einem Bestellwert von
	 * 35 Franken liefert der Shop gratis, die Kosten fallen aber trotzdem an
	 * und sollen nicht in die Provision einfliessen. Hat jemand einen teureren
	 * Versand gewaehlt, gilt der tatsaechliche Betrag.
	 *
	 * @param float  $total     Bestellsumme.
	 * @param float  $shipping  Berechnete Versandkosten.
	 * @param float  $tax       Enthaltene Steuer.
	 * @param float  $refunded  Zurueckerstatteter Betrag.
	 * @param string $grundlage 'net' oder 'gross'.
	 *
	 * @return float
	 */
	public static function umsatzbasis( $total, $shipping, $tax, $refunded, $grundlage = 'net' ) {
		if ( 'gross' === $grundlage ) {
			return max( 0.0, (float) $total - (float) $refunded );
		}

		$abzug = (float) $shipping;

		if ( HHP_Settings::get( 'shipping_deduct' ) ) {
			$abzug = max( $abzug, (float) HHP_Settings::get( 'shipping_flat', 4.95 ) );
		}

		// Auf die Nachkommastellen der Waehrung runden: Fliesskommarechnung
		// erzeugt sonst Werte wie 29.900000000000002, die sich ueber viele
		// Bestellungen zu sichtbaren Rundungsdifferenzen summieren.
		return round( max( 0.0, (float) $total - $abzug - (float) $tax - (float) $refunded ), self::nachkommastellen() );
	}

	/**
	 * Nachkommastellen der Shopwaehrung.
	 *
	 * @return int
	 */
	protected static function nachkommastellen() {
		return function_exists( 'wc_get_price_decimals' ) ? (int) wc_get_price_decimals() : 2;
	}

	/**
	 * Ergaenzt Tage ohne Bestellungen und fasst lange Zeitraeume monatlich zusammen.
	 *
	 * @param array  $series Rohdaten je Tag.
	 * @param string $from   Startdatum.
	 * @param string $to     Enddatum.
	 *
	 * @return array<int,array>
	 */
	protected static function fill_series( $series, $from, $to ) {
		$start = strtotime( $from . ' 00:00:00' );
		$end   = strtotime( $to . ' 23:59:59' );

		if ( ! $start || ! $end || $end < $start ) {
			$result = array();

			foreach ( $series as $day => $values ) {
				$result[] = array_merge( array( 'label' => $day ), $values );
			}

			return $result;
		}

		$days     = (int) floor( ( $end - $start ) / DAY_IN_SECONDS ) + 1;
		$monthly  = $days > 62;
		$buckets  = array();

		if ( $monthly ) {
			foreach ( $series as $day => $values ) {
				$bucket = substr( $day, 0, 7 );

				if ( ! isset( $buckets[ $bucket ] ) ) {
					$buckets[ $bucket ] = array(
						'umsatz'       => 0.0,
						'bestellungen' => 0,
					);
				}

				$buckets[ $bucket ]['umsatz']       += $values['umsatz'];
				$buckets[ $bucket ]['bestellungen'] += $values['bestellungen'];
			}

			$cursor = strtotime( gmdate( 'Y-m-01', $start ) );

			while ( $cursor <= $end ) {
				$key = gmdate( 'Y-m', $cursor );

				if ( ! isset( $buckets[ $key ] ) ) {
					$buckets[ $key ] = array(
						'umsatz'       => 0.0,
						'bestellungen' => 0,
					);
				}

				$cursor = strtotime( '+1 month', $cursor );
			}
		} else {
			$buckets = $series;

			for ( $cursor = $start; $cursor <= $end; $cursor += DAY_IN_SECONDS ) {
				$key = gmdate( 'Y-m-d', $cursor );

				if ( ! isset( $buckets[ $key ] ) ) {
					$buckets[ $key ] = array(
						'umsatz'       => 0.0,
						'bestellungen' => 0,
					);
				}
			}
		}

		ksort( $buckets );

		$result = array();

		foreach ( $buckets as $key => $values ) {
			$result[] = array(
				'schluessel' => $key,
				'label'      => $monthly
					? date_i18n( 'M Y', strtotime( $key . '-01' ) )
					: date_i18n( 'j. M', strtotime( $key ) ),
				'umsatz'       => (float) $values['umsatz'],
				'bestellungen' => (int) $values['bestellungen'],
			);
		}

		return $result;
	}

	/**
	 * Beschreibt die bestellten Artikel.
	 *
	 * @param WC_Order $order Bestellung.
	 *
	 * @return array<int,string>
	 */
	protected static function describe_items( $order ) {
		if ( ! HHP_Settings::get( 'show_products' ) ) {
			return array();
		}

		$items = array();

		foreach ( $order->get_items() as $item ) {
			$items[] = sprintf( '%d x %s', (int) $item->get_quantity(), $item->get_name() );
		}

		return $items;
	}

	/**
	 * Beschreibt den Kunden gemaess der eingestellten Datensparsamkeit.
	 *
	 * @param WC_Order $order Bestellung.
	 *
	 * @return string
	 */
	protected static function describe_customer( $order ) {
		$mode = HHP_Settings::get( 'customer_data', 'initials' );

		if ( 'none' === $mode ) {
			return '';
		}

		$first = trim( (string) $order->get_billing_first_name() );
		$last  = trim( (string) $order->get_billing_last_name() );

		if ( 'full' === $mode ) {
			return trim( $first . ' ' . $last );
		}

		$initials = '';

		if ( '' !== $first ) {
			$initials .= mb_substr( $first, 0, 1 ) . '.';
		}

		if ( '' !== $last ) {
			$initials .= ' ' . mb_substr( $last, 0, 1 ) . '.';
		}

		return trim( $initials );
	}
}
