<?php
/**
 * Plugin Name:  HairHelp i18n
 * Description:  Schlanke Mehrsprachigkeit (DE/FR/IT/EN) fuer WordPress + WooCommerce ohne Uebersetzungs-Plugin.
 * Version:      1.0.0
 * Requires PHP: 7.4
 *
 * Installation (empfohlen):  als Datei nach wp-content/mu-plugins/hairhelp-i18n.php
 * Alternative:               kompletter Inhalt (ohne "<?php") als PHP-Snippet in Code Snippets / WPCode,
 *                            Ausfuehrung "Everywhere", Prioritaet moeglichst frueh (1).
 *
 * Sprachlogik: Die Sprache steckt im URL-Praefix.
 *   /streuhaar/          -> Deutsch  (Standard, ohne Praefix)
 *   /fr/streuhaar/       -> Franzoesisch
 *   /it/streuhaar/       -> Italienisch
 * Die uebersetzten Seiten sind ganz normale WordPress-Seiten unterhalb der Elternseite "fr" bzw. "it".
 * Zusammengehoerige Seiten werden ueber das Feld "Uebersetzungs-Gruppe" (_hh_group) verknuepft.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'HH_DEFAULT_LANG' ) ) {
	define( 'HH_DEFAULT_LANG', 'de' );
}

/* -------------------------------------------------------------------------
 * 1. Konfiguration
 * ---------------------------------------------------------------------- */

/**
 * Aktive Sprachen.
 *
 * prefix   = URL-Segment (Standardsprache: leer)
 * locale   = WordPress-Locale, bestimmt die Uebersetzung von WP-Core, Theme und WooCommerce
 *            (unter Einstellungen > Allgemein bzw. per WP-CLI installieren, siehe README)
 * hreflang = Sprach-/Laendercode fuer Suchmaschinen (fuer die Schweiz mit -CH targeten)
 */
function hh_langs(): array {
	static $langs = null;

	if ( null === $langs ) {
		$langs = apply_filters(
			'hh_langs',
			array(
				'de' => array( 'prefix' => '',   'locale' => 'de_CH', 'hreflang' => 'de-CH', 'label' => 'Deutsch',   'short' => 'DE' ),
				'fr' => array( 'prefix' => 'fr', 'locale' => 'fr_FR', 'hreflang' => 'fr-CH', 'label' => 'Français',  'short' => 'FR' ),
				'it' => array( 'prefix' => 'it', 'locale' => 'it_IT', 'hreflang' => 'it-CH', 'label' => 'Italiano',  'short' => 'IT' ),
				// Englisch spaeter einfach freischalten:
				// 'en' => array( 'prefix' => 'en', 'locale' => 'en_GB', 'hreflang' => 'en', 'label' => 'English', 'short' => 'EN' ),
			)
		);
	}

	return $langs;
}

/* -------------------------------------------------------------------------
 * 2. Spracherkennung
 * ---------------------------------------------------------------------- */

/**
 * Ermittelt die Sprache aus einem Pfad (z. B. "/fr/streuhaar/").
 */
function hh_lang_from_path( string $path ): string {
	$path = (string) wp_parse_url( $path, PHP_URL_PATH );

	// Unterverzeichnis-Installationen beruecksichtigen (z. B. example.ch/shop/).
	$home_path = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	$path      = trim( $path, '/' );

	if ( '' !== $home_path && 0 === strpos( $path, $home_path ) ) {
		$path = trim( substr( $path, strlen( $home_path ) ), '/' );
	}

	$segments = explode( '/', $path );
	$first    = strtolower( $segments[0] ?? '' );

	foreach ( hh_langs() as $code => $cfg ) {
		if ( '' !== $cfg['prefix'] && $first === $cfg['prefix'] ) {
			return $code;
		}
	}

	return HH_DEFAULT_LANG;
}

/**
 * Aktuelle Sprache des Requests.
 */
function hh_current_lang(): string {
	static $lang = null;

	if ( null !== $lang ) {
		return $lang;
	}

	// Bei AJAX (z. B. WooCommerce Warenkorb-Fragmente) zeigt die URL immer auf
	// /wp-admin/admin-ajax.php - die Sprache steht dort im Referer.
	if ( wp_doing_ajax() && ! empty( $_SERVER['HTTP_REFERER'] ) ) {
		$referer = esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
		if ( 0 === strpos( $referer, home_url() ) ) {
			return $lang = hh_lang_from_path( $referer );
		}
	}

	$uri  = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
	$lang = hh_lang_from_path( $uri );

	return $lang;
}

/**
 * Startseite einer Sprache (optional mit angehaengtem Pfad).
 */
function hh_home_url( ?string $lang = null, string $path = '' ): string {
	$langs  = hh_langs();
	$lang   = $lang ?: hh_current_lang();
	$prefix = $langs[ $lang ]['prefix'] ?? '';

	return home_url( '/' . ( '' !== $prefix ? $prefix . '/' : '' ) . ltrim( $path, '/' ) );
}

/* -------------------------------------------------------------------------
 * 3. Locale umschalten -> WP-Core, Theme und WooCommerce uebersetzen sich selbst
 * ---------------------------------------------------------------------- */

add_filter(
	'determine_locale',
	function ( $locale ) {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return $locale;
		}
		if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || wp_doing_cron() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			return $locale;
		}

		$langs = hh_langs();
		$code  = hh_current_lang();

		return $langs[ $code ]['locale'] ?? $locale;
	},
	20
);

// <html lang="fr-CH"> statt lang="fr-FR".
add_filter(
	'language_attributes',
	function ( $output ) {
		$langs = hh_langs();
		$code  = hh_current_lang();

		if ( empty( $langs[ $code ]['hreflang'] ) ) {
			return $output;
		}

		return preg_replace( '/lang="[^"]*"/', 'lang="' . esc_attr( $langs[ $code ]['hreflang'] ) . '"', $output, 1 );
	}
);

// CSS-Hook: <body class="... hh-lang-fr">
add_filter(
	'body_class',
	function ( $classes ) {
		$classes[] = 'hh-lang-' . hh_current_lang();

		return $classes;
	}
);

/* -------------------------------------------------------------------------
 * 4. Verknuepfung der Uebersetzungen (Feld "_hh_group")
 * ---------------------------------------------------------------------- */

/**
 * Liefert alle Uebersetzungen eines Beitrags/einer Seite als [ 'de' => URL, 'fr' => URL, ... ].
 */
function hh_translations_of( int $post_id ): array {
	static $cache = array();

	if ( isset( $cache[ $post_id ] ) ) {
		return $cache[ $post_id ];
	}

	$group = (string) get_post_meta( $post_id, '_hh_group', true );
	$out   = array();

	if ( '' !== $group ) {
		$posts = get_posts(
			array(
				'post_type'        => 'any',
				'post_status'      => 'publish',
				'numberposts'      => 20,
				'no_found_rows'    => true,
				'suppress_filters' => false,
				'meta_key'         => '_hh_group',
				'meta_value'       => $group,
			)
		);

		$langs = hh_langs();

		foreach ( $posts as $post ) {
			$code = (string) get_post_meta( $post->ID, '_hh_lang', true );
			$code = isset( $langs[ $code ] ) ? $code : HH_DEFAULT_LANG;
			$out[ $code ] = get_permalink( $post );
		}
	}

	$cache[ $post_id ] = $out;

	return $out;
}

/**
 * URLs fuer den aktuellen Kontext: echte Uebersetzungen, sonst Sprach-Startseiten.
 */
function hh_alternate_urls(): array {
	$langs = hh_langs();
	$urls  = array();

	if ( is_singular() ) {
		$urls = hh_translations_of( (int) get_queried_object_id() );
	}

	if ( is_front_page() || empty( $urls ) ) {
		foreach ( $langs as $code => $cfg ) {
			if ( ! isset( $urls[ $code ] ) ) {
				$urls[ $code ] = hh_home_url( $code );
			}
		}
	}

	return array_intersect_key( $urls, $langs );
}

/* -------------------------------------------------------------------------
 * 5. hreflang-Tags (SEO)
 * ---------------------------------------------------------------------- */

add_action(
	'wp_head',
	function () {
		if ( is_404() || is_search() ) {
			return;
		}

		$langs = hh_langs();
		$urls  = hh_alternate_urls();

		if ( count( $urls ) < 2 ) {
			return;
		}

		foreach ( $urls as $code => $url ) {
			printf(
				'<link rel="alternate" hreflang="%s" href="%s" />' . "\n",
				esc_attr( $langs[ $code ]['hreflang'] ),
				esc_url( $url )
			);
		}

		if ( isset( $urls[ HH_DEFAULT_LANG ] ) ) {
			printf( '<link rel="alternate" hreflang="x-default" href="%s" />' . "\n", esc_url( $urls[ HH_DEFAULT_LANG ] ) );
		}
	},
	1
);

/* -------------------------------------------------------------------------
 * 6. Sprachumschalter  ->  [hh_lang_switcher]  oder  hh_lang_switcher() im Theme
 * ---------------------------------------------------------------------- */

/**
 * @param array $args style = inline|dropdown, labels = short|full, hide_current = bool
 */
function hh_lang_switcher( array $args = array() ): string {
	$args = wp_parse_args(
		$args,
		array(
			'style'        => 'inline',
			'labels'       => 'short',
			'hide_current' => false,
		)
	);

	$langs   = hh_langs();
	$current = hh_current_lang();
	$urls    = hh_alternate_urls();

	// Fehlende Uebersetzungen zeigen auf die jeweilige Sprach-Startseite.
	foreach ( $langs as $code => $cfg ) {
		if ( empty( $urls[ $code ] ) ) {
			$urls[ $code ] = hh_home_url( $code );
		}
	}

	$items = '';

	foreach ( $langs as $code => $cfg ) {
		if ( $args['hide_current'] && $code === $current ) {
			continue;
		}

		$label = 'full' === $args['labels'] ? $cfg['label'] : $cfg['short'];
		$class = 'hh-lang-item' . ( $code === $current ? ' is-current' : '' );

		$items .= sprintf(
			'<li class="%s"><a href="%s" hreflang="%s" lang="%s" rel="alternate"%s>%s</a></li>',
			esc_attr( $class ),
			esc_url( $urls[ $code ] ),
			esc_attr( $cfg['hreflang'] ),
			esc_attr( $cfg['hreflang'] ),
			$code === $current ? ' aria-current="true"' : '',
			esc_html( $label )
		);
	}

	return sprintf(
		'<nav class="hh-lang-switcher hh-lang-switcher--%s" aria-label="%s"><ul>%s</ul></nav>',
		esc_attr( $args['style'] ),
		esc_attr( hh_t( 'lang_switcher_label' ) ),
		$items
	);
}

add_shortcode(
	'hh_lang_switcher',
	function ( $atts ) {
		$atts = shortcode_atts(
			array(
				'style'        => 'inline',
				'labels'       => 'short',
				'hide_current' => '0',
			),
			$atts,
			'hh_lang_switcher'
		);

		$atts['hide_current'] = filter_var( $atts['hide_current'], FILTER_VALIDATE_BOOLEAN );

		return hh_lang_switcher( $atts );
	}
);

// Minimales CSS, nur wenn der Umschalter auch verwendet wird.
add_action(
	'wp_head',
	function () {
		?>
<style id="hh-i18n-css">
.hh-lang-switcher ul{display:flex;gap:.5rem;list-style:none;margin:0;padding:0}
.hh-lang-switcher a{text-decoration:none;font-size:.85rem;line-height:1;padding:.35em .6em;border-radius:3px;opacity:.7;display:inline-block}
.hh-lang-switcher a:hover{opacity:1}
.hh-lang-switcher .is-current a{opacity:1;font-weight:600;background:rgba(0,0,0,.06)}
</style>
		<?php
	},
	5
);

/* -------------------------------------------------------------------------
 * 7. Kleines Woerterbuch fuer fest verdrahtete Texte im Theme
 *    Verwendung:  hh_t( 'buy_now' )   oder   [hh_t key="buy_now"]
 * ---------------------------------------------------------------------- */

function hh_strings(): array {
	return apply_filters(
		'hh_strings',
		array(
			'de' => array(
				'lang_switcher_label' => 'Sprache wählen',
				'buy_now'             => 'Jetzt bestellen',
				'free_shipping'       => 'Gratis Versand in der Schweiz',
				'money_back'          => '30 Tage Geld-zurück-Garantie',
				'add_to_cart'         => 'In den Warenkorb',
				'contact'             => 'Kontakt',
			),
			'fr' => array(
				'lang_switcher_label' => 'Choisir la langue',
				'buy_now'             => 'Commander maintenant',
				'free_shipping'       => 'Livraison gratuite en Suisse',
				'money_back'          => 'Satisfait ou remboursé sous 30 jours',
				'add_to_cart'         => 'Ajouter au panier',
				'contact'             => 'Contact',
			),
			'it' => array(
				'lang_switcher_label' => 'Scegli la lingua',
				'buy_now'             => 'Ordina ora',
				'free_shipping'       => 'Spedizione gratuita in Svizzera',
				'money_back'          => 'Garanzia di rimborso di 30 giorni',
				'add_to_cart'         => 'Aggiungi al carrello',
				'contact'             => 'Contatto',
			),
			'en' => array(
				'lang_switcher_label' => 'Choose language',
				'buy_now'             => 'Order now',
				'free_shipping'       => 'Free shipping within Switzerland',
				'money_back'          => '30-day money-back guarantee',
				'add_to_cart'         => 'Add to cart',
				'contact'             => 'Contact',
			),
		)
	);
}

function hh_t( string $key, ?string $lang = null ): string {
	$strings = hh_strings();
	$lang    = $lang ?: hh_current_lang();

	if ( isset( $strings[ $lang ][ $key ] ) ) {
		return $strings[ $lang ][ $key ];
	}

	return $strings[ HH_DEFAULT_LANG ][ $key ] ?? $key;
}

add_shortcode(
	'hh_t',
	function ( $atts ) {
		$atts = shortcode_atts( array( 'key' => '' ), $atts, 'hh_t' );

		return esc_html( hh_t( (string) $atts['key'] ) );
	}
);

/* -------------------------------------------------------------------------
 * 8. Pro Sprache ein eigenes Menue
 *    Konvention: Menue "hauptmenue" -> "hauptmenue-fr" / "hauptmenue-it"
 * ---------------------------------------------------------------------- */

add_filter(
	'wp_nav_menu_args',
	function ( $args ) {
		$lang = hh_current_lang();

		if ( $lang === HH_DEFAULT_LANG ) {
			return $args;
		}

		$menu = ! empty( $args['menu'] ) ? $args['menu'] : 0;

		if ( ! $menu && ! empty( $args['theme_location'] ) ) {
			$locations = get_nav_menu_locations();
			$menu      = $locations[ $args['theme_location'] ] ?? 0;
		}

		$object = $menu ? wp_get_nav_menu_object( $menu ) : false;

		if ( ! $object ) {
			return $args;
		}

		$translated = wp_get_nav_menu_object( $object->slug . '-' . $lang );

		if ( $translated ) {
			$args['menu'] = $translated->term_id;
		}

		return $args;
	}
);

/* -------------------------------------------------------------------------
 * 9. Suche auf die aktuelle Sprache beschraenken
 * ---------------------------------------------------------------------- */

add_action(
	'pre_get_posts',
	function ( $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return;
		}

		$lang = hh_current_lang();

		if ( HH_DEFAULT_LANG === $lang ) {
			// Standardsprache: alles ohne explizite Sprachmarkierung + explizit "de".
			$query->set(
				'meta_query',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_hh_lang',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'   => '_hh_lang',
						'value' => $lang,
					),
				)
			);

			return;
		}

		$query->set(
			'meta_query',
			array(
				array(
					'key'   => '_hh_lang',
					'value' => $lang,
				),
			)
		);
	}
);

/* -------------------------------------------------------------------------
 * 10. Redaktionelle Felder: Sprache + Uebersetzungs-Gruppe
 * ---------------------------------------------------------------------- */

add_action(
	'add_meta_boxes',
	function () {
		$types = apply_filters( 'hh_meta_box_post_types', array( 'page', 'post', 'product' ) );

		foreach ( $types as $type ) {
			add_meta_box( 'hh-i18n', 'Sprache / Übersetzung', 'hh_render_meta_box', $type, 'side', 'default' );
		}
	}
);

function hh_render_meta_box( $post ) {
	$langs = hh_langs();
	$lang  = (string) get_post_meta( $post->ID, '_hh_lang', true );
	$group = (string) get_post_meta( $post->ID, '_hh_group', true );

	wp_nonce_field( 'hh_i18n_save', 'hh_i18n_nonce' );
	?>
	<p>
		<label for="hh_lang"><strong>Sprache</strong></label><br>
		<select name="hh_lang" id="hh_lang" style="width:100%">
			<?php foreach ( $langs as $code => $cfg ) : ?>
				<option value="<?php echo esc_attr( $code ); ?>" <?php selected( $lang ?: HH_DEFAULT_LANG, $code ); ?>>
					<?php echo esc_html( $cfg['label'] ); ?>
				</option>
			<?php endforeach; ?>
		</select>
	</p>
	<p>
		<label for="hh_group"><strong>Übersetzungs-Gruppe</strong></label><br>
		<input type="text" name="hh_group" id="hh_group" value="<?php echo esc_attr( $group ); ?>" style="width:100%" placeholder="z. B. streuhaar-anwendung">
		<span class="description">Gleicher Wert auf allen Sprachversionen derselben Seite. Steuert Sprachumschalter und hreflang.</span>
	</p>
	<?php
}

add_action(
	'save_post',
	function ( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! isset( $_POST['hh_i18n_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['hh_i18n_nonce'] ) ), 'hh_i18n_save' ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$langs = hh_langs();
		$lang  = isset( $_POST['hh_lang'] ) ? sanitize_key( wp_unslash( $_POST['hh_lang'] ) ) : HH_DEFAULT_LANG;
		$lang  = isset( $langs[ $lang ] ) ? $lang : HH_DEFAULT_LANG;
		$group = isset( $_POST['hh_group'] ) ? sanitize_title( wp_unslash( $_POST['hh_group'] ) ) : '';

		update_post_meta( $post_id, '_hh_lang', $lang );

		if ( '' !== $group ) {
			update_post_meta( $post_id, '_hh_group', $group );
		} else {
			delete_post_meta( $post_id, '_hh_group' );
		}
	}
);

/* -------------------------------------------------------------------------
 * 11. Optional: Lagerbestand zwischen uebersetzten Produkt-Duplikaten synchron halten
 *     Aktivieren mit:  define( 'HH_SYNC_STOCK', true );  (z. B. in der wp-config.php)
 * ---------------------------------------------------------------------- */

add_action(
	'woocommerce_product_set_stock',
	function ( $product ) {
		if ( ! defined( 'HH_SYNC_STOCK' ) || ! HH_SYNC_STOCK ) {
			return;
		}

		static $running = false;

		if ( $running ) {
			return;
		}

		$group = (string) get_post_meta( $product->get_id(), '_hh_group', true );

		if ( '' === $group ) {
			return;
		}

		$running = true;

		$siblings = get_posts(
			array(
				'post_type'     => 'product',
				'post_status'   => 'any',
				'numberposts'   => 20,
				'fields'        => 'ids',
				'no_found_rows' => true,
				'exclude'       => array( $product->get_id() ),
				'meta_key'      => '_hh_group',
				'meta_value'    => $group,
			)
		);

		foreach ( $siblings as $sibling_id ) {
			$sibling = wc_get_product( $sibling_id );

			if ( ! $sibling ) {
				continue;
			}

			$sibling->set_manage_stock( $product->get_manage_stock() );
			$sibling->set_stock_quantity( $product->get_stock_quantity() );
			$sibling->set_stock_status( $product->get_stock_status() );
			$sibling->save();
		}

		$running = false;
	}
);
