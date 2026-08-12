/**
 * Baut aus jeder Quellseite den passenden Elementor-Block:
 *   - Schrift, gemeinsames Stylesheet und alle Bilder werden eingebettet
 *   - <html>/<head>/<body> entfallen
 *   - Ergebnis: elementor-<name>.html, je ein Copy-Paste-Block
 *
 * Aufruf:  node build-elementor.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { src: 'index.html',     out: 'elementor-startseite.html', titel: 'Startseite' },
  { src: 'produkt.html',   out: 'elementor-produkt.html',    titel: 'Produkt' },
  { src: 'ueber-uns.html', out: 'elementor-ueber-uns.html',  titel: 'Über uns' },
];

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
const sharedCss = readFileSync(resolve(root, 'assets/css/sd.css'), 'utf8').trim();

for (const page of PAGES) {
  const html = readFileSync(resolve(root, page.src), 'utf8');

  // Body-Block zwischen Wrapper-Anfang und Endmarke herausschneiden
  const body = html
    .match(/<div class="sdx">[\s\S]*<\/div>\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->/)[0]
    .replace(/\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->$/, '');

  // Seiteneigenes <style> (falls vorhanden) mitnehmen
  const own = html.match(/<style>([\s\S]*?)<\/style>/);
  const ownCss = own ? '\n\n' + own[1].trim() : '';

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
${fontCss}

${sharedCss}${ownCss}
</style>

${inlined}
`;

  writeFileSync(resolve(root, page.out), out);
  const kb = (statSync(resolve(root, page.out)).size / 1024).toFixed(0);
  console.log(`${page.out.padEnd(30)} ${String(kb).padStart(4)} KB  ${used.size} Bilder`);
}
