'use strict';
/**
 * Golfreise-Anmeldung – Demo-Server
 * Reines Node.js (http) + qrcode. Speichert Anmeldungen in data/registrations.json.
 *
 * Start:  npm install && npm start
 * Env:    PORT (Standard 3000), PUBLIC_URL (für QR-Code, z. B. https://demo.example.com)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'registrations.json');

// ---------- Speicher-Helfer ----------
function ensureStore() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}
function readAll() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || []; }
  catch (e) { return []; }
}
function writeAll(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// ---------- Feld-Whitelist (nur Erwartetes speichern) ----------
const FIELDS = ['firstName', 'lastName', 'street', 'zip', 'city', 'consent'];
const REQUIRED = ['firstName', 'lastName', 'street', 'zip', 'city'];

function sanitize(body) {
  const out = {};
  FIELDS.forEach((f) => {
    let v = body[f];
    if (typeof v === 'string') v = v.trim().slice(0, 500);
    if (v !== undefined) out[f] = v;
  });
  return out;
}
function validate(rec) {
  const errors = [];
  REQUIRED.forEach((f) => { if (!rec[f]) errors.push(f); });
  if (!rec.consent) errors.push('consent');
  return errors;
}

function makeReference() {
  // z. B. OB27-7F3A
  return 'OB27-' + crypto.randomBytes(2).toString('hex').toUpperCase();
}

// ---------- HTTP-Helfer ----------
function sendJson(res, status, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(s);
}
function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': (types[ext] || 'application/octet-stream') + '; charset=utf-8' });
    res.end(data);
  });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function baseUrl(req) {
  if (PUBLIC_URL) return PUBLIC_URL.replace(/\/$/, '');
  const host = req.headers.host || ('localhost:' + PORT);
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return proto + '://' + host;
}

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// ---------- Demo-Daten ----------
const SEED = [
  { firstName: 'Hans', lastName: 'Meier', street: 'Dorfstrasse 12', zip: '8155', city: 'Nassenwil' },
  { firstName: 'Ruth', lastName: 'Baumann', street: 'Seeweg 4', zip: '8620', city: 'Wetzikon' },
  { firstName: 'Peter', lastName: 'Steiner', street: 'Bahnhofstrasse 8', zip: '5000', city: 'Aarau' },
  { firstName: 'Verena', lastName: 'Widmer', street: 'Rebbergstrasse 21', zip: '8134', city: 'Adliswil' },
  { firstName: 'Walter', lastName: 'Frei', street: 'Lindenweg 6', zip: '8964', city: 'Rudolfstetten' },
  { firstName: 'Margrit', lastName: 'Huber', street: 'Kirchgasse 3', zip: '8907', city: 'Wettswil' },
  { firstName: 'Kurt', lastName: 'Brunner', street: 'Sonnhaldenstrasse 17', zip: '8600', city: 'Dübendorf' }
];

function seedData() {
  const list = readAll();
  const now = Date.now();
  SEED.forEach((s, i) => {
    list.push(Object.assign({
      id: crypto.randomUUID(),
      reference: makeReference(),
      consent: true,
      createdAt: new Date(now - (SEED.length - i) * 3600 * 1000 * 30).toISOString()
    }, s));
  });
  writeAll(list);
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  try {
    // --- API ---
    if (p === '/api/register' && req.method === 'POST') {
      const raw = await readBody(req);
      let body;
      try { body = JSON.parse(raw || '{}'); } catch (e) { return sendJson(res, 400, { error: 'Ungültige Daten' }); }
      const rec = sanitize(body);
      const errors = validate(rec);
      if (errors.length) return sendJson(res, 422, { error: 'Pflichtfelder fehlen', fields: errors });

      rec.id = crypto.randomUUID();
      rec.reference = makeReference();
      rec.createdAt = new Date().toISOString();
      const list = readAll();
      list.push(rec);
      writeAll(list);
      return sendJson(res, 201, { ok: true, reference: rec.reference, id: rec.id });
    }

    if (p === '/api/registrations' && req.method === 'GET') {
      return sendJson(res, 200, readAll());
    }

    if (p === '/api/registrations.csv' && req.method === 'GET') {
      const list = readAll();
      const cols = ['reference', 'createdAt'].concat(FIELDS);
      const header = cols.join(';');
      const lines = list.map((r) => cols.map((c) => csvEscape(r[c])).join(';'));
      const csv = '﻿' + [header].concat(lines).join('\n'); // BOM für Excel
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="seniorenreise-2027-anmeldungen.csv"'
      });
      return res.end(csv);
    }

    if (p === '/api/seed' && req.method === 'POST') {
      seedData();
      return sendJson(res, 200, { ok: true });
    }

    if (p === '/api/qr.svg') {
      const target = url.searchParams.get('url') || (baseUrl(req) + '/register');
      const svg = await QRCode.toString(target, {
        type: 'svg', margin: 1, color: { dark: '#0b3927', light: '#ffffff' }
      });
      res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(svg);
    }

    // --- Seiten ---
    if (p === '/' || p === '/index.html') return sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
    if (p === '/register' || p === '/register.html') return sendFile(res, path.join(PUBLIC_DIR, 'register.html'));
    if (p === '/dashboard' || p === '/dashboard.html') return sendFile(res, path.join(PUBLIC_DIR, 'dashboard.html'));

    // --- Statische Assets (sicher innerhalb PUBLIC_DIR) ---
    const safe = path.normalize(path.join(PUBLIC_DIR, p));
    if (safe.startsWith(PUBLIC_DIR) && fs.existsSync(safe) && fs.statSync(safe).isFile()) {
      return sendFile(res, safe);
    }

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>Seite nicht gefunden. <a href="/">Zur Startseite</a></p>');
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Serverfehler' });
  }
});

ensureStore();
server.listen(PORT, () => {
  console.log('\n⛳  Golfreise-Demo läuft:');
  console.log('   Start/QR-Aushang :  http://localhost:' + PORT + '/');
  console.log('   Anmeldung        :  http://localhost:' + PORT + '/register');
  console.log('   Dashboard        :  http://localhost:' + PORT + '/dashboard');
  if (PUBLIC_URL) console.log('   QR zeigt auf     :  ' + PUBLIC_URL + '/register');
  console.log('');
});
