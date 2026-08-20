<?php
/**
 * Eigenstaendiger QR-Code-Encoder nach ISO/IEC 18004.
 *
 * Bewusst ohne externe Bibliothek und ohne Aufruf fremder Dienste: Die QR-Codes
 * werden lokal erzeugt, damit weder eine Abhaengigkeit installiert noch eine
 * Kampagnen-URL an einen Drittanbieter uebermittelt werden muss.
 *
 * Kodiert wird im Byte-Modus (UTF-8), der fuer URLs universell funktioniert.
 * Ausgabe als SVG (verlustfrei skalierbar, ideal fuer den Druck) oder PNG.
 *
 * @package HairHelp_Partner_Dashboard
 */

defined( 'ABSPATH' ) || exit;

/**
 * Erzeugt QR-Code-Matrizen und rendert sie als SVG oder PNG.
 */
class HHP_QR_Code {

	/**
	 * Bitmuster der Fehlerkorrekturstufen fuer die Formatinformation.
	 *
	 * @var array<string,int>
	 */
	const LEVEL_BITS = array(
		'L' => 1,
		'M' => 0,
		'Q' => 3,
		'H' => 2,
	);

	/**
	 * Zu kodierender Text.
	 *
	 * @var string
	 */
	protected $data;

	/**
	 * Fehlerkorrekturstufe (L, M, Q oder H).
	 *
	 * @var string
	 */
	protected $level;

	/**
	 * Symbolversion 1-40.
	 *
	 * @var int
	 */
	protected $version;

	/**
	 * Kantenlaenge in Modulen.
	 *
	 * @var int
	 */
	protected $size;

	/**
	 * Modulmatrix, [zeile][spalte] => 0|1.
	 *
	 * @var array<int,array<int,int>>
	 */
	protected $matrix = array();

	/**
	 * Markiert Funktionsmuster, die nicht maskiert werden duerfen.
	 *
	 * @var array<int,array<int,bool>>
	 */
	protected $reserved = array();

	/**
	 * Gewaehlte Maske 0-7.
	 *
	 * @var int
	 */
	protected $mask = 0;

	/**
	 * Referenztabellen aus qr-tables.php.
	 *
	 * @var array|null
	 */
	protected static $tables = null;

	/**
	 * Exponentialtabelle von GF(256).
	 *
	 * @var array<int,int>
	 */
	protected static $gf_exp = array();

	/**
	 * Logarithmentabelle von GF(256).
	 *
	 * @var array<int,int>
	 */
	protected static $gf_log = array();

	/**
	 * Konstruktor. Nutze bevorzugt HHP_QR_Code::create().
	 *
	 * @param string $data  Zu kodierender Text.
	 * @param string $level Fehlerkorrekturstufe L, M, Q oder H.
	 * @param int    $min_version Kleinste zu verwendende Version.
	 *
	 * @throws InvalidArgumentException Wenn die Daten nicht kodierbar sind.
	 */
	public function __construct( $data, $level = 'M', $min_version = 1 ) {
		$level = strtoupper( (string) $level );

		if ( ! isset( self::LEVEL_BITS[ $level ] ) ) {
			throw new InvalidArgumentException( 'Unbekannte Fehlerkorrekturstufe: ' . $level );
		}

		if ( '' === (string) $data ) {
			throw new InvalidArgumentException( 'Es wurden keine Daten zum Kodieren uebergeben.' );
		}

		$this->data    = (string) $data;
		$this->level   = $level;
		$this->version = $this->pick_version( max( 1, (int) $min_version ) );
		$this->size    = 17 + ( 4 * $this->version );

		$this->build();
	}

	/**
	 * Bequemer Einstiegspunkt.
	 *
	 * @param string $data        Zu kodierender Text.
	 * @param string $level       Fehlerkorrekturstufe.
	 * @param int    $min_version Kleinste zu verwendende Version.
	 *
	 * @return HHP_QR_Code
	 */
	public static function create( $data, $level = 'M', $min_version = 1 ) {
		return new self( $data, $level, $min_version );
	}

	/**
	 * Liefert die fertige Modulmatrix.
	 *
	 * @return array<int,array<int,int>>
	 */
	public function get_matrix() {
		return $this->matrix;
	}

	/**
	 * Liefert die verwendete Symbolversion.
	 *
	 * @return int
	 */
	public function get_version() {
		return $this->version;
	}

	/**
	 * Liefert die gewaehlte Maske.
	 *
	 * @return int
	 */
	public function get_mask() {
		return $this->mask;
	}

	/**
	 * Liefert die Kantenlaenge in Modulen.
	 *
	 * @return int
	 */
	public function get_size() {
		return $this->size;
	}

	/* --------------------------------------------------------------------- *
	 * Ausgabe
	 * --------------------------------------------------------------------- */

	/**
	 * Rendert den Code als SVG.
	 *
	 * @param array $args {
	 *     Optionale Darstellungsparameter.
	 *
	 *     @type int    $scale      Kantenlaenge eines Moduls in Pixeln. Standard 8.
	 *     @type int    $quiet_zone Ruhezone in Modulen. Standard 4 (Normvorgabe).
	 *     @type string $dark       Farbe der dunklen Module.
	 *     @type string $light      Hintergrundfarbe, 'none' fuer transparent.
	 *     @type string $title      Barrierefreier Titel des Bildes.
	 * }
	 *
	 * @return string SVG-Markup.
	 */
	public function to_svg( $args = array() ) {
		$args = array_merge(
			array(
				'scale'      => 8,
				'quiet_zone' => 4,
				'dark'       => '#000000',
				'light'      => '#ffffff',
				'title'      => '',
			),
			$args
		);

		$scale  = max( 1, (int) $args['scale'] );
		$quiet  = max( 0, (int) $args['quiet_zone'] );
		$blocks = $this->size + ( 2 * $quiet );
		$px     = $blocks * $scale;

		// Zusammenhaengende dunkle Module einer Zeile werden zu einem Pfadsegment
		// zusammengefasst; das haelt die Datei klein und druckt sauber.
		$path = '';

		for ( $row = 0; $row < $this->size; $row++ ) {
			$col = 0;

			while ( $col < $this->size ) {
				if ( 1 !== $this->matrix[ $row ][ $col ] ) {
					$col++;
					continue;
				}

				$run = 0;

				while ( ( $col + $run ) < $this->size && 1 === $this->matrix[ $row ][ $col + $run ] ) {
					$run++;
				}

				$path .= sprintf( 'M%d %dh%dv%dh-%dz', $col + $quiet, $row + $quiet, $run, 1, $run );
				$col   += $run;
			}
		}

		$title = '' !== $args['title'] ? '<title>' . htmlspecialchars( $args['title'], ENT_QUOTES, 'UTF-8' ) . '</title>' : '';
		$bg    = 'none' === $args['light'] ? '' : sprintf(
			'<rect width="%d" height="%d" fill="%s"/>',
			$blocks,
			$blocks,
			htmlspecialchars( $args['light'], ENT_QUOTES, 'UTF-8' )
		);

		return sprintf(
			'<svg xmlns="http://www.w3.org/2000/svg" width="%1$d" height="%1$d" viewBox="0 0 %2$d %2$d" shape-rendering="crispEdges" role="img">%3$s%4$s<path d="%5$s" fill="%6$s"/></svg>',
			$px,
			$blocks,
			$title,
			$bg,
			$path,
			htmlspecialchars( $args['dark'], ENT_QUOTES, 'UTF-8' )
		);
	}

	/**
	 * Rendert den Code als PNG.
	 *
	 * Der PNG-Datenstrom wird direkt geschrieben, damit die GD-Bibliothek keine
	 * Voraussetzung ist.
	 *
	 * @param array $args {
	 *     Optionale Darstellungsparameter.
	 *
	 *     @type int    $scale      Kantenlaenge eines Moduls in Pixeln. Standard 10.
	 *     @type int    $quiet_zone Ruhezone in Modulen. Standard 4.
	 *     @type string $dark       Dunkle Farbe als Hexwert.
	 *     @type string $light      Helle Farbe als Hexwert.
	 * }
	 *
	 * @return string Binaerer PNG-Inhalt.
	 */
	public function to_png( $args = array() ) {
		$args = array_merge(
			array(
				'scale'      => 10,
				'quiet_zone' => 4,
				'dark'       => '#000000',
				'light'      => '#ffffff',
			),
			$args
		);

		$scale = max( 1, (int) $args['scale'] );
		$quiet = max( 0, (int) $args['quiet_zone'] );
		$dark  = self::hex_to_rgb( $args['dark'] );
		$light = self::hex_to_rgb( $args['light'] );

		$blocks = $this->size + ( 2 * $quiet );
		$px     = $blocks * $scale;

		// Eine Modulzeile als Pixelzeile vorbereiten und $scale-mal ausgeben.
		$quiet_row = str_repeat( $light, $px );
		$raw       = str_repeat( "\x00" . $quiet_row, $quiet * $scale );

		for ( $row = 0; $row < $this->size; $row++ ) {
			$line = str_repeat( $light, $quiet * $scale );

			for ( $col = 0; $col < $this->size; $col++ ) {
				$line .= str_repeat( 1 === $this->matrix[ $row ][ $col ] ? $dark : $light, $scale );
			}

			$line .= str_repeat( $light, $quiet * $scale );
			$raw  .= str_repeat( "\x00" . $line, $scale );
		}

		$raw .= str_repeat( "\x00" . $quiet_row, $quiet * $scale );

		$ihdr = pack( 'NN', $px, $px ) . "\x08\x02\x00\x00\x00";

		return "\x89PNG\r\n\x1a\n"
			. self::png_chunk( 'IHDR', $ihdr )
			. self::png_chunk( 'IDAT', gzcompress( $raw, 9 ) )
			. self::png_chunk( 'IEND', '' );
	}

	/**
	 * Baut einen PNG-Chunk inklusive Pruefsumme.
	 *
	 * @param string $type Chunk-Typ.
	 * @param string $data Nutzdaten.
	 *
	 * @return string
	 */
	protected static function png_chunk( $type, $data ) {
		return pack( 'N', strlen( $data ) ) . $type . $data . pack( 'N', crc32( $type . $data ) );
	}

	/**
	 * Wandelt einen Hexfarbwert in drei Rohbytes.
	 *
	 * @param string $hex Farbwert, z. B. #1a2b3c.
	 *
	 * @return string
	 */
	protected static function hex_to_rgb( $hex ) {
		$hex = ltrim( (string) $hex, '#' );

		if ( 3 === strlen( $hex ) ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		if ( 6 !== strlen( $hex ) || ! ctype_xdigit( $hex ) ) {
			$hex = '000000';
		}

		return chr( hexdec( substr( $hex, 0, 2 ) ) ) . chr( hexdec( substr( $hex, 2, 2 ) ) ) . chr( hexdec( substr( $hex, 4, 2 ) ) );
	}

	/* --------------------------------------------------------------------- *
	 * Kodierung
	 * --------------------------------------------------------------------- */

	/**
	 * Laedt die Referenztabellen.
	 *
	 * @return array
	 */
	protected static function tables() {
		if ( null === self::$tables ) {
			self::$tables = require __DIR__ . '/qr-tables.php';
		}

		return self::$tables;
	}

	/**
	 * Anzahl der Datencodewoerter fuer Version und Stufe.
	 *
	 * @param int    $version Symbolversion.
	 * @param string $level   Fehlerkorrekturstufe.
	 *
	 * @return int
	 */
	protected static function data_codewords( $version, $level ) {
		$total = 0;

		foreach ( self::tables()['ecc'][ $version ][ $level ] as $group ) {
			$total += $group[0] * $group[2];
		}

		return $total;
	}

	/**
	 * Laenge des Zeichenzaehlers im Byte-Modus.
	 *
	 * @param int $version Symbolversion.
	 *
	 * @return int
	 */
	protected static function count_bits( $version ) {
		return $version < 10 ? 8 : 16;
	}

	/**
	 * Waehlt die kleinste Version, in die die Daten passen.
	 *
	 * @param int $min_version Untergrenze.
	 *
	 * @return int
	 *
	 * @throws InvalidArgumentException Wenn die Daten zu lang sind.
	 */
	protected function pick_version( $min_version ) {
		$length = strlen( $this->data );

		for ( $version = $min_version; $version <= 40; $version++ ) {
			$needed = 4 + self::count_bits( $version ) + ( 8 * $length );

			if ( $needed <= self::data_codewords( $version, $this->level ) * 8 ) {
				return $version;
			}
		}

		throw new InvalidArgumentException( 'Die Daten sind fuer einen QR-Code zu lang (max. Version 40).' );
	}

	/**
	 * Erzeugt Matrix, Maske und Formatinformationen.
	 *
	 * @return void
	 */
	protected function build() {
		$codewords = $this->encode_codewords();

		$this->init_matrix();
		$this->draw_function_patterns();
		$this->place_codewords( $codewords );
		$this->apply_best_mask();
		$this->draw_format_bits( $this->mask );
	}

	/**
	 * Erzeugt den vollstaendigen Codewortstrom inklusive Fehlerkorrektur.
	 *
	 * @return array<int,int>
	 */
	protected function encode_codewords() {
		$bits   = array();
		$length = strlen( $this->data );

		// Modusindikator Byte-Modus.
		self::push_bits( $bits, 4, 4 );
		self::push_bits( $bits, $length, self::count_bits( $this->version ) );

		for ( $i = 0; $i < $length; $i++ ) {
			self::push_bits( $bits, ord( $this->data[ $i ] ), 8 );
		}

		$capacity = self::data_codewords( $this->version, $this->level ) * 8;

		// Abschlusszeichen und Auffuellen auf volle Codewoerter.
		for ( $i = 0; $i < 4 && count( $bits ) < $capacity; $i++ ) {
			$bits[] = 0;
		}

		while ( 0 !== count( $bits ) % 8 ) {
			$bits[] = 0;
		}

		$pad = array( 0xEC, 0x11 );

		for ( $i = 0; count( $bits ) < $capacity; $i++ ) {
			self::push_bits( $bits, $pad[ $i % 2 ], 8 );
		}

		$data = array();

		for ( $i = 0; $i < count( $bits ); $i += 8 ) {
			$byte = 0;

			for ( $b = 0; $b < 8; $b++ ) {
				$byte = ( $byte << 1 ) | $bits[ $i + $b ];
			}

			$data[] = $byte;
		}

		return $this->interleave( $data );
	}

	/**
	 * Teilt die Daten in Bloecke, berechnet die Fehlerkorrektur und verschraenkt beides.
	 *
	 * @param array<int,int> $data Datencodewoerter.
	 *
	 * @return array<int,int>
	 */
	protected function interleave( $data ) {
		$groups      = self::tables()['ecc'][ $this->version ][ $this->level ];
		$data_blocks = array();
		$ecc_blocks  = array();
		$offset      = 0;
		$ecc_len     = 0;

		foreach ( $groups as $group ) {
			list( $num_blocks, $num_total, $num_data ) = $group;

			$ecc_len = $num_total - $num_data;

			for ( $b = 0; $b < $num_blocks; $b++ ) {
				$block         = array_slice( $data, $offset, $num_data );
				$offset       += $num_data;
				$data_blocks[] = $block;
				$ecc_blocks[]  = self::reed_solomon( $block, $ecc_len );
			}
		}

		$result   = array();
		$max_data = 0;

		foreach ( $data_blocks as $block ) {
			$max_data = max( $max_data, count( $block ) );
		}

		for ( $i = 0; $i < $max_data; $i++ ) {
			foreach ( $data_blocks as $block ) {
				if ( isset( $block[ $i ] ) ) {
					$result[] = $block[ $i ];
				}
			}
		}

		for ( $i = 0; $i < $ecc_len; $i++ ) {
			foreach ( $ecc_blocks as $block ) {
				if ( isset( $block[ $i ] ) ) {
					$result[] = $block[ $i ];
				}
			}
		}

		return $result;
	}

	/**
	 * Haengt einen Wert bitweise an einen Bitpuffer an.
	 *
	 * @param array<int,int> $bits   Bitpuffer, wird veraendert.
	 * @param int            $value  Anzuhaengender Wert.
	 * @param int            $length Anzahl Bits.
	 *
	 * @return void
	 */
	protected static function push_bits( &$bits, $value, $length ) {
		for ( $i = $length - 1; $i >= 0; $i-- ) {
			$bits[] = ( $value >> $i ) & 1;
		}
	}

	/* --------------------------------------------------------------------- *
	 * Galoiskoerper und Reed-Solomon
	 * --------------------------------------------------------------------- */

	/**
	 * Initialisiert die Tabellen von GF(256) mit dem Generatorpolynom 0x11D.
	 *
	 * @return void
	 */
	protected static function init_gf() {
		if ( array() !== self::$gf_exp ) {
			return;
		}

		$x = 1;

		for ( $i = 0; $i < 255; $i++ ) {
			self::$gf_exp[ $i ]   = $x;
			self::$gf_log[ $x ]   = $i;
			$x                  <<= 1;

			if ( $x & 0x100 ) {
				$x ^= 0x11D;
			}
		}

		// Verdoppelte Tabelle spart die Modulorechnung bei der Multiplikation.
		for ( $i = 255; $i < 512; $i++ ) {
			self::$gf_exp[ $i ] = self::$gf_exp[ $i - 255 ];
		}
	}

	/**
	 * Multiplikation in GF(256).
	 *
	 * @param int $a Faktor.
	 * @param int $b Faktor.
	 *
	 * @return int
	 */
	protected static function gf_mul( $a, $b ) {
		if ( 0 === $a || 0 === $b ) {
			return 0;
		}

		self::init_gf();

		return self::$gf_exp[ self::$gf_log[ $a ] + self::$gf_log[ $b ] ];
	}

	/**
	 * Berechnet das Generatorpolynom fuer die gewuenschte Anzahl Pruefcodewoerter.
	 *
	 * @param int $degree Anzahl Pruefcodewoerter.
	 *
	 * @return array<int,int>
	 */
	protected static function generator_poly( $degree ) {
		self::init_gf();

		$poly = array( 1 );

		for ( $i = 0; $i < $degree; $i++ ) {
			$next = array_fill( 0, count( $poly ) + 1, 0 );

			foreach ( $poly as $j => $coef ) {
				// Index 0 traegt den hoechsten Grad, der Leitkoeffizient bleibt 1.
				$next[ $j ]     ^= $coef;
				$next[ $j + 1 ] ^= self::gf_mul( $coef, self::$gf_exp[ $i ] );
			}

			$poly = $next;
		}

		return $poly;
	}

	/**
	 * Berechnet die Reed-Solomon-Pruefcodewoerter eines Blocks.
	 *
	 * @param array<int,int> $block  Datencodewoerter.
	 * @param int            $degree Anzahl Pruefcodewoerter.
	 *
	 * @return array<int,int>
	 */
	protected static function reed_solomon( $block, $degree ) {
		$gen       = self::generator_poly( $degree );
		$remainder = array_fill( 0, $degree, 0 );

		foreach ( $block as $byte ) {
			$factor = $byte ^ array_shift( $remainder );
			$remainder[] = 0;

			foreach ( $gen as $i => $coef ) {
				if ( $i > 0 ) {
					$remainder[ $i - 1 ] ^= self::gf_mul( $coef, $factor );
				}
			}
		}

		return $remainder;
	}

	/* --------------------------------------------------------------------- *
	 * Matrixaufbau
	 * --------------------------------------------------------------------- */

	/**
	 * Legt eine leere Matrix an.
	 *
	 * @return void
	 */
	protected function init_matrix() {
		$row            = array_fill( 0, $this->size, 0 );
		$this->matrix   = array_fill( 0, $this->size, $row );
		$this->reserved = array_fill( 0, $this->size, array_fill( 0, $this->size, false ) );
	}

	/**
	 * Setzt ein Funktionsmodul und schuetzt es vor der Maskierung.
	 *
	 * @param int $row Zeile.
	 * @param int $col Spalte.
	 * @param int $val Modulwert.
	 *
	 * @return void
	 */
	protected function set_function( $row, $col, $val ) {
		if ( $row < 0 || $col < 0 || $row >= $this->size || $col >= $this->size ) {
			return;
		}

		$this->matrix[ $row ][ $col ]   = $val ? 1 : 0;
		$this->reserved[ $row ][ $col ] = true;
	}

	/**
	 * Zeichnet Sucher-, Ausrichtungs- und Taktmuster sowie reservierte Bereiche.
	 *
	 * @return void
	 */
	protected function draw_function_patterns() {
		// Taktmuster.
		for ( $i = 0; $i < $this->size; $i++ ) {
			$this->set_function( 6, $i, 1 - ( $i % 2 ) );
			$this->set_function( $i, 6, 1 - ( $i % 2 ) );
		}

		// Suchermuster mit Trennstegen.
		$this->draw_finder( 0, 0 );
		$this->draw_finder( 0, $this->size - 7 );
		$this->draw_finder( $this->size - 7, 0 );

		// Ausrichtungsmuster.
		if ( $this->version >= 2 ) {
			$positions = self::tables()['alignment'][ $this->version ];

			foreach ( $positions as $row ) {
				foreach ( $positions as $col ) {
					// Ueberschneidungen mit den Suchermustern auslassen.
					if ( ( $row <= 8 && $col <= 8 )
						|| ( $row <= 8 && $col >= $this->size - 9 )
						|| ( $row >= $this->size - 9 && $col <= 8 ) ) {
						continue;
					}

					$this->draw_alignment( $row, $col );
				}
			}
		}

		// Bereiche der Formatinformation reservieren. Index 6 bleibt ausgespart:
		// dort kreuzt das Taktmuster, das nicht ueberschrieben werden darf.
		for ( $i = 0; $i < 9; $i++ ) {
			if ( 6 === $i ) {
				continue;
			}

			$this->set_function( 8, $i, 0 );
			$this->set_function( $i, 8, 0 );
		}

		for ( $i = 0; $i < 8; $i++ ) {
			$this->set_function( 8, $this->size - 1 - $i, 0 );
			$this->set_function( $this->size - 1 - $i, 8, 0 );
		}

		// Dauerhaft dunkles Modul.
		$this->set_function( $this->size - 8, 8, 1 );

		if ( $this->version >= 7 ) {
			$this->draw_version_bits();
		}
	}

	/**
	 * Zeichnet ein Suchermuster samt Trennsteg an der angegebenen Ecke.
	 *
	 * @param int $top  Oberste Zeile des Musters.
	 * @param int $left Linke Spalte des Musters.
	 *
	 * @return void
	 */
	protected function draw_finder( $top, $left ) {
		for ( $row = -1; $row <= 7; $row++ ) {
			for ( $col = -1; $col <= 7; $col++ ) {
				$distance = max( abs( $row - 3 ), abs( $col - 3 ) );
				$this->set_function( $top + $row, $left + $col, ( 2 === $distance || 4 === $distance ) ? 0 : 1 );
			}
		}
	}

	/**
	 * Zeichnet ein Ausrichtungsmuster um den angegebenen Mittelpunkt.
	 *
	 * @param int $center_row Mittelpunktzeile.
	 * @param int $center_col Mittelpunktspalte.
	 *
	 * @return void
	 */
	protected function draw_alignment( $center_row, $center_col ) {
		for ( $row = -2; $row <= 2; $row++ ) {
			for ( $col = -2; $col <= 2; $col++ ) {
				$this->set_function( $center_row + $row, $center_col + $col, 1 === max( abs( $row ), abs( $col ) ) ? 0 : 1 );
			}
		}
	}

	/**
	 * Zeichnet die Versionsinformation (ab Version 7).
	 *
	 * @return void
	 */
	protected function draw_version_bits() {
		$remainder = $this->version;

		for ( $i = 0; $i < 12; $i++ ) {
			$remainder = ( $remainder << 1 ) ^ ( ( $remainder >> 11 ) * 0x1F25 );
		}

		$bits = ( $this->version << 12 ) | $remainder;

		for ( $i = 0; $i < 18; $i++ ) {
			$bit = ( $bits >> $i ) & 1;
			$a   = $this->size - 11 + ( $i % 3 );
			$b   = intdiv( $i, 3 );

			$this->set_function( $b, $a, $bit );
			$this->set_function( $a, $b, $bit );
		}
	}

	/**
	 * Zeichnet die Formatinformation fuer die gewaehlte Maske.
	 *
	 * @param int $mask Maskennummer 0-7.
	 *
	 * @return void
	 */
	protected function draw_format_bits( $mask ) {
		$data      = ( self::LEVEL_BITS[ $this->level ] << 3 ) | $mask;
		$remainder = $data;

		for ( $i = 0; $i < 10; $i++ ) {
			$remainder = ( $remainder << 1 ) ^ ( ( $remainder >> 9 ) * 0x537 );
		}

		$bits = ( ( $data << 10 ) | $remainder ) ^ 0x5412;

		// Erste Kopie rund um das obere linke Suchermuster.
		for ( $i = 0; $i <= 5; $i++ ) {
			$this->set_function( $i, 8, ( $bits >> $i ) & 1 );
		}

		$this->set_function( 7, 8, ( $bits >> 6 ) & 1 );
		$this->set_function( 8, 8, ( $bits >> 7 ) & 1 );
		$this->set_function( 8, 7, ( $bits >> 8 ) & 1 );

		for ( $i = 9; $i < 15; $i++ ) {
			$this->set_function( 8, 14 - $i, ( $bits >> $i ) & 1 );
		}

		// Zweite Kopie an den beiden anderen Suchermustern.
		for ( $i = 0; $i < 8; $i++ ) {
			$this->set_function( 8, $this->size - 1 - $i, ( $bits >> $i ) & 1 );
		}

		for ( $i = 8; $i < 15; $i++ ) {
			$this->set_function( $this->size - 15 + $i, 8, ( $bits >> $i ) & 1 );
		}

		$this->set_function( $this->size - 8, 8, 1 );
	}

	/**
	 * Verteilt den Codewortstrom im Zickzack ueber die freien Module.
	 *
	 * @param array<int,int> $codewords Verschraenkte Codewoerter.
	 *
	 * @return void
	 */
	protected function place_codewords( $codewords ) {
		$bits = array();

		foreach ( $codewords as $byte ) {
			self::push_bits( $bits, $byte, 8 );
		}

		$total = count( $bits );
		$index = 0;
		$row   = $this->size - 1;
		$dir   = -1;

		for ( $col = $this->size - 1; $col > 0; $col -= 2 ) {
			// Die Taktspalte wird uebersprungen.
			if ( 6 === $col ) {
				$col--;
			}

			while ( true ) {
				for ( $c = 0; $c < 2; $c++ ) {
					$current = $col - $c;

					if ( ! $this->reserved[ $row ][ $current ] ) {
						$this->matrix[ $row ][ $current ] = $index < $total ? $bits[ $index ] : 0;
						$index++;
					}
				}

				$row += $dir;

				if ( $row < 0 || $row >= $this->size ) {
					$row -= $dir;
					$dir  = -$dir;
					break;
				}
			}
		}
	}

	/* --------------------------------------------------------------------- *
	 * Maskierung
	 * --------------------------------------------------------------------- */

	/**
	 * Prueft alle acht Masken und behaelt die mit der geringsten Bewertung.
	 *
	 * @return void
	 */
	protected function apply_best_mask() {
		$best_mask  = 0;
		$best_score = PHP_INT_MAX;
		$original   = $this->matrix;

		for ( $mask = 0; $mask < 8; $mask++ ) {
			$this->matrix = $original;
			$this->apply_mask( $mask );
			$this->draw_format_bits( $mask );

			$score = $this->penalty_score();

			if ( $score < $best_score ) {
				$best_score = $score;
				$best_mask  = $mask;
			}
		}

		$this->matrix = $original;
		$this->apply_mask( $best_mask );
		$this->mask = $best_mask;
	}

	/**
	 * Wendet eine Maske auf alle Datenmodule an.
	 *
	 * @param int $mask Maskennummer 0-7.
	 *
	 * @return void
	 */
	protected function apply_mask( $mask ) {
		for ( $row = 0; $row < $this->size; $row++ ) {
			for ( $col = 0; $col < $this->size; $col++ ) {
				if ( $this->reserved[ $row ][ $col ] ) {
					continue;
				}

				switch ( $mask ) {
					case 0:
						$invert = 0 === ( $row + $col ) % 2;
						break;
					case 1:
						$invert = 0 === $row % 2;
						break;
					case 2:
						$invert = 0 === $col % 3;
						break;
					case 3:
						$invert = 0 === ( $row + $col ) % 3;
						break;
					case 4:
						$invert = 0 === ( intdiv( $row, 2 ) + intdiv( $col, 3 ) ) % 2;
						break;
					case 5:
						$invert = 0 === ( ( $row * $col ) % 2 ) + ( ( $row * $col ) % 3 );
						break;
					case 6:
						$invert = 0 === ( ( ( $row * $col ) % 2 ) + ( ( $row * $col ) % 3 ) ) % 2;
						break;
					default:
						$invert = 0 === ( ( ( $row + $col ) % 2 ) + ( ( $row * $col ) % 3 ) ) % 2;
						break;
				}

				if ( $invert ) {
					$this->matrix[ $row ][ $col ] ^= 1;
				}
			}
		}
	}

	/**
	 * Bewertet suchermusteraehnliche Folgen in einer Zeile oder Spalte.
	 *
	 * Gezaehlt wird das Kernmuster 1:1:3:1:1 (dunkel-hell-dunkel-dunkel-dunkel-
	 * hell-dunkel), sofern ihm eine vier Module breite helle Zone vorangeht oder
	 * folgt. Der Symbolrand gilt dabei als helle Zone, wie in ISO/IEC 18004
	 * Tabelle 11 beschrieben.
	 *
	 * @param array<int,int> $sequence Modulwerte einer Zeile oder Spalte.
	 *
	 * @return int
	 */
	protected function finder_like_penalty( $sequence ) {
		$pattern = array( 1, 0, 1, 1, 1, 0, 1 );
		$size    = $this->size;
		$score   = 0;
		$index   = 0;

		while ( $index <= $size - 7 ) {
			if ( array_slice( $sequence, $index, 7 ) !== $pattern ) {
				$index++;
				continue;
			}

			$before = array_slice( $sequence, max( $index - 4, 0 ), min( $index, $size ) - max( $index - 4, 0 ) );
			$after  = array_slice( $sequence, $index + 7, 4 );

			if ( 0 === $index
				|| $index === $size - 7
				|| ! array_sum( $before )
				|| ! array_sum( $after ) ) {
				$score += 40;
				$index += 7;
			} else {
				// Ohne ausreichende Hellzone beim naechsten moeglichen Treffer weitersuchen.
				$index += 4;
			}
		}

		return $score;
	}

	/**
	 * Bewertet die aktuelle Matrix nach den vier Regeln der Norm.
	 *
	 * @return int
	 */
	protected function penalty_score() {
		$score = 0;
		$dark  = 0;

		// Regel 1: gleichfarbige Reihen ab fuenf Modulen.
		for ( $i = 0; $i < $this->size; $i++ ) {
			$row_run  = 1;
			$col_run  = 1;

			for ( $j = 1; $j < $this->size; $j++ ) {
				if ( $this->matrix[ $i ][ $j ] === $this->matrix[ $i ][ $j - 1 ] ) {
					$row_run++;
				} else {
					$score  += $row_run >= 5 ? 3 + ( $row_run - 5 ) : 0;
					$row_run = 1;
				}

				if ( $this->matrix[ $j ][ $i ] === $this->matrix[ $j - 1 ][ $i ] ) {
					$col_run++;
				} else {
					$score  += $col_run >= 5 ? 3 + ( $col_run - 5 ) : 0;
					$col_run = 1;
				}
			}

			$score += $row_run >= 5 ? 3 + ( $row_run - 5 ) : 0;
			$score += $col_run >= 5 ? 3 + ( $col_run - 5 ) : 0;
		}

		// Regel 2: gleichfarbige Bloecke aus 2x2 Modulen.
		for ( $row = 0; $row < $this->size - 1; $row++ ) {
			for ( $col = 0; $col < $this->size - 1; $col++ ) {
				$value = $this->matrix[ $row ][ $col ];

				if ( $value === $this->matrix[ $row ][ $col + 1 ]
					&& $value === $this->matrix[ $row + 1 ][ $col ]
					&& $value === $this->matrix[ $row + 1 ][ $col + 1 ] ) {
					$score += 3;
				}
			}
		}

		// Regel 3: suchermusteraehnliche Folgen in Zeilen und Spalten.
		for ( $i = 0; $i < $this->size; $i++ ) {
			$column = array();

			for ( $j = 0; $j < $this->size; $j++ ) {
				$column[] = $this->matrix[ $j ][ $i ];
			}

			$score += $this->finder_like_penalty( $this->matrix[ $i ] );
			$score += $this->finder_like_penalty( $column );
		}

		// Regel 4: Abweichung vom ausgewogenen Verhaeltnis heller und dunkler Module.
		foreach ( $this->matrix as $row ) {
			$dark += array_sum( $row );
		}

		$total   = $this->size * $this->size;
		$percent = ( $dark * 100 ) / $total;
		$score  += intdiv( (int) floor( abs( $percent - 50 ) ), 5 ) * 10;

		return $score;
	}
}
