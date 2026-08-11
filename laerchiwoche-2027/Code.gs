/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LÄRCHI-TROPHY 2027 · Golfplanung — Google-Apps-Script-Backend
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Speichert Teilnehmer und deren Golfplatz-Auswahl in einer Google-Tabelle.
 * Die Weboberfläche liegt in der HTML-Datei, die exakt "Index" heißen muss.
 *
 * Einrichtung siehe README.md (Punkt „Veröffentlichen“).
 */

/* ─────────────────────────── EINSTELLUNGEN ─────────────────────────── */

/** Passwort für den Organisator-Bereich. Bitte ändern! */
var ADMIN_PASSWORT = 'laerchi2027';

/** Name des Tabellenblatts */
var BLATT = 'Anmeldungen';

/** Die sieben Golfplätze — Reihenfolge und IDs müssen zu Index.html passen. */
var COURSES = [
  {id:'d1', kurz:'So 18.07', name:'Wilder Kaiser Ellmau'},
  {id:'d2', kurz:'Mo 19.07', name:'Kitzbühel-Schwarzsee-Reith'},
  {id:'d3', kurz:'Di 20.07', name:'Kössen-Lärchenhof'},
  {id:'d4', kurz:'Mi 21.07', name:'Kitzbühel Kaps'},
  {id:'d5', kurz:'Do 22.07', name:'Reit im Winkl-Kössen'},
  {id:'d6', kurz:'Fr 23.07', name:'Eichenheim Kitzbühel'},
  {id:'d7', kurz:'Sa 24.07', name:'G&CC Lärchenhof'}
];

/** Spaltenüberschriften des Tabellenblatts */
function kopfzeile_(){
  return ['Referenz','Angemeldet am','Vorname','Nachname','Handicap','Heimatclub','Zugangscode','ID']
    .concat(COURSES.map(function(c){ return c.kurz + ' ' + c.name; }));
}

/* Spaltenindizes (0-basiert) */
var C_REF = 0, C_ZEIT = 1, C_VOR = 2, C_NACH = 3, C_HCP = 4, C_CLUB = 5, C_CODE = 6, C_ID = 7;
var C_SEL = 8;   /* ab hier die sieben Platz-Spalten */

/* ─────────────────────────── WEB-APP ─────────────────────────── */

function doGet(){
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Lärchi-Trophy 2027 · Golfplanung')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ─────────────────────────── TABELLE ─────────────────────────── */

function blatt_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(BLATT);
  if(!sh){
    sh = ss.insertSheet(BLATT);
  }
  var kopf = kopfzeile_();
  if(sh.getLastRow() === 0){
    sh.getRange(1, 1, 1, kopf.length).setValues([kopf]);
    sh.getRange(1, 1, 1, kopf.length)
      .setFontWeight('bold')
      .setBackground('#4a3a24')
      .setFontColor('#f6efe1');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 90);
    sh.setColumnWidth(2, 150);
  }
  return sh;
}

function alleZeilen_(){
  var sh = blatt_();
  var n = sh.getLastRow() - 1;
  if(n <= 0) return {sh: sh, rows: []};
  var breite = kopfzeile_().length;
  return {sh: sh, rows: sh.getRange(2, 1, n, breite).getValues()};
}

/** Zeile → Objekt. mitCode=false entfernt den Zugangscode (öffentliche Ansicht). */
function zuObjekt_(r, mitCode){
  var sel = {};
  COURSES.forEach(function(c, i){
    var v = String(r[C_SEL + i] || '').trim();
    sel[c.id] = (v === '9' || v === '18') ? v : '';
  });
  var o = {
    ref:        String(r[C_REF] || ''),
    created:    r[C_ZEIT] instanceof Date ? r[C_ZEIT].toISOString() : String(r[C_ZEIT] || ''),
    vorname:    String(r[C_VOR] || ''),
    nachname:   String(r[C_NACH] || ''),
    handicap:   String(r[C_HCP] || ''),
    heimatclub: String(r[C_CLUB] || ''),
    id:         String(r[C_ID] || ''),
    sel:        sel
  };
  if(mitCode) o.code = String(r[C_CODE] || '');
  return o;
}

/* ─────────────────────────── ÖFFENTLICHE API ─────────────────────────── */

/** Alle Teilnehmer inklusive Auswahl — ohne Zugangscodes. */
function apiList(){
  return alleZeilen_().rows
    .filter(function(r){ return String(r[C_ID] || ''); })
    .map(function(r){ return zuObjekt_(r, false); });
}

/** Neue Anmeldung. Erwartet {vorname, nachname, handicap, heimatclub}. */
function apiRegister(d){
  d = d || {};
  var vor  = String(d.vorname || '').trim();
  var nach = String(d.nachname || '').trim();
  var hcp  = String(d.handicap || '').trim();
  var club = String(d.heimatclub || '').trim();
  if(!vor || !nach || !hcp || !club){
    return {ok: false, error: 'Bitte alle Felder ausfüllen.'};
  }

  var lock = LockService.getScriptLock();
  try{ lock.waitLock(20000); }
  catch(e){ return {ok: false, error: 'Gerade zu viele Zugriffe – bitte nochmal versuchen.'}; }

  try{
    var a = alleZeilen_(), sh = a.sh, rows = a.rows;

    var doppelt = rows.some(function(r){
      return String(r[C_VOR]).trim().toLowerCase() === vor.toLowerCase() &&
             String(r[C_NACH]).trim().toLowerCase() === nach.toLowerCase();
    });
    if(doppelt){
      return {ok: false, error: 'Diese Person ist bereits angemeldet. Bitte mit dem Zugangscode einloggen.'};
    }

    var nr   = rows.length + 1;
    var ref  = 'LT27-' + ('00' + nr).slice(-3);
    var id   = 'p' + new Date().getTime() + Math.floor(Math.random() * 1000);
    var code = String(Math.floor(100000 + Math.random() * 900000));
    var jetzt = new Date();

    var zeile = [ref, jetzt, vor, nach, hcp, club, code, id]
      .concat(COURSES.map(function(){ return ''; }));
    sh.appendRow(zeile);

    return {ok: true, teilnehmer: {
      ref: ref, created: jetzt.toISOString(), vorname: vor, nachname: nach,
      handicap: hcp, heimatclub: club, id: id, code: code, sel: {}
    }};
  } finally {
    lock.releaseLock();
  }
}

/** Login mit ID + Zugangscode. */
function apiLogin(id, code){
  id = String(id || ''); code = String(code || '').trim();
  var treffer = alleZeilen_().rows.filter(function(r){ return String(r[C_ID]) === id; })[0];
  if(!treffer || String(treffer[C_CODE]).trim() !== code){
    return {ok: false, error: 'Zugangscode stimmt nicht.'};
  }
  return {ok: true, teilnehmer: zuObjekt_(treffer, true)};
}

/**
 * Auswahl speichern. Nur mit passendem Zugangscode — so kann niemand
 * die Eintragung einer anderen Person verändern.
 */
function apiSave(id, code, sel){
  id = String(id || ''); code = String(code || '').trim(); sel = sel || {};

  var lock = LockService.getScriptLock();
  try{ lock.waitLock(20000); }
  catch(e){ return {ok: false, error: 'Gerade zu viele Zugriffe – bitte nochmal versuchen.'}; }

  try{
    var a = alleZeilen_(), sh = a.sh, rows = a.rows, zeile = -1;
    for(var i = 0; i < rows.length; i++){
      if(String(rows[i][C_ID]) === id){ zeile = i + 2; break; }   /* +2 wegen Kopfzeile */
    }
    if(zeile < 0) return {ok: false, error: 'Teilnehmer nicht gefunden.'};
    if(String(rows[zeile - 2][C_CODE]).trim() !== code){
      return {ok: false, error: 'Nicht berechtigt – Zugangscode stimmt nicht.'};
    }

    var werte = COURSES.map(function(c){
      var v = String(sel[c.id] || '').trim();
      return (v === '9' || v === '18') ? v : '';
    });
    sh.getRange(zeile, C_SEL + 1, 1, werte.length).setValues([werte]);
    return {ok: true};
  } finally {
    lock.releaseLock();
  }
}

/* ─────────────────────────── ORGANISATOR ─────────────────────────── */

function pwOk_(pw){ return String(pw || '') === ADMIN_PASSWORT; }

/** Teilnehmerliste inklusive Zugangscodes — nur mit Passwort. */
function apiAdminList(pw){
  if(!pwOk_(pw)) return {ok: false, error: 'Passwort stimmt nicht.'};
  var list = alleZeilen_().rows
    .filter(function(r){ return String(r[C_ID] || ''); })
    .map(function(r){ return zuObjekt_(r, true); });
  return {ok: true, teilnehmer: list};
}

/** Teilnehmer löschen — nur mit Passwort. */
function apiAdminDelete(pw, id){
  if(!pwOk_(pw)) return {ok: false, error: 'Passwort stimmt nicht.'};
  id = String(id || '');

  var lock = LockService.getScriptLock();
  try{ lock.waitLock(20000); }
  catch(e){ return {ok: false, error: 'Gerade zu viele Zugriffe – bitte nochmal versuchen.'}; }

  try{
    var a = alleZeilen_(), sh = a.sh, rows = a.rows;
    for(var i = 0; i < rows.length; i++){
      if(String(rows[i][C_ID]) === id){
        sh.deleteRow(i + 2);
        return {ok: true};
      }
    }
    return {ok: false, error: 'Teilnehmer nicht gefunden.'};
  } finally {
    lock.releaseLock();
  }
}

/* ─────────────────────────── HILFE / TEST ─────────────────────────── */

/**
 * Einmal ausführen, um Tabellenblatt und Kopfzeile anzulegen
 * (passiert sonst automatisch bei der ersten Anmeldung).
 */
function setup(){
  blatt_();
  SpreadsheetApp.getActiveSpreadsheet().toast('Tabellenblatt "' + BLATT + '" ist bereit.');
}
