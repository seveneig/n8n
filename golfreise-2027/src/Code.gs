/**
 * Ziischtigsclub Golf Augwil — 10 Jahre Jubiläumsreise
 * Andalusien, 3.–7. März 2027
 *
 * Google-Apps-Script-Backend für die Anmeldeseite.
 * Speichert alle Anmeldungen im Tabellenblatt "Anmeldungen"
 * der Google-Tabelle, zu der dieses Skript gehört.
 *
 * Einrichtung: siehe README.md (Abschnitt "Veröffentlichen").
 */

/* ============================================================
   Einstellungen
   ============================================================ */
var SHEET_NAME       = 'Anmeldungen';
var ADMIN_PASSWORD   = 'Augwil2027';   // <-- Passwort für den Organisator-Bereich
var MAX_PARTICIPANTS = 20;             // nur informativ; die Anzeige rechnet im Browser
var HEADERS = ['Referenz', 'Eingegangen', 'Vorname', 'Name', 'Telefon', 'E-Mail', 'ID'];

/* ============================================================
   Auslieferung der Seite
   ============================================================ */
function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  t.siteUrl = getWebAppUrl_();
  return t.evaluate()
    .setTitle('Ziischtigsclub · Andalusien 2027')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getWebAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (err) {
    return '';
  }
}

/* ============================================================
   Tabellenzugriff
   ============================================================ */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 170);
    sh.setColumnWidth(6, 230);
  }
  return sh;
}

function toIso_(v) {
  if (v instanceof Date) return v.toISOString();
  var d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Liest alle Zeilen als Objekte (vollständig, inkl. Kontaktdaten). */
function readRows_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    if (!String(v[6] || '') && !String(v[2] || '') && !String(v[3] || '')) continue;
    out.push({
      ref:     String(v[0] || ''),
      created: toIso_(v[1]),
      first:   String(v[2] || ''),
      last:    String(v[3] || ''),
      phone:   String(v[4] || ''),
      mail:    String(v[5] || ''),
      id:      String(v[6] || ''),
      _row:    i + 2
    });
  }
  return out;
}

/** Nur die Felder, die öffentlich sichtbar sein dürfen. */
function toPublic_(rows) {
  return rows.map(function (r) {
    return { id: r.id, first: r.first, last: r.last, created: r.created };
  });
}

/* ============================================================
   Öffentliche Schnittstelle (wird vom Browser aufgerufen)
   ============================================================ */

/** Öffentliche Liste: nur Vorname, Name, Zeitpunkt. */
function apiList() {
  return toPublic_(readRows_());
}

/** Vollständige Liste — nur mit korrektem Passwort. */
function apiListAdmin(pw) {
  requirePassword_(pw);
  return readRows_().map(function (r) {
    return {
      id: r.id, ref: r.ref, created: r.created,
      first: r.first, last: r.last, phone: r.phone, mail: r.mail
    };
  });
}

/** Neue Anmeldung speichern. */
function apiAdd(entry) {
  if (!entry) throw new Error('Keine Daten erhalten.');
  var first = String(entry.first || '').trim();
  var last  = String(entry.last  || '').trim();
  var phone = String(entry.phone || '').trim();
  var mail  = String(entry.mail  || '').trim();

  if (!first || !last) throw new Error('Vorname und Name sind Pflichtfelder.');
  if (phone.replace(/[^0-9]/g, '').length < 9) throw new Error('Bitte eine gültige Telefonnummer angeben.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) throw new Error('Bitte eine gültige E-Mail-Adresse angeben.');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var rows = readRows_();
    var key = mail.toLowerCase();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].mail || '').trim().toLowerCase() === key) {
        throw new Error('Diese E-Mail-Adresse ist bereits eingetragen.');
      }
    }
    var sh = getSheet_();
    sh.appendRow([
      String(entry.ref || ''),
      new Date(),
      first,
      last,
      "'" + phone,          // führendes Hochkomma: erzwingt Text (führende Null bleibt)
      mail,
      String(entry.id || ('x' + Date.now()))
    ]);
    SpreadsheetApp.flush();
    return { rows: toPublic_(readRows_()) };
  } finally {
    lock.releaseLock();
  }
}

/** Eintrag löschen — nur mit korrektem Passwort. */
function apiRemove(id, pw) {
  requirePassword_(pw);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var rows = readRows_();
    var target = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === String(id)) { target = rows[i]; break; }
    }
    if (!target) throw new Error('Eintrag nicht gefunden (evtl. schon gelöscht).');
    getSheet_().deleteRow(target._row);
    SpreadsheetApp.flush();
    return {
      rows: readRows_().map(function (r) {
        return {
          id: r.id, ref: r.ref, created: r.created,
          first: r.first, last: r.last, phone: r.phone, mail: r.mail
        };
      })
    };
  } finally {
    lock.releaseLock();
  }
}

/** Passwortprüfung für den Organisator-Bereich. */
function apiCheckPw(pw) {
  return String(pw) === ADMIN_PASSWORD;
}

function requirePassword_(pw) {
  if (String(pw) !== ADMIN_PASSWORD) throw new Error('Nicht berechtigt.');
}
