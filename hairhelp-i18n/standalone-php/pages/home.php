<?php
/**
 * Beispiel-Template. Ein Template bedient alle Sprachen - die Texte kommen aus lang/*.php.
 *
 * Braucht eine Sprache eine voellig andere Seitenstruktur, legt man daneben einfach
 * home.fr.php an; die Bibliothek bevorzugt automatisch die sprachspezifische Datei.
 */

declare( strict_types=1 );

if ( ! function_exists( 'e' ) ) {
	exit;
}
?>

<section class="hero">
	<h1><?php echo e( 'hero_title' ); ?></h1>
	<p><?php echo e( 'hero_text' ); ?></p>
	<a class="btn btn--primary" href="<?php echo htmlspecialchars( i18n_url( 'shop' ), ENT_QUOTES, 'UTF-8' ); ?>">
		<?php echo e( 'cta_buy' ); ?>
	</a>
</section>

<ul class="usps">
	<li><?php echo e( 'usp_shipping' ); ?></li>
	<li><?php echo e( 'usp_money_back' ); ?></li>
	<li><?php echo e( 'usp_tested' ); ?></li>
</ul>
