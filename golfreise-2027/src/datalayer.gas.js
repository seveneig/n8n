/* ------------------------------------------------------------
   Datenschicht: Google Apps Script + Google-Tabelle
   Alle Anmeldungen landen zentral im Tabellenblatt "Anmeldungen".
   Das Passwort wird ausschliesslich serverseitig (Code.gs) geprüft.
   ------------------------------------------------------------ */
var SITE_URL_RAW = '<?!= siteUrl ?>';
var IN_APPS_SCRIPT = true;

function _gcall(fn, args){
  return new Promise(function(resolve, reject){
    var runner = google.script.run
      .withSuccessHandler(function(v){ resolve(v); })
      .withFailureHandler(function(err){
        reject(new Error(err && err.message ? err.message : 'Serverfehler'));
      });
    runner[fn].apply(runner, args || []);
  });
}

var DB = {
  list:      function(){          return _gcall('apiList'); },
  listAdmin: function(pw){        return _gcall('apiListAdmin', [pw]); },
  add:       function(entry){     return _gcall('apiAdd', [entry]); },
  remove:    function(id, pw){    return _gcall('apiRemove', [id, pw]); },
  checkPw:   function(pw){        return _gcall('apiCheckPw', [pw]); }
};
