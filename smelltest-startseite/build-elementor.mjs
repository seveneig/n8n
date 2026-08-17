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
];

// Zusaetzlich als .txt ablegen: laesst sich per Doppelklick in Notepad oeffnen,
// waehrend .html im Browser landen wuerde.
mkdirSync(resolve(root, 'zum-kopieren'), { recursive: true });

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
    .match(/<div class="sdx">[\s\S]*<\/div>\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->/)[0]
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
${fontCss}${extraFontCss ? '\n' + extraFontCss : ''}

${sharedCss}${ownCss}
</style>

${inlined}
`;

  writeFileSync(resolve(root, page.out), out);
  // Mit BOM, damit Windows-Notepad die Umlaute sicher als UTF-8 liest.
  // Beim Markieren mit Strg+A wird das BOM nicht mitkopiert.
  writeFileSync(resolve(root, 'zum-kopieren', page.txt), '\uFEFF' + out, 'utf8');
  const kb = (statSync(resolve(root, page.out)).size / 1024).toFixed(0);
  console.log(`${page.out.padEnd(30)} ${String(kb).padStart(4)} KB  ${used.size} Bilder  -> zum-kopieren/${page.txt}`);
}
