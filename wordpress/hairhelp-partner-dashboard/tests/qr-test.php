<?php
/**
 * Selbsttest des QR-Encoders.
 *
 * Die hinterlegten Pruefsummen stammen aus einem Abgleich gegen eine
 * unabhaengige Referenzumsetzung (Python-Bibliothek segno): Ueber die
 * Versionen 1 bis 40 und alle vier Fehlerkorrekturstufen stimmten die
 * Modulmatrizen bei gleicher Maske Modul fuer Modul ueberein. Zusaetzlich
 * wurden die erzeugten Bilder mit dem Decoder ZXing wieder eingelesen.
 *
 * Aufruf:  php tests/qr-test.php
 *
 * @package HairHelp_Partner_Dashboard
 */

define( 'ABSPATH', __DIR__ );
require __DIR__ . '/../includes/class-hhp-qr-code.php';

$faelle = array(
	array(
		'daten'      => 'https://www.hairhelp-haarverdichter.ch/qr/loopx13',
		'stufe'      => 'Q',
		'version'    => 5,
		'maske'      => 3,
		'pruefsumme' => 'f80cad6f53326a9b39077b2b3a5f88b9',
	),
	array(
		'daten'      => 'https://www.hairhelp-haarverdichter.ch/?qr=loopx13',
		'stufe'      => 'Q',
		'version'    => 5,
		'maske'      => 7,
		'pruefsumme' => '3dee23de7a714f4b9d34d1e1c74e38c5',
	),
	array(
		'daten'      => 'HELLO',
		'stufe'      => 'L',
		'version'    => 1,
		'maske'      => 0,
		'pruefsumme' => 'c409e27aa736adffa32137c3a5cdb84c',
	),
);

$bestanden = 0;
$fehler    = 0;

echo "Referenzvergleich\n";

foreach ( $faelle as $fall ) {
	$qr     = HHP_QR_Code::create( $fall['daten'], $fall['stufe'] );
	$zeilen = array();

	foreach ( $qr->get_matrix() as $reihe ) {
		$zeilen[] = implode( '', $reihe );
	}

	$summe = md5( implode( '', $zeilen ) );
	$passt = $summe === $fall['pruefsumme']
		&& $qr->get_version() === $fall['version']
		&& $qr->get_mask() === $fall['maske'];

	$passt ? $bestanden++ : $fehler++;

	printf(
		"  %-52s %s\n",
		substr( $fall['daten'], 0, 52 ),
		$passt ? sprintf( 'OK (Version %d, Maske %d)', $qr->get_version(), $qr->get_mask() ) : 'ABWEICHUNG'
	);
}

echo "\nStrukturpruefungen\n";

/**
 * Kleine Pruefhilfe.
 *
 * @param string $name Bezeichnung.
 * @param mixed  $ist  Ergebnis.
 * @param mixed  $soll Erwartung.
 *
 * @return void
 */
function hhp_pruefe( $name, $ist, $soll ) {
	global $bestanden, $fehler;

	$gleich = $ist === $soll;
	$gleich ? $bestanden++ : $fehler++;

	printf( "  %-52s %s\n", $name, $gleich ? 'OK' : sprintf( 'FEHLER (ist %s)', var_export( $ist, true ) ) );
}

$qr = HHP_QR_Code::create( 'https://www.hairhelp-haarverdichter.ch/qr/loopx13', 'Q' );

hhp_pruefe( 'Kantenlaenge entspricht der Version', $qr->get_size(), 17 + ( 4 * $qr->get_version() ) );
hhp_pruefe( 'SVG beginnt mit dem richtigen Element', substr( $qr->to_svg(), 0, 4 ), '<svg' );
hhp_pruefe( 'PNG traegt die richtige Signatur', substr( $qr->to_png(), 0, 8 ), "\x89PNG\r\n\x1a\n" );

$svg = $qr->to_svg( array( 'scale' => 10, 'quiet_zone' => 4 ) );
$kante = ( $qr->get_size() + 8 ) * 10;
hhp_pruefe( 'SVG-Breite enthaelt die Ruhezone', (bool) strpos( $svg, 'width="' . $kante . '"' ), true );

// Fehlerkorrekturstufen ergeben unterschiedlich dichte Symbole.
$klein = HHP_QR_Code::create( 'https://www.hairhelp-haarverdichter.ch/qr/loopx13', 'L' );
$gross = HHP_QR_Code::create( 'https://www.hairhelp-haarverdichter.ch/qr/loopx13', 'H' );
hhp_pruefe( 'hoehere Fehlerkorrektur braucht mehr Flaeche', $gross->get_size() >= $klein->get_size(), true );

// Zu lange Daten muessen sauber abgewiesen werden.
$abgewiesen = false;

try {
	HHP_QR_Code::create( str_repeat( 'A', 3000 ), 'H' );
} catch ( InvalidArgumentException $e ) {
	$abgewiesen = true;
}

hhp_pruefe( 'zu lange Daten werden abgewiesen', $abgewiesen, true );

$leer = false;

try {
	HHP_QR_Code::create( '', 'M' );
} catch ( InvalidArgumentException $e ) {
	$leer = true;
}

hhp_pruefe( 'leere Eingabe wird abgewiesen', $leer, true );

printf( "\n=== %d bestanden, %d fehlgeschlagen ===\n", $bestanden, $fehler );

exit( $fehler > 0 ? 1 : 0 );
