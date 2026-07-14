/* Dashboard: laden, rendern, filtern, Detailansicht, CSV, Auto-Refresh */
(function () {
  var CAPACITY = 32;
  var PRICES = { 'Standard': 1290, 'Premium': 1790, 'Nur Turnier': 490 };

  var all = [];
  var seenIds = {};
  var rowsEl = document.getElementById('rows');
  var emptyEl = document.getElementById('empty');
  var searchEl = document.getElementById('search');
  var filterEl = document.getElementById('filterPkg');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    return d.toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function pkgPill(p) {
    var cls = p === 'Premium' ? 'pill-premium' : (p === 'Nur Turnier' ? 'pill-turnier' : 'pill-standard');
    return '<span class="pill ' + cls + '">' + esc(p || '–') + '</span>';
  }

  function animateNumber(el, target, suffix) {
    suffix = suffix || '';
    var start = 0, dur = 600, t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  function renderStats() {
    animateNumber(document.getElementById('stTotal'), all.length);
    document.getElementById('stCapacity').textContent = 'von ' + CAPACITY + ' Plätzen';

    var hcps = all.map(function (r) { return parseFloat(r.handicap); }).filter(function (n) { return !isNaN(n); });
    var avg = hcps.length ? (hcps.reduce(function (a, b) { return a + b; }, 0) / hcps.length) : null;
    document.getElementById('stHcp').textContent = avg == null ? '–' : avg.toFixed(1);

    var rentals = all.filter(function (r) { return r.rentalClubs === 'Ja'; }).length;
    document.getElementById('stRentals').textContent = rentals;

    var revenue = all.reduce(function (a, r) { return a + (PRICES[r.package] || 0); }, 0);
    animateNumber(document.getElementById('stRevenue'), revenue, ' €');

    // Sparkline: Anmeldungen pro Tag (letzte 7 mit Daten)
    renderSpark();
  }

  function renderSpark() {
    var buckets = {};
    all.forEach(function (r) {
      var d = new Date(r.createdAt);
      if (isNaN(d)) return;
      var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      buckets[key] = (buckets[key] || 0) + 1;
    });
    var vals = Object.keys(buckets).sort().slice(-10).map(function (k) { return buckets[k]; });
    if (!vals.length) vals = [0];
    var max = Math.max.apply(null, vals) || 1;
    var spark = document.getElementById('spark');
    spark.innerHTML = vals.map(function (v) {
      return '<i style="height:' + Math.max(8, (v / max) * 26) + 'px"></i>';
    }).join('');
  }

  function matches(r) {
    var q = searchEl.value.trim().toLowerCase();
    var pkg = filterEl.value;
    if (pkg && r.package !== pkg) return false;
    if (!q) return true;
    var hay = [r.firstName, r.lastName, r.email, r.homeClub, r.package].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderRows() {
    var list = all.filter(matches);
    if (!all.length) {
      emptyEl.classList.remove('hidden');
      rowsEl.innerHTML = '';
      return;
    }
    emptyEl.classList.add('hidden');

    rowsEl.innerHTML = list.map(function (r) {
      var isNew = !seenIds[r.id];
      seenIds[r.id] = true;
      return '<tr data-id="' + esc(r.id) + '" class="' + (isNew ? 'row-enter' : '') + '">' +
        '<td><span class="person">' + esc(r.firstName) + ' ' + esc(r.lastName) +
          '<small>' + esc(r.email) + '</small></span></td>' +
        '<td>' + esc(r.homeClub || '–') + '</td>' +
        '<td>' + esc(r.handicap != null && r.handicap !== '' ? r.handicap : '–') + '</td>' +
        '<td>' + pkgPill(r.package) + '</td>' +
        '<td>' + esc(r.room || '–') + '</td>' +
        '<td>' + (r.rentalClubs === 'Ja' ? '<span class="tag-yes">Ja</span>' : '<span class="tag-no">Nein</span>') + '</td>' +
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
      ['E-Mail', r.email], ['Telefon', r.phone], ['Geburtsdatum', r.birthdate],
      ['Heimatclub', r.homeClub], ['Handicap', r.handicap], ['DGV-Ausweis', r.dgvId],
      ['Schlaghand', r.handedness], ['Leihschläger', r.rentalClubs], ['Fortbewegung', r.cart],
      ['Paket', r.package], ['Zimmer', r.room], ['Zimmerpartner', r.roommate],
      ['Anreise', r.travel], ['Ernährung', r.diet],
      ['Notfallkontakt', [r.emergencyName, r.emergencyPhone].filter(Boolean).join(' · ')],
      ['Eingegangen', fmtDate(r.createdAt)]
    ];
    var html = rows.filter(function (x) { return x[1] != null && x[1] !== ''; })
      .map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('');
    if (r.notes) html += '<dt class="full">Anmerkungen</dt><dd class="full">' + esc(r.notes) + '</dd>';
    document.getElementById('dList').innerHTML = html;
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
  function load(initial) {
    fetch('/api/registrations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // Neueste zuerst
        data.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        var changed = data.length !== all.length;
        all = data;
        renderStats();
        renderRows();
      })
      .catch(function () { /* still im Demo-Betrieb */ });
  }

  searchEl.addEventListener('input', renderRows);
  filterEl.addEventListener('change', renderRows);

  // CSV-Export
  document.getElementById('btnExport').addEventListener('click', function () {
    window.location.href = '/api/registrations.csv';
  });

  // Demo-Daten
  function seed() {
    var btn = document.getElementById('btnSeed');
    btn.disabled = true; btn.textContent = 'Erzeuge …';
    fetch('/api/seed', { method: 'POST' })
      .then(function () { seenIds = {}; return load(); })
      .finally(function () { btn.disabled = false; btn.textContent = '✨ Demo-Daten'; });
  }
  document.getElementById('btnSeed').addEventListener('click', seed);
  document.getElementById('seedLink').addEventListener('click', function (e) { e.preventDefault(); seed(); });

  load(true);
  setInterval(load, 5000); // Auto-Refresh alle 5s
})();
