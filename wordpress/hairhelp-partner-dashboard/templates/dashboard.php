<?php
/**
 * Vorlage des Vermittler-Dashboards.
 *
 * @package HairHelp_Partner_Dashboard
 *
 * @var array  $partner   Vermittlerdatensatz.
 * @var array  $report    Ausgewerteter Datensatz.
 * @var string $von       Startdatum.
 * @var string $bis       Enddatum.
 * @var string $zeitraum  Gewaehlter Zeitraum.
 * @var string $token     Zugangstoken.
 * @var bool   $ist_admin Ob eine Shop-Verantwortliche zugreift.
 */

defined( 'ABSPATH' ) || exit;

$hhp_summen   = $report['summen'];
$hhp_waehrung = $report['waehrung'];
$hhp_preis    = static function ( $betrag ) use ( $hhp_waehrung ) {
	return wc_price( (float) $betrag, array( 'currency' => $hhp_waehrung ) );
};
$hhp_schnitt  = $hhp_summen['orders'] > 0 ? $hhp_summen['revenue'] / $hhp_summen['orders'] : 0;
$hhp_titel    = HHP_Settings::get( 'dashboard_title' );
$hhp_titel    = $hhp_titel ? $hhp_titel : __( 'Deine vermittelten Verkaeufe', 'hairhelp-partner' );
$hhp_zeitraeume = array(
	'7'        => __( 'Letzte 7 Tage', 'hairhelp-partner' ),
	'30'       => __( 'Letzte 30 Tage', 'hairhelp-partner' ),
	'90'       => __( 'Letzte 90 Tage', 'hairhelp-partner' ),
	'monat'    => __( 'Dieser Monat', 'hairhelp-partner' ),
	'vormonat' => __( 'Letzter Monat', 'hairhelp-partner' ),
	'jahr'     => __( 'Dieses Jahr', 'hairhelp-partner' ),
	'alles'    => __( 'Gesamter Zeitraum', 'hairhelp-partner' ),
	'eigen'    => __( 'Eigener Zeitraum', 'hairhelp-partner' ),
);
?>
<div class="hhp-dashboard" style="<?php echo esc_attr( HHP_Dashboard::brand_style() ); ?>">

	<header class="hhp-header">
		<div class="hhp-header-brand">
			<?php echo wp_kses_post( HHP_Dashboard::brand_logo() ); ?>
			<div>
				<h2 class="hhp-title"><?php echo esc_html( $hhp_titel ); ?></h2>
				<p class="hhp-subtitle">
					<?php
					printf(
						/* translators: %s: Name des Vermittlers */
						esc_html__( 'Uebersicht fuer %s', 'hairhelp-partner' ),
						'<strong>' . esc_html( $partner['name'] ? $partner['name'] : $partner['id'] ) . '</strong>'
					);
					?>
				</p>
			</div>
		</div>

		<?php if ( $ist_admin ) : ?>
			<p class="hhp-adminhinweis">
				<?php esc_html_e( 'Interne Ansicht als Shop-Verantwortliche.', 'hairhelp-partner' ); ?>
			</p>
		<?php endif; ?>
	</header>

	<form class="hhp-filter" method="get">
		<?php if ( '' !== $token ) : ?>
			<input type="hidden" name="hhp_token" value="<?php echo esc_attr( $token ); ?>" />
		<?php elseif ( $ist_admin ) : ?>
			<input type="hidden" name="hhp_partner" value="<?php echo esc_attr( $partner['id'] ); ?>" />
		<?php endif; ?>

		<label class="hhp-field">
			<span><?php esc_html_e( 'Zeitraum', 'hairhelp-partner' ); ?></span>
			<select name="hhp_zeitraum" onchange="this.form.submit()">
				<?php foreach ( $hhp_zeitraeume as $hhp_key => $hhp_label ) : ?>
					<option value="<?php echo esc_attr( $hhp_key ); ?>" <?php selected( $zeitraum, $hhp_key ); ?>><?php echo esc_html( $hhp_label ); ?></option>
				<?php endforeach; ?>
			</select>
		</label>

		<?php if ( 'eigen' === $zeitraum ) : ?>
			<label class="hhp-field">
				<span><?php esc_html_e( 'von', 'hairhelp-partner' ); ?></span>
				<input type="date" name="hhp_von" value="<?php echo esc_attr( $von ); ?>" />
			</label>
			<label class="hhp-field">
				<span><?php esc_html_e( 'bis', 'hairhelp-partner' ); ?></span>
				<input type="date" name="hhp_bis" value="<?php echo esc_attr( $bis ); ?>" />
			</label>
			<button type="submit" class="hhp-button"><?php esc_html_e( 'Anzeigen', 'hairhelp-partner' ); ?></button>
		<?php endif; ?>

		<a class="hhp-button hhp-button-ghost" href="<?php echo esc_url( HHP_Export::url( $partner, $von, $bis, $token ) ); ?>">
			<?php esc_html_e( 'Als Tabelle herunterladen', 'hairhelp-partner' ); ?>
		</a>
	</form>

	<p class="hhp-zeitraum-hinweis">
		<?php
		printf(
			/* translators: 1: Startdatum, 2: Enddatum */
			esc_html__( 'Zeitraum %1$s bis %2$s', 'hairhelp-partner' ),
			esc_html( date_i18n( get_option( 'date_format' ), strtotime( $von ) ) ),
			esc_html( date_i18n( get_option( 'date_format' ), strtotime( $bis ) ) )
		);
		?>
	</p>

	<div class="hhp-kacheln">
		<div class="hhp-kachel">
			<span class="hhp-kachel-label"><?php esc_html_e( 'Vermittelte Bestellungen', 'hairhelp-partner' ); ?></span>
			<strong class="hhp-kachel-wert"><?php echo esc_html( number_format_i18n( $hhp_summen['orders'] ) ); ?></strong>
			<span class="hhp-kachel-fuss">
				<?php
				printf(
					/* translators: 1: Anzahl ueber QR-Code, 2: Anzahl ueber Gutschein, 3: Anzahl ueber beides */
					esc_html__( '%1$d ueber QR-Code, %2$d ueber Gutschein, %3$d ueber beides', 'hairhelp-partner' ),
					(int) $hhp_summen['qr'],
					(int) $hhp_summen['coupon'],
					(int) $hhp_summen['both']
				);
				?>
			</span>
		</div>

		<div class="hhp-kachel">
			<span class="hhp-kachel-label"><?php esc_html_e( 'Vermittelter Umsatz', 'hairhelp-partner' ); ?></span>
			<strong class="hhp-kachel-wert"><?php echo wp_kses_post( $hhp_preis( $hhp_summen['revenue'] ) ); ?></strong>
			<span class="hhp-kachel-fuss">
				<?php
				echo 'gross' === $partner['commission_base']
					? esc_html__( 'Bestellsumme gesamt', 'hairhelp-partner' )
					: esc_html__( 'Warenwert ohne Versand und Steuer', 'hairhelp-partner' );
				?>
			</span>
		</div>

		<div class="hhp-kachel hhp-kachel-akzent">
			<span class="hhp-kachel-label"><?php esc_html_e( 'Deine Provision', 'hairhelp-partner' ); ?></span>
			<strong class="hhp-kachel-wert"><?php echo wp_kses_post( $hhp_preis( $hhp_summen['commission'] ) ); ?></strong>
			<span class="hhp-kachel-fuss">
				<?php
				printf(
					/* translators: %s: Provisionssatz */
					esc_html__( '%s Prozent der Umsatzbasis', 'hairhelp-partner' ),
					esc_html( number_format_i18n( (float) $partner['commission'], 1 ) )
				);
				?>
			</span>
		</div>

		<div class="hhp-kachel">
			<span class="hhp-kachel-label"><?php esc_html_e( 'Durchschnittlicher Bestellwert', 'hairhelp-partner' ); ?></span>
			<strong class="hhp-kachel-wert"><?php echo wp_kses_post( $hhp_preis( $hhp_schnitt ) ); ?></strong>
			<span class="hhp-kachel-fuss">
				<?php
				printf(
					/* translators: 1: offene Bestellungen, 2: stornierte Bestellungen */
					esc_html__( '%1$d offen, %2$d storniert', 'hairhelp-partner' ),
					(int) $hhp_summen['open'],
					(int) $hhp_summen['cancelled']
				);
				?>
			</span>
		</div>
	</div>

	<section class="hhp-block">
		<h3 class="hhp-block-titel"><?php esc_html_e( 'Umsatzverlauf', 'hairhelp-partner' ); ?></h3>
		<?php
		// Das Diagramm wird serverseitig als SVG erzeugt und ist daher unbedenklich.
		echo HHP_Dashboard::chart( $report['verlauf'], $hhp_waehrung ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
	</section>

	<section class="hhp-block">
		<h3 class="hhp-block-titel"><?php esc_html_e( 'Einzelne Bestellungen', 'hairhelp-partner' ); ?></h3>

		<?php if ( empty( $report['reihen'] ) ) : ?>
			<p class="hhp-empty"><?php esc_html_e( 'In diesem Zeitraum sind noch keine vermittelten Bestellungen eingegangen.', 'hairhelp-partner' ); ?></p>
		<?php else : ?>
			<div class="hhp-tabelle-wrapper">
				<table class="hhp-tabelle">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Datum', 'hairhelp-partner' ); ?></th>
							<th><?php esc_html_e( 'Bestellung', 'hairhelp-partner' ); ?></th>
							<th><?php esc_html_e( 'Herkunft', 'hairhelp-partner' ); ?></th>
							<th><?php esc_html_e( 'Status', 'hairhelp-partner' ); ?></th>
							<th class="hhp-rechts"><?php esc_html_e( 'Umsatz', 'hairhelp-partner' ); ?></th>
							<th class="hhp-rechts"><?php esc_html_e( 'Provision', 'hairhelp-partner' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $report['reihen'] as $hhp_reihe ) : ?>
							<tr class="<?php echo $hhp_reihe['gezaehlt'] ? '' : 'hhp-nicht-gezaehlt'; ?>">
								<td data-label="<?php esc_attr_e( 'Datum', 'hairhelp-partner' ); ?>">
									<?php echo esc_html( $hhp_reihe['datum'] ? date_i18n( get_option( 'date_format' ), $hhp_reihe['datum'] ) : '' ); ?>
								</td>
								<td data-label="<?php esc_attr_e( 'Bestellung', 'hairhelp-partner' ); ?>">
									<span class="hhp-nummer">#<?php echo esc_html( $hhp_reihe['nummer'] ); ?></span>
									<?php if ( $hhp_reihe['kunde'] ) : ?>
										<span class="hhp-kunde"><?php echo esc_html( $hhp_reihe['kunde'] ); ?></span>
									<?php endif; ?>
									<?php if ( ! empty( $hhp_reihe['artikel'] ) ) : ?>
										<span class="hhp-artikel"><?php echo esc_html( implode( ', ', $hhp_reihe['artikel'] ) ); ?></span>
									<?php endif; ?>
								</td>
								<td data-label="<?php esc_attr_e( 'Herkunft', 'hairhelp-partner' ); ?>">
									<span class="hhp-tag hhp-tag-<?php echo esc_attr( str_replace( '+', '-', $hhp_reihe['quelle'] ) ); ?>">
										<?php echo esc_html( HHP_Export::source_label( $hhp_reihe['quelle'] ) ); ?>
									</span>
								</td>
								<td data-label="<?php esc_attr_e( 'Status', 'hairhelp-partner' ); ?>">
									<?php echo esc_html( $hhp_reihe['status_text'] ); ?>
								</td>
								<td class="hhp-rechts" data-label="<?php esc_attr_e( 'Umsatz', 'hairhelp-partner' ); ?>">
									<?php echo wp_kses_post( $hhp_preis( $hhp_reihe['umsatz'] ) ); ?>
								</td>
								<td class="hhp-rechts" data-label="<?php esc_attr_e( 'Provision', 'hairhelp-partner' ); ?>">
									<?php echo $hhp_reihe['gezaehlt'] ? wp_kses_post( $hhp_preis( $hhp_reihe['provision'] ) ) : '&ndash;'; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
					<tfoot>
						<tr>
							<th colspan="4"><?php esc_html_e( 'Summe der gezaehlten Bestellungen', 'hairhelp-partner' ); ?></th>
							<th class="hhp-rechts"><?php echo wp_kses_post( $hhp_preis( $hhp_summen['revenue'] ) ); ?></th>
							<th class="hhp-rechts"><?php echo wp_kses_post( $hhp_preis( $hhp_summen['commission'] ) ); ?></th>
						</tr>
					</tfoot>
				</table>
			</div>
		<?php endif; ?>
	</section>

	<footer class="hhp-fuss">
		<p>
			<?php esc_html_e( 'Gezaehlt werden Bestellungen, die ueber deinen QR-Code oder deinen Gutscheincode eingegangen sind. Der QR-Code wirkt 30 Tage nach dem Scan.', 'hairhelp-partner' ); ?>
			<?php esc_html_e( 'Stornierte und zurueckerstattete Bestellungen sind ausgewiesen, zaehlen aber nicht zur Provision.', 'hairhelp-partner' ); ?>
		</p>
	</footer>
</div>
