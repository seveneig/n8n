<?php
/**
 * Verwaltungsoberflaeche im WordPress-Backend.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Einstellungen, Vermittlerpflege, QR-Generator und Werkzeuge.
 */
class HHP_Admin {

	const CAPABILITY = 'manage_woocommerce';
	const SLUG       = 'hhp-dashboard';

	/**
	 * Registriert Menue und Aktionen.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_post_hhp_save_settings', array( __CLASS__, 'save_settings' ) );
		add_action( 'admin_post_hhp_save_partners', array( __CLASS__, 'save_partners' ) );
		add_action( 'admin_post_hhp_qr', array( __CLASS__, 'download_qr' ) );
		add_action( 'wp_ajax_hhp_reindex', array( __CLASS__, 'ajax_reindex' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Haengt die Seite unter WooCommerce ein.
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_submenu_page(
			'woocommerce',
			__( 'Vermittler-Dashboard', 'hairhelp-partner' ),
			__( 'Vermittler-Dashboard', 'hairhelp-partner' ),
			self::CAPABILITY,
			self::SLUG,
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Laedt Stil und Skript der Verwaltungsseite.
	 *
	 * @param string $hook Aktuelle Seite.
	 *
	 * @return void
	 */
	public static function enqueue( $hook ) {
		if ( false === strpos( (string) $hook, self::SLUG ) ) {
			return;
		}

		wp_enqueue_style( 'hhp-admin', HHP_URL . 'assets/css/admin.css', array(), HHP_VERSION );
		wp_enqueue_script( 'hhp-admin', HHP_URL . 'assets/js/admin.js', array(), HHP_VERSION, true );
		wp_localize_script(
			'hhp-admin',
			'hhpAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'hhp_reindex' ),
				'texte'   => array(
					'laeuft'   => __( 'Bestellungen werden geprüft ...', 'hairhelp-partner' ),
					'fertig'   => __( 'Fertig.', 'hairhelp-partner' ),
					'fehler'   => __( 'Es ist ein Fehler aufgetreten.', 'hairhelp-partner' ),
					'kopiert'  => __( 'Link kopiert.', 'hairhelp-partner' ),
				),
			)
		);
	}

	/**
	 * Ermittelt den aktiven Reiter.
	 *
	 * @return string
	 */
	protected static function current_tab() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reine Navigation.
		$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'einstellungen';

		return in_array( $tab, array( 'einstellungen', 'vermittler', 'qr', 'werkzeuge' ), true ) ? $tab : 'einstellungen';
	}

	/**
	 * Gibt die Verwaltungsseite aus.
	 *
	 * @return void
	 */
	public static function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'Fehlende Berechtigung.', 'hairhelp-partner' ) );
		}

		$tab  = self::current_tab();
		$tabs = array(
			'einstellungen' => __( 'Einstellungen', 'hairhelp-partner' ),
			'vermittler'    => __( 'Vermittler', 'hairhelp-partner' ),
			'qr'            => __( 'QR-Codes', 'hairhelp-partner' ),
			'werkzeuge'     => __( 'Werkzeuge', 'hairhelp-partner' ),
		);

		echo '<div class="wrap hhp-admin">';
		printf( '<h1>%s</h1>', esc_html__( 'Vermittler-Dashboard', 'hairhelp-partner' ) );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reine Anzeige.
		if ( isset( $_GET['hhp_gespeichert'] ) ) {
			printf(
				'<div class="notice notice-success is-dismissible"><p>%s</p></div>',
				esc_html__( 'Gespeichert.', 'hairhelp-partner' )
			);
		}

		echo '<h2 class="nav-tab-wrapper">';

		foreach ( $tabs as $key => $label ) {
			printf(
				'<a href="%s" class="nav-tab %s">%s</a>',
				esc_url( admin_url( 'admin.php?page=' . self::SLUG . '&tab=' . $key ) ),
				$key === $tab ? 'nav-tab-active' : '',
				esc_html( $label )
			);
		}

		echo '</h2>';

		switch ( $tab ) {
			case 'vermittler':
				self::render_partners();
				break;
			case 'qr':
				self::render_qr();
				break;
			case 'werkzeuge':
				self::render_tools();
				break;
			default:
				self::render_settings();
				break;
		}

		echo '</div>';
	}

	/* --------------------------------------------------------------------- *
	 * Reiter: Einstellungen
	 * --------------------------------------------------------------------- */

	/**
	 * Gibt das Einstellungsformular aus.
	 *
	 * @return void
	 */
	protected static function render_settings() {
		$s        = HHP_Settings::all();
		$statuses = wc_get_order_statuses();

		?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hhp_save_settings" />
			<?php wp_nonce_field( 'hhp_save_settings' ); ?>

			<h3><?php esc_html_e( 'Tracking', 'hairhelp-partner' ); ?></h3>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="hhp-param"><?php esc_html_e( 'Adressparameter', 'hairhelp-partner' ); ?></label></th>
					<td>
						<input name="param" id="hhp-param" type="text" class="regular-text" value="<?php echo esc_attr( $s['param'] ); ?>" />
						<p class="description">
							<?php
							printf(
								/* translators: %s: Beispieladresse */
								esc_html__( 'Beispiel: %s', 'hairhelp-partner' ),
								'<code>' . esc_html( home_url( '/?' . $s['param'] . '=loopx13' ) ) . '</code>'
							);
							?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-cookie"><?php esc_html_e( 'Name des Cookies', 'hairhelp-partner' ); ?></label></th>
					<td><input name="cookie_name" id="hhp-cookie" type="text" class="regular-text" value="<?php echo esc_attr( $s['cookie_name'] ); ?>" /></td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-days"><?php esc_html_e( 'Gültigkeit in Tagen', 'hairhelp-partner' ); ?></label></th>
					<td>
						<input name="cookie_days" id="hhp-days" type="number" min="1" max="730" value="<?php echo esc_attr( $s['cookie_days'] ); ?>" />
						<p class="description"><?php esc_html_e( 'Vereinbart sind 30 Tage.', 'hairhelp-partner' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Zuordnung bei mehreren Besuchen', 'hairhelp-partner' ); ?></th>
					<td>
						<label><input type="radio" name="attribution" value="last" <?php checked( $s['attribution'], 'last' ); ?> /> <?php esc_html_e( 'Letzter Kontakt zählt', 'hairhelp-partner' ); ?></label><br />
						<label><input type="radio" name="attribution" value="first" <?php checked( $s['attribution'], 'first' ); ?> /> <?php esc_html_e( 'Erster Kontakt zählt', 'hairhelp-partner' ); ?></label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-landing"><?php esc_html_e( 'Zielseite nach dem Scan', 'hairhelp-partner' ); ?></label></th>
					<td>
						<input name="landing_url" id="hhp-landing" type="url" class="regular-text code" value="<?php echo esc_attr( $s['landing_url'] ); ?>" placeholder="<?php echo esc_attr( home_url( '/' ) ); ?>" />
						<p class="description"><?php esc_html_e( 'Leer lassen für die Startseite.', 'hairhelp-partner' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Kurze QR-Adresse', 'hairhelp-partner' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="pretty_urls" value="1" <?php checked( $s['pretty_urls'], 1 ); ?> />
							<?php
							printf(
								/* translators: %s: Beispieladresse */
								esc_html__( '%s verwenden (ergibt einen kleineren, besser scannbaren Code)', 'hairhelp-partner' ),
								'<code>' . esc_html( home_url( '/qr/loopx13' ) ) . '</code>'
							);
							?>
						</label>
					</td>
				</tr>
			</table>

			<h3><?php esc_html_e( 'Auswertung', 'hairhelp-partner' ); ?></h3>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Als Umsatz zählen', 'hairhelp-partner' ); ?></th>
					<td>
						<?php foreach ( $statuses as $key => $label ) : ?>
							<?php $clean = str_replace( 'wc-', '', $key ); ?>
							<label style="display:inline-block;min-width:220px">
								<input type="checkbox" name="statuses[]" value="<?php echo esc_attr( $clean ); ?>" <?php checked( in_array( $clean, (array) $s['statuses'], true ) ); ?> />
								<?php echo esc_html( $label ); ?>
							</label>
						<?php endforeach; ?>
						<p class="description"><?php esc_html_e( 'Nicht angehakte Status erscheinen im Dashboard als offen oder storniert, fliessen aber nicht in Umsatz und Provision ein.', 'hairhelp-partner' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Kundendaten im Dashboard', 'hairhelp-partner' ); ?></th>
					<td>
						<label><input type="radio" name="customer_data" value="none" <?php checked( $s['customer_data'], 'none' ); ?> /> <?php esc_html_e( 'Gar nicht anzeigen', 'hairhelp-partner' ); ?></label><br />
						<label><input type="radio" name="customer_data" value="initials" <?php checked( $s['customer_data'], 'initials' ); ?> /> <?php esc_html_e( 'Nur Initialen (empfohlen)', 'hairhelp-partner' ); ?></label><br />
						<label><input type="radio" name="customer_data" value="full" <?php checked( $s['customer_data'], 'full' ); ?> /> <?php esc_html_e( 'Vollständiger Name', 'hairhelp-partner' ); ?></label>
						<p class="description"><?php esc_html_e( 'Der Vermittler braucht für die Abrechnung keine Kundendaten. Initialen genügen, um Rückfragen zuzuordnen.', 'hairhelp-partner' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Bestellte Artikel zeigen', 'hairhelp-partner' ); ?></th>
					<td><label><input type="checkbox" name="show_products" value="1" <?php checked( $s['show_products'], 1 ); ?> /> <?php esc_html_e( 'Artikelnamen in der Bestellliste anzeigen', 'hairhelp-partner' ); ?></label></td>
				</tr>
			</table>

			<h3><?php esc_html_e( 'Erscheinungsbild', 'hairhelp-partner' ); ?></h3>
			<p class="description" style="max-width:44em">
				<?php esc_html_e( 'Die Schriften bezieht das Dashboard aus dem Elementor-Kit der Website und fällt auf Jost und Heebo zurück; das Logo kommt aus dem Customizer. Hier werden nur die Markenfarben festgelegt.', 'hairhelp-partner' ); ?>
			</p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="hhp-primary"><?php esc_html_e( 'Hauptfarbe', 'hairhelp-partner' ); ?></label></th>
					<td><input name="brand_primary" id="hhp-primary" type="color" value="<?php echo esc_attr( $s['brand_primary'] ); ?>" /> <code><?php echo esc_html( $s['brand_primary'] ); ?></code></td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-accent"><?php esc_html_e( 'Akzentfarbe', 'hairhelp-partner' ); ?></label></th>
					<td><input name="brand_accent" id="hhp-accent" type="color" value="<?php echo esc_attr( $s['brand_accent'] ); ?>" /> <code><?php echo esc_html( $s['brand_accent'] ); ?></code></td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-dark"><?php esc_html_e( 'Dunkle Textfarbe', 'hairhelp-partner' ); ?></label></th>
					<td><input name="brand_dark" id="hhp-dark" type="color" value="<?php echo esc_attr( $s['brand_dark'] ); ?>" /> <code><?php echo esc_html( $s['brand_dark'] ); ?></code></td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Logo', 'hairhelp-partner' ); ?></th>
					<td>
						<label><input type="checkbox" name="use_site_logo" value="1" <?php checked( $s['use_site_logo'], 1 ); ?> /> <?php esc_html_e( 'Website-Logo aus WordPress verwenden', 'hairhelp-partner' ); ?></label>
						<p><input name="brand_logo" type="url" class="regular-text code" value="<?php echo esc_attr( $s['brand_logo'] ); ?>" placeholder="<?php esc_attr_e( 'Abweichende Logo-Adresse (optional)', 'hairhelp-partner' ); ?>" /></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-title"><?php esc_html_e( 'Überschrift im Dashboard', 'hairhelp-partner' ); ?></label></th>
					<td><input name="dashboard_title" id="hhp-title" type="text" class="regular-text" value="<?php echo esc_attr( $s['dashboard_title'] ); ?>" placeholder="<?php esc_attr_e( 'Deine vermittelten Verkäufe', 'hairhelp-partner' ); ?>" /></td>
				</tr>
				<tr>
					<th scope="row"><label for="hhp-poster"><?php esc_html_e( 'Name auf der Druckvorlage', 'hairhelp-partner' ); ?></label></th>
					<td>
						<input name="poster_name" id="hhp-poster" type="text" class="regular-text" value="<?php echo esc_attr( $s['poster_name'] ); ?>" placeholder="<?php echo esc_attr( self::brand_name() ); ?>" />
						<p class="description"><?php esc_html_e( 'Leer lassen, dann wird der Website-Titel verwendet und bei Bedarf gekürzt.', 'hairhelp-partner' ); ?></p>
					</td>
				</tr>
			</table>

			<?php submit_button(); ?>
		</form>
		<?php
	}

	/**
	 * Speichert die Einstellungen.
	 *
	 * @return void
	 */
	public static function save_settings() {
		if ( ! current_user_can( self::CAPABILITY ) || ! check_admin_referer( 'hhp_save_settings' ) ) {
			wp_die( esc_html__( 'Fehlende Berechtigung.', 'hairhelp-partner' ) );
		}

		$values = array(
			'param'           => isset( $_POST['param'] ) ? sanitize_key( wp_unslash( $_POST['param'] ) ) : 'qr',
			'cookie_name'     => isset( $_POST['cookie_name'] ) ? preg_replace( '/[^A-Za-z0-9_\-]/', '', sanitize_text_field( wp_unslash( $_POST['cookie_name'] ) ) ) : 'hhp_ref',
			'cookie_days'     => isset( $_POST['cookie_days'] ) ? min( 730, max( 1, (int) $_POST['cookie_days'] ) ) : 30,
			'attribution'     => isset( $_POST['attribution'] ) && 'first' === $_POST['attribution'] ? 'first' : 'last',
			'landing_url'     => isset( $_POST['landing_url'] ) ? esc_url_raw( wp_unslash( $_POST['landing_url'] ) ) : '',
			'pretty_urls'     => isset( $_POST['pretty_urls'] ) ? 1 : 0,
			'statuses'        => isset( $_POST['statuses'] ) ? array_map( 'sanitize_key', (array) wp_unslash( $_POST['statuses'] ) ) : array(),
			'customer_data'   => isset( $_POST['customer_data'] ) && in_array( $_POST['customer_data'], array( 'none', 'initials', 'full' ), true ) ? sanitize_key( wp_unslash( $_POST['customer_data'] ) ) : 'initials',
			'show_products'   => isset( $_POST['show_products'] ) ? 1 : 0,
			'brand_primary'   => isset( $_POST['brand_primary'] ) ? (string) sanitize_hex_color( wp_unslash( $_POST['brand_primary'] ) ) : '#2f6f62',
			'brand_accent'    => isset( $_POST['brand_accent'] ) ? (string) sanitize_hex_color( wp_unslash( $_POST['brand_accent'] ) ) : '#c8a04a',
			'brand_dark'      => isset( $_POST['brand_dark'] ) ? (string) sanitize_hex_color( wp_unslash( $_POST['brand_dark'] ) ) : '#1c2b28',
			'brand_logo'      => isset( $_POST['brand_logo'] ) ? esc_url_raw( wp_unslash( $_POST['brand_logo'] ) ) : '',
			'use_site_logo'   => isset( $_POST['use_site_logo'] ) ? 1 : 0,
			'dashboard_title' => isset( $_POST['dashboard_title'] ) ? sanitize_text_field( wp_unslash( $_POST['dashboard_title'] ) ) : '',
			'poster_name'     => isset( $_POST['poster_name'] ) ? sanitize_text_field( wp_unslash( $_POST['poster_name'] ) ) : '',
		);

		if ( empty( $values['statuses'] ) ) {
			$values['statuses'] = array( 'processing', 'completed' );
		}

		HHP_Settings::save( $values );

		// Die Permalink-Regeln muessen nach einer Aenderung neu geschrieben werden.
		HHP_Tracker::register_rewrite_rules();
		flush_rewrite_rules();

		wp_safe_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&tab=einstellungen&hhp_gespeichert=1' ) );
		exit;
	}

	/* --------------------------------------------------------------------- *
	 * Reiter: Vermittler
	 * --------------------------------------------------------------------- */

	/**
	 * Gibt die Vermittlerverwaltung aus.
	 *
	 * @return void
	 */
	protected static function render_partners() {
		$partners = HHP_Settings::partners();
		$page     = self::dashboard_page_url();

		?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hhp_save_partners" />
			<?php wp_nonce_field( 'hhp_save_partners' ); ?>

			<p class="description" style="max-width:48em">
				<?php esc_html_e( 'Jeder Vermittler erhält einen geheimen Zugangslink. Wer den Link kennt, sieht ausschliesslich seine eigenen vermittelten Verkäufe: keine Kundenadressen, keine anderen Bestellungen, kein WordPress-Konto.', 'hairhelp-partner' ); ?>
			</p>

			<div id="hhp-partners">
				<?php foreach ( $partners as $index => $partner ) : ?>
					<?php self::partner_fields( $index, $partner, $page ); ?>
				<?php endforeach; ?>
			</div>

			<p>
				<button type="button" class="button" id="hhp-add-partner"><?php esc_html_e( 'Vermittler hinzufügen', 'hairhelp-partner' ); ?></button>
			</p>

			<?php submit_button(); ?>
		</form>

		<script type="text/template" id="hhp-partner-template">
			<?php self::partner_fields( '__INDEX__', HHP_Settings::normalize_partner( array( 'active' => 1, 'commission' => 10 ) ), $page ); ?>
		</script>
		<?php
	}

	/**
	 * Gibt die Felder eines Vermittlers aus.
	 *
	 * @param int|string $index   Laufender Index.
	 * @param array      $partner Datensatz.
	 * @param string     $page    Adresse der Dashboard-Seite.
	 *
	 * @return void
	 */
	protected static function partner_fields( $index, $partner, $page ) {
		$link = '' !== $partner['token'] && $page ? add_query_arg( 'hhp_token', $partner['token'], $page ) : '';

		?>
		<div class="hhp-partner-card">
			<div class="hhp-partner-grid">
				<label>
					<span><?php esc_html_e( 'Kennung', 'hairhelp-partner' ); ?></span>
					<input type="text" name="partners[<?php echo esc_attr( $index ); ?>][id]" value="<?php echo esc_attr( $partner['id'] ); ?>" placeholder="loopx13" required />
				</label>
				<label>
					<span><?php esc_html_e( 'Name', 'hairhelp-partner' ); ?></span>
					<input type="text" name="partners[<?php echo esc_attr( $index ); ?>][name]" value="<?php echo esc_attr( $partner['name'] ); ?>" placeholder="Loop X" />
				</label>
				<label>
					<span><?php esc_html_e( 'QR-Codes', 'hairhelp-partner' ); ?></span>
					<input type="text" name="partners[<?php echo esc_attr( $index ); ?>][codes]" value="<?php echo esc_attr( implode( ', ', $partner['codes'] ) ); ?>" placeholder="loopx13" />
				</label>
				<label>
					<span><?php esc_html_e( 'Gutscheincodes', 'hairhelp-partner' ); ?></span>
					<input type="text" name="partners[<?php echo esc_attr( $index ); ?>][coupons]" value="<?php echo esc_attr( implode( ', ', $partner['coupons'] ) ); ?>" placeholder="loopx13" />
				</label>
				<label>
					<span><?php esc_html_e( 'Provision in Prozent', 'hairhelp-partner' ); ?></span>
					<input type="number" step="0.1" min="0" max="100" name="partners[<?php echo esc_attr( $index ); ?>][commission]" value="<?php echo esc_attr( $partner['commission'] ); ?>" />
				</label>
				<label>
					<span><?php esc_html_e( 'Berechnungsgrundlage', 'hairhelp-partner' ); ?></span>
					<select name="partners[<?php echo esc_attr( $index ); ?>][commission_base]">
						<option value="net" <?php selected( $partner['commission_base'], 'net' ); ?>><?php esc_html_e( 'Warenwert ohne Versand und Steuer', 'hairhelp-partner' ); ?></option>
						<option value="gross" <?php selected( $partner['commission_base'], 'gross' ); ?>><?php esc_html_e( 'Bestellsumme gesamt', 'hairhelp-partner' ); ?></option>
					</select>
				</label>
			</div>

			<div class="hhp-partner-meta">
				<label class="hhp-inline">
					<input type="checkbox" name="partners[<?php echo esc_attr( $index ); ?>][active]" value="1" <?php checked( $partner['active'], 1 ); ?> />
					<?php esc_html_e( 'aktiv', 'hairhelp-partner' ); ?>
				</label>

				<input type="hidden" name="partners[<?php echo esc_attr( $index ); ?>][token]" value="<?php echo esc_attr( $partner['token'] ); ?>" />

				<?php if ( $link ) : ?>
					<label class="hhp-linkfield">
						<span><?php esc_html_e( 'Zugangslink für den Vermittler', 'hairhelp-partner' ); ?></span>
						<input type="text" readonly value="<?php echo esc_attr( $link ); ?>" onfocus="this.select()" class="hhp-copy-input" />
					</label>
					<button type="button" class="button hhp-copy" data-link="<?php echo esc_attr( $link ); ?>"><?php esc_html_e( 'Kopieren', 'hairhelp-partner' ); ?></button>
				<?php elseif ( ! $page ) : ?>
					<p class="description"><?php esc_html_e( 'Sobald eine Seite mit dem Shortcode [hhp_partner_dashboard] veröffentlicht ist, erscheint hier der fertige Zugangslink.', 'hairhelp-partner' ); ?></p>
				<?php endif; ?>

				<label class="hhp-inline">
					<input type="checkbox" name="partners[<?php echo esc_attr( $index ); ?>][neues_token]" value="1" />
					<?php esc_html_e( 'Neues Token erzeugen (alter Link wird ungültig)', 'hairhelp-partner' ); ?>
				</label>

				<label class="hhp-inline">
					<input type="checkbox" name="partners[<?php echo esc_attr( $index ); ?>][loeschen]" value="1" />
					<?php esc_html_e( 'Diesen Vermittler entfernen', 'hairhelp-partner' ); ?>
				</label>
			</div>
		</div>
		<?php
	}

	/**
	 * Speichert die Vermittlerliste.
	 *
	 * @return void
	 */
	public static function save_partners() {
		if ( ! current_user_can( self::CAPABILITY ) || ! check_admin_referer( 'hhp_save_partners' ) ) {
			wp_die( esc_html__( 'Fehlende Berechtigung.', 'hairhelp-partner' ) );
		}

		$raw   = isset( $_POST['partners'] ) ? (array) wp_unslash( $_POST['partners'] ) : array();
		$clean = array();

		foreach ( $raw as $entry ) {
			if ( ! is_array( $entry ) || ! empty( $entry['loeschen'] ) ) {
				continue;
			}

			$id = isset( $entry['id'] ) ? sanitize_key( $entry['id'] ) : '';

			if ( '' === $id ) {
				continue;
			}

			$token = isset( $entry['token'] ) ? preg_replace( '/[^a-f0-9]/', '', (string) $entry['token'] ) : '';

			if ( ! empty( $entry['neues_token'] ) || '' === $token ) {
				$token = HHP_Settings::generate_token();
			}

			$clean[] = array(
				'id'              => $id,
				'name'            => isset( $entry['name'] ) ? sanitize_text_field( $entry['name'] ) : '',
				'codes'           => self::split_codes( isset( $entry['codes'] ) ? $entry['codes'] : '' ),
				'coupons'         => self::split_codes( isset( $entry['coupons'] ) ? $entry['coupons'] : '' ),
				'commission'      => isset( $entry['commission'] ) ? (float) $entry['commission'] : 0.0,
				'commission_base' => isset( $entry['commission_base'] ) && 'gross' === $entry['commission_base'] ? 'gross' : 'net',
				'token'           => $token,
				'active'          => ! empty( $entry['active'] ) ? 1 : 0,
				'note'            => '',
			);
		}

		HHP_Settings::save_partners( $clean );
		HHP_Repository::bump_cache_version();

		wp_safe_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&tab=vermittler&hhp_gespeichert=1' ) );
		exit;
	}

	/**
	 * Zerlegt eine kommagetrennte Liste von Codes.
	 *
	 * @param string $value Eingabe.
	 *
	 * @return array<int,string>
	 */
	protected static function split_codes( $value ) {
		$parts = preg_split( '/[,;\s]+/', (string) $value );
		$clean = array();

		foreach ( (array) $parts as $part ) {
			$part = HHP_Tracker::sanitize_code( $part );

			if ( '' !== $part ) {
				$clean[] = $part;
			}
		}

		return array_values( array_unique( $clean ) );
	}

	/* --------------------------------------------------------------------- *
	 * Reiter: QR-Codes
	 * --------------------------------------------------------------------- */

	/**
	 * Gibt den QR-Generator aus.
	 *
	 * @return void
	 */
	protected static function render_qr() {
		$partners = HHP_Settings::partners();

		echo '<p class="description" style="max-width:48em">';
		esc_html_e( 'Die Codes werden direkt auf diesem Server erzeugt. Es wird kein externer Dienst aufgerufen, die Kampagnenadresse verlässt den Shop also nicht. SVG eignet sich für den Druck, PNG für Bildschirm und Social Media.', 'hairhelp-partner' );
		echo '</p>';

		if ( empty( $partners ) ) {
			printf( '<p>%s</p>', esc_html__( 'Es ist noch kein Vermittler angelegt.', 'hairhelp-partner' ) );

			return;
		}

		foreach ( $partners as $partner ) {
			foreach ( $partner['codes'] as $code ) {
				$url = HHP_Tracker::build_qr_url( $code );

				if ( '' === $url ) {
					continue;
				}

				try {
					$qr = HHP_QR_Code::create( $url, 'Q' );
				} catch ( Exception $e ) {
					continue;
				}

				?>
				<div class="hhp-qr-card">
					<div class="hhp-qr-preview"><?php echo $qr->to_svg( array( 'scale' => 4, 'title' => $url ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Selbst erzeugtes SVG. ?></div>
					<div class="hhp-qr-info">
						<h3><?php echo esc_html( $partner['name'] ? $partner['name'] : $partner['id'] ); ?> &ndash; <code><?php echo esc_html( $code ); ?></code></h3>
						<p><?php esc_html_e( 'Zieladresse:', 'hairhelp-partner' ); ?> <code><?php echo esc_html( $url ); ?></code></p>
						<p>
							<?php
							printf(
								/* translators: 1: Version, 2: Kantenlaenge in Modulen */
								esc_html__( 'Version %1$d, %2$d x %2$d Module, Fehlerkorrektur Q (30 Prozent wiederherstellbar).', 'hairhelp-partner' ),
								(int) $qr->get_version(),
								(int) $qr->get_size()
							);
							?>
						</p>
						<p class="hhp-qr-actions">
							<a class="button button-primary" href="<?php echo esc_url( self::qr_url( $code, 'svg' ) ); ?>"><?php esc_html_e( 'SVG herunterladen', 'hairhelp-partner' ); ?></a>
							<a class="button" href="<?php echo esc_url( self::qr_url( $code, 'png' ) ); ?>"><?php esc_html_e( 'PNG herunterladen', 'hairhelp-partner' ); ?></a>
							<a class="button" href="<?php echo esc_url( self::qr_url( $code, 'plakat' ) ); ?>"><?php esc_html_e( 'Druckvorlage (SVG)', 'hairhelp-partner' ); ?></a>
						</p>
					</div>
				</div>
				<?php
			}
		}
	}

	/**
	 * Baut die Downloadadresse eines QR-Codes.
	 *
	 * @param string $code   Kampagnencode.
	 * @param string $format svg, png oder plakat.
	 *
	 * @return string
	 */
	protected static function qr_url( $code, $format ) {
		return add_query_arg(
			array(
				'action'   => 'hhp_qr',
				'code'     => $code,
				'format'   => $format,
				'_wpnonce' => wp_create_nonce( 'hhp_qr' ),
			),
			admin_url( 'admin-post.php' )
		);
	}

	/**
	 * Liefert eine QR-Datei zum Download aus.
	 *
	 * @return void
	 */
	public static function download_qr() {
		if ( ! current_user_can( self::CAPABILITY ) || ! check_admin_referer( 'hhp_qr' ) ) {
			wp_die( esc_html__( 'Fehlende Berechtigung.', 'hairhelp-partner' ) );
		}

		$code   = isset( $_GET['code'] ) ? HHP_Tracker::sanitize_code( wp_unslash( $_GET['code'] ) ) : '';
		$format = isset( $_GET['format'] ) ? sanitize_key( wp_unslash( $_GET['format'] ) ) : 'svg';
		$url    = HHP_Tracker::build_qr_url( $code );

		if ( '' === $url ) {
			wp_die( esc_html__( 'Unbekannter Kampagnencode.', 'hairhelp-partner' ) );
		}

		try {
			$qr = HHP_QR_Code::create( $url, 'Q' );
		} catch ( Exception $e ) {
			wp_die( esc_html__( 'Der QR-Code konnte nicht erzeugt werden.', 'hairhelp-partner' ) );
		}

		nocache_headers();

		if ( 'png' === $format ) {
			header( 'Content-Type: image/png' );
			header( 'Content-Disposition: attachment; filename="qr-' . $code . '.png"' );
			echo $qr->to_png( array( 'scale' => 20 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Binaerdaten.
			exit;
		}

		if ( 'plakat' === $format ) {
			header( 'Content-Type: image/svg+xml' );
			header( 'Content-Disposition: attachment; filename="qr-' . $code . '-druckvorlage.svg"' );
			echo self::poster_svg( $qr, $code, $url ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Selbst erzeugtes SVG.
			exit;
		}

		header( 'Content-Type: image/svg+xml' );
		header( 'Content-Disposition: attachment; filename="qr-' . $code . '.svg"' );
		echo $qr->to_svg( array( 'scale' => 10, 'title' => $url ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Selbst erzeugtes SVG.
		exit;
	}

	/**
	 * Baut eine druckfertige Vorlage mit Aufruf und Code.
	 *
	 * @param HHP_QR_Code $qr   Erzeugter Code.
	 * @param string      $code Kampagnencode.
	 * @param string      $url  Zieladresse.
	 *
	 * @return string
	 */
	/**
	 * Liefert einen kurzen Markennamen fuer die Druckvorlage.
	 *
	 * Website-Titel sind haeufig fuer Suchmaschinen ausgeschrieben und damit zu
	 * lang fuer ein Plakat. Genommen wird deshalb das erste Segment vor einem
	 * Trennzeichen, notfalls hart gekuerzt.
	 *
	 * @return string
	 */
	protected static function brand_name() {
		$eigener = trim( (string) HHP_Settings::get( 'poster_name' ) );

		if ( '' !== $eigener ) {
			return $eigener;
		}

		$name = trim( (string) get_bloginfo( 'name' ) );

		// Website-Titel sind haeufig fuer Suchmaschinen ausgeschrieben. Der Teil
		// vor dem ersten Trennzeichen ist in aller Regel der Markenname.
		foreach ( array( '|', ':', ' - ', ' – ', ' — ' ) as $trenner ) {
			$position = mb_strpos( $name, $trenner );

			if ( false !== $position && $position > 2 ) {
				$name = trim( mb_substr( $name, 0, $position ) );
			}
		}

		// Bleibt es zu lang, an der letzten Wortgrenze trennen statt mitten im Wort.
		if ( mb_strlen( $name ) > 28 ) {
			$gekuerzt = mb_substr( $name, 0, 28 );
			$luecke   = mb_strrpos( $gekuerzt, ' ' );

			$name = ( false !== $luecke && $luecke > 8 )
				? trim( mb_substr( $gekuerzt, 0, $luecke ) )
				: trim( $gekuerzt );
		}

		return '' !== $name ? $name : __( 'Jetzt scannen', 'hairhelp-partner' );
	}

	protected static function poster_svg( $qr, $code, $url ) {
		$primary = sanitize_hex_color( HHP_Settings::get( 'brand_primary' ) );
		$primary = $primary ? $primary : '#a39772';
		$dark    = sanitize_hex_color( HHP_Settings::get( 'brand_dark' ) );
		$dark    = $dark ? $dark : '#292929';
		$name    = self::brand_name();

		$inner = $qr->to_svg(
			array(
				'scale'      => 1,
				'quiet_zone' => 0,
				'dark'       => '#1a1a1a',
				'light'      => 'none',
			)
		);

		// Nur den Pfad uebernehmen, damit der Code frei positioniert werden kann.
		$path = '';

		if ( preg_match( '/<path d="([^"]*)"/', $inner, $matches ) ) {
			$path = $matches[1];
		}

		$modules = $qr->get_size();
		$target  = 380;
		$scale   = $target / $modules;

		// Schriftstapel wie auf der Website; faellt sauber zurueck, falls die
		// Hausschriften auf dem Rechner der Druckerei fehlen.
		$titel = 'Jost, Futura, Helvetica, Arial, sans-serif';
		$text  = 'Heebo, Helvetica, Arial, sans-serif';

		// Zurueckhaltend gehalten wie der Auftritt der Website: viel Weissraum,
		// Haarlinien statt Flaechen, Gold ausschliesslich als Akzent. Text bleibt
		// dunkel, weil Gold auf Weiss fuer Fliesstext zu wenig Kontrast hat.
		return sprintf(
			'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">'
			. '<rect width="600" height="800" fill="#ffffff"/>'
			. '<text x="300" y="86" text-anchor="middle" font-family="%1$s" font-size="30" font-weight="500" letter-spacing="1.5" fill="%2$s">%3$s</text>'
			. '<line x1="240" y1="116" x2="360" y2="116" stroke="%4$s" stroke-width="2"/>'
			. '<g transform="translate(110 176) scale(%5$F)"><path d="%6$s" fill="#1a1a1a"/></g>'
			. '<text x="300" y="638" text-anchor="middle" font-family="%1$s" font-size="27" font-weight="500" letter-spacing="3" fill="%2$s">%7$s</text>'
			. '<text x="300" y="676" text-anchor="middle" font-family="%8$s" font-size="17" fill="#7a7a7a">%9$s</text>'
			. '<rect x="205" y="700" width="190" height="46" fill="#faf9f6" stroke="%4$s" stroke-width="1"/>'
			. '<text x="300" y="731" text-anchor="middle" font-family="%1$s" font-size="24" font-weight="500" letter-spacing="4" fill="%2$s">%10$s</text>'
			. '<text x="300" y="775" text-anchor="middle" font-family="%8$s" font-size="13" letter-spacing="1" fill="#7a7a7a">%11$s</text>'
			. '</svg>',
			esc_attr( $titel ),
			esc_attr( $dark ),
			esc_html( $name ),
			esc_attr( $primary ),
			$scale,
			esc_attr( $path ),
			esc_html__( 'JETZT SCANNEN', 'hairhelp-partner' ),
			esc_attr( $text ),
			esc_html__( 'oder an der Kasse eingeben:', 'hairhelp-partner' ),
			esc_html( strtoupper( $code ) ),
			esc_html( preg_replace( '#^https?://#', '', $url ) )
		);
	}

	/* --------------------------------------------------------------------- *
	 * Reiter: Werkzeuge
	 * --------------------------------------------------------------------- */

	/**
	 * Gibt die Werkzeugseite aus.
	 *
	 * @return void
	 */
	protected static function render_tools() {
		$page = self::dashboard_page_url();

		?>
		<h3><?php esc_html_e( 'Bestehende Bestellungen zuordnen', 'hairhelp-partner' ); ?></h3>
		<p class="description" style="max-width:48em">
			<?php esc_html_e( 'Bestellungen, die vor der Installation eingegangen sind, tragen noch keine Zuordnung. Der Abgleich prüft die vorhandenen Bestellungen auf die hinterlegten Gutschein- und Kampagnencodes und trägt die Herkunft nach. Der Vorgang kann jederzeit wiederholt werden.', 'hairhelp-partner' ); ?>
		</p>
		<p>
			<label for="hhp-reindex-after"><?php esc_html_e( 'Bestellungen ab', 'hairhelp-partner' ); ?></label>
			<input type="date" id="hhp-reindex-after" value="<?php echo esc_attr( gmdate( 'Y-m-d', strtotime( '-1 year' ) ) ); ?>" />
			<button type="button" class="button button-primary" id="hhp-reindex"><?php esc_html_e( 'Abgleich starten', 'hairhelp-partner' ); ?></button>
		</p>
		<div id="hhp-reindex-status" class="hhp-status"></div>

		<hr />

		<h3><?php esc_html_e( 'Dashboard-Seite', 'hairhelp-partner' ); ?></h3>
		<?php if ( $page ) : ?>
			<p>
				<?php esc_html_e( 'Gefundene Seite:', 'hairhelp-partner' ); ?>
				<a href="<?php echo esc_url( $page ); ?>" target="_blank" rel="noreferrer noopener"><?php echo esc_html( $page ); ?></a>
			</p>
		<?php else : ?>
			<p>
				<?php
				printf(
					/* translators: %s: Shortcode */
					esc_html__( 'Lege eine Seite an und setze dort den Shortcode %s ein. Danach erscheinen die fertigen Zugangslinks im Reiter Vermittler.', 'hairhelp-partner' ),
					'<code>[hhp_partner_dashboard]</code>'
				);
				?>
			</p>
		<?php endif; ?>

		<h3><?php esc_html_e( 'Prüfung des Trackings', 'hairhelp-partner' ); ?></h3>
		<p>
			<?php esc_html_e( 'Aktuell gesetztes Cookie in diesem Browser:', 'hairhelp-partner' ); ?>
			<code><?php echo esc_html( HHP_Tracker::current_code() ? HHP_Tracker::current_code() : __( 'keines', 'hairhelp-partner' ) ); ?></code>
		</p>
		<?php
	}

	/**
	 * AJAX-Endpunkt fuer den Abgleich.
	 *
	 * @return void
	 */
	public static function ajax_reindex() {
		check_ajax_referer( 'hhp_reindex', 'nonce' );

		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error( array( 'meldung' => __( 'Fehlende Berechtigung.', 'hairhelp-partner' ) ), 403 );
		}

		$page  = isset( $_POST['seite'] ) ? max( 1, (int) $_POST['seite'] ) : 1;
		$after = isset( $_POST['ab'] ) ? sanitize_text_field( wp_unslash( $_POST['ab'] ) ) : '';

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $after ) ) {
			$after = '';
		}

		$result = HHP_Attribution::reindex(
			array(
				'after' => $after,
				'limit' => 40,
				'page'  => $page,
			)
		);

		HHP_Repository::bump_cache_version();

		wp_send_json_success( $result );
	}

	/**
	 * Sucht die Seite, auf der der Dashboard-Shortcode eingebunden ist.
	 *
	 * @return string
	 */
	public static function dashboard_page_url() {
		$cached = get_transient( 'hhp_dashboard_page' );

		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}

		$pages = get_posts(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'posts_per_page' => 20,
				's'              => '[' . HHP_Dashboard::SHORTCODE,
				'fields'         => 'ids',
			)
		);

		foreach ( $pages as $page_id ) {
			$content = get_post_field( 'post_content', $page_id );

			if ( has_shortcode( (string) $content, HHP_Dashboard::SHORTCODE ) ) {
				$url = get_permalink( $page_id );
				set_transient( 'hhp_dashboard_page', $url, HOUR_IN_SECONDS );

				return $url;
			}
		}

		return '';
	}
}
