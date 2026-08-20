/**
 * Verwaltungsoberflaeche: Vermittler hinzufuegen, Links kopieren, Abgleich starten.
 */
( function () {
	'use strict';

	document.addEventListener( 'DOMContentLoaded', function () {
		var texte = ( window.hhpAdmin && window.hhpAdmin.texte ) || {};

		// Weiteren Vermittler anlegen.
		var addButton = document.getElementById( 'hhp-add-partner' );
		var template = document.getElementById( 'hhp-partner-template' );
		var container = document.getElementById( 'hhp-partners' );

		if ( addButton && template && container ) {
			addButton.addEventListener( 'click', function () {
				var index = container.querySelectorAll( '.hhp-partner-card' ).length;
				var markup = template.innerHTML.replace( /__INDEX__/g, 'neu' + index );
				var wrapper = document.createElement( 'div' );

				wrapper.innerHTML = markup.trim();

				while ( wrapper.firstChild ) {
					container.appendChild( wrapper.firstChild );
				}
			} );
		}

		// Zugangslink in die Zwischenablage kopieren.
		document.addEventListener( 'click', function ( event ) {
			var button = event.target.closest( '.hhp-copy' );

			if ( ! button ) {
				return;
			}

			event.preventDefault();

			var link = button.getAttribute( 'data-link' ) || '';
			var melden = function () {
				var alt = button.textContent;
				button.textContent = texte.kopiert || 'Kopiert.';
				window.setTimeout( function () {
					button.textContent = alt;
				}, 1800 );
			};

			if ( navigator.clipboard && navigator.clipboard.writeText ) {
				navigator.clipboard.writeText( link ).then( melden );
				return;
			}

			// Rueckfall fuer aeltere Browser.
			var feld = button.parentNode.querySelector( '.hhp-copy-input' );

			if ( feld ) {
				feld.select();
				document.execCommand( 'copy' );
				melden();
			}
		} );

		// Bestehende Bestellungen seitenweise abgleichen.
		var reindex = document.getElementById( 'hhp-reindex' );
		var status = document.getElementById( 'hhp-reindex-status' );

		if ( reindex && status ) {
			reindex.addEventListener( 'click', function () {
				var ab = document.getElementById( 'hhp-reindex-after' );
				var geprueft = 0;
				var zugeordnet = 0;

				reindex.disabled = true;

				var setzeStatus = function ( text, klasse ) {
					status.textContent = text;
					status.className = 'hhp-status ' + ( klasse || '' );
				};

				var durchlauf = function ( seite ) {
					var daten = new FormData();
					daten.append( 'action', 'hhp_reindex' );
					daten.append( 'nonce', window.hhpAdmin.nonce );
					daten.append( 'seite', seite );
					daten.append( 'ab', ab ? ab.value : '' );

					fetch( window.hhpAdmin.ajaxUrl, {
						method: 'POST',
						credentials: 'same-origin',
						body: daten
					} )
						.then( function ( antwort ) {
							return antwort.json();
						} )
						.then( function ( ergebnis ) {
							if ( ! ergebnis || ! ergebnis.success ) {
								throw new Error( 'fehler' );
							}

							geprueft += ergebnis.data.geprueft;
							zugeordnet += ergebnis.data.zugeordnet;

							setzeStatus(
								( texte.laeuft || '' ) + ' ' + geprueft + ' geprueft, ' + zugeordnet + ' zugeordnet.',
								'laeuft'
							);

							if ( ergebnis.data.fertig ) {
								setzeStatus(
									( texte.fertig || 'Fertig.' ) + ' ' + geprueft + ' Bestellungen geprueft, ' + zugeordnet + ' zugeordnet.',
									'fertig'
								);
								reindex.disabled = false;
								return;
							}

							durchlauf( seite + 1 );
						} )
						.catch( function () {
							setzeStatus( texte.fehler || 'Fehler.', 'fehler' );
							reindex.disabled = false;
						} );
				};

				setzeStatus( texte.laeuft || '', 'laeuft' );
				durchlauf( 1 );
			} );
		}
	} );
}() );
