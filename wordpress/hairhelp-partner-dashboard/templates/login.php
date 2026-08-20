<?php
/**
 * Anmeldemaske des Vermittler-Dashboards.
 *
 * @package HairHelp_Partner_Dashboard
 *
 * @var string $fehler  Fehlermeldung, falls vorhanden.
 * @var string $hinweis Bestaetigung, falls vorhanden.
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="hhp-dashboard hhp-dashboard-schmal <?php echo esc_attr( HHP_Dashboard::theme_class( isset( $marke ) ? $marke : null ) ); ?>" style="<?php echo esc_attr( HHP_Dashboard::brand_style( isset( $marke ) ? $marke : null ) ); ?>">
	<header class="hhp-header">
		<div class="hhp-header-brand">
			<?php echo wp_kses_post( HHP_Dashboard::brand_logo( isset( $marke ) ? $marke : null ) ); ?>
			<div>
				<h2 class="hhp-title"><?php esc_html_e( 'Vermittler-Zugang', 'hairhelp-partner' ); ?></h2>
				<p class="hhp-subtitle"><?php esc_html_e( 'Bitte melde dich an, um deine vermittelten Verkäufe zu sehen.', 'hairhelp-partner' ); ?></p>
			</div>
		</div>
	</header>

	<?php if ( ! empty( $hinweis ) ) : ?>
		<p class="hhp-hinweis-box"><?php echo esc_html( $hinweis ); ?></p>
	<?php endif; ?>

	<?php if ( ! empty( $fehler ) ) : ?>
		<p class="hhp-fehler"><?php echo esc_html( $fehler ); ?></p>
	<?php endif; ?>

	<?php if ( HHP_Auth::login_allowed() ) : ?>
		<form class="hhp-loginform" method="post">
			<input type="hidden" name="hhp_aktion" value="anmelden" />
			<?php wp_nonce_field( 'hhp_anmelden' ); ?>

			<label class="hhp-field">
				<span><?php esc_html_e( 'Benutzername', 'hairhelp-partner' ); ?></span>
				<input type="text" name="hhp_benutzer" autocomplete="username" spellcheck="false" autocapitalize="none" required />
			</label>

			<label class="hhp-field">
				<span><?php esc_html_e( 'Passwort', 'hairhelp-partner' ); ?></span>
				<input type="password" name="hhp_passwort" autocomplete="current-password" required />
			</label>

			<label class="hhp-merken">
				<input type="checkbox" name="hhp_merken" value="1" />
				<span>
					<?php
					printf(
						/* translators: %d: Anzahl Tage */
						esc_html__( 'Angemeldet bleiben (%d Tage)', 'hairhelp-partner' ),
						(int) HHP_Settings::get( 'remember_days', 30 )
					);
					?>
				</span>
			</label>

			<button type="submit" class="hhp-button"><?php esc_html_e( 'Anmelden', 'hairhelp-partner' ); ?></button>
		</form>

		<p class="hhp-hinweis">
			<?php esc_html_e( 'Zugangsdaten vergessen? Melde dich beim Shop, dort lässt sich ein neues Passwort setzen.', 'hairhelp-partner' ); ?>
		</p>
	<?php else : ?>
		<p class="hhp-hinweis">
			<?php esc_html_e( 'Der Zugang erfolgt über den persönlichen Link, den du vom Shop erhalten hast.', 'hairhelp-partner' ); ?>
		</p>
	<?php endif; ?>
</div>
