/* ------------------------------------------------------------
   Datenschicht: localStorage (Vorschau / einzelne HTML-Datei)
   Die Anmeldungen liegen nur im Browser des jeweiligen Geräts.
   ------------------------------------------------------------ */
var SITE_URL_RAW = (window.location.href.split('#')[0]);
var STORE_KEY = 'zc27-anmeldungen';

function _readAll(){
  try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]') || []; }
  catch (e){ return []; }
}
function _writeAll(rows){
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(rows)); }
  catch (e){ throw new Error('Speicher nicht verfügbar (Privater Modus?).'); }
}
function _public(rows){
  return rows.map(function(r){
    return { id:r.id, first:r.first, last:r.last, created:r.created };
  });
}

var DB = {
  list: function(){
    return Promise.resolve(_public(_readAll()));
  },
  listAdmin: function(pw){
    if (pw !== CONFIG.adminPassword) return Promise.reject(new Error('Nicht berechtigt.'));
    return Promise.resolve(_readAll());
  },
  add: function(entry){
    var rows = _readAll();
    var mail = String(entry.mail || '').trim().toLowerCase();
    for (var i = 0; i < rows.length; i++){
      if (String(rows[i].mail || '').trim().toLowerCase() === mail){
        return Promise.reject(new Error('Diese E-Mail-Adresse ist bereits eingetragen.'));
      }
    }
    rows.push(entry);
    _writeAll(rows);
    return Promise.resolve({ rows: _public(rows) });
  },
  remove: function(id, pw){
    if (pw !== CONFIG.adminPassword) return Promise.reject(new Error('Nicht berechtigt.'));
    var rows = _readAll().filter(function(r){ return r.id !== id; });
    _writeAll(rows);
    return Promise.resolve({ rows: rows });
  },
  checkPw: function(pw){
    return Promise.resolve(pw === CONFIG.adminPassword);
  }
};
