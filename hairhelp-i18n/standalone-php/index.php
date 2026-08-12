<?php
/**
 * Front Controller: nimmt jeden Request entgegen, ermittelt Sprache + Seite
 * und rendert das passende Template.
 *
 * Voraussetzung: alle Requests werden per .htaccess auf diese Datei geleitet.
 */

declare( strict_types=1 );

require __DIR__ . '/lib/i18n.php';

$lang     = i18n_lang();
$page     = i18n_page();
$template = i18n_template( $page, $lang );

if ( null === $template ) {
	http_response_code( 404 );
	$template = i18n_template( '404', $lang ) ?? null;

	if ( null === $template ) {
		echo '<h1>404</h1>';
		exit;
	}
}

$suggested = i18n_suggested_lang();
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars( I18N_LANGS[ $lang ]['hreflang'], ENT_QUOTES, 'UTF-8' ); ?>">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo e( 'meta_title' ); ?></title>
	<meta name="description" content="<?php echo e( 'meta_description' ); ?>">
	<link rel="canonical" href="<?php echo htmlspecialchars( i18n_url( $page, $lang ), ENT_QUOTES, 'UTF-8' ); ?>">
	<?php echo i18n_hreflang_tags(); ?>
</head>
<body class="lang-<?php echo htmlspecialchars( $lang, ENT_QUOTES, 'UTF-8' ); ?>">

<header class="site-header">
	<a class="site-logo" href="<?php echo htmlspecialchars( i18n_url( '', $lang ), ENT_QUOTES, 'UTF-8' ); ?>"><?php echo e( 'site_name' ); ?></a>

	<nav class="site-nav">
		<a href="<?php echo htmlspecialchars( i18n_url( 'streuhaar' ), ENT_QUOTES, 'UTF-8' ); ?>"><?php echo e( 'nav_product' ); ?></a>
		<a href="<?php echo htmlspecialchars( i18n_url( 'anwendung' ), ENT_QUOTES, 'UTF-8' ); ?>"><?php echo e( 'nav_application' ); ?></a>
		<a href="<?php echo htmlspecialchars( i18n_url( 'shop' ), ENT_QUOTES, 'UTF-8' ); ?>"><?php echo e( 'nav_shop' ); ?></a>
		<a href="<?php echo htmlspecialchars( i18n_url( 'kontakt' ), ENT_QUOTES, 'UTF-8' ); ?>"><?php echo e( 'nav_contact' ); ?></a>
	</nav>

	<?php echo i18n_switcher(); ?>
</header>

<?php if ( null !== $suggested ) : ?>
	<div class="lang-hint">
		<?php echo htmlspecialchars( t( 'suggest_language', array(), $suggested ), ENT_QUOTES, 'UTF-8' ); ?>
		<a href="<?php echo htmlspecialchars( i18n_url( $page, $suggested ), ENT_QUOTES, 'UTF-8' ); ?>">
			<?php echo htmlspecialchars( I18N_LANGS[ $suggested ]['label'], ENT_QUOTES, 'UTF-8' ); ?>
		</a>
	</div>
<?php endif; ?>

<main>
	<?php require $template; ?>
</main>

</body>
</html>
