/**
 * Seniorenreise 2027 · Öschberghof – Anmeldungen in einer Google-Tabelle
 * ---------------------------------------------------------------------
 * Diese Apps-Script-Web-App liefert die Anmeldeseite UND speichert jede
 * Anmeldung als Zeile im Tabellenblatt "Anmeldungen" der verknüpften Tabelle.
 *
 * Einrichtung: siehe ANLEITUNG.md
 */

var SHEET_NAME = 'Anmeldungen';
var ADMIN_PW = '2512'; // Passwort für das Organisator-Dashboard (hier änderbar)
var HEADERS = ['Referenz', 'Eingegangen', 'Vorname', 'Name', 'E-Mail', 'Telefon', 'Strasse', 'PLZ', 'Ort', 'ID'];

// ---- Seite ausliefern -------------------------------------------------------
function doGet(e) {
  var page = (e && e.parameter && e.parameter.p) ? String(e.parameter.p) : '';
  var t = HtmlService.createTemplateFromFile('Index');
  t.initialPage = JSON.stringify(page);
  t.appUrl = JSON.stringify(getAppUrl_());
  return t.evaluate()
    .setTitle('Seniorenreise 2027 · Öschberghof · Anmeldung')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getAppUrl_() {
  try { return ScriptApp.getService().getUrl() || ''; } catch (err) { return ''; }
}

// ---- Tabelle ----------------------------------------------------------------
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); }
  return sh;
}

function clean_(v) { return (v == null ? '' : String(v)).slice(0, 300); }

function makeRef_() {
  var h = '0123456789ABCDEF', s = '';
  for (var i = 0; i < 4; i++) s += h.charAt(Math.floor(Math.random() * 16));
  return 'OB27-' + s;
}

// ---- API (vom Browser über google.script.run aufgerufen) --------------------
function addRegistration(data) {
  data = data || {};
  var sh = getSheet_();
  var ref = makeRef_();
  var id = 'id-' + new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) { /* weiter ohne Lock */ }
  try {
    sh.appendRow([
      ref, new Date(),
      clean_(data.firstName), clean_(data.lastName),
      clean_(data.email), clean_(data.phone),
      clean_(data.street), clean_(data.zip), clean_(data.city),
      id
    ]);
  } finally { try { lock.releaseLock(); } catch (e) {} }
  return { ok: true, reference: ref, id: id };
}

function getRegistrations() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    if (!r[9]) continue; // Zeilen ohne ID überspringen
    var created = '';
    if (r[1]) { try { created = new Date(r[1]).toISOString(); } catch (e) { created = ''; } }
    out.push({
      reference: r[0], createdAt: created,
      firstName: r[2], lastName: r[3], email: r[4], phone: r[5],
      street: r[6], zip: r[7], city: r[8], id: r[9]
    });
  }
  return out;
}

function checkPassword(pw) {
  return { ok: String(pw) === ADMIN_PW };
}

function deleteRegistration(id, pw) {
  if (String(pw) !== ADMIN_PW) return { ok: false, error: 'unauthorized' };
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return { ok: false, error: 'notfound' };
  var ids = sh.getRange(2, HEADERS.length, last - 1, 1).getValues(); // Spalte ID
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sh.deleteRow(i + 2);
      return { ok: true };
    }
  }
  return { ok: false, error: 'notfound' };
}
