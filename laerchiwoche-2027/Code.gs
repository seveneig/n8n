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
var ADMIN_PASSWORT = 'banfhold15';

/** Name des Tabellenblatts */
var BLATT = 'Anmeldungen';

/** Zeitzone der Tabelle. Die Seite zeigt keine Zeiten an — die Spalte
    „Angemeldet am“ ist nur ein Vermerk in der Tabelle selbst. */
var ZEITZONE = 'Europe/Zurich';

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

  // Tabelle auf Schweizer Zeit stellen. Ohne das rechnet die Tabelle in ihrer
  // eigenen Zeitzone und das Skript in seiner — die Anmeldezeiten stimmen dann
  // nicht überein und verschieben sich je nach Sommer- oder Winterzeit anders.
  if(ss.getSpreadsheetTimeZone() !== ZEITZONE){
    ss.setSpreadsheetTimeZone(ZEITZONE);
  }

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
    spaltenFormate_(sh);
  }
  return sh;
}

/**
 * Spaltenformate setzen. Steht bewusst in einer eigenen Funktion, damit
 * `setup()` sie auch auf eine bereits bestehende Tabelle anwenden kann.
 */
function spaltenFormate_(sh){
  var zeilen = sh.getMaxRows() - 1;
  if(zeilen < 1) return;
  // „Angemeldet am“ mit Datum und Uhrzeit anzeigen
  sh.getRange(2, C_ZEIT + 1, zeilen, 1).setNumberFormat('dd.MM.yyyy HH:mm');
  // Handicap als Text führen, damit die Tabelle „5,5“ nicht in eine andere
  // Zahl oder gar ein Datum umdeutet
  sh.getRange(2, C_HCP + 1, zeilen, 1).setNumberFormat('@');
}

function alleZeilen_(){
  var sh = blatt_();
  var n = sh.getLastRow() - 1;
  if(n <= 0) return {sh: sh, rows: []};
  var breite = kopfzeile_().length;
  return {sh: sh, rows: sh.getRange(2, 1, n, breite).getValues()};
}

/**
 * Zelle → Text. Wichtig: NICHT `wert || ''` verwenden — die Zahl 0 ist in
 * JavaScript unwahr und ein Handicap von 0 würde damit verschwinden.
 */
function text_(wert){
  if(wert === null || wert === undefined) return '';
  return String(wert);
}

/**
 * Handicap aus der Zelle lesen.
 *
 * Google Tabellen deutet Eingaben wie „5.5“ oder „19.9“ als Datum um —
 * aus 5.5 wird der 5. Mai. Betroffen ist jeder Wert, dessen Nachkommastelle
 * eine gültige Monatszahl ist; „21.0“ oder „38.8“ bleiben verschont, weil es
 * keinen Monat 0 und keinen 38. Tag gibt.
 *
 * Steht in der Zelle ein Datum, rechnen wir es hier zurück: Tag und Monat
 * ergeben wieder die ursprüngliche Zahl. Neue Eintragungen sind davon nicht
 * mehr betroffen, weil die Spalte als Text formatiert wird — siehe
 * spaltenFormate_(). Für bereits bestehende Zeilen rettet diese Umrechnung
 * die Werte.
 */
function handicapText_(wert){
  if(wert instanceof Date){
    return wert.getDate() + ',' + (wert.getMonth() + 1);
  }
  return text_(wert);
}

/** Zeile → Objekt. mitCode=false entfernt den Zugangscode (öffentliche Ansicht). */
function zuObjekt_(r, mitCode){
  var sel = {};
  COURSES.forEach(function(c, i){
    var v = text_(r[C_SEL + i]).trim();
    sel[c.id] = (v === '9' || v === '18') ? v : '';
  });
  var o = {
    ref:        text_(r[C_REF]),
    vorname:    text_(r[C_VOR]),
    nachname:   text_(r[C_NACH]),
    handicap:   handicapText_(r[C_HCP]),
    heimatclub: text_(r[C_CLUB]),
    id:         text_(r[C_ID]),
    sel:        sel
  };
  if(mitCode) o.code = text_(r[C_CODE]);
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
      ref: ref, vorname: vor, nachname: nach,
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
 * Einmal ausführen, um Tabellenblatt und Kopfzeile anzulegen (passiert sonst
 * automatisch bei der ersten Anmeldung).
 *
 * Bei einer bereits bestehenden Tabelle stellt der Aufruf ausserdem die
 * Zeitzone auf Schweizer Zeit und die Spaltenformate richtig — sinnvoll, wenn
 * die Tabelle noch mit einer älteren Fassung dieses Skripts angelegt wurde.
 */
function setup(){
  var sh = blatt_();
  spaltenFormate_(sh);
  var repariert = handicapsReparieren();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Blatt "' + BLATT + '" bereit.' +
    (repariert ? ' ' + repariert + ' Handicap(s) zurückgerechnet.' : ''));
}

/**
 * Handicaps reparieren, die Google Tabellen als Datum eingelesen hat.
 *
 * Rechnet betroffene Zellen zurück (5. Mai → „5,5“) und stellt die Spalte auf
 * Text, damit es nicht wieder passiert. Kann gefahrlos mehrfach laufen —
 * unauffällige Werte werden nur unverändert zurückgeschrieben.
 * Wird von setup() aufgerufen.
 */
function handicapsReparieren(){
  var a = alleZeilen_(), sh = a.sh, rows = a.rows;
  if(!rows.length) return 0;

  var anzahl = 0;
  var werte = rows.map(function(r){
    if(r[C_HCP] instanceof Date) anzahl++;
    return [handicapText_(r[C_HCP])];
  });

  var bereich = sh.getRange(2, C_HCP + 1, rows.length, 1);
  bereich.setNumberFormat('@');      // erst Text-Format …
  bereich.setValues(werte);          // … dann die Werte schreiben
  return anzahl;
}
