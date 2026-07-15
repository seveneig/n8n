/* Hell-/Dunkelmodus umschalten (Standard: dunkel, gesetzt im <head>) */
(function () {
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('golfTheme', next); } catch (e) {}
    });
  });
})();
