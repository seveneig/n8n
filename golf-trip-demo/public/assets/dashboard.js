/* Dashboard: laden, rendern, filtern, Detailansicht, CSV, Auto-Refresh */
(function () {
  var CAPACITY = 20;
  var PRICE = 1690;
  var DEADLINE = new Date('2026-08-10T23:59:59');

  var all = [];
  var seenIds = {};
  var rowsEl = document.getElementById('rows');
  var emptyEl = document.getElementById('empty');
  var searchEl = document.getElementById('search');

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
  function chf(n) { return n.toLocaleString('de-CH'); }

  function animateNumber(el, target, fmt) {
    var start = 0, dur = 600, t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = fmt ? fmt(val) : val;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt ? fmt(target) : target;
    }
    requestAnimationFrame(tick);
  }

  function renderStats() {
    animateNumber(document.getElementById('stTotal'), all.length);
    document.getElementById('stFree').textContent = Math.max(0, CAPACITY - all.length);
    document.getElementById('stBar').style.width = Math.min(100, (all.length / CAPACITY) * 100) + '%';
    animateNumber(document.getElementById('stRevenue'), all.length * PRICE, chf);
    var days = Math.ceil((DEADLINE - new Date()) / (24 * 3600 * 1000));
    document.getElementById('stDeadline').textContent = days > 0 ? ('noch ' + days + ' Tage') : 'abgelaufen';
  }

  function matches(r) {
    var q = searchEl.value.trim().toLowerCase();
    if (!q) return true;
    return [r.firstName, r.lastName, r.city, r.zip, r.street].join(' ').toLowerCase().indexOf(q) !== -1;
  }

  function renderRows() {
    if (!all.length) { emptyEl.classList.remove('hidden'); rowsEl.innerHTML = ''; return; }
    emptyEl.classList.add('hidden');
    var pos = {};
    all.forEach(function (r, i) { pos[r.id] = i + 1; });
    var list = all.filter(matches);
    rowsEl.innerHTML = list.map(function (r) {
      var isNew = !seenIds[r.id];
      seenIds[r.id] = true;
      return '<tr data-id="' + esc(r.id) + '" class="' + (isNew ? 'row-enter' : '') + '">' +
        '<td class="idx">' + pos[r.id] + '</td>' +
        '<td><span class="person">' + esc(r.firstName) + ' ' + esc(r.lastName) + '</span></td>' +
        '<td>' + esc(r.street || '–') + '</td>' +
        '<td>' + esc(r.zip || '–') + '</td>' +
        '<td>' + esc(r.city || '–') + '</td>' +
        '<td>' + fmtDate(r.createdAt) + '</td>' +
        '</tr>';
    }).join('');
  }

  // -------- Detail-Drawer --------
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('overlay');

  function openDrawer(r) {
    document.getElementById('dRef').textContent = 'Referenz ' + (r.reference || r.id);
    document.getElementById('dName').textContent = r.firstName + ' ' + r.lastName;
    var rows = [
      ['Vorname', r.firstName], ['Name', r.lastName],
      ['Strasse und Nr.', r.street], ['PLZ', r.zip], ['Ort', r.city],
      ['Anmeldung', r.consent ? 'verbindlich bestätigt' : '–'],
      ['Eingegangen', fmtDate(r.createdAt)]
    ];
    document.getElementById('dList').innerHTML = rows
      .filter(function (x) { return x[1] != null && x[1] !== ''; })
      .map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('');
    drawer.classList.add('show'); overlay.classList.add('show');
  }
  function closeDrawer() { drawer.classList.remove('show'); overlay.classList.remove('show'); }

  rowsEl.addEventListener('click', function (e) {
    var tr = e.target.closest('tr'); if (!tr) return;
    var r = all.filter(function (x) { return x.id === tr.dataset.id; })[0];
    if (r) openDrawer(r);
  });
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  // -------- Daten laden --------
  function load() {
    fetch('/api/registrations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        data.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); }); // älteste zuerst
        all = data;
        renderStats();
        renderRows();
      })
      .catch(function () { /* im Demo-Betrieb ignorieren */ });
  }

  searchEl.addEventListener('input', renderRows);

  document.getElementById('btnExport').addEventListener('click', function () {
    window.location.href = '/api/registrations.csv';
  });

  load();
  setInterval(load, 5000);
})();
