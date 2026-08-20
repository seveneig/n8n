<?php
/**
 * Logikpruefung der Kernfunktionen ohne WordPress-Installation.
 *
 * Aufruf:  php tests/logic-test.php
 * Rueckgabewert 0 bedeutet, dass alle Pruefungen bestanden wurden.
 *
 * @package HairHelp_Partner_Dashboard
 */

require __DIR__ . '/wp-stubs.php';

$ok = 0; $fehl = 0;
function pruefe( $name, $ist, $soll ) {
    global $ok, $fehl;
    $gleich = $ist === $soll;
    $gleich ? $ok++ : $fehl++;
    printf( "  %-58s %s\n", $name, $gleich ? 'OK' : sprintf( 'FEHLER (ist %s, soll %s)', var_export( $ist, true ), var_export( $soll, true ) ) );
}

echo "Codebereinigung\n";
pruefe( 'Grossbuchstaben werden vereinheitlicht', HHP_Tracker::sanitize_code( 'LoopX13' ), 'loopx13' );
pruefe( 'Leerzeichen und Sonderzeichen entfallen', HHP_Tracker::sanitize_code( ' loop x13! ' ), 'loopx13' );
pruefe( 'Skriptversuch wird entschaerft', HHP_Tracker::sanitize_code( '<script>alert(1)</script>' ), 'scriptalert1script' );
pruefe( 'Laenge wird begrenzt', strlen( HHP_Tracker::sanitize_code( str_repeat( 'a', 80 ) ) ), 40 );
pruefe( 'Bindestrich bleibt erhalten', HHP_Tracker::sanitize_code( 'sommer-2026' ), 'sommer-2026' );

echo "\nStandardeinrichtung\n";
HHP_Settings::install_defaults();
$partner = HHP_Settings::get_partner( 'loopx13' );
pruefe( 'Vermittler loopx13 ist angelegt', is_array( $partner ), true );
pruefe( 'Token hat volle Laenge', strlen( $partner['token'] ), 48 );
pruefe( 'Cookie-Laufzeit betraegt 30 Tage', HHP_Settings::get( 'cookie_days' ), 30 );
pruefe( 'Standardprovision', $partner['commission'], 10.0 );

echo "\nZuordnung ueber Token\n";
pruefe( 'gueltiges Token findet den Vermittler', HHP_Settings::get_partner_by_token( $partner['token'] )['id'], 'loopx13' );
pruefe( 'falsches Token wird abgewiesen', HHP_Settings::get_partner_by_token( str_repeat( 'a', 48 ) ), null );
pruefe( 'leeres Token wird abgewiesen', HHP_Settings::get_partner_by_token( '' ), null );
pruefe( 'zu kurzes Token wird abgewiesen', HHP_Settings::get_partner_by_token( 'abc' ), null );
pruefe( 'Token mit Fremdzeichen wird abgewiesen', HHP_Settings::get_partner_by_token( $partner['token'] . '<x>' ), null );

echo "\nZuordnung ueber Code und Gutschein\n";
pruefe( 'QR-Code findet Vermittler', HHP_Settings::get_partner_by_code( 'loopx13' )['id'], 'loopx13' );
pruefe( 'Gross-/Kleinschreibung egal', HHP_Settings::get_partner_by_coupon( 'LOOPX13' )['id'], 'loopx13' );
pruefe( 'unbekannter Code ergibt nichts', HHP_Settings::get_partner_by_code( 'fremd' ), null );

echo "\nHerkunft einer Bestellung\n";
$nur_qr = new WC_Order( 1, array(), array( '_hhp_ref' => 'loopx13' ) );
pruefe( 'nur QR-Code', HHP_Attribution::resolve( $nur_qr )['source'], 'qr' );

$nur_gutschein = new WC_Order( 2, array( 'loopx13' ) );
pruefe( 'nur Gutschein', HHP_Attribution::resolve( $nur_gutschein )['source'], 'coupon' );

$beides = new WC_Order( 3, array( 'LOOPX13' ), array( '_hhp_ref' => 'loopx13' ) );
pruefe( 'QR-Code und Gutschein', HHP_Attribution::resolve( $beides )['source'], 'qr+coupon' );
pruefe( 'Doppelquelle zaehlt einem Vermittler', HHP_Attribution::resolve( $beides )['partner'], 'loopx13' );

$fremd = new WC_Order( 4, array( 'sommeraktion' ), array( '_hhp_ref' => 'unbekannt' ) );
pruefe( 'fremde Codes ergeben keine Zuordnung', HHP_Attribution::resolve( $fremd ), null );

$gemischt = new WC_Order( 5, array( 'rabatt10', 'loopx13' ) );
pruefe( 'Gutschein wird neben anderen erkannt', HHP_Attribution::resolve( $gemischt )['source'], 'coupon' );

echo "\nZwei Vermittler nebeneinander\n";
HHP_Settings::save_partners( array(
    array( 'id'=>'loopx13', 'name'=>'Loop X', 'codes'=>array('loopx13'), 'coupons'=>array('loopx13'), 'commission'=>10, 'active'=>1, 'token'=>str_repeat('b',48) ),
    array( 'id'=>'studio7', 'name'=>'Studio 7', 'codes'=>array('studio7'), 'coupons'=>array('studio7'), 'commission'=>15, 'active'=>1, 'token'=>str_repeat('c',48) ),
) );
$konflikt = new WC_Order( 6, array( 'studio7' ), array( '_hhp_ref' => 'loopx13' ) );
$aufloesung = HHP_Attribution::resolve( $konflikt );
pruefe( 'bei Konflikt gewinnt der Gutschein', $aufloesung['partner'], 'studio7' );
pruefe( 'Herkunft wird als Gutschein gefuehrt', $aufloesung['source'], 'coupon' );

$inaktiv = HHP_Settings::partners();
HHP_Settings::save_partners( array( array_merge( $inaktiv[0], array( 'active' => 0 ) ), $inaktiv[1] ) );
pruefe( 'inaktiver Vermittler wird nicht zugeordnet', HHP_Settings::get_partner_by_code( 'loopx13' ), null );
pruefe( 'inaktives Token greift nicht', HHP_Settings::get_partner_by_token( str_repeat('b',48) ), null );

echo "\nZeitraeume\n";
$_GET = array( 'hhp_zeitraum' => '7' );
list( $von, $bis, $r ) = HHP_Dashboard::resolve_range();
pruefe( '7-Tage-Zeitraum umfasst 7 Tage', (int) round( ( strtotime($bis) - strtotime($von) ) / 86400 ) + 1, 7 );
$_GET = array( 'hhp_zeitraum' => 'eigen', 'hhp_von' => '2026-03-31', 'hhp_bis' => '2026-03-01' );
list( $von, $bis, $r ) = HHP_Dashboard::resolve_range();
pruefe( 'vertauschte Daten werden getauscht', $von . '/' . $bis, '2026-03-01/2026-03-31' );
$_GET = array( 'hhp_zeitraum' => 'eigen', 'hhp_von' => 'kaputt', 'hhp_bis' => '' );
list( $von, $bis, $r ) = HHP_Dashboard::resolve_range();
pruefe( 'ungueltiges Datum faellt zurueck', (bool) preg_match( '/^\d{4}-\d{2}-\d{2}$/', $von ), true );
$_GET = array( 'hhp_zeitraum' => 'boese<script>' );
list( $von, $bis, $r ) = HHP_Dashboard::resolve_range();
pruefe( 'unbekannter Zeitraum faellt auf 30 Tage', $r, '30' );

echo "\nQR-Adresse\n";
$GLOBALS['optionen']['permalink_structure'] = '/%postname%/';
pruefe( 'kurze Adresse', HHP_Tracker::build_qr_url( 'loopx13' ), 'https://www.hairhelp-haarverdichter.ch/qr/loopx13' );
pruefe( 'leerer Code ergibt keine Adresse', HHP_Tracker::build_qr_url( '' ), '' );

echo "\nErscheinungsbild je Vermittler\n";

// Ein frueherer Abschnitt hat die Vermittlerliste ersetzt; hier wird der
// Auslieferungszustand wiederhergestellt, um die Vorbelegung zu pruefen.
unset( $GLOBALS['optionen']['hhp_partners'] );
HHP_Settings::install_defaults();

$loop = HHP_Settings::get_partner( 'loopx13' );
pruefe( 'LoopX13 nutzt das dunkle Schema', HHP_Dashboard::theme_class( $loop ), 'hhp-thema-dunkel' );
pruefe( 'ohne Vermittler bleibt es hell', HHP_Dashboard::theme_class( null ), '' );

$marke = HHP_Dashboard::brand( $loop );
pruefe( 'Leitfarbe kommt vom Vermittler', $marke['primary'], '#00e5ff' );
pruefe( 'Zweitfarbe kommt vom Vermittler', $marke['accent'], '#ff007a' );
pruefe( 'Grund kommt vom Vermittler', $marke['grund'], '#030712' );

$shop = HHP_Dashboard::brand( null );
pruefe( 'ohne Vermittler gelten die Shopfarben', $shop['primary'], '#a39772' );

// Ein Vermittler ohne eigene Werte faellt vollstaendig auf den Shop zurueck.
$leer = HHP_Settings::normalize_partner( array( 'id' => 'leer' ) );
pruefe( 'leere Marke erbt die Shopfarbe', HHP_Dashboard::brand( $leer )['primary'], '#a39772' );
pruefe( 'leere Marke bleibt hell', HHP_Dashboard::brand( $leer )['thema'], 'hell' );

echo "\nKontrastsicherung\n";
$weiss = array( 255, 255, 255 );
$schwarz = array( 0, 0, 0 );
pruefe( 'Schwarz auf Weiss ergibt 21 zu 1', round( HHP_Dashboard::contrast( $schwarz, $weiss ), 1 ), 21.0 );

/**
 * Kontrast zweier Hexwerte.
 *
 * @param string $a Farbe.
 * @param string $b Farbe.
 *
 * @return float
 */
function kontrast( $a, $b ) {
	$zu = function ( $hex ) {
		$hex = ltrim( $hex, '#' );
		return array( hexdec( substr( $hex, 0, 2 ) ), hexdec( substr( $hex, 2, 2 ) ), hexdec( substr( $hex, 4, 2 ) ) );
	};
	return HHP_Dashboard::contrast( $zu( $a ), $zu( $b ) );
}

pruefe( 'Cyan auf Weiss ist ungeprüft unlesbar', kontrast( '#00e5ff', '#ffffff' ) < 2.0, true );
$fix = HHP_Dashboard::readable( '#00e5ff', '#ffffff' );
pruefe( 'nach der Korrektur lesbar auf Weiss', kontrast( $fix, '#ffffff' ) >= 4.5, true );

$fix2 = HHP_Dashboard::readable( '#00e5ff', '#030712' );
pruefe( 'auf dunklem Grund bleibt Cyan unverändert', $fix2, '#00e5ff' );

$gold = HHP_Dashboard::readable( '#a39772', '#ffffff' );
pruefe( 'Markengold wird für Text nachgedunkelt', kontrast( $gold, '#ffffff' ) >= 4.5, true );

$dunkelblau = HHP_Dashboard::readable( '#0a1832', '#030712' );
pruefe( 'zu dunkle Farbe wird auf dunklem Grund aufgehellt', kontrast( $dunkelblau, '#030712' ) >= 4.5, true );

pruefe( 'unsinniger Farbwert wird unverändert zurückgegeben', HHP_Dashboard::readable( 'kaputt', '#ffffff' ), 'kaputt' );

echo "\nAktualisierung eines bestehenden Datensatzes\n";

// Zustand nachstellen, wie ihn die erste Fassung hinterlassen hat:
// ohne Benutzername, ohne Passwort, ohne Markenwerte.
$GLOBALS['optionen']['hhp_partners'] = array(
	array(
		'id'         => 'loopx13',
		'name'       => 'Loop X',
		'codes'      => array( 'loopx13' ),
		'coupons'    => array( 'loopx13' ),
		'commission' => 10.0,
		'token'      => str_repeat( 'd', 48 ),
		'active'     => 1,
	),
);
unset( $GLOBALS['optionen']['hhp_version'] );

$vorher = HHP_Settings::get_partner( 'loopx13' );
pruefe( 'alter Datensatz hat keinen Benutzernamen', $vorher['username'], '' );
pruefe( 'alter Datensatz hat kein Erscheinungsbild', $vorher['brand_theme'], 'shop' );

HHP_Settings::maybe_upgrade();

$nachher = HHP_Settings::get_partner( 'loopx13' );
pruefe( 'Benutzername wird nachgetragen', $nachher['username'], 'loopx13' );
pruefe( 'LoopX13 erhält sein Erscheinungsbild', $nachher['brand_theme'], 'dunkel' );
pruefe( 'Leitfarbe wird nachgetragen', $nachher['brand_primary'], '#00e5ff' );
pruefe( 'Token bleibt unverändert', $nachher['token'], str_repeat( 'd', 48 ) );
pruefe( 'Provision bleibt unverändert', $nachher['commission'], 10.0 );
pruefe( 'Version wird vermerkt', get_option( 'hhp_version' ), HHP_VERSION );

// Ein zweiter Durchlauf darf nichts mehr anfassen.
$GLOBALS['optionen']['hhp_partners'][0]['brand_primary'] = '#123456';
HHP_Settings::maybe_upgrade();
pruefe( 'zweiter Durchlauf ändert nichts', HHP_Settings::get_partner( 'loopx13' )['brand_primary'], '#123456' );

// Eine eigene Farbwahl darf nicht überschrieben werden.
$GLOBALS['optionen']['hhp_partners'][0]['brand_theme']   = 'hell';
$GLOBALS['optionen']['hhp_partners'][0]['brand_primary'] = '#abcdef';
unset( $GLOBALS['optionen']['hhp_version'] );
HHP_Settings::maybe_upgrade();
pruefe( 'eigene Farbwahl bleibt erhalten', HHP_Settings::get_partner( 'loopx13' )['brand_primary'], '#abcdef' );

printf( "\n=== %d bestanden, %d fehlgeschlagen ===\n", $ok, $fehl );
exit( $fehl > 0 ? 1 : 0 );
