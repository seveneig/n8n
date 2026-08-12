/**
 * Baut aus index.html den Elementor-Block:
 *   - Schrift und alle Bilder werden als Base64 eingebettet
 *   - <html>/<head>/<body> entfallen
 *   - Ergebnis: elementor-embed.html, ein einziger Copy-Paste-Block
 *
 * Aufruf:  node build-elementor.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const MIME = {
  webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg',
  jpeg: 'image/jpeg', svg: 'image/svg+xml', gif: 'image/gif',
};

const dataUri = (rel) => {
  const file = resolve(root, rel);
  const ext = rel.split('.').pop().toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Unbekannter Bildtyp: ${rel}`);
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
};

// 1. Style- und Body-Teil herausschneiden
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body = html.match(/<div class="sdx">[\s\S]*<\/div>\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->/)[0]
  .replace(/\s*<!-- ==== ENDE ELEMENTOR-BLOCK ==== -->$/, '');

// 2. Schrift-CSS einsetzen
const fontCss = readFileSync(resolve(root, 'assets/fonts/lato.css'), 'utf8').trim();

// 3. Alle Bildpfade durch Data-URIs ersetzen
let inlined = body;
const used = new Set();
inlined = inlined.replace(/src="(assets\/[^"]+)"/g, (_m, rel) => {
  used.add(rel);
  return `src="${dataUri(rel)}"`;
});

const out = `<!--
  ============================================================
  SMELL DISCETTES - STARTSEITE
  Diesen kompletten Block in ein Elementor-HTML-Widget einfuegen.
  Enthaelt Schrift und Bilder eingebettet - keine externen Dateien noetig.
  ============================================================
-->
<style>
${fontCss}

${style.trim()}
</style>

${inlined}
`;

writeFileSync(resolve(root, 'elementor-embed.html'), out);
const kb = (statSync(resolve(root, 'elementor-embed.html')).size / 1024).toFixed(0);
console.log(`elementor-embed.html geschrieben - ${kb} KB, ${used.size} Bilder eingebettet`);
for (const u of [...used].sort()) console.log('  ·', u);
