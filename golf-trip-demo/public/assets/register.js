/* Einfaches Anmeldeformular: Validierung + Absenden an den Server */
(function () {
  var form = document.getElementById('form');
  var btnSubmit = document.getElementById('btnSubmit');
  var REQUIRED = ['firstName', 'lastName', 'street', 'zip', 'city'];

  function markError(el, show) {
    var field = el.closest('.field');
    if (!field) return;
    var msg = field.querySelector('.err-msg');
    if (el.type === 'checkbox') { if (msg) msg.classList.toggle('show', show); }
    else { el.classList.toggle('invalid', show); if (msg) msg.classList.toggle('show', show); }
  }

  function validate() {
    var ok = true;
    REQUIRED.forEach(function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      var good = (el.value || '').trim().length > 0;
      markError(el, !good);
      if (!good) ok = false;
    });
    var c = form.querySelector('[name=consent]');
    markError(c, !c.checked);
    if (!c.checked) ok = false;
    return ok;
  }

  function shake(el) {
    el.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }
    ], { duration: 260, easing: 'ease-in-out' });
  }

  form.addEventListener('input', function (e) { markError(e.target, false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) { shake(btnSubmit); return; }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });
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
        form.classList.add('hidden');
        var s = document.getElementById('success');
        s.classList.remove('hidden');
        document.getElementById('okName').textContent = data.firstName || '';
        document.getElementById('okRef').textContent = res.body.reference;
      })
      .catch(function (err) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Verbindlich anmelden';
        alert('Es ist ein Fehler aufgetreten: ' + err.message + '\nBitte erneut versuchen.');
      });
  });
})();
