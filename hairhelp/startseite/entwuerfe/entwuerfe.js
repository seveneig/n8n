(function () {
  "use strict";
  document.documentElement.lang = "de";

  var sanft = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  /* ---- Einzelregler (Entwürfe B, D, E) ---------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-cmp]"), function (box) {
    var regler = box.querySelector(".cmp__range");
    var setzen = function () { box.style.setProperty("--pos", regler.value + "%"); };
    regler.addEventListener("input", setzen);
    setzen();
    var ziehen = function (e) {
      var r = box.getBoundingClientRect();
      regler.value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      setzen();
    };
    box.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      box.setPointerCapture(e.pointerId);
      ziehen(e);
    });
    box.addEventListener("pointermove", function (e) {
      if (box.hasPointerCapture(e.pointerId)) ziehen(e);
    });
  });

  /* ---- Achse: ein Regler über alle Aufnahmen (Entwurf A) ----------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-axis]"), function (achse) {
    var regler = achse.querySelector(".ax__range");
    var reihe  = achse.querySelector(".ax__row");
    var stuecke = Array.prototype.slice.call(achse.querySelectorAll(".ax__item"));
    var stand  = achse.querySelector("[data-axis-state]");
    var anteil = 100 / stuecke.length;

    var setzen = function () {
      var zug = Number(regler.value);
      reihe.style.setProperty("--sweep", zug + "%");
      stuecke.forEach(function (stueck, i) {
        var p = (zug - i * anteil) / anteil;
        stueck.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
      });
      var fertig = stuecke.filter(function (s) {
        return Number(s.style.getPropertyValue("--p")) >= 0.999;
      }).length;
      stand.textContent = fertig === 0 ? "Ohne Fasern"
        : fertig === stuecke.length ? "Alle vier verdichtet"
        : fertig + " von " + stuecke.length + " verdichtet";
    };
    regler.addEventListener("input", setzen);

    var ziehen = function (e) {
      var r = reihe.getBoundingClientRect();
      regler.value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      setzen();
    };
    achse.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      achse.setPointerCapture(e.pointerId);
      ziehen(e);
    });
    achse.addEventListener("pointermove", function (e) {
      if (achse.hasPointerCapture(e.pointerId)) ziehen(e);
    });
    setzen();
  });

  /* ---- Sprungmarken sanft anfahren -------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.top__nav a'), function (a) {
    a.addEventListener("click", function (e) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (!ziel) return;
      e.preventDefault();
      ziel.scrollIntoView({ behavior: sanft, block: "start" });
    });
  });
})();
