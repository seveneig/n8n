<?php
/**
 * Plugin Name:       SMELL Online-Test
 * Description:       Prüft die Seriennummer (SN) des SMELL Test-Sets beim Login zum Online-Test, speichert auf Wunsch die Anmeldedaten und zählt die durchgeführten Tests je Test-Set.
 * Version:           1.1.1
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            SMELL Discettes GmbH
 * Text Domain:       smell-online-test
 *
 * Schnittstelle (vom Online-Test auf der Seite /test/ aufgerufen):
 *   POST /wp-json/smell/v1/anmelden   { pruefer, klinik, sn, speichern }
 *   POST /wp-json/smell/v1/test       { token }
 *
 * Mitgeliefert (assets/): das ausfüllbare Testformular und pdf-lib (MIT-Lizenz),
 * mit dem der Online-Test das Formular im Browser ausfüllt. Die Adressen
 * stehen in der Antwort von /anmelden.
 *
 * Patientendaten werden nie an den Server übertragen.
 */

defined( 'ABSPATH' ) || exit;

final class Smell_Online_Test {

	const VERSION     = '1.1.1';
	const OPTION      = 'smell_ot_einstellungen';
	const DB_VERSION  = 'smell_ot_db_version';
	const NS          = 'smell/v1';
	const TOKEN_TTL   = 12 * HOUR_IN_SECONDS;   // Gültigkeit einer Anmeldung
	const FEHL_MAX    = 10;                     // Fehlversuche je IP …
	const FEHL_FRIST  = 15 * MINUTE_IN_SECONDS; // … innerhalb dieser Zeit
	const TEST_ABSTAND = 15;                    // Sekunden zwischen zwei gezählten Tests je Anmeldung

	/* ------------------------------------------------------------------ */
	/* Grundgerüst                                                         */
	/* ------------------------------------------------------------------ */

	public static function start() {
		register_activation_hook( __FILE__, array( __CLASS__, 'aktivieren' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'db_pruefen' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'routen' ) );
		add_action( 'admin_menu', array( __CLASS__, 'menue' ) );
		add_action( 'admin_post_smell_ot', array( __CLASS__, 'admin_aktion' ) );
		add_action( 'smell_ot_aufraeumen', array( __CLASS__, 'aufraeumen' ) );
	}

	private static function tab( $name ) {
		global $wpdb;
		return $wpdb->prefix . 'smell_' . $name;
	}

	public static function einstellungen() {
		$standard = array(
			'grenze'            => 500,  // vorgesehene Tests je Test-Set
			'speichern_erlaubt' => 1,    // Anmeldedaten dürfen gespeichert werden
			'aufbewahrung_tage' => 365,  // gespeicherte Anmeldungen danach löschen (0 = unbegrenzt)
		);
		return wp_parse_args( (array) get_option( self::OPTION, array() ), $standard );
	}

	public static function aktivieren() {
		self::tabellen();
		// Vorführ-Seriennummer, damit der Ablauf sofort geprüft werden kann
		self::sn_anlegen( array( 'SMELL-2026-HANS' ), 'Vorführcode' );
		if ( ! wp_next_scheduled( 'smell_ot_aufraeumen' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'smell_ot_aufraeumen' );
		}
	}

	public static function db_pruefen() {
		if ( get_option( self::DB_VERSION ) !== self::VERSION ) {
			self::tabellen();
		}
	}

	private static function tabellen() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$c = $wpdb->get_charset_collate();

		dbDelta( 'CREATE TABLE ' . self::tab( 'sets' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			sn varchar(64) NOT NULL,
			tests int(10) unsigned NOT NULL DEFAULT 0,
			aktiv tinyint(1) NOT NULL DEFAULT 1,
			notiz varchar(190) NOT NULL DEFAULT '',
			angelegt datetime NOT NULL,
			letzter_test datetime NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY sn (sn)
		) $c;" );

		dbDelta( 'CREATE TABLE ' . self::tab( 'anmeldungen' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			set_id bigint(20) unsigned NOT NULL,
			sn varchar(64) NOT NULL,
			pruefer varchar(190) NOT NULL,
			klinik varchar(190) NOT NULL,
			zeitpunkt datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY set_id (set_id),
			KEY zeitpunkt (zeitpunkt)
		) $c;" );

		update_option( self::DB_VERSION, self::VERSION );
	}

	/* ------------------------------------------------------------------ */
	/* Seriennummern                                                       */
	/* ------------------------------------------------------------------ */

	/** Legt Seriennummern an; bestehende bleiben unverändert. Gibt die Anzahl neuer Einträge zurück. */
	private static function sn_anlegen( array $liste, $notiz = '' ) {
		global $wpdb;
		$neu = 0;
		foreach ( $liste as $sn ) {
			$sn = trim( (string) $sn );
			if ( '' === $sn || strlen( $sn ) > 64 ) {
				continue;
			}
			if ( self::set_finden( $sn ) ) {
				continue;
			}
			$ok = $wpdb->insert(
				self::tab( 'sets' ),
				array(
					'sn'       => $sn,
					'tests'    => 0,
					'aktiv'    => 1,
					'notiz'    => substr( $notiz, 0, 190 ),
					'angelegt' => current_time( 'mysql' ),
				),
				array( '%s', '%d', '%d', '%s', '%s' )
			);
			if ( $ok ) {
				$neu++;
			}
		}
		return $neu;
	}

	/**
	 * Sucht ein Test-Set mit exakt dieser Seriennummer.
	 * Die Datenbank vergleicht je nach Sortierung ohne Gross-/Kleinschreibung –
	 * deshalb wird das Ergebnis hier noch einmal zeichengenau geprüft.
	 */
	private static function set_finden( $sn ) {
		global $wpdb;
		$zeilen = $wpdb->get_results(
			$wpdb->prepare( 'SELECT * FROM ' . self::tab( 'sets' ) . ' WHERE sn = %s', $sn )
		);
		foreach ( (array) $zeilen as $z ) {
			if ( hash_equals( (string) $z->sn, (string) $sn ) ) {
				return $z;
			}
		}
		return null;
	}

	/* ------------------------------------------------------------------ */
	/* REST-Schnittstelle                                                  */
	/* ------------------------------------------------------------------ */

	public static function routen() {
		register_rest_route( self::NS, '/anmelden', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'rest_anmelden' ),
			'permission_callback' => '__return_true', // öffentlich; geschützt durch Fehlversuch-Sperre
		) );
		register_rest_route( self::NS, '/test', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'rest_test' ),
			'permission_callback' => '__return_true', // nur mit gültigem Anmelde-Token wirksam
		) );
	}

	private static function fehler( $code, $text, $status ) {
		return new WP_REST_Response( array( 'ok' => false, 'code' => $code, 'meldung' => $text ), $status );
	}

	private static function ip_schluessel() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
		return 'smell_ot_fehl_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 32 );
	}

	private static function feld( WP_REST_Request $r, $name, $max = 190 ) {
		$v = $r->get_param( $name );
		$v = is_scalar( $v ) ? trim( wp_strip_all_tags( (string) $v ) ) : '';
		return function_exists( 'mb_substr' ) ? mb_substr( $v, 0, $max ) : substr( $v, 0, $max );
	}

	public static function rest_anmelden( WP_REST_Request $r ) {
		$e       = self::einstellungen();
		$pruefer = self::feld( $r, 'pruefer' );
		$klinik  = self::feld( $r, 'klinik' );
		$sn      = self::feld( $r, 'sn', 64 );

		if ( '' === $pruefer || '' === $klinik || '' === $sn ) {
			return self::fehler( 'felder_leer', 'Bitte füllen Sie alle Felder aus.', 400 );
		}

		$schluessel = self::ip_schluessel();
		$fehl       = (int) get_transient( $schluessel );
		if ( $fehl >= self::FEHL_MAX ) {
			return self::fehler( 'gesperrt', 'Zu viele erfolglose Versuche. Bitte versuchen Sie es in 15 Minuten erneut.', 429 );
		}

		$set = self::set_finden( $sn );
		if ( ! $set || ! (int) $set->aktiv ) {
			set_transient( $schluessel, $fehl + 1, self::FEHL_FRIST );
			return self::fehler( 'sn_unbekannt', 'Diese Seriennummer ist nicht freigeschaltet.', 403 );
		}

		$gespeichert = false;
		if ( (int) $e['speichern_erlaubt'] && rest_sanitize_boolean( $r->get_param( 'speichern' ) ) ) {
			global $wpdb;
			$gespeichert = (bool) $wpdb->insert(
				self::tab( 'anmeldungen' ),
				array(
					'set_id'    => (int) $set->id,
					'sn'        => $set->sn,
					'pruefer'   => $pruefer,
					'klinik'    => $klinik,
					'zeitpunkt' => current_time( 'mysql' ),
				),
				array( '%d', '%s', '%s', '%s', '%s' )
			);
		}

		$token = wp_generate_password( 40, false, false );
		set_transient( 'smell_ot_tok_' . $token, array( 'set' => (int) $set->id, 'zuletzt' => 0 ), self::TOKEN_TTL );

		return new WP_REST_Response( array(
			'ok'          => true,
			'token'       => $token,
			'tests'       => (int) $set->tests,
			'grenze'      => (int) $e['grenze'],
			'gespeichert' => $gespeichert,
			'formular'    => self::datei( 'SMELL_Olfaction_Test_Formular_D_ausfuellbar.pdf' ),
			'pdflib'      => self::datei( 'pdf-lib.min.js' ),
		), 200 );
	}

	private static function datei( $name ) {
		return add_query_arg( 'ver', self::VERSION, plugins_url( 'assets/' . $name, __FILE__ ) );
	}

	public static function rest_test( WP_REST_Request $r ) {
		global $wpdb;
		$token = preg_replace( '/[^A-Za-z0-9]/', '', (string) $r->get_param( 'token' ) );
		$daten = $token ? get_transient( 'smell_ot_tok_' . $token ) : false;
		if ( ! is_array( $daten ) || empty( $daten['set'] ) ) {
			return self::fehler( 'abgelaufen', 'Die Anmeldung ist abgelaufen. Bitte melden Sie sich erneut an.', 401 );
		}

		$tab = self::tab( 'sets' );
		if ( time() - (int) $daten['zuletzt'] >= self::TEST_ABSTAND ) {
			$wpdb->query( $wpdb->prepare(
				"UPDATE $tab SET tests = tests + 1, letzter_test = %s WHERE id = %d",
				current_time( 'mysql' ),
				(int) $daten['set']
			) );
			$daten['zuletzt'] = time();
			set_transient( 'smell_ot_tok_' . $token, $daten, self::TOKEN_TTL );
		}

		$tests = (int) $wpdb->get_var( $wpdb->prepare( "SELECT tests FROM $tab WHERE id = %d", (int) $daten['set'] ) );
		$e     = self::einstellungen();
		return new WP_REST_Response( array( 'ok' => true, 'tests' => $tests, 'grenze' => (int) $e['grenze'] ), 200 );
	}

	/* ------------------------------------------------------------------ */
	/* Aufbewahrung                                                        */
	/* ------------------------------------------------------------------ */

	public static function aufraeumen() {
		global $wpdb;
		$tage = (int) self::einstellungen()['aufbewahrung_tage'];
		if ( $tage > 0 ) {
			$grenze = gmdate( 'Y-m-d H:i:s', current_time( 'timestamp' ) - $tage * DAY_IN_SECONDS );
			$wpdb->query( $wpdb->prepare( 'DELETE FROM ' . self::tab( 'anmeldungen' ) . ' WHERE zeitpunkt < %s', $grenze ) );
		}
	}

	/* ------------------------------------------------------------------ */
	/* Verwaltung                                                          */
	/* ------------------------------------------------------------------ */

	public static function menue() {
		add_menu_page( 'SMELL Online-Test', 'SMELL Online-Test', 'manage_options', 'smell-online-test',
			array( __CLASS__, 'seite' ), 'dashicons-clipboard', 58 );
	}

	public static function admin_aktion() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Keine Berechtigung.' );
		}
		check_admin_referer( 'smell_ot' );
		global $wpdb;
		$was  = isset( $_POST['was'] ) ? sanitize_key( wp_unslash( $_POST['was'] ) ) : '';
		$id   = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0;
		$info = '';

		switch ( $was ) {
			case 'einstellungen':
				update_option( self::OPTION, array(
					'grenze'            => max( 1, (int) ( $_POST['grenze'] ?? 500 ) ),
					'speichern_erlaubt' => empty( $_POST['speichern_erlaubt'] ) ? 0 : 1,
					'aufbewahrung_tage' => max( 0, (int) ( $_POST['aufbewahrung_tage'] ?? 365 ) ),
				) );
				$info = 'Einstellungen gespeichert.';
				break;
			case 'sn_neu':
				$text  = isset( $_POST['liste'] ) ? (string) wp_unslash( $_POST['liste'] ) : '';
				$notiz = isset( $_POST['notiz'] ) ? sanitize_text_field( wp_unslash( $_POST['notiz'] ) ) : '';
				$liste = preg_split( '/[\r\n,;]+/', $text );
				$info  = sprintf( '%d Seriennummer(n) neu angelegt.', self::sn_anlegen( $liste, $notiz ) );
				break;
			case 'aktiv':
				$wpdb->query( $wpdb->prepare( 'UPDATE ' . self::tab( 'sets' ) . ' SET aktiv = 1 - aktiv WHERE id = %d', $id ) );
				$info = 'Status geändert.';
				break;
			case 'zuruecksetzen':
				$wpdb->update( self::tab( 'sets' ), array( 'tests' => 0 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
				$info = 'Zähler zurückgesetzt.';
				break;
			case 'sn_loeschen':
				$wpdb->delete( self::tab( 'sets' ), array( 'id' => $id ), array( '%d' ) );
				$info = 'Seriennummer gelöscht.';
				break;
			case 'anmeldungen_loeschen':
				$wpdb->query( 'DELETE FROM ' . self::tab( 'anmeldungen' ) );
				$info = 'Alle gespeicherten Anmeldungen gelöscht.';
				break;
		}

		wp_safe_redirect( add_query_arg( array( 'page' => 'smell-online-test', 'info' => rawurlencode( $info ) ), admin_url( 'admin.php' ) ) );
		exit;
	}

	private static function knopf( $was, $text, $id = 0, $klasse = 'button-small', $frage = '' ) {
		$h  = '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline">';
		$h .= wp_nonce_field( 'smell_ot', '_wpnonce', true, false );
		$h .= '<input type="hidden" name="action" value="smell_ot"><input type="hidden" name="was" value="' . esc_attr( $was ) . '">';
		$h .= '<input type="hidden" name="id" value="' . (int) $id . '">';
		$h .= '<button class="button ' . esc_attr( $klasse ) . '"' . ( $frage ? ' onclick="return confirm(\'' . esc_js( $frage ) . '\')"' : '' ) . '>' . esc_html( $text ) . '</button></form> ';
		return $h;
	}

	public static function seite() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		global $wpdb;
		$e    = self::einstellungen();
		$sets = $wpdb->get_results( 'SELECT * FROM ' . self::tab( 'sets' ) . ' ORDER BY angelegt DESC, id DESC' );
		$anm  = $wpdb->get_results( 'SELECT * FROM ' . self::tab( 'anmeldungen' ) . ' ORDER BY zeitpunkt DESC, id DESC LIMIT 200' );
		$anz  = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::tab( 'anmeldungen' ) );
		$info = isset( $_GET['info'] ) ? sanitize_text_field( wp_unslash( $_GET['info'] ) ) : '';
		$post = esc_url( admin_url( 'admin-post.php' ) );
		$nonce = wp_nonce_field( 'smell_ot', '_wpnonce', true, false );
		?>
		<div class="wrap">
			<h1>SMELL Online-Test</h1>
			<?php if ( $info ) : ?><div class="notice notice-success is-dismissible"><p><?php echo esc_html( $info ); ?></p></div><?php endif; ?>

			<h2>Seriennummern hinzufügen</h2>
			<p>Eine Seriennummer pro Zeile, genau so, wie sie auf dem Etikett der TestBox steht. Beim Login wird zeichengenau verglichen, auch Gross- und Kleinschreibung.</p>
			<form method="post" action="<?php echo $post; ?>">
				<?php echo $nonce; ?>
				<input type="hidden" name="action" value="smell_ot"><input type="hidden" name="was" value="sn_neu">
				<textarea name="liste" rows="5" cols="50" class="large-text code" placeholder="21ISNB1EZ9K"></textarea>
				<p><label>Notiz (optional, z. B. Lieferung oder Kunde): <input type="text" name="notiz" class="regular-text"></label></p>
				<?php submit_button( 'Seriennummern anlegen', 'primary', 'submit', false ); ?>
			</form>

			<h2 style="margin-top:2em">Test-Sets (<?php echo count( $sets ); ?>)</h2>
			<table class="widefat striped">
				<thead><tr><th>Seriennummer</th><th>Durchgeführte Tests</th><th>Status</th><th>Notiz</th><th>Angelegt</th><th>Letzter Test</th><th></th></tr></thead>
				<tbody>
				<?php if ( ! $sets ) : ?><tr><td colspan="7">Noch keine Seriennummern.</td></tr><?php endif; ?>
				<?php foreach ( $sets as $s ) : ?>
					<tr>
						<td><code><?php echo esc_html( $s->sn ); ?></code></td>
						<td><?php echo (int) $s->tests; ?> / <?php echo (int) $e['grenze']; ?></td>
						<td><?php echo (int) $s->aktiv ? 'aktiv' : '<strong>gesperrt</strong>'; ?></td>
						<td><?php echo esc_html( $s->notiz ); ?></td>
						<td><?php echo esc_html( $s->angelegt ); ?></td>
						<td><?php echo esc_html( (string) $s->letzter_test ); ?></td>
						<td>
							<?php
							echo self::knopf( 'aktiv', (int) $s->aktiv ? 'Sperren' : 'Freigeben', $s->id );
							echo self::knopf( 'zuruecksetzen', 'Zähler auf 0', $s->id, 'button-small', 'Zähler dieser Seriennummer auf 0 setzen?' );
							echo self::knopf( 'sn_loeschen', 'Löschen', $s->id, 'button-small', 'Seriennummer endgültig löschen?' );
							?>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>

			<h2 style="margin-top:2em">Gespeicherte Anmeldungen (<?php echo $anz; ?>)</h2>
			<p>Gespeichert wird nur, wenn die Person beim Login zustimmt und die Speicherung unten erlaubt ist. Patientendaten werden nie übertragen. Angezeigt werden die letzten 200.</p>
			<table class="widefat striped">
				<thead><tr><th>Zeitpunkt</th><th>Seriennummer</th><th>Prüferin / Prüfer</th><th>Klinik / Praxis</th></tr></thead>
				<tbody>
				<?php if ( ! $anm ) : ?><tr><td colspan="4">Keine gespeicherten Anmeldungen.</td></tr><?php endif; ?>
				<?php foreach ( $anm as $a ) : ?>
					<tr><td><?php echo esc_html( $a->zeitpunkt ); ?></td><td><code><?php echo esc_html( $a->sn ); ?></code></td><td><?php echo esc_html( $a->pruefer ); ?></td><td><?php echo esc_html( $a->klinik ); ?></td></tr>
				<?php endforeach; ?>
				</tbody>
			</table>
			<p><?php echo self::knopf( 'anmeldungen_loeschen', 'Alle gespeicherten Anmeldungen löschen', 0, '', 'Alle gespeicherten Anmeldungen endgültig löschen?' ); ?></p>

			<h2 style="margin-top:2em">Einstellungen</h2>
			<form method="post" action="<?php echo $post; ?>">
				<?php echo $nonce; ?>
				<input type="hidden" name="action" value="smell_ot"><input type="hidden" name="was" value="einstellungen">
				<table class="form-table">
					<tr><th>Vorgesehene Tests je Test-Set</th><td><input type="number" name="grenze" min="1" value="<?php echo (int) $e['grenze']; ?>"> <p class="description">Ab dieser Zahl erhält die Fachperson beim Login den Hinweis, ein neues SMELL Test-Set zu bestellen.</p></td></tr>
					<tr><th>Anmeldedaten speichern</th><td><label><input type="checkbox" name="speichern_erlaubt" value="1" <?php checked( (int) $e['speichern_erlaubt'], 1 ); ?>> erlaubt, sofern die Person beim Login zustimmt</label></td></tr>
					<tr><th>Aufbewahrung</th><td><input type="number" name="aufbewahrung_tage" min="0" value="<?php echo (int) $e['aufbewahrung_tage']; ?>"> Tage <p class="description">Ältere gespeicherte Anmeldungen werden täglich gelöscht. 0 = unbegrenzt.</p></td></tr>
				</table>
				<?php submit_button( 'Einstellungen speichern' ); ?>
			</form>
		</div>
		<?php
	}
}

Smell_Online_Test::start();
