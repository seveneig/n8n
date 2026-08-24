/* ==================================================================
   Verglichmi – Template-Renderer
   Baut die komplette Vergleichsseite aus window.VG_DATA.
   Keine Abhaengigkeiten, laeuft auch direkt per file://
   ================================================================== */
(function () {
  'use strict';

  var D = window.VG_DATA;
  if (!D) { console.error('[Verglichmi] window.VG_DATA fehlt – Datendatei vor template.js einbinden.'); return; }

  /* ---------------- Helfer ------------------------------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* Fuer redaktionelle Felder, die bewusst <strong>/<em> enthalten duerfen. */
  function rich(s) { return String(s == null ? '' : s); }

  function chf(value) {
    if (value == null) return '–';
    var whole = Math.round(value * 100) % 100 === 0;
    var int = Math.floor(value);
    var grouped = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return whole ? 'CHF ' + grouped + '.–' : 'CHF ' + grouped + '.' + String(Math.round(value * 100) % 100).padStart(2, '0');
  }

  function gradeInfo(g) {
    if (g <= 1.5) return { cls: 'g1', label: 'sehr gut' };
    if (g <= 2.5) return { cls: 'g2', label: 'gut' };
    if (g <= 3.5) return { cls: 'g3', label: 'befriedigend' };
    if (g <= 4.5) return { cls: 'g4', label: 'ausreichend' };
    return { cls: 'g5', label: 'mangelhaft' };
  }

  function gradeStr(g) { return Number(g).toFixed(1).replace('.', ','); }

  function deDate(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
  }

  function slug(s) {
    return String(s).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  var icon = {
    ext: '<svg class="vg-shop__ext" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10"/><path d="M9.5 2.5H14V7M14 2.5 7.5 9"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.2"/></svg>',
    target: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r=".6" fill="currentColor"/></svg>',
    swipe: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2.5 10h15M14 6.5 17.5 10 14 13.5M6 6.5 2.5 10 6 13.5"/></svg>',
  };

  /* ---------------- Affiliate-Links ----------------------------- */

  var AFF = D.affiliate || { shops: {}, shopOrder: [] };

  function buildOfferUrl(shopKey, offer) {
    var shop = AFF.shops[shopKey];
    if (!shop || !offer) return null;
    return String(shop.pattern)
      .replace('{sku}', encodeURIComponent(offer.sku))
      .replace('{tag}', encodeURIComponent(shop.tag));
  }

  /** Preisguenstigstes Angebot eines Produkts ermitteln. */
  function bestOfferKey(product) {
    var best = null, bestPrice = Infinity;
    (AFF.shopOrder || []).forEach(function (k) {
      var o = product.offers && product.offers[k];
      if (o && typeof o.price === 'number' && o.price < bestPrice) { bestPrice = o.price; best = k; }
    });
    return best;
  }

  /**
   * Ein Shop-Button.
   * @param {object} product
   * @param {string} shopKey
   * @param {object} [opt] {compact:boolean, showBest:boolean}
   */
  function shopButton(product, shopKey, opt) {
    opt = opt || {};
    var shop = AFF.shops[shopKey];
    var offer = product.offers && product.offers[shopKey];
    if (!shop || !offer) return '';

    var url = buildOfferUrl(shopKey, offer);
    var isBest = opt.showBest && bestOfferKey(product) === shopKey;
    var label = esc(shop.label);
    var priceTxt = typeof offer.price === 'number' ? '<span class="vg-shop__price">' + esc(chf(offer.price)) + '</span>' : '';

    return '<a class="vg-shop vg-shop--' + esc(shop.theme) + '"' +
      ' href="' + esc(url) + '"' +
      ' target="_blank" rel="sponsored nofollow noopener"' +
      ' data-vg-shop="' + esc(shopKey) + '"' +
      ' data-vg-product="' + esc(product.id) + '"' +
      ' aria-label="' + esc(product.brand + ' ' + product.model + ' bei ' + shop.label + ' ansehen (Affiliate-Link)') + '">' +
      (isBest ? '<span class="vg-shop__best">Bester Preis</span>' : '') +
      '<span>' + label + '</span>' + (opt.compact ? '' : priceTxt) + icon.ext +
      '</a>';
  }

  function shopButtons(product, opt) {
    return (AFF.shopOrder || []).map(function (k) { return shopButton(product, k, opt); }).join('');
  }

  /* ---------------- Produktbild -------------------------------- */

  /**
   * Platzhalter-Illustration. Sobald echte Bilder vorliegen, genuegt
   * product.image = 'assets/img/xy.jpg' in der Datendatei.
   */
  function productImage(p, opts) {
    opts = opts || {};
    if (p.image) {
      return '<img src="' + esc(p.image) + '" alt="' + esc(p.brand + ' ' + p.model) + '" loading="lazy" decoding="async">';
    }
    var a = p.accent || '#8a94a6';
    var id = 'g-' + esc(p.id) + (opts.suffix || '');
    return '' +
      '<svg viewBox="0 0 160 160" role="img" aria-label="' + esc(p.brand + ' ' + p.model + ' – Platzhalterbild') + '">' +
        '<defs>' +
          '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="' + esc(a) + '" stop-opacity=".95"/>' +
            '<stop offset="1" stop-color="' + esc(a) + '" stop-opacity=".55"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<g fill="none" stroke="url(#' + id + ')" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
          /* Geblaesekopf */
          '<rect x="30" y="40" width="72" height="42" rx="21"/>' +
          /* Duese */
          '<path d="M102 50h20a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4h-20"/>' +
          /* Griff */
          '<path d="M52 82v28a10 10 0 0 0 10 10h6a10 10 0 0 0 10-10V82"/>' +
          /* Kabel */
          '<path d="M65 120c0 12-16 8-16 18s14 8 22 8"/>' +
          /* Bedienelemente */
          '<path d="M60 96h10M60 104h10" stroke-width="4"/>' +
          /* Lufteinlass */
          '<path d="M40 55v12" stroke-width="4"/>' +
        '</g>' +
        '<circle cx="118" cy="61" r="3.5" fill="' + esc(a) + '"/>' +
      '</svg>';
  }

  /* ---------------- Bausteine ---------------------------------- */

  function gradeBlock(p, opts) {
    opts = opts || {};
    var gi = gradeInfo(p.grade);
    return '<div class="vg-grade vg-grade--' + gi.cls + '">' +
      '<div class="vg-grade__box" aria-hidden="true">' + esc(gradeStr(p.grade)) + '</div>' +
      (opts.bare ? '' :
        '<div class="vg-grade__meta">' +
          '<span class="vg-grade__caption">Testnote</span>' +
          '<span class="vg-grade__label">' + esc(gi.label) + '</span>' +
        '</div>') +
      '<span class="vg-sr">Testnote ' + esc(gradeStr(p.grade)) + ', ' + esc(gi.label) + '</span>' +
    '</div>';
  }

  function prosCons(p) {
    return '<div class="vg-pc">' +
      '<div class="vg-pc--pro">' +
        '<div class="vg-pc__title vg-pc__title--pro">Pro</div>' +
        '<ul>' + p.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="vg-pc--con">' +
        '<div class="vg-pc__title vg-pc__title--con">Kontra</div>' +
        '<ul>' + p.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
    '</div>';
  }

  function quickChips(p) {
    var keys = D.quickSpecs || [];
    var byKey = {};
    (D.specFields || []).forEach(function (f) { byKey[f.key] = f; });
    return '<div class="vg-chips">' + keys.map(function (k) {
      var f = byKey[k], v = p.specs && p.specs[k];
      if (!f || !v) return '';
      return '<span class="vg-chip"><span class="vg-chip__k">' + esc(f.label) + '</span>' +
             '<span class="vg-chip__v">' + esc(v) + '</span></span>';
    }).join('') + '</div>';
  }

  function priceRow(p) {
    var save = p.price && p.price.uvp && p.price.uvp > p.price.current
      ? Math.round((1 - p.price.current / p.price.uvp) * 100) : 0;
    return '<div class="vg-price">' +
      '<span class="vg-price__now">' + esc(chf(p.price.current)) + '</span>' +
      (save ? '<span class="vg-price__was">' + esc(chf(p.price.uvp)) + '</span>' +
              '<span class="vg-price__save">−' + save + '&nbsp;%</span>' : '') +
      '<span class="vg-price__note">Günstigster Preis am ' + esc(deDate(D.meta.updated)) + '</span>' +
    '</div>';
  }

  function offersBlock(p) {
    return '<div class="vg-offers">' +
      priceRow(p) +
      '<div class="vg-shops">' + shopButtons(p, { showBest: true }) + '</div>' +
      '<p class="vg-offers__legal">Preise inkl. MwSt., zzgl. Versand. Stand: ' + esc(deDate(D.meta.updated)) +
      '. Links zu Händlern sind Affiliate-Links.</p>' +
    '</div>';
  }

  /* ---------------- Produktbox (Bestenliste) -------------------- */

  function productCard(p, rank) {
    var anchor = 'test-' + slug(p.id);
    return '<article class="vg-card' + (rank === 1 ? ' vg-card--winner' : '') + '" id="box-' + esc(p.id) + '">' +
      '<header class="vg-card__top">' +
        '<span class="vg-rank">Platz <b>' + rank + '</b></span>' +
        (p.badge ? '<span class="vg-badge">' + esc(p.badge) + '</span>' : '') +
        (p.claim ? '<span class="vg-card__claim">' + esc(p.claim) + '</span>' : '') +
      '</header>' +
      '<div class="vg-card__body">' +
        '<div class="vg-card__media">' +
          '<div class="vg-card__img">' + productImage(p) + '</div>' +
          gradeBlock(p) +
        '</div>' +
        '<div class="vg-card__main">' +
          '<div class="vg-card__brand">' + esc(p.brand) + '</div>' +
          '<h3 class="vg-card__model"><a href="#' + esc(anchor) + '">' + esc(p.model) + '</a></h3>' +
          quickChips(p) +
          prosCons(p) +
          offersBlock(p) +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------------- Einzeltest --------------------------------- */

  function scoreBars(p) {
    return '<div class="vg-scores">' +
      '<div class="vg-scores__title">Einzelwertungen</div>' +
      (D.criteria || []).map(function (c) {
        var v = (p.scores && p.scores[c.key]) || 0;
        var mod = v >= 80 ? '' : (v >= 65 ? ' vg-score__fill--mid' : ' vg-score__fill--low');
        return '<div class="vg-score">' +
          '<div class="vg-score__label">' + esc(c.label) + ' <small>(' + c.weight + '&nbsp;%)</small></div>' +
          '<div class="vg-score__track"><div class="vg-score__fill' + mod + '" style="width:' + v + '%"></div></div>' +
          '<div class="vg-score__value">' + v + '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function specList(p) {
    var groups = [], seen = {};
    (D.specFields || []).forEach(function (f) {
      if (!seen[f.group]) { seen[f.group] = []; groups.push(f.group); }
      seen[f.group].push(f);
    });
    return '<dl class="vg-specs">' + groups.map(function (g) {
      return '<div class="vg-specs__group">' + esc(g) + '</div>' +
        seen[g].map(function (f) {
          return '<div class="vg-specs__row' + (f.highlight ? ' vg-specs__row--hl' : '') + '">' +
            '<dt>' + esc(f.label) + '</dt><dd>' + esc((p.specs && p.specs[f.key]) || '–') + '</dd>' +
          '</div>';
        }).join('');
    }).join('') + '</dl>';
  }

  function miniCard(p) {
    return '<div class="vg-minicard">' +
      '<div class="vg-minicard__img">' + productImage(p, { suffix: '-mini' }) + '</div>' +
      '<div>' +
        '<div class="vg-minicard__name">' + esc(p.brand + ' ' + p.model) + '</div>' +
        '<div class="vg-minicard__sub">Testnote ' + esc(gradeStr(p.grade)) + ' · ' +
          esc(gradeInfo(p.grade).label) + ' · ab ' + esc(chf(p.price.current)) + '</div>' +
      '</div>' +
      '<div class="vg-minicard__cta">' + shopButtons(p, { compact: true, showBest: true }) + '</div>' +
    '</div>';
  }

  function reviewSection(p, rank) {
    var r = p.review || {};
    var anchor = 'test-' + slug(p.id);
    return '<section class="vg-review" id="' + esc(anchor) + '">' +
      '<div class="vg-review__head">' +
        (r.kicker ? '<span class="vg-kicker">' + esc(r.kicker) + '</span>' : '') +
        '<h2>' + esc(r.headline || (p.brand + ' ' + p.model)) + '</h2>' +
        (r.verdict ? '<p class="vg-review__verdict">' + esc(r.verdict) + '</p>' : '') +
      '</div>' +
      '<div class="vg-review__body">' +
        (r.paragraphs || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('') +
      '</div>' +
      (r.imageCaption ?
        '<figure class="vg-figure">' +
          '<div class="vg-figure__frame">' + productImage(p, { suffix: '-fig' }) + '</div>' +
          '<figcaption><b>' + esc(p.brand + ' ' + p.model) + ':</b> ' + esc(r.imageCaption) +
          ' <span style="opacity:.7">(Platzhalterbild – Staging)</span></figcaption>' +
        '</figure>' : '') +
      scoreBars(p) +
      (r.bestFor ? '<p class="vg-bestfor">' + icon.target + '<span><b>Für wen?</b> ' + esc(r.bestFor) + '</span></p>' : '') +
      specList(p) +
      miniCard(p) +
    '</section>';
  }

  /* ---------------- Grosse Vergleichstabelle -------------------- */

  function comparisonTable() {
    var ps = D.products;
    var groups = [], seen = {};
    (D.specFields || []).forEach(function (f) {
      if (!seen[f.group]) { seen[f.group] = []; groups.push(f.group); }
      seen[f.group].push(f);
    });

    var head = '<thead><tr>' +
      '<th class="vg-ctable__rowhead vg-ctable__corner" scope="col">Modell</th>' +
      ps.map(function (p) {
        return '<th scope="col"><div class="vg-ctable__prod">' +
          '<span class="vg-card__brand">' + esc(p.brand) + '</span>' +
          '<strong>' + esc(p.model) + '</strong>' +
          gradeBlock(p, { bare: true }) +
        '</div></th>';
      }).join('') +
    '</tr></thead>';

    var rows = '';

    rows += '<tr class="vg-ctable__group"><th class="vg-ctable__rowhead" scope="row">Bewertung</th>' +
      ps.map(function () { return '<td></td>'; }).join('') + '</tr>';
    rows += '<tr><th class="vg-ctable__rowhead" scope="row">Platzierung</th>' +
      ps.map(function (p, i) { return '<td>Platz ' + (i + 1) + (p.badge ? ' · ' + esc(p.badge) : '') + '</td>'; }).join('') + '</tr>';
    rows += '<tr><th class="vg-ctable__rowhead" scope="row">Preis (Bestpreis)</th>' +
      ps.map(function (p) { return '<td class="vg-ctable__hl">' + esc(chf(p.price.current)) + '</td>'; }).join('') + '</tr>';

    groups.forEach(function (g) {
      rows += '<tr class="vg-ctable__group"><th class="vg-ctable__rowhead" scope="row">' + esc(g) + '</th>' +
        ps.map(function () { return '<td></td>'; }).join('') + '</tr>';
      seen[g].forEach(function (f) {
        rows += '<tr><th class="vg-ctable__rowhead" scope="row">' + esc(f.label) + '</th>' +
          ps.map(function (p) {
            return '<td' + (f.highlight ? ' class="vg-ctable__hl"' : '') + '>' +
              esc((p.specs && p.specs[f.key]) || '–') + '</td>';
          }).join('') + '</tr>';
      });
    });

    rows += '<tr class="vg-ctable__group"><th class="vg-ctable__rowhead" scope="row">Pro &amp; Kontra</th>' +
      ps.map(function () { return '<td></td>'; }).join('') + '</tr>';
    rows += '<tr><th class="vg-ctable__rowhead" scope="row">Pro</th>' +
      ps.map(function (p) {
        return '<td><ul class="vg-ctable__pc vg-ctable__pc--pro">' +
          p.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></td>';
      }).join('') + '</tr>';
    rows += '<tr><th class="vg-ctable__rowhead" scope="row">Kontra</th>' +
      ps.map(function (p) {
        return '<td><ul class="vg-ctable__pc vg-ctable__pc--con">' +
          p.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></td>';
      }).join('') + '</tr>';
    rows += '<tr><th class="vg-ctable__rowhead" scope="row">Zum Angebot</th>' +
      ps.map(function (p) {
        return '<td><div class="vg-ctable__cta vg-shops">' + shopButtons(p, { compact: true }) + '</div></td>';
      }).join('') + '</tr>';

    return '<div class="vg-table-wrap">' +
      '<div class="vg-table-hint">' + icon.swipe + '<span>In der Tabelle scrollen, um alle ' + ps.length +
        ' Modelle zu vergleichen – Kopfzeile und Merkmalsspalte bleiben stehen.</span></div>' +
      '<div class="vg-table-scroll vg-table-scroll--tall"><table class="vg-ctable">' + head + '<tbody>' + rows + '</tbody></table></div>' +
    '</div>';
  }

  function rankingTable() {
    return '<div class="vg-table-wrap"><div class="vg-table-scroll"><table class="vg-ranking">' +
      '<thead><tr><th scope="col">Platz</th><th scope="col">Produkt</th><th scope="col">Testnote</th>' +
      '<th scope="col">Preis</th><th scope="col" class="vg-ranking__cta">Zum Angebot</th></tr></thead><tbody>' +
      D.products.map(function (p, i) {
        return '<tr>' +
          '<td>' + (i + 1) + '.</td>' +
          '<td><div class="vg-card__brand">' + esc(p.brand) + '</div>' +
            '<a href="#test-' + esc(slug(p.id)) + '" style="font-weight:650;color:inherit;text-decoration:none">' + esc(p.model) + '</a></td>' +
          '<td>' + gradeBlock(p) + '</td>' +
          '<td style="font-variant-numeric:tabular-nums;font-weight:650">' + esc(chf(p.price.current)) + '</td>' +
          '<td class="vg-ranking__cta"><div class="vg-shops" style="grid-template-columns:1fr">' +
            shopButton(p, bestOfferKey(p), { compact: true }) + '</div></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table></div></div>';
  }

  /* ---------------- Seitenabschnitte --------------------------- */

  function headerHtml() {
    var cats = ['Technik', 'Haushalt', 'Küche', 'Garten', 'Sport', 'Auto', 'Deals'];
    return (AFF.staging ?
      '<div class="vg-staging"><div class="vg-wrap vg-staging__inner">' +
        '<b>Staging-Umgebung</b><span>· Affiliate-Links sind Platzhalter und führen zu keinem Shop. ' +
        'Ein Klick zeigt die Ziel-URL, die im Live-Betrieb aufgerufen würde.</span>' +
      '</div></div>' : '') +
    '<header class="vg-header"><div class="vg-wrap vg-header__bar">' +
      '<a class="vg-logo" href="#top">' +
        '<span class="vg-logo__mark">V</span>' +
        '<span class="vg-logo__text">verglich<em>mi</em></span>' +
      '</a>' +
      '<nav class="vg-nav" aria-label="Kategorien">' +
        cats.map(function (c) {
          var cur = c === (D.meta.breadcrumb || [])[1];
          return '<a href="#top"' + (cur ? ' aria-current="page"' : '') + '>' + esc(c) + '</a>';
        }).join('') +
      '</nav>' +
      '<button class="vg-theme-toggle" type="button" data-vg-theme aria-label="Farbschema wechseln">' +
        '<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
        '<path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5Z"/></svg>' +
      '</button>' +
    '</div></header>';
  }

  function heroHtml() {
    var m = D.meta;
    return '<div class="vg-hero"><div class="vg-wrap"><div class="vg-col">' +
      '<nav class="vg-breadcrumb" aria-label="Brotkrumen-Navigation">' +
        (m.breadcrumb || []).map(function (b, i, arr) {
          return '<a href="#top">' + esc(b) + '</a>' +
            (i < arr.length - 1 ? '<span aria-hidden="true">/</span>' : '');
        }).join('') +
      '</nav>' +
      '<span class="vg-hero__kicker">' + esc(m.kicker) + '</span>' +
      '<h1>' + esc(m.title) + ' ' + esc(m.year) + '</h1>' +
      '<p class="vg-hero__lead">' + rich(m.lead) + '</p>' +
      '<div class="vg-byline">' +
        '<span class="vg-avatar" aria-hidden="true">' + esc(m.author.initials) + '</span>' +
        '<div>' +
          '<div class="vg-byline__name">' + esc(m.author.name) + '</div>' +
          '<div class="vg-byline__meta">' + esc(m.author.role) + ' · ' +
            'Aktualisiert: <time datetime="' + esc(m.updated) + '">' + esc(deDate(m.updated)) + '</time>' +
            ' · ' + esc(m.readingTime) + ' Min. Lesezeit</div>' +
        '</div>' +
      '</div>' +
      '<div class="vg-facts">' +
        (m.testFacts || []).map(function (f) {
          return '<div class="vg-facts__item">' +
            '<div class="vg-facts__value">' + esc(f.value) + '</div>' +
            '<div class="vg-facts__label">' + esc(f.label) + '</div></div>';
        }).join('') +
      '</div>' +
      '<details class="vg-disclosure" open>' +
        '<summary>' +
          '<svg class="vg-disclosure__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
          '<path d="M10 2.5 3 5.5v4.2c0 3.6 2.9 6.6 7 7.8 4.1-1.2 7-4.2 7-7.8V5.5Z"/><path d="m7.2 10 2 2 3.6-3.8"/></svg>' +
          esc(AFF.disclosureTitle) +
        '</summary>' +
        '<p>' + esc(AFF.disclosureText) + '</p>' +
      '</details>' +
      tocHtml() +
    '</div></div></div>';
  }

  function tocHtml() {
    var items = [{ href: '#bestenliste', label: 'Die Bestenliste auf einen Blick' }]
      .concat(D.products.map(function (p) {
        return { href: '#test-' + slug(p.id), label: p.brand + ' ' + p.model + ' im Test' };
      }))
      .concat([
        { href: '#methodik', label: 'So testen wir' },
        { href: '#vergleich', label: 'Alle Modelle im Direktvergleich' },
        { href: '#fazit', label: 'Unser Fazit' },
        { href: '#faq', label: 'Häufige Fragen' },
      ]);
    return '<nav class="vg-toc" aria-label="Inhaltsverzeichnis">' +
      '<div class="vg-toc__head">Inhaltsverzeichnis</div>' +
      '<ol>' + items.map(function (i) {
        return '<li><a href="' + esc(i.href) + '">' + esc(i.label) + '</a></li>';
      }).join('') + '</ol></nav>';
  }

  function methodHtml() {
    var m = D.method;
    return '<section class="vg-section vg-section--alt" id="methodik"><div class="vg-wrap"><div class="vg-col">' +
      '<div class="vg-section__head">' +
        '<span class="vg-kicker">' + esc(m.kicker) + '</span>' +
        '<h2>' + esc(m.headline) + '</h2>' +
        '<p>' + rich(m.intro) + '</p>' +
      '</div>' +
      '<div class="vg-criteria">' +
        (D.criteria || []).map(function (c) {
          return '<article class="vg-criterion">' +
            '<div class="vg-criterion__weight">' + c.weight + '&nbsp;%</div>' +
            '<div><h3>' + esc(c.label) + '</h3><p>' + esc(c.desc) + '</p></div>' +
          '</article>';
        }).join('') +
      '</div>' +
      '<p class="vg-note" style="margin-top:1.25rem">' + icon.info + '<span>' + rich(m.outro) + '</span></p>' +
    '</div></div></section>';
  }

  function conclusionHtml() {
    var c = D.conclusion;
    return '<section class="vg-section" id="fazit"><div class="vg-wrap"><div class="vg-col">' +
      '<div class="vg-section__head">' +
        '<span class="vg-kicker">' + esc(c.kicker) + '</span>' +
        '<h2>' + esc(c.headline) + '</h2>' +
      '</div>' +
      '<div class="vg-review__body">' +
        (c.paragraphs || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('') +
      '</div>' +
      (c.quote ?
        '<figure class="vg-quote">' +
          '<blockquote class="vg-quote__text">' + esc(c.quote.text) + '</blockquote>' +
          '<figcaption class="vg-quote__by">' +
            '<span class="vg-avatar" aria-hidden="true">' + esc(D.meta.author.initials) + '</span>' +
            '<span><strong>' + esc(c.quote.author) + '</strong><br>' +
            '<span style="font-size:.84rem;color:var(--vg-ink-3)">' + esc(c.quote.role) + '</span></span>' +
          '</figcaption>' +
        '</figure>' : '') +
      '<h3 style="margin-top:2.5rem;margin-bottom:1rem">Die Rangliste im Überblick</h3>' +
      rankingTable() +
    '</div></div></section>';
  }

  function faqHtml() {
    return '<section class="vg-section vg-section--alt" id="faq"><div class="vg-wrap"><div class="vg-col">' +
      '<div class="vg-section__head">' +
        '<span class="vg-kicker">FAQ</span>' +
        '<h2>Häufige Fragen zu ' + esc(D.meta.category) + 'n</h2>' +
      '</div>' +
      '<div class="vg-faq">' +
        (D.faq || []).map(function (f, i) {
          return '<details' + (i === 0 ? ' open' : '') + '>' +
            '<summary>' + esc(f.q) + '</summary>' +
            '<div class="vg-faq__answer"><p>' + rich(f.a) + '</p></div>' +
          '</details>';
        }).join('') +
      '</div>' +
    '</div></div></section>';
  }

  function footerHtml() {
    var cols = [
      { h: 'Verglichmi', items: ['Über uns', 'So testen wir', 'Redaktion', 'Kontakt'] },
      { h: 'Kategorien', items: ['Technik', 'Haushalt', 'Küche', 'Garten', 'Sport'] },
      { h: 'Rechtliches', items: ['Impressum', 'Datenschutz', 'AGB', 'Affiliate-Hinweis'] },
      { h: 'Transparenz', items: ['Testmethodik', 'Unabhängigkeit', 'Korrekturen melden'] },
    ];
    return '<footer class="vg-footer"><div class="vg-wrap">' +
      '<div class="vg-footer__grid">' +
        cols.map(function (c) {
          return '<div><h4>' + esc(c.h) + '</h4><ul>' +
            c.items.map(function (i) { return '<li><a href="#top">' + esc(i) + '</a></li>'; }).join('') +
          '</ul></div>';
        }).join('') +
      '</div>' +
      '<div class="vg-footer__bottom">' +
        '<a class="vg-logo" href="#top"><span class="vg-logo__mark">V</span>' +
        '<span class="vg-logo__text">verglich<em>mi</em></span></a>' +
        '<span>© ' + new Date().getFullYear() + ' Verglichmi · Alle Tests unabhängig und selbst finanziert</span>' +
        '<a class="vg-backtotop" href="#top">↑ Nach oben</a>' +
      '</div>' +
    '</div></footer>';
  }

  /* ---------------- Strukturierte Daten (SEO) ------------------- */

  function jsonLd() {
    var itemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: D.meta.title + ' ' + D.meta.year,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: D.products.length,
      itemListElement: D.products.map(function (p, i) {
        return {
          '@type': 'ListItem', position: i + 1,
          item: {
            '@type': 'Product', name: p.brand + ' ' + p.model, brand: { '@type': 'Brand', name: p.brand },
            review: {
              '@type': 'Review',
              reviewRating: { '@type': 'Rating', ratingValue: p.grade, bestRating: 1, worstRating: 6 },
              author: { '@type': 'Person', name: D.meta.author.name },
            },
            offers: { '@type': 'Offer', price: p.price.current, priceCurrency: 'CHF', availability: 'https://schema.org/InStock' },
          },
        };
      }),
    };
    var faqPage = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: (D.faq || []).map(function (f) {
        return {
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: String(f.a).replace(/<[^>]+>/g, '') },
        };
      }),
    };
    [itemList, faqPage].forEach(function (obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }

  /* ---------------- Interaktion -------------------------------- */

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem('vg-theme'); } catch (e) { /* Private Mode */ }
    if (stored === 'dark' || stored === 'light') document.documentElement.setAttribute('data-theme', stored);

    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-vg-theme]');
      if (!btn) return;
      var root = document.documentElement;
      var isDark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('vg-theme', next); } catch (e) { /* ignoriert */ }
    });
  }

  /** Klicks auf Affiliate-Buttons: Tracking-Hook + Staging-Abfangen. */
  function initOfferClicks() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[data-vg-shop]');
      if (!a) return;

      var payload = {
        shop: a.getAttribute('data-vg-shop'),
        product: a.getAttribute('data-vg-product'),
        url: a.getAttribute('href'),
      };
      /* Anbindungspunkt fuer Analytics im Live-Betrieb. */
      if (typeof window.vgTrackOffer === 'function') window.vgTrackOffer(payload);

      if (AFF.staging) {
        ev.preventDefault();
        toast('Staging – kein Weiterleiten. Live-Ziel wäre:\n' + payload.url);
      }
    });
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('vg-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'vg-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:200;' +
        'max-width:min(560px,92vw);background:var(--vg-ink);color:var(--vg-bg);padding:.85rem 1.1rem;' +
        'border-radius:10px;font-size:.85rem;line-height:1.45;box-shadow:var(--vg-shadow-lg);' +
        'white-space:pre-wrap;word-break:break-all;opacity:0;transition:opacity .18s ease';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 4200);
  }

  /* ---------------- Aufbau ------------------------------------- */

  function render() {
    document.title = D.meta.title + ' ' + D.meta.year + ' – ' + D.meta.category +
      ' im Vergleich | Verglichmi';

    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content',
        D.products.length + ' ' + D.meta.category + ' im Test: Testsieger ist der ' +
        D.products[0].brand + ' ' + D.products[0].model + ' mit Note ' + gradeStr(D.products[0].grade) +
        '. Alle Messwerte, Pro und Kontra sowie aktuelle Preise im Vergleich.');
    }

    var app = document.getElementById('vg-app');
    app.innerHTML =
      headerHtml() +
      '<main id="top">' +
        heroHtml() +

        '<section class="vg-section" id="bestenliste"><div class="vg-wrap"><div class="vg-col">' +
          '<div class="vg-section__head">' +
            '<span class="vg-kicker">Bestenliste</span>' +
            '<h2>Die ' + D.products.length + ' besten ' + esc(D.meta.category) + ' im Test</h2>' +
            '<p>Sortiert nach Testnote. Jede Box zeigt die wichtigsten Messwerte, Pro und Kontra sowie ' +
            'den aktuellen Bestpreis bei drei Händlern. Ausführliche Einzeltests folgen darunter.</p>' +
          '</div>' +
          '<div class="vg-list">' +
            D.products.map(function (p, i) { return productCard(p, i + 1); }).join('') +
          '</div>' +
          '<p class="vg-note" style="margin-top:1.25rem">' + icon.info +
            '<span><b>Hinweis:</b> Bei gleicher Testnote entscheidet das interne Ergebnis, das wir auf ' +
            'drei Nachkommastellen führen. Preise werden mehrmals täglich aktualisiert.</span></p>' +
        '</div></div></section>' +

        '<section class="vg-section vg-section--alt"><div class="vg-wrap"><div class="vg-col">' +
          '<div class="vg-section__head">' +
            '<span class="vg-kicker">Einzeltests</span>' +
            '<h2>Jedes Modell im ausführlichen Test</h2>' +
            '<p>Was hinter den Noten steckt: Messwerte, Alltagseindruck und die Frage, für wen sich ' +
            'welches Gerät wirklich lohnt.</p>' +
          '</div>' +
          D.products.map(function (p, i) { return reviewSection(p, i + 1); }).join('') +
        '</div></div></section>' +

        methodHtml() +

        '<section class="vg-section" id="vergleich"><div class="vg-wrap">' +
          '<div class="vg-section__head">' +
            '<span class="vg-kicker">Direktvergleich</span>' +
            '<h2>Alle ' + esc(D.meta.category) + ' im Datenvergleich</h2>' +
            '<p>Sämtliche Messwerte und technischen Daten nebeneinander – die wichtigsten Zeilen sind ' +
            'farblich hervorgehoben.</p>' +
          '</div>' +
          comparisonTable() +
        '</div></section>' +

        conclusionHtml() +
        faqHtml() +
      '</main>' +
      footerHtml();

    jsonLd();
  }

  /* ---------------- Start -------------------------------------- */

  initTheme();
  render();
  initOfferClicks();

  /* Kleine oeffentliche API fuer spaetere Integration */
  window.VG = {
    data: D,
    buildOfferUrl: buildOfferUrl,
    bestOfferKey: bestOfferKey,
    formatPrice: chf,
    rerender: render,
  };
})();
