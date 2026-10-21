// Schritt 2 von 3: druckt das HTML als PDF und misst die Formularfelder.
// Aufruf: node drucken.mjs <formular.html> <layout.pdf> <felder.json>
// Playwright: PLAYWRIGHT_PATH (Standard: globale Installation unter /opt/node22).
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const pw = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
const [html, pdf, json] = process.argv.slice(2);

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.emulateMedia({ media: 'print' });
await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const messung = await page.evaluate(() => {
  const seiten = [...document.querySelectorAll('.seite')];
  const felder = [...document.querySelectorAll('[data-feld]')].map(el => {
    const s = el.closest('.seite');
    const r = el.getBoundingClientRect(), p = s.getBoundingClientRect();
    const pt = v => Math.round(v * 0.75 * 100) / 100; // CSS-px (96 dpi) -> pt
    return { feld: el.dataset.feld, wert: el.dataset.wert || null, seite: seiten.indexOf(s),
             rect: [pt(r.left - p.left), pt(r.top - p.top), pt(r.right - p.left), pt(r.bottom - p.top)] };
  });
  // Überlauf prüfen: Inhalt darf die Seite nicht überschreiten
  const ueberlauf = seiten.map((s, i) => s.scrollHeight > s.clientHeight + 1 ? i + 1 : 0).filter(Boolean);
  const schrift = document.fonts.check('10pt EbrimaPDF');
  return { felder, ueberlauf, schrift, seiten: seiten.length };
});
if (messung.ueberlauf.length) console.warn('ACHTUNG Überlauf auf Seite', messung.ueberlauf.join(', '));
if (!messung.schrift) console.warn('ACHTUNG Ebrima nicht geladen');

await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
writeFileSync(json, JSON.stringify(messung.felder, null, 1));
console.log(`${messung.seiten} Seiten, ${messung.felder.length} Felder gemessen`);
await browser.close();
