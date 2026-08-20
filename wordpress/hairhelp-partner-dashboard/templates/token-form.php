<?php
/**
 * Eingabemaske fuer den Zugangscode.
 *
 * @package HairHelp_Partner_Dashboard
 *
 * @var string $fehler Fehlermeldung der letzten Pruefung.
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="hhp-dashboard hhp-dashboard-schmal" style="<?php echo esc_attr( HHP_Dashboard::brand_style() ); ?>">
	<header class="hhp-header">
		<div class="hhp-header-brand">
			<?php echo wp_kses_post( HHP_Dashboard::brand_logo() ); ?>
			<div>
				<h2 class="hhp-title"><?php esc_html_e( 'Vermittler-Zugang', 'hairhelp-partner' ); ?></h2>
				<p class="hhp-subtitle"><?php esc_html_e( 'Bitte den persoenlichen Zugangscode eingeben.', 'hairhelp-partner' ); ?></p>
			</div>
		</div>
	</header>

	<?php if ( ! empty( $fehler ) ) : ?>
		<p class="hhp-fehler"><?php echo esc_html( $fehler ); ?></p>
	<?php endif; ?>

	<form class="hhp-tokenform" method="get">
		<label class="hhp-field">
			<span><?php esc_html_e( 'Zugangscode', 'hairhelp-partner' ); ?></span>
			<input type="text" name="hhp_token" autocomplete="off" spellcheck="false" required />
		</label>
		<button type="submit" class="hhp-button"><?php esc_html_e( 'Anmelden', 'hairhelp-partner' ); ?></button>
	</form>

	<p class="hhp-hinweis">
		<?php esc_html_e( 'Den Code erhaeltst du direkt vom Shop. Am einfachsten ist der zugesandte Link: Er enthaelt den Code bereits und kann als Lesezeichen gespeichert werden.', 'hairhelp-partner' ); ?>
	</p>
</div>
