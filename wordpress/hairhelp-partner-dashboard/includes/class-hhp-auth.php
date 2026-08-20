<?php
/**
 * Anmeldung der Vermittler.
 *
 * Bewusst eine eigene Anmeldung statt WordPress-Benutzerkonten: Der Vermittler
 * soll seine Zahlen sehen, ohne einen Zugang zum Backend zu erhalten. Passwoerter
 * werden mit den WordPress-Funktionen gehasht, die Sitzung liegt serverseitig;
 * im Browser steht nur eine Zufallskennung.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Anmeldung, Sitzungsverwaltung und Passwortwechsel.
 */
class HHP_Auth {

	const COOKIE = 'hhp_session';

	/**
	 * Ersatz-Hash fuer Konten ohne Passwort und unbekannte Benutzernamen.
	 *
	 * Passt auf keine Eingabe und ist laenger als 32 Zeichen, damit WordPress
	 * ihn nicht als MD5-Hash behandelt.
	 */
	const ERSATZ_HASH = '$P$Bkeinpasswortgesetzt00000000000000';

	/**
	 * Hoechstzahl Fehlversuche je Adresse innerhalb des Zeitfensters.
	 */
	const MAX_VERSUCHE = 8;

	/**
	 * Laenge des Zeitfensters fuer die Versuchszaehlung in Sekunden.
	 */
	const SPERRE = 900;

	/**
	 * Im laufenden Aufruf ermittelter Vermittler.
	 *
	 * @var array|null|false
	 */
	protected static $aktuell = false;

	/**
	 * Registriert die Hooks.
	 *
	 * Anmelden, Abmelden und Passwortwechsel laufen ueber template_redirect,
	 * also bevor eine Ausgabe beginnt. Nur dort lassen sich Cookies setzen.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'template_redirect', array( __CLASS__, 'handle_requests' ), 5 );
	}

	/* --------------------------------------------------------------------- *
	 * Formularverarbeitung
	 * --------------------------------------------------------------------- */

	/**
	 * Verarbeitet Anmeldung, Abmeldung und Passwortwechsel.
	 *
	 * @return void
	 */
	public static function handle_requests() {
		if ( isset( $_POST['hhp_aktion'] ) && 'anmelden' === $_POST['hhp_aktion'] ) {
			self::handle_login();

			return;
		}

		if ( isset( $_POST['hhp_aktion'] ) && 'passwort' === $_POST['hhp_aktion'] ) {
			self::handle_password_change();

			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce wird unmittelbar darunter geprueft.
		if ( isset( $_GET['hhp_abmelden'] ) ) {
			$nonce = isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ) : '';

			if ( wp_verify_nonce( $nonce, 'hhp_abmelden' ) ) {
				self::logout();
			}

			self::redirect_back( array( 'hhp_hinweis' => 'abgemeldet' ) );
		}
	}

	/**
	 * Prueft die Anmeldedaten und legt bei Erfolg eine Sitzung an.
	 *
	 * @return void
	 */
	protected static function handle_login() {
		$nonce = isset( $_POST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ) : '';

		if ( ! wp_verify_nonce( $nonce, 'hhp_anmelden' ) ) {
			self::redirect_back( array( 'hhp_fehler' => 'abgelaufen' ) );
		}

		if ( ! self::attempts_left() ) {
			self::redirect_back( array( 'hhp_fehler' => 'gesperrt' ) );
		}

		$benutzer = isset( $_POST['hhp_benutzer'] ) ? (string) wp_unslash( $_POST['hhp_benutzer'] ) : '';
		$passwort = isset( $_POST['hhp_passwort'] ) ? (string) wp_unslash( $_POST['hhp_passwort'] ) : '';
		$gemerkt  = ! empty( $_POST['hhp_merken'] );
		$partner  = self::verify_credentials( $benutzer, $passwort );

		if ( ! $partner ) {
			self::register_failure();
			self::redirect_back( array( 'hhp_fehler' => 'zugangsdaten' ) );
		}

		self::clear_failures();
		self::start_session( $partner['id'], $gemerkt );

		self::redirect_back();
	}

	/**
	 * Prueft Benutzername und Passwort.
	 *
	 * Ist kein Passwort hinterlegt, wird gegen einen Ersatz-Hash geprueft, der
	 * auf keine Eingabe passt. Ein Vermittler ohne gesetztes Passwort kann sich
	 * also nicht anmelden, auch nicht mit leerer Eingabe. Der Ersatz-Hash wird
	 * ebenso bei unbekanntem Benutzernamen geprueft, damit die Antwortzeit nicht
	 * verraet, ob es den Zugang gibt.
	 *
	 * @param string $benutzer Benutzername.
	 * @param string $passwort Passwort im Klartext.
	 *
	 * @return array|null Vermittler bei Erfolg, sonst null.
	 */
	public static function verify_credentials( $benutzer, $passwort ) {
		$partner = self::find_by_username( $benutzer );

		// Bewusst laenger als 32 Zeichen: kuerzere Werte vergleicht WordPress
		// als MD5-Hash, was hier der falsche Pfad waere.
		$hash = ( $partner && '' !== $partner['password_hash'] )
			? $partner['password_hash']
			: self::ERSATZ_HASH;

		$passt = wp_check_password( (string) $passwort, $hash );

		if ( ! $partner || ! $passt ) {
			return null;
		}

		return $partner;
	}

	/**
	 * Verarbeitet den Passwortwechsel eines angemeldeten Vermittlers.
	 *
	 * @return void
	 */
	protected static function handle_password_change() {
		$nonce = isset( $_POST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ) : '';

		if ( ! wp_verify_nonce( $nonce, 'hhp_passwort' ) ) {
			self::redirect_back( array( 'hhp_fehler' => 'abgelaufen' ) );
		}

		$partner = self::session_partner();

		if ( ! $partner ) {
			self::redirect_back( array( 'hhp_fehler' => 'abgelaufen' ) );
		}

		$alt  = isset( $_POST['hhp_alt'] ) ? (string) wp_unslash( $_POST['hhp_alt'] ) : '';
		$neu  = isset( $_POST['hhp_neu'] ) ? (string) wp_unslash( $_POST['hhp_neu'] ) : '';
		$neu2 = isset( $_POST['hhp_neu2'] ) ? (string) wp_unslash( $_POST['hhp_neu2'] ) : '';

		if ( empty( $partner['password_hash'] ) || ! wp_check_password( $alt, $partner['password_hash'] ) ) {
			self::redirect_back( array( 'hhp_fehler' => 'altfalsch' ) );
		}

		if ( $neu !== $neu2 ) {
			self::redirect_back( array( 'hhp_fehler' => 'ungleich' ) );
		}

		if ( ! self::password_acceptable( $neu ) ) {
			self::redirect_back( array( 'hhp_fehler' => 'zukurz' ) );
		}

		HHP_Settings::set_password( $partner['id'], $neu );

		// Alle bestehenden Sitzungen verfallen; die aktuelle wird neu aufgebaut.
		self::destroy_sessions( $partner['id'] );
		self::start_session( $partner['id'], false );

		self::redirect_back( array( 'hhp_hinweis' => 'passwort' ) );
	}

	/**
	 * Mindestanforderung an ein Passwort.
	 *
	 * @param string $passwort Passwort.
	 *
	 * @return bool
	 */
	public static function password_acceptable( $passwort ) {
		return mb_strlen( (string) $passwort ) >= 10;
	}

	/**
	 * Leitet auf die aufrufende Seite zurueck.
	 *
	 * Nach dem Absenden wird stets umgeleitet, damit ein Neuladen das Formular
	 * nicht erneut abschickt und die Adresszeile sauber bleibt.
	 *
	 * @param array $args Zusaetzliche Parameter.
	 *
	 * @return void
	 */
	protected static function redirect_back( $args = array() ) {
		$ziel = self::current_url();

		if ( ! empty( $args ) ) {
			$ziel = add_query_arg( $args, $ziel );
		}

		wp_safe_redirect( $ziel );
		exit;
	}

	/**
	 * Ermittelt die aufrufende Adresse ohne eigene Statusparameter.
	 *
	 * @return string
	 */
	protected static function current_url() {
		$id = get_queried_object_id();

		if ( $id ) {
			$url = get_permalink( $id );

			if ( $url ) {
				return $url;
			}
		}

		return home_url( '/' );
	}

	/* --------------------------------------------------------------------- *
	 * Sitzungen
	 * --------------------------------------------------------------------- */

	/**
	 * Legt eine Sitzung an und setzt das Cookie.
	 *
	 * @param string $partner_id Vermittler.
	 * @param bool   $gemerkt    Laengere Gueltigkeit gewuenscht.
	 *
	 * @return void
	 */
	public static function start_session( $partner_id, $gemerkt = false ) {
		$dauer = $gemerkt
			? max( 1, (int) HHP_Settings::get( 'remember_days', 30 ) ) * DAY_IN_SECONDS
			: max( 1, (int) HHP_Settings::get( 'session_hours', 12 ) ) * HOUR_IN_SECONDS;

		$kennung = bin2hex( random_bytes( 32 ) );

		set_transient(
			self::session_key( $kennung ),
			array(
				'partner'  => sanitize_key( $partner_id ),
				'erstellt' => time(),
			),
			$dauer
		);

		// Kennungen der Sitzungen je Vermittler mitfuehren, damit sich alle
		// Sitzungen bei einem Passwortwechsel gemeinsam beenden lassen.
		$liste   = get_option( 'hhp_sessions_' . sanitize_key( $partner_id ), array() );
		$liste   = is_array( $liste ) ? $liste : array();
		$liste[] = array(
			'key'     => self::session_key( $kennung ),
			'ablauf'  => time() + $dauer,
		);

		update_option( 'hhp_sessions_' . sanitize_key( $partner_id ), self::prune( $liste ), false );

		if ( ! headers_sent() ) {
			setcookie(
				self::COOKIE,
				$kennung,
				array(
					'expires'  => time() + $dauer,
					'path'     => COOKIEPATH ? COOKIEPATH : '/',
					'domain'   => COOKIE_DOMAIN,
					'secure'   => is_ssl(),
					// Anders als beim Kampagnen-Cookie: die Sitzungskennung darf
					// fuer JavaScript nicht lesbar sein.
					'httponly' => true,
					'samesite' => 'Lax',
				)
			);
		}

		$_COOKIE[ self::COOKIE ] = $kennung;
		self::$aktuell           = false;
	}

	/**
	 * Beendet die aktuelle Sitzung.
	 *
	 * @return void
	 */
	public static function logout() {
		if ( isset( $_COOKIE[ self::COOKIE ] ) ) {
			$kennung = self::sanitize_key_value( wp_unslash( $_COOKIE[ self::COOKIE ] ) );

			if ( '' !== $kennung ) {
				delete_transient( self::session_key( $kennung ) );
			}
		}

		if ( ! headers_sent() ) {
			setcookie(
				self::COOKIE,
				'',
				array(
					'expires'  => time() - YEAR_IN_SECONDS,
					'path'     => COOKIEPATH ? COOKIEPATH : '/',
					'domain'   => COOKIE_DOMAIN,
					'secure'   => is_ssl(),
					'httponly' => true,
					'samesite' => 'Lax',
				)
			);
		}

		unset( $_COOKIE[ self::COOKIE ] );
		self::$aktuell = false;
	}

	/**
	 * Beendet alle Sitzungen eines Vermittlers.
	 *
	 * @param string $partner_id Vermittler.
	 *
	 * @return void
	 */
	public static function destroy_sessions( $partner_id ) {
		$option = 'hhp_sessions_' . sanitize_key( $partner_id );
		$liste  = get_option( $option, array() );

		if ( is_array( $liste ) ) {
			foreach ( $liste as $eintrag ) {
				if ( isset( $eintrag['key'] ) ) {
					delete_transient( $eintrag['key'] );
				}
			}
		}

		delete_option( $option );
		self::$aktuell = false;
	}

	/**
	 * Entfernt abgelaufene Eintraege aus der Sitzungsliste.
	 *
	 * @param array $liste Sitzungen.
	 *
	 * @return array
	 */
	protected static function prune( $liste ) {
		$jetzt  = time();
		$sauber = array();

		foreach ( (array) $liste as $eintrag ) {
			if ( isset( $eintrag['ablauf'] ) && $eintrag['ablauf'] > $jetzt ) {
				$sauber[] = $eintrag;
			}
		}

		// Obergrenze, damit die Option nicht unbegrenzt waechst.
		return array_slice( $sauber, -20 );
	}

	/**
	 * Bildet den Schluessel der Sitzung.
	 *
	 * Gespeichert wird nur der Hash: Wer Datenbankzugriff hat, kann daraus
	 * keine gueltige Sitzungskennung ableiten.
	 *
	 * @param string $kennung Zufallskennung aus dem Cookie.
	 *
	 * @return string
	 */
	protected static function session_key( $kennung ) {
		return 'hhp_sess_' . hash( 'sha256', $kennung );
	}

	/**
	 * Liefert den Vermittler der aktuellen Sitzung.
	 *
	 * @return array|null
	 */
	public static function session_partner() {
		if ( ! isset( $_COOKIE[ self::COOKIE ] ) ) {
			return null;
		}

		$kennung = self::sanitize_key_value( wp_unslash( $_COOKIE[ self::COOKIE ] ) );

		if ( '' === $kennung ) {
			return null;
		}

		$sitzung = get_transient( self::session_key( $kennung ) );

		if ( ! is_array( $sitzung ) || empty( $sitzung['partner'] ) ) {
			return null;
		}

		$partner = HHP_Settings::get_partner( $sitzung['partner'] );

		if ( ! $partner || empty( $partner['active'] ) ) {
			return null;
		}

		return $partner;
	}

	/* --------------------------------------------------------------------- *
	 * Zugriffsermittlung
	 * --------------------------------------------------------------------- */

	/**
	 * Ermittelt den Vermittler, dessen Zahlen angezeigt werden duerfen.
	 *
	 * @param string $forced Im Shortcode fest hinterlegter Vermittler.
	 *
	 * @return array|null
	 */
	public static function current_partner( $forced = '' ) {
		if ( false !== self::$aktuell ) {
			return self::$aktuell;
		}

		self::$aktuell = self::resolve( $forced );

		return self::$aktuell;
	}

	/**
	 * Fuehrt die eigentliche Ermittlung durch.
	 *
	 * @param string $forced Im Shortcode fest hinterlegter Vermittler.
	 *
	 * @return array|null
	 */
	protected static function resolve( $forced = '' ) {
		// 1. Bestehende Anmeldung.
		$partner = self::session_partner();

		if ( $partner ) {
			return $partner;
		}

		// 2. Zugangslink, sofern im Backend erlaubt.
		if ( self::token_allowed() ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Zugang erfolgt ueber das Token.
			$token = isset( $_REQUEST['hhp_token'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['hhp_token'] ) ) : '';

			if ( '' !== $token ) {
				if ( ! self::attempts_left() ) {
					return null;
				}

				$partner = HHP_Settings::get_partner_by_token( $token );

				if ( $partner ) {
					return $partner;
				}

				self::register_failure();

				return null;
			}
		}

		// 3. Shop-Verantwortliche duerfen jeden Vermittler einsehen.
		if ( current_user_can( 'manage_woocommerce' ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reine Auswahl der Ansicht.
			$gewuenscht = isset( $_GET['hhp_partner'] ) ? sanitize_key( wp_unslash( $_GET['hhp_partner'] ) ) : '';

			if ( '' !== $gewuenscht ) {
				$partner = HHP_Settings::get_partner( $gewuenscht );

				if ( $partner ) {
					return $partner;
				}
			}

			if ( '' !== $forced ) {
				$partner = HHP_Settings::get_partner( $forced );

				if ( $partner ) {
					return $partner;
				}
			}

			$alle = HHP_Settings::partners( true );

			if ( ! empty( $alle ) ) {
				return $alle[0];
			}
		}

		return null;
	}

	/**
	 * Ist der Zugang ueber den geheimen Link erlaubt?
	 *
	 * @return bool
	 */
	public static function token_allowed() {
		return in_array( HHP_Settings::get( 'access_mode', 'login' ), array( 'token', 'both' ), true );
	}

	/**
	 * Ist der Zugang ueber Benutzername und Passwort erlaubt?
	 *
	 * @return bool
	 */
	public static function login_allowed() {
		return in_array( HHP_Settings::get( 'access_mode', 'login' ), array( 'login', 'both' ), true );
	}

	/**
	 * Ist gerade ein Vermittler angemeldet?
	 *
	 * @return bool
	 */
	public static function is_logged_in() {
		return null !== self::session_partner();
	}

	/* --------------------------------------------------------------------- *
	 * Hilfsfunktionen
	 * --------------------------------------------------------------------- */

	/**
	 * Sucht einen Vermittler anhand des Benutzernamens.
	 *
	 * @param string $benutzer Benutzername.
	 *
	 * @return array|null
	 */
	public static function find_by_username( $benutzer ) {
		$benutzer = self::sanitize_username( $benutzer );

		if ( '' === $benutzer ) {
			return null;
		}

		foreach ( HHP_Settings::partners( true ) as $partner ) {
			if ( '' !== $partner['username'] && hash_equals( $partner['username'], $benutzer ) ) {
				return $partner;
			}
		}

		return null;
	}

	/**
	 * Bereinigt einen Benutzernamen.
	 *
	 * @param string $benutzer Eingabe.
	 *
	 * @return string
	 */
	public static function sanitize_username( $benutzer ) {
		$benutzer = strtolower( trim( (string) $benutzer ) );
		$benutzer = preg_replace( '/[^a-z0-9._\-]/', '', $benutzer );

		return substr( (string) $benutzer, 0, 60 );
	}

	/**
	 * Bereinigt eine Sitzungskennung.
	 *
	 * @param string $wert Eingabe.
	 *
	 * @return string
	 */
	protected static function sanitize_key_value( $wert ) {
		$wert = trim( (string) $wert );

		return preg_match( '/^[a-f0-9]{64}$/', $wert ) ? $wert : '';
	}

	/**
	 * Sind noch Versuche von dieser Adresse zulaessig?
	 *
	 * @return bool
	 */
	public static function attempts_left() {
		return (int) get_transient( self::failure_key() ) < self::MAX_VERSUCHE;
	}

	/**
	 * Vermerkt einen Fehlversuch.
	 *
	 * @return void
	 */
	protected static function register_failure() {
		$schluessel = self::failure_key();
		set_transient( $schluessel, (int) get_transient( $schluessel ) + 1, self::SPERRE );
	}

	/**
	 * Setzt die Versuchszaehlung zurueck.
	 *
	 * @return void
	 */
	protected static function clear_failures() {
		delete_transient( self::failure_key() );
	}

	/**
	 * Bildet den Schluessel der Versuchszaehlung.
	 *
	 * @return string
	 */
	protected static function failure_key() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unbekannt';

		return 'hhp_try_' . md5( $ip );
	}

	/**
	 * Uebersetzt einen Fehlerschluessel in einen Meldungstext.
	 *
	 * @param string $code Schluessel.
	 *
	 * @return string
	 */
	public static function message( $code ) {
		switch ( $code ) {
			case 'zugangsdaten':
				return __( 'Benutzername oder Passwort stimmt nicht.', 'hairhelp-partner' );
			case 'gesperrt':
				return __( 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.', 'hairhelp-partner' );
			case 'abgelaufen':
				return __( 'Das Formular ist abgelaufen. Bitte erneut absenden.', 'hairhelp-partner' );
			case 'altfalsch':
				return __( 'Das bisherige Passwort stimmt nicht.', 'hairhelp-partner' );
			case 'ungleich':
				return __( 'Die beiden neuen Passwörter stimmen nicht überein.', 'hairhelp-partner' );
			case 'zukurz':
				return __( 'Das neue Passwort muss mindestens 10 Zeichen lang sein.', 'hairhelp-partner' );
			case 'kein_zugang':
				return __( 'Dieser Zugangslink ist ungültig oder wurde zurückgezogen.', 'hairhelp-partner' );
			default:
				return '';
		}
	}

	/**
	 * Uebersetzt einen Hinweisschluessel in einen Meldungstext.
	 *
	 * @param string $code Schluessel.
	 *
	 * @return string
	 */
	public static function notice( $code ) {
		switch ( $code ) {
			case 'abgemeldet':
				return __( 'Du wurdest abgemeldet.', 'hairhelp-partner' );
			case 'passwort':
				return __( 'Das Passwort wurde geändert.', 'hairhelp-partner' );
			default:
				return '';
		}
	}
}
