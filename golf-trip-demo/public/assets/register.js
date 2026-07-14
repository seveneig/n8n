/* Mehrstufiges Anmeldeformular: Navigation, Validierung, Absenden */
(function () {
  var form = document.getElementById('form');
  var panes = Array.prototype.slice.call(document.querySelectorAll('[data-pane]'));
  var labels = Array.prototype.slice.call(document.querySelectorAll('.progress-labels span'));
  var bar = document.getElementById('bar');
  var btnBack = document.getElementById('btnBack');
  var btnNext = document.getElementById('btnNext');
  var btnSubmit = document.getElementById('btnSubmit');
  var total = panes.length;
  var current = 1;

  // Zimmerpartner-Feld nur bei Doppelzimmer zeigen
  form.addEventListener('change', function (e) {
    if (e.target.name === 'room') {
      document.getElementById('roommateField').style.display =
        e.target.value === 'Doppelzimmer' ? 'block' : 'none';
    }
  });

  function showPane(n) {
    panes.forEach(function (p) {
      p.classList.toggle('hidden', Number(p.dataset.pane) !== n);
    });
    // Fortschritt
    bar.style.width = (n / total * 100) + '%';
    labels.forEach(function (l) {
      var s = Number(l.dataset.step);
      l.classList.toggle('active', s === n);
      l.classList.toggle('done', s < n);
    });
    // Buttons
    btnBack.classList.toggle('hidden', n === 1);
    btnNext.classList.toggle('hidden', n === total);
    btnSubmit.classList.toggle('hidden', n !== total);
    // Nach oben scrollen (sanft)
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fieldsIn(paneEl) {
    return Array.prototype.slice.call(paneEl.querySelectorAll('input, select, textarea'));
  }

  function markError(el, show) {
    var field = el.closest('.field');
    if (!field) return;
    var msg = field.querySelector('.err-msg');
    if (el.type === 'radio' || el.type === 'checkbox') {
      // Fehler auf Gruppen-/Feldebene
      if (msg) msg.classList.toggle('show', show);
    } else {
      el.classList.toggle('invalid', show);
      if (msg && msg.textContent.trim()) msg.classList.toggle('show', show);
    }
  }

  function validatePane(n) {
    var pane = panes[n - 1];
    var ok = true;
    var seenRadio = {};
    fieldsIn(pane).forEach(function (el) {
      if (!el.required) return;

      if (el.type === 'radio') {
        if (seenRadio[el.name]) return;
        seenRadio[el.name] = true;
        var checked = form.querySelector('input[name="' + el.name + '"]:checked');
        var good = !!checked;
        markError(el, !good);
        if (!good) ok = false;
        return;
      }
      if (el.type === 'checkbox') {
        markError(el, !el.checked);
        if (!el.checked) ok = false;
        return;
      }
      var val = (el.value || '').trim();
      var good = val.length > 0;
      if (good && el.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (good && el.name === 'handicap') {
        var h = parseFloat(val); good = !isNaN(h) && h >= -5 && h <= 54;
      }
      markError(el, !good);
      if (!good) ok = false;
    });
    return ok;
  }

  // Fehler ausblenden, sobald korrigiert wird
  form.addEventListener('input', function (e) { markError(e.target, false); });

  btnNext.addEventListener('click', function () {
    if (!validatePane(current)) { shake(btnNext); return; }
    if (current < total) { current++; showPane(current); }
  });
  btnBack.addEventListener('click', function () {
    if (current > 1) { current--; showPane(current); }
  });

  function shake(el) {
    el.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }
    ], { duration: 260, easing: 'ease-in-out' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validatePane(current)) { shake(btnSubmit); return; }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.consent = !!form.querySelector('[name=consent]').checked;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Wird gesendet …';

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body && res.body.error || 'Fehler');
        document.getElementById('progressWrap').classList.add('hidden');
        form.classList.add('hidden');
        var s = document.getElementById('success');
        s.classList.remove('hidden');
        document.getElementById('okName').textContent = data.firstName ? data.firstName : '';
        document.getElementById('okRef').textContent = res.body.reference;
      })
      .catch(function (err) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Anmeldung absenden';
        alert('Es ist ein Fehler aufgetreten: ' + err.message + '\nBitte erneut versuchen.');
      });
  });

  showPane(1);
})();
