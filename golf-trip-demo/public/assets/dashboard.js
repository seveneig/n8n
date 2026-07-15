/* Dashboard: öffentliche Ansicht + passwortgeschützter Admin-Modus mit Löschen */
(function () {
  var CAPACITY = 20;
  var wantAdmin = (location.pathname.replace(/\/$/, '') === '/admin');
  var adminMode = false;

  var all = [];
  var seenIds = {};
  var rowsEl = document.getElementById('rows');
  var emptyEl = document.getElementById('empty');
  var searchEl = document.getElementById('search');
  var dashView = document.body;
  var lockEl = document.getElementById('adminLock');
  var bodyEl = document.getElementById('dashBody');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    return d.toLocaleString('de-CH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function storedPw() { try { return sessionStorage.getItem('golfAdminPw') || ''; } catch (e) { return ''; } }

  // ---------- Kopf / Modus ----------
  function setHeader(locked) {
    var h1 = document.getElementById('dashH1'), sub = document.getElementById('dashSub'), badge = document.getElementById('roleBadge');
    if (adminMode) {
      h1.firstChild.textContent = 'Organisator-Dashboard';
      badge.textContent = 'Admin · Löschen möglich'; badge.className = 'role-badge role-admin';
      sub.textContent = 'Seniorenreise 2027 · Öschberghof · 5.–9. Juni 2027 · alle Anmeldungen';
    } else {
      h1.firstChild.textContent = 'Anmeldungen';
      badge.textContent = locked ? 'Gesperrt' : 'Ansicht'; badge.className = 'role-badge role-public';
      sub.textContent = 'Seniorenreise 2027 · Öschberghof · 5.–9. Juni 2027';
    }
  }
  function showLock() {
    adminMode = false;
    dashView.classList.remove('admin-mode');
    lockEl.classList.remove('hidden');
    bodyEl.classList.add('hidden');
    document.getElementById('pwErr').classList.remove('show');
    setHeader(true);
    setTimeout(function () { document.getElementById('pwInput').focus(); }, 60);
  }
  function enterAdmin() {
    adminMode = true;
    lockEl.classList.add('hidden');
    bodyEl.classList.remove('hidden');
    dashView.classList.add('admin-mode');
    setHeader(false);
    load();
  }
  function enterPublic() {
    adminMode = false;
    lockEl.classList.add('hidden');
    bodyEl.classList.remove('hidden');
    dashView.classList.remove('admin-mode');
    setHeader(false);
    load();
  }

  function tryUnlock() {
    var v = document.getElementById('pwInput').value.trim();
    fetch('/api/admin/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pw: v }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          try { sessionStorage.setItem('golfAdminPw', v); } catch (e) {}
          enterAdmin();
        } else { pwFail(); }
      })
      .catch(pwFail);
  }
  function pwFail() {
    var err = document.getElementById('pwErr'); err.classList.add('show');
    var inp = document.getElementById('pwInput'); inp.classList.add('invalid');
    inp.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260, easing: 'ease-in-out' });
    inp.value = ''; inp.focus();
    setTimeout(function () { inp.classList.remove('invalid'); }, 800);
  }
  if (document.getElementById('pwBtn')) {
    document.getElementById('pwBtn').addEventListener('click', tryUnlock);
    document.getElementById('pwInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
    document.getElementById('btnLock').addEventListener('click', function () {
      try { sessionStorage.removeItem('golfAdminPw'); } catch (e) {}
      location.href = '/dashboard';
    });
  }

  // ---------- Render ----------
  function animateNumber(el, target) {
    var start = 0, dur = 600, t0 = null;
    function tick(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * e); if (p < 1) requestAnimationFrame(tick); else el.textContent = target; }
    requestAnimationFrame(tick);
  }
  function renderStats() {
    var confirmed = Math.min(all.length, CAPACITY);
    animateNumber(document.getElementById('stTotal'), confirmed);
    document.getElementById('stWait').textContent = Math.max(0, all.length - CAPACITY);
    document.getElementById('stBar').style.width = Math.min(100, (confirmed / CAPACITY) * 100) + '%';
  }
  function matches(r) {
    var q = searchEl.value.trim().toLowerCase();
    if (!q) return true;
    return [r.firstName, r.lastName, r.city, r.zip, r.street, r.email].join(' ').toLowerCase().indexOf(q) !== -1;
  }
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
  function renderRows() {
    if (!all.length) { emptyEl.classList.remove('hidden'); rowsEl.innerHTML = ''; return; }
    emptyEl.classList.add('hidden');
    var pos = {};
    all.forEach(function (r, i) { pos[r.id] = i + 1; });
    var q = searchEl.value.trim().toLowerCase();
    var list = all.filter(matches);
    var html = '', dividerDone = false;
    list.forEach(function (r) {
      var p = pos[r.id], wait = p > CAPACITY;
      if (!q && wait && !dividerDone) { html += '<tr class="divider"><td colspan="8">Warteliste — rückt bei Absagen automatisch nach</td></tr>'; dividerDone = true; }
      var isNew = !seenIds[r.id]; seenIds[r.id] = true;
      html += '<tr data-id="' + esc(r.id) + '" class="' + (isNew ? 'row-enter ' : '') + (wait ? 'wl' : '') + '">' +
        '<td class="idx">' + p + '</td>' +
        '<td><span class="person">' + esc(r.firstName) + ' ' + esc(r.lastName) + '<small>' + esc(r.email || '') + '</small></span></td>' +
        '<td>' + esc(r.street || '–') + '</td>' +
        '<td>' + esc(r.zip || '–') + '</td>' +
        '<td>' + esc(r.city || '–') + '</td>' +
        '<td>' + fmtDate(r.createdAt) + '</td>' +
        '<td>' + (wait ? '<span class="pill pill-wait">Warteliste</span>' : '<span class="pill pill-ok">Angemeldet</span>') + '</td>' +
        '<td class="col-admin"><button class="del" data-del="' + esc(r.id) + '" title="Eintrag löschen" aria-label="Eintrag löschen">' + TRASH + '</button></td>' +
        '</tr>';
    });
    rowsEl.innerHTML = html;
  }

  // Eigenes Bestätigungsfenster + Toast (statt window.confirm/alert)
  function askConfirm(msg, onYes) {
    var m = document.getElementById('confirmModal');
    document.getElementById('confirmMsg').textContent = msg;
    m.hidden = false;
    var yes = document.getElementById('confirmYes'), no = document.getElementById('confirmNo');
    function close() { m.hidden = true; yes.onclick = null; no.onclick = null; m.onclick = null; }
    yes.onclick = function () { close(); onYes(); };
    no.onclick = function () { close(); };
    m.onclick = function (e) { if (e.target === m) close(); };
  }
  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function deleteEntry(id) {
    var rec = all.filter(function (x) { return x.id === id; })[0];
    if (!rec) return;
    askConfirm('„' + rec.firstName + ' ' + rec.lastName + '“ wird dauerhaft aus der Liste entfernt.', function () {
      fetch('/api/registrations/' + encodeURIComponent(id) + '?pw=' + encodeURIComponent(storedPw()), { method: 'DELETE' })
        .then(function (r) {
          if (r.status === 401) { toast('Nicht autorisiert – bitte erneut als Organisator anmelden.'); showLock(); return; }
          delete seenIds[id]; closeDrawer(); load(); toast('Anmeldung gelöscht.');
        })
        .catch(function () { toast('Löschen fehlgeschlagen. Bitte erneut versuchen.'); });
    });
  }

  // ---------- Drawer ----------
  var drawer = document.getElementById('drawer'), overlay = document.getElementById('overlay');
  function openDrawer(r) {
    document.getElementById('dRef').textContent = 'Referenz ' + (r.reference || r.id);
    document.getElementById('dName').textContent = r.firstName + ' ' + r.lastName;
    var rows = [['Vorname', r.firstName], ['Name', r.lastName], ['E-Mail', r.email], ['Telefon', r.phone], ['Strasse und Nr.', r.street], ['PLZ', r.zip], ['Ort', r.city], ['Anmeldung', r.consent ? 'verbindlich bestätigt' : '–'], ['Eingegangen', fmtDate(r.createdAt)]];
    document.getElementById('dList').innerHTML = rows.filter(function (x) { return x[1] != null && x[1] !== ''; }).map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('');
    var foot = document.getElementById('drawerFoot');
    foot.classList.toggle('hidden', !adminMode);
    document.getElementById('drawerDel').onclick = function () { deleteEntry(r.id); };
    drawer.classList.add('show'); overlay.classList.add('show');
  }
  function closeDrawer() { drawer.classList.remove('show'); overlay.classList.remove('show'); }

  rowsEl.addEventListener('click', function (e) {
    var del = e.target.closest('.del');
    if (del) { e.stopPropagation(); deleteEntry(del.getAttribute('data-del')); return; }
    var tr = e.target.closest('tr'); if (!tr) return;
    var r = all.filter(function (x) { return x.id === tr.dataset.id; })[0]; if (r) openDrawer(r);
  });
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  searchEl.addEventListener('input', renderRows);
  document.getElementById('btnExport').addEventListener('click', function () { window.location.href = '/api/registrations.csv'; });

  // ---------- Daten laden ----------
  function load() {
    fetch('/api/registrations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
        all = data;
        renderStats();
        renderRows();
      })
      .catch(function () { /* im Demo-Betrieb ignorieren */ });
  }

  // ---------- Start ----------
  if (wantAdmin) {
    if (storedPw()) { enterAdmin(); }
    else { showLock(); }
  } else {
    enterPublic();
  }
  setInterval(function () { if (!adminMode || storedPw()) load(); }, 5000);
})();
