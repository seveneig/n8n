/**
 * Baut aus jeder Quellseite den passenden Elementor-Block:
 *   - Schrift, gemeinsames Stylesheet und alle Bilder werden eingebettet
 *   - <html>/<head>/<body> entfallen
 *   - Ergebnis: elementor-<name>.html, je ein Copy-Paste-Block
 *
 * Aufruf:  node build-elementor.mjs
 */
import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { src: 'index.html',     out: 'elementor-startseite.html', txt: 'startseite.txt', titel: 'Startseite' },
  { src: 'produkt.html',   out: 'elementor-produkt.html',    txt: 'produkt.txt',    titel: 'Produkt' },
  { src: 'ueber-uns.html', out: 'elementor-ueber-uns.html',  txt: 'ueber-uns.txt',  titel: 'Über uns' },
  { src: 'index-alt.html', out: 'elementor-startseite-variante-b.html', txt: 'startseite-variante-b.txt',
    titel: 'Startseite Variante B', extraCss: 'assets/css/sd-alt.css' },
  { src: 'index-c.html',   out: 'elementor-startseite-variante-c.html', txt: 'startseite-variante-c.txt',
    titel: 'Startseite Variante C', baseCss: 'assets/css/sd-c.css', extraFonts: ['assets/fonts/lato-300.css'] },
  { src: 'kontakt.html',          out: 'elementor-kontakt.html',          txt: 'kontakt.txt',          titel: 'Kontakt' },
  { src: 'vertriebspartner.html', out: 'elementor-vertriebspartner.html', txt: 'vertriebspartner.txt', titel: 'Vertriebspartner' },
  { src: 'impressum.html',        out: 'elementor-impressum.html',        txt: 'impressum.txt',        titel: 'Impressum' },
  { src: 'datenschutz.html',      out: 'elementor-datenschutz.html',      txt: 'datenschutz.txt',      titel: 'Datenschutz' },
  { src: 'header.html', out: 'elementor-header.html', txt: 'header.txt',
    titel: 'Kopfzeile (Theme Builder)', baseCss: 'assets/css/sd-header.css' },
  { src: 'footer.html', out: 'elementor-footer.html', txt: 'footer.txt',
    titel: 'Fusszeile (Theme Builder)', baseCss: 'assets/css/sd-footer.css', noFont: true },
];

// Zusaetzlich als .txt ablegen: laesst sich per Doppelklick in Notepad oeffnen,
// waehrend .html im Browser landen wuerde.
mkdirSync(resolve(root, 'zum-kopieren'), { recursive: true });

// Fassung ohne Kopf- und Fusszeile (dunkelblaue Variante A).
// Header und Footer kommen spaeter separat in Elementor dazu.
const OHNE_CHROME = new Set([
  'index.html', 'produkt.html', 'ueber-uns.html', 'kontakt.html',
  'vertriebspartner.html', 'impressum.html', 'datenschutz.html',
]);
mkdirSync(resolve(root, 'ohne-header-footer'), { recursive: true });

// Kleiner, bewusst gut auffindbarer Zusatzstil: haelt oben Platz frei, damit ein
// transparenter Header spaeter ueber dem Seitenanfang liegen kann.
const FREIRAUM = `<style>
/* --------------------------------------------------------------
   Freiraum fuer den spaeter ergaenzten, transparenten Header.
   Der Seitenanfang haelt oben so viel Platz frei, dass ein
   ueberlagernder Header nichts verdeckt.
   Wird der Header NICHT ueberlagernd eingesetzt, diesen ganzen
   <style>-Block loeschen - dann beginnt der Inhalt direkt oben.
   -------------------------------------------------------------- */
.sdx--bare .sd-phero { padding-top: clamp(148px, 12vw, 188px); }
@media (max-width: 900px) {
  .sdx--bare .sd-phero { padding-top: 132px; }
  .sdx--bare .sd-hero--glass { padding-top: 116px; }
}
@media (max-width: 680px) {
  .sdx--bare .sd-phero { padding-top: 116px; }
  .sdx--bare .sd-hero--glass { padding-top: 100px; }
}
</style>`;

const MIME = {
  webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg',
  jpeg: 'image/jpeg', svg: 'image/svg+xml', gif: 'image/gif',
};

const cache = new Map();
const dataUri = (rel) => {
  if (cache.has(rel)) return cache.get(rel);
  const ext = rel.split('.').pop().toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Unbekannter Bildtyp: ${rel}`);
  const uri = `data:${mime};base64,${readFileSync(resolve(root, rel)).toString('base64')}`;
  cache.set(rel, uri);
  return uri;
};

const fontCss = readFileSync(resolve(root, 'assets/fonts/lato.css'), 'utf8').trim();
const defaultCss = readFileSync(resolve(root, 'assets/css/sd.css'), 'utf8').trim();

for (const page of PAGES) {
  const html = readFileSync(resolve(root, page.src), 'utf8');

  // Body-Block zwischen Wrapper-Anfang und Endmarke herausschneiden
  const body = html
    .match(/<div class="sdx[^"]*">[\s\S]*<\/div>\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->/)[0]
    .replace(/\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->$/, '');

  // Seiteneigenes <style> (falls vorhanden) mitnehmen
  // baseCss ersetzt das gemeinsame Stylesheet, extraCss ergänzt es
  const sharedCss = page.baseCss
    ? readFileSync(resolve(root, page.baseCss), 'utf8').trim()
    : defaultCss;
  const extraFontCss = (page.extraFonts || [])
    .map((f) => readFileSync(resolve(root, f), 'utf8').trim()).join('\n');

  const own = html.match(/<style>([\s\S]*?)<\/style>/);
  const ownCss = (page.extraCss ? '\n\n' + readFileSync(resolve(root, page.extraCss), 'utf8').trim() : '')
               + (own ? '\n\n' + own[1].trim() : '');

  const used = new Set();
  const inlined = body.replace(/src="(assets\/[^"]+)"/g, (_m, rel) => {
    used.add(rel);
    return `src="${dataUri(rel)}"`;
  });

  const out = `<!--
  ============================================================
  SMELL DISCETTES - ${page.titel.toUpperCase()}
  Diesen kompletten Block in ein Elementor-HTML-Widget einfuegen.
  Enthaelt Schrift und Bilder eingebettet - keine externen Dateien noetig.
  Container auf volle Breite stellen, Padding auf 0.
  ============================================================
-->
<style>
${page.noFont ? '' : fontCss + (extraFontCss ? '\n' + extraFontCss : '') + '\n\n'}${sharedCss}${ownCss}
</style>

${inlined}
`;

  writeFileSync(resolve(root, page.out), out);
  // Mit BOM, damit Windows-Notepad die Umlaute sicher als UTF-8 liest.
  // Beim Markieren mit Strg+A wird das BOM nicht mitkopiert.
  writeFileSync(resolve(root, 'zum-kopieren', page.txt), '\uFEFF' + out, 'utf8');
  const kb = (statSync(resolve(root, page.out)).size / 1024).toFixed(0);
  console.log(`${page.out.padEnd(38)} ${String(kb).padStart(4)} KB  ${used.size} Bilder`);

  if (!OHNE_CHROME.has(page.src)) continue;

  // Kopf- und Fusszeile samt zugehoerigem Kommentar entfernen
  const bare = inlined
    .replace(/\s*<!-- -+ (?:Header|Kopfzeile)[^>]*-+ -->/g, '')
    .replace(/\s*<!-- -+ (?:Footer|Fusszeile) -+ -->/g, '')
    .replace(/\s*<header[\s\S]*?<\/header>/g, '')
    .replace(/\s*<footer[\s\S]*?<\/footer>/g, '')
    .replace('<div class="sdx">', '<div class="sdx sdx--bare">');

  const bareOut = `<!--
  ============================================================
  SMELL DISCETTES - ${page.titel.toUpperCase()}  (ohne Kopf- und Fusszeile)
  Kopfzeile und Fusszeile werden separat in Elementor ergaenzt.
  Der Seitenanfang haelt Platz fuer einen transparenten Header frei -
  siehe den kurz kommentierten Zusatzstil unten.
  Container auf volle Breite stellen, Padding auf 0.
  ============================================================
-->
<style>
${fontCss}${extraFontCss ? '\n' + extraFontCss : ''}

${sharedCss}${ownCss}
</style>
${FREIRAUM}

${bare}
`;
  const basis = page.src.replace(/\.html$/, '');
  writeFileSync(resolve(root, 'ohne-header-footer', `${basis}.html`), bareOut);
  writeFileSync(resolve(root, 'ohne-header-footer', `${basis}.txt`), '\uFEFF' + bareOut, 'utf8');
  const bkb = (statSync(resolve(root, 'ohne-header-footer', `${basis}.html`)).size / 1024).toFixed(0);
  console.log(`   ohne-header-footer/${basis}.html`.padEnd(46) + `${String(bkb).padStart(4)} KB`);
}
