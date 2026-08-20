/**
 * QR-Code-Tracking fuer www.hairhelp-haarverdichter.ch - eigenstaendige Variante.
 *
 * Diese Datei wird nur gebraucht, wenn das Tracking OHNE das Plugin laufen soll,
 * etwa ueber den Google Tag Manager oder ein eigenes Skriptfeld im Theme.
 * Mit aktivem Plugin ist sie ueberfluessig: Das Plugin setzt das Cookie bereits
 * serverseitig, was zuverlaessiger ist (Skriptblocker greifen dort nicht).
 *
 * Erfasst wird:
 *   https://www.hairhelp-haarverdichter.ch/qr/loopx13     (kurze Adresse)
 *   https://www.hairhelp-haarverdichter.ch/?qr=loopx13    (Adressparameter)
 *
 * Einbinden: als letztes Element vor </body> oder als benutzerdefiniertes
 * HTML-Tag im Tag Manager, ausgeloest bei jedem Seitenaufruf.
 */
( function () {
	'use strict';

	// Zentrale Einstellungen -------------------------------------------------
	var COOKIE_NAME = 'hhp_ref';
	var PARAMETER = 'qr';
	var TAGE = 30;

	// Fuehrender Punkt: Das Cookie gilt damit fuer www und die Adresse ohne www.
	var DOMAIN = '.hairhelp-haarverdichter.ch';

	// Nur diese Codes werden akzeptiert. Leer lassen, um jeden Code zu erlauben.
	var ERLAUBTE_CODES = [ 'loopx13' ];

	/**
	 * Liest einen Wert aus der Adresszeile.
	 */
	function ausAdresse( name ) {
		var treffer = new RegExp( '[?&]' + name + '=([^&#]*)' ).exec( window.location.search );

		return treffer ? decodeURIComponent( treffer[ 1 ] ) : '';
	}

	/**
	 * Liest den Code aus einer kurzen Adresse der Form /qr/CODE.
	 */
	function ausPfad() {
		var treffer = /^\/qr\/([^/?#]+)\/?$/i.exec( window.location.pathname );

		return treffer ? decodeURIComponent( treffer[ 1 ] ) : '';
	}

	/**
	 * Entfernt alles, was kein zulaessiges Zeichen ist.
	 */
	function bereinigen( wert ) {
		return String( wert || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' ).slice( 0, 40 );
	}

	/**
	 * Setzt das Cookie fuer die eingestellte Anzahl Tage.
	 */
	function cookieSetzen( name, wert, tage ) {
		var ablauf = new Date();
		ablauf.setTime( ablauf.getTime() + ( tage * 24 * 60 * 60 * 1000 ) );

		var teile = [
			name + '=' + encodeURIComponent( wert ),
			'expires=' + ablauf.toUTCString(),
			'path=/',
			'domain=' + DOMAIN,
			'SameSite=Lax'
		];

		// Ohne HTTPS wuerde ein als sicher markiertes Cookie verworfen.
		if ( 'https:' === window.location.protocol ) {
			teile.push( 'Secure' );
		}

		document.cookie = teile.join( '; ' );
	}

	// Ablauf -----------------------------------------------------------------
	var code = bereinigen( ausAdresse( PARAMETER ) || ausPfad() );

	if ( ! code ) {
		return;
	}

	if ( ERLAUBTE_CODES.length && ERLAUBTE_CODES.indexOf( code ) === -1 ) {
		return;
	}

	cookieSetzen( COOKIE_NAME, code, TAGE );
	cookieSetzen( COOKIE_NAME + '_ts', String( Math.floor( Date.now() / 1000 ) ), TAGE );
}() );
