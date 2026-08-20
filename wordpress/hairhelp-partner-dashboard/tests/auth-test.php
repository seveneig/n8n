<?php
/**
 * Pruefung der Anmeldelogik ohne WordPress-Installation.
 *
 * Aufruf:  php tests/auth-test.php
 *
 * @package HairHelp_Partner_Dashboard
 */

require __DIR__ . '/wp-stubs.php';

$ok   = 0;
$fehl = 0;

/**
 * Kleine Pruefhilfe.
 *
 * @param string $name Bezeichnung.
 * @param mixed  $ist  Ergebnis.
 * @param mixed  $soll Erwartung.
 *
 * @return void
 */
function pruefe( $name, $ist, $soll ) {
	global $ok, $fehl;

	$gleich = $ist === $soll;
	$gleich ? $ok++ : $fehl++;

	printf( "  %-58s %s\n", $name, $gleich ? 'OK' : sprintf( 'FEHLER (ist %s)', var_export( $ist, true ) ) );
}

HHP_Settings::install_defaults();

echo "Benutzernamen\n";
pruefe( 'Grossbuchstaben werden vereinheitlicht', HHP_Auth::sanitize_username( 'LoopX13' ), 'loopx13' );
pruefe( 'Leerzeichen und Sonderzeichen entfallen', HHP_Auth::sanitize_username( ' loop x13! ' ), 'loopx13' );
pruefe( 'Punkt, Strich und Unterstrich bleiben', HHP_Auth::sanitize_username( 'loop.x-13_a' ), 'loop.x-13_a' );
pruefe( 'Länge wird begrenzt', strlen( HHP_Auth::sanitize_username( str_repeat( 'a', 90 ) ) ), 60 );

echo "\nPasswortregel\n";
pruefe( 'zu kurz wird abgelehnt', HHP_Auth::password_acceptable( 'kurz123' ), false );
pruefe( 'neun Zeichen reichen nicht', HHP_Auth::password_acceptable( '123456789' ), false );
pruefe( 'zehn Zeichen genügen', HHP_Auth::password_acceptable( '1234567890' ), true );
pruefe( 'Umlaute zählen als ein Zeichen', HHP_Auth::password_acceptable( 'äöüäöüäöüä' ), true );

echo "\nPasswort setzen und prüfen\n";
pruefe( 'ohne Passwort kein Hash', HHP_Settings::get_partner( 'loopx13' )['password_hash'], '' );
HHP_Settings::set_password( 'loopx13', 'GeheimesPasswort2026' );
$partner = HHP_Settings::get_partner( 'loopx13' );
pruefe( 'Hash wurde gespeichert', 20 < strlen( $partner['password_hash'] ), true );
pruefe( 'Klartext steht nicht im Datensatz', false === strpos( $partner['password_hash'], 'GeheimesPasswort2026' ), true );
pruefe( 'richtiges Passwort passt', wp_check_password( 'GeheimesPasswort2026', $partner['password_hash'] ), true );
pruefe( 'falsches Passwort passt nicht', wp_check_password( 'GeheimesPasswort2027', $partner['password_hash'] ), false );
pruefe( 'leeres Passwort passt nicht', wp_check_password( '', $partner['password_hash'] ), false );
pruefe( 'Passwort für unbekannten Vermittler schlägt fehl', HHP_Settings::set_password( 'gibtesnicht', 'IrgendeinPasswort' ), false );

echo "\nAnmeldung prüfen\n";
pruefe( 'richtige Zugangsdaten werden angenommen', HHP_Auth::verify_credentials( 'loopx13', 'GeheimesPasswort2026' )['id'], 'loopx13' );
pruefe( 'falsches Passwort wird abgewiesen', HHP_Auth::verify_credentials( 'loopx13', 'falsch12345' ), null );
pruefe( 'unbekannter Benutzer wird abgewiesen', HHP_Auth::verify_credentials( 'fremd', 'GeheimesPasswort2026' ), null );
pruefe( 'leere Eingaben werden abgewiesen', HHP_Auth::verify_credentials( '', '' ), null );

// Der wichtigste Fall: Solange kein Passwort gesetzt ist, darf niemand hinein.
$ohne = HHP_Settings::partners();
$ohne[0]['password_hash'] = '';
HHP_Settings::save_partners( $ohne );
pruefe( 'ohne gesetztes Passwort kein Zugang', HHP_Auth::verify_credentials( 'loopx13', '' ), null );
pruefe( 'ohne gesetztes Passwort auch mit Rateversuch kein Zugang', HHP_Auth::verify_credentials( 'loopx13', 'passwort123' ), null );
pruefe( 'Ersatz-Hash umgeht den MD5-Pfad von WordPress', strlen( HHP_Auth::ERSATZ_HASH ) > 32, true );
HHP_Settings::set_password( 'loopx13', 'GeheimesPasswort2026' );

echo "\nBenutzer finden\n";
pruefe( 'Benutzername findet den Vermittler', HHP_Auth::find_by_username( 'loopx13' )['id'], 'loopx13' );
pruefe( 'Gross-/Kleinschreibung egal', HHP_Auth::find_by_username( 'LOOPX13' )['id'], 'loopx13' );
pruefe( 'unbekannter Benutzer ergibt nichts', HHP_Auth::find_by_username( 'fremd' ), null );
pruefe( 'leerer Benutzer ergibt nichts', HHP_Auth::find_by_username( '' ), null );

$alle = HHP_Settings::partners();
HHP_Settings::save_partners( array( array_merge( $alle[0], array( 'active' => 0 ) ) ) );
pruefe( 'inaktiver Vermittler kann sich nicht anmelden', HHP_Auth::find_by_username( 'loopx13' ), null );
HHP_Settings::save_partners( array( array_merge( $alle[0], array( 'active' => 1 ) ) ) );

echo "\nPasswort bleibt beim Speichern erhalten\n";
$vorher = HHP_Settings::get_partner( 'loopx13' )['password_hash'];
HHP_Settings::save_partners( HHP_Settings::partners() );
pruefe( 'Hash übersteht ein erneutes Speichern', HHP_Settings::get_partner( 'loopx13' )['password_hash'], $vorher );

echo "\nZugangsarten\n";
HHP_Settings::save( array( 'access_mode' => 'login' ) );
pruefe( 'Modus Login: Anmeldung erlaubt', HHP_Auth::login_allowed(), true );
pruefe( 'Modus Login: Zugangslink gesperrt', HHP_Auth::token_allowed(), false );

HHP_Settings::save( array( 'access_mode' => 'token' ) );
pruefe( 'Modus Link: Anmeldung gesperrt', HHP_Auth::login_allowed(), false );
pruefe( 'Modus Link: Zugangslink erlaubt', HHP_Auth::token_allowed(), true );

HHP_Settings::save( array( 'access_mode' => 'both' ) );
pruefe( 'Modus Beides: Anmeldung erlaubt', HHP_Auth::login_allowed(), true );
pruefe( 'Modus Beides: Zugangslink erlaubt', HHP_Auth::token_allowed(), true );

echo "\nVersuchszählung\n";
delete_transient( 'hhp_try_' . md5( 'unbekannt' ) );
pruefe( 'zu Beginn sind Versuche offen', HHP_Auth::attempts_left(), true );
set_transient( 'hhp_try_' . md5( 'unbekannt' ), 8, 900 );
pruefe( 'nach acht Fehlversuchen gesperrt', HHP_Auth::attempts_left(), false );
delete_transient( 'hhp_try_' . md5( 'unbekannt' ) );

echo "\nSitzungen\n";
HHP_Auth::start_session( 'loopx13', false );
pruefe( 'Sitzung erkennt den Vermittler', HHP_Auth::session_partner()['id'], 'loopx13' );
pruefe( 'Sitzungskennung ist 64 Zeichen lang', strlen( $_COOKIE[ HHP_Auth::COOKIE ] ), 64 );
$kennung = $_COOKIE[ HHP_Auth::COOKIE ];
pruefe( 'Kennung steht nicht im Klartext in der Datenbank', isset( $GLOBALS['transients'][ 'hhp_sess_' . $kennung ] ), false );
HHP_Auth::destroy_sessions( 'loopx13' );
pruefe( 'nach dem Beenden keine Sitzung mehr', HHP_Auth::session_partner(), null );

HHP_Auth::start_session( 'loopx13', false );
$_COOKIE[ HHP_Auth::COOKIE ] = str_repeat( 'f', 64 );
pruefe( 'fremde Kennung ergibt keine Sitzung', HHP_Auth::session_partner(), null );
$_COOKIE[ HHP_Auth::COOKIE ] = 'unfug';
pruefe( 'ungültige Kennung ergibt keine Sitzung', HHP_Auth::session_partner(), null );

printf( "\n=== %d bestanden, %d fehlgeschlagen ===\n", $ok, $fehl );

exit( $fehl > 0 ? 1 : 0 );
