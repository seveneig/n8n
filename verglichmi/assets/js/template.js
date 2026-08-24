/* ==================================================================
   Verglichmi – Template-Renderer
   Baut die komplette Vergleichsseite aus window.VG_DATA.
   Keine Abhängigkeiten, läuft auch direkt per file://

   Optionale Datenblöcke – fehlen sie, entfällt der Abschnitt:
     meta.glossary · quickPicker · filters · gadgets · safety
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
  /* Redaktionelle Felder dürfen bewusst <strong>/<em> enthalten. */
  function rich(s) { return String(s == null ? '' : s); }

  function chf(v) {
    if (v == null) return '–';
    var int = Math.floor(v), rest = Math.round(v * 100) % 100;
    var grouped = String(int).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return rest === 0 ? 'CHF ' + grouped + '.–'
                      : 'CHF ' + grouped + '.' + String(rest).padStart(2, '0');
  }

  function gradeInfo(g) {
    if (g <= 1.5) return { cls: 'g1', word: 'sehr gut' };
    if (g <= 2.5) return { cls: 'g2', word: 'gut' };
    if (g <= 3.5) return { cls: 'g3', word: 'befriedigend' };
    if (g <= 4.5) return { cls: 'g4', word: 'ausreichend' };
    return { cls: 'g5', word: 'mangelhaft' };
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

  function byId(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }

  var icon = {
    ext:    '<svg class="shop__ext" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10"/><path d="M9.5 2.5H14V7M14 2.5 7.5 9"/></svg>',
    info:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.2"/></svg>',
    shield: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M10 2.5 3 5.5v4.2c0 3.6 2.9 6.6 7 7.8 4.1-1.2 7-4.2 7-7.8V5.5Z"/><path d="m7.2 10 2 2 3.6-3.8"/></svg>',
    person: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="6.5" r="3"/><path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"/></svg>',
    swipe:  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2.5 10h15M14 6.5 17.5 10 14 13.5M6 6.5 2.5 10 6 13.5"/></svg>',
    moon:   '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5Z"/></svg>',
  };

  /* Wellenlinie als Abschnittstrenner – einziges dekoratives Element */
  var wave = '<svg class="wave" viewBox="0 0 240 14" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M0 7q15-6 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  /* ---------------- Affiliate ---------------------------------- */

  var AFF = D.affiliate || { shops: {}, shopOrder: [] };

  function offerUrl(shopKey, offer) {
    var shop = AFF.shops[shopKey];
    if (!shop || !offer) return null;
    return String(shop.pattern)
      .replace('{sku}', encodeURIComponent(offer.sku))
      .replace('{tag}', encodeURIComponent(shop.tag));
  }

  function bestOfferKey(p) {
    var best = null, low = Infinity;
    (AFF.shopOrder || []).forEach(function (k) {
      var o = p.offers && p.offers[k];
      if (o && typeof o.price === 'number' && o.price < low) { low = o.price; best = k; }
    });
    return best;
  }

  function shopButton(p, shopKey, opt) {
    opt = opt || {};
    var shop = AFF.shops[shopKey], offer = p.offers && p.offers[shopKey];
    if (!shop || !offer) return '';
    var isBest = opt.showBest && bestOfferKey(p) === shopKey;
    return '<a class="shop shop--' + esc(shop.theme) + '"' +
      ' href="' + esc(offerUrl(shopKey, offer)) + '"' +
      ' target="_blank" rel="sponsored nofollow noopener"' +
      ' data-shop="' + esc(shopKey) + '" data-product="' + esc(p.id) + '"' +
      ' aria-label="' + esc(p.brand + ' ' + p.model + ' bei ' + shop.label + ' ansehen (Affiliate-Link)') + '">' +
      (isBest ? '<span class="shop__best">Bester Preis</span>' : '') +
      '<span>' + esc(shop.label) + '</span>' +
      (opt.compact ? '' : '<span class="shop__p">' + esc(chf(offer.price)) + '</span>') +
      icon.ext + '</a>';
  }

  function shopButtons(p, opt) {
    return (AFF.shopOrder || []).map(function (k) { return shopButton(p, k, opt); }).join('');
  }

  /* ---------------- Produktbild -------------------------------- */

  /**
   * Platzhalter: Schlauchboot von oben. Sobald echte Fotos vorliegen,
   * genügt product.image = 'assets/img/xy.jpg' in der Datendatei.
   */
  function boatImage(p, suffix) {
    if (p.image) {
      return '<img src="' + esc(p.image) + '" alt="' + esc(p.brand + ' ' + p.model) + '" loading="lazy" decoding="async">';
    }
    var a = p.accent || '#0E5A6E';
    var gid = 'bg-' + esc(p.id) + (suffix || '');
    return '' +
    '<svg viewBox="0 0 200 150" role="img" aria-label="' + esc(p.brand + ' ' + p.model + ' – Platzhalterbild') + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + esc(a) + '" stop-opacity=".92"/>' +
        '<stop offset="1" stop-color="' + esc(a) + '" stop-opacity=".5"/>' +
      '</linearGradient></defs>' +
      '<g fill="none" stroke="url(#' + gid + ')" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
        /* Aussenschlauch */
        '<path d="M46 30h108c14 0 24 12 24 26v14c0 26-22 48-48 48H74c-26 0-48-22-48-48V56c0-14 10-26 20-26Z"/>' +
        /* Innenkante */
        '<path d="M52 44h96c7 0 12 6 12 13v11c0 19-16 34-35 34H75c-19 0-35-15-35-34V57c0-7 5-13 12-13Z" stroke-width="3" opacity=".55"/>' +
        /* Sitzbaenke */
        '<path d="M52 63h96M52 88h96" stroke-width="4" opacity=".8"/>' +
        /* Paddel */
        '<path d="M22 96 8 110M8 110l-4 8 8-4Z" stroke-width="3.5" opacity=".7"/>' +
      '</g>' +
      /* Ventil */
      '<circle cx="164" cy="46" r="4" fill="' + esc(a) + '"/>' +
    '</svg>';
  }

  /* ---------------- Bausteine ---------------------------------- */

  function gradeBlock(p, bare) {
    var gi = gradeInfo(p.grade);
    return '<div class="grade grade--' + gi.cls + '">' +
      '<div class="grade__box" aria-hidden="true">' + esc(gradeStr(p.grade)) + '</div>' +
      (bare ? '' : '<div class="grade__meta"><span class="grade__cap">Testnote</span>' +
                   '<span class="grade__word">' + esc(gi.word) + '</span></div>') +
      '<span class="sr">Testnote ' + esc(gradeStr(p.grade)) + ', ' + esc(gi.word) + '</span>' +
    '</div>';
  }

  function prosCons(p) {
    return '<div class="pc">' +
      '<div class="pc--pro"><div class="pc__title pc__title--pro">Dafür</div><ul>' +
        p.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="pc--con"><div class="pc__title pc__title--con">Dagegen</div><ul>' +
        p.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul></div>' +
    '</div>';
  }

  var specByKey = {};
  (D.specFields || []).forEach(function (f) { specByKey[f.key] = f; });

  function measureStrip(p) {
    return '<div class="strip">' + (D.quickSpecs || []).map(function (k) {
      var f = specByKey[k], v = p.specs && p.specs[k];
      if (!f || !v) return '';
      return '<div class="strip__cell"><div class="strip__k">' + esc(f.label) + '</div>' +
             '<div class="strip__v' + (f.mono ? ' num' : '') + '">' + esc(v) + '</div></div>';
    }).join('') + '</div>';
  }

  function offersBlock(p) {
    var save = p.price && p.price.uvp > p.price.current
      ? Math.round((1 - p.price.current / p.price.uvp) * 100) : 0;
    return '<div class="offers">' +
      '<div class="price">' +
        '<span class="price__now">' + esc(chf(p.price.current)) + '</span>' +
        (save ? '<span class="price__was">' + esc(chf(p.price.uvp)) + '</span>' +
                '<span class="price__save">−' + save + '&nbsp;%</span>' : '') +
        '<span class="price__stamp">Bestpreis am ' + esc(deDate(D.meta.updated)) + '</span>' +
      '</div>' +
      '<div class="shops">' + shopButtons(p, { showBest: true }) + '</div>' +
      '<p class="offers__legal">Preise inkl. MwSt., zzgl. Versand. Stand: ' + esc(deDate(D.meta.updated)) +
      '. Händler-Links sind Affiliate-Links.</p>' +
    '</div>';
  }

  /* ---------------- Produktbox --------------------------------- */

  function productCard(p, rank) {
    return '<article class="card' + (rank === 1 ? ' card--top' : '') + '"' +
      ' id="box-' + esc(p.id) + '" data-tags="' + esc((p.tags || []).join(' ')) + '">' +
      '<header class="card__top">' +
        '<span class="rank">Platz&nbsp;<b>' + rank + '</b></span>' +
        (p.badge ? '<span class="award">' + esc(p.badge) + '</span>' : '') +
        (p.claim ? '<span class="card__claim">' + esc(p.claim) + '</span>' : '') +
      '</header>' +
      '<div class="card__body">' +
        '<div class="card__media">' +
          '<div class="card__img">' + boatImage(p) + '</div>' +
          gradeBlock(p) +
        '</div>' +
        '<div>' +
          '<div class="card__brand">' + esc(p.brand) + '</div>' +
          '<h3 class="card__model"><a href="#test-' + esc(slug(p.id)) + '">' + esc(p.model) + '</a></h3>' +
          measureStrip(p) + prosCons(p) + offersBlock(p) +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------------- Einzeltest --------------------------------- */

  function scoreBars(p) {
    return '<div class="scores"><div class="scores__title">Einzelwertungen</div>' +
      (D.criteria || []).map(function (c) {
        var v = (p.scores && p.scores[c.key]) || 0;
        var mod = v >= 80 ? '' : (v >= 65 ? ' score__fill--mid' : ' score__fill--low');
        return '<div class="score">' +
          '<div class="score__label">' + esc(c.label) + ' <small>' + c.weight + '&nbsp;%</small></div>' +
          '<div class="score__track"><div class="score__fill' + mod + '" style="width:' + v + '%"></div></div>' +
          '<div class="score__v">' + v + '</div></div>';
      }).join('') + '</div>';
  }

  function groupSpecFields() {
    var order = [], byGroup = {};
    (D.specFields || []).forEach(function (f) {
      if (!byGroup[f.group]) { byGroup[f.group] = []; order.push(f.group); }
      byGroup[f.group].push(f);
    });
    return { order: order, byGroup: byGroup };
  }

  function specList(p) {
    var g = groupSpecFields();
    return '<dl class="specs">' + g.order.map(function (name) {
      return '<div class="specs__group">' + esc(name) + '</div>' +
        g.byGroup[name].map(function (f) {
          return '<div class="specs__row' + (f.highlight ? ' specs__row--hl' : '') + '">' +
            '<dt>' + esc(f.label) + '</dt>' +
            '<dd' + (f.mono ? ' class="num"' : '') + '>' + esc((p.specs && p.specs[f.key]) || '–') + '</dd>' +
          '</div>';
        }).join('');
    }).join('') + '</dl>';
  }

  function miniCard(p) {
    return '<div class="minicard">' +
      '<figure>' + boatImage(p, '-mini') + '</figure>' +
      '<div><div class="minicard__name">' + esc(p.brand + ' ' + p.model) + '</div>' +
        '<div class="minicard__sub">Testnote ' + esc(gradeStr(p.grade)) + ' · ' +
        esc(gradeInfo(p.grade).word) + ' · ab ' + esc(chf(p.price.current)) + '</div></div>' +
      '<div class="minicard__cta">' + shopButtons(p, { compact: true, showBest: true }) + '</div>' +
    '</div>';
  }

  function reviewSection(p) {
    var r = p.review || {};
    return '<section class="review" id="test-' + esc(slug(p.id)) + '">' +
      '<div class="review__head">' +
        (r.kicker ? '<span class="eyebrow">' + esc(r.kicker) + '</span>' : '') +
        '<h2>' + esc(r.headline || (p.brand + ' ' + p.model)) + '</h2>' +
        (r.verdict ? '<p class="review__verdict">' + esc(r.verdict) + '</p>' : '') +
      '</div>' +
      '<div class="review__body">' +
        (r.paragraphs || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('') +
      '</div>' +
      (r.imageCaption ?
        '<figure class="figure"><div class="figure__frame">' + boatImage(p, '-fig') + '</div>' +
        '<figcaption><b>' + esc(p.brand + ' ' + p.model) + ':</b> ' + esc(r.imageCaption) +
        ' <span style="opacity:.7">(Platzhalterbild – Staging)</span></figcaption></figure>' : '') +
      scoreBars(p) +
      (r.bestFor ? '<p class="bestfor">' + icon.person + '<span><b>Für wen?</b> ' + esc(r.bestFor) + '</span></p>' : '') +
      specList(p) + miniCard(p) +
    '</section>';
  }

  /* ---------------- Gadget-Matrix ------------------------------ */

  function gadgetCell(v) {
    if (v === true)     return '<span class="dot dot--yes"></span><span class="sr">vorhanden</span>';
    if (v === 'option') return '<span class="dot dot--opt"></span><span class="sr">gegen Aufpreis</span>';
    if (v === false || v == null) return '<span class="dot dot--no"></span><span class="sr">nicht vorhanden</span>';
    return '<span class="matrix__count">' + esc(v) + '</span>';
  }

  function gadgetMatrix() {
    if (!D.gadgets) return '';
    var ps = D.products, G = D.gadgets;

    var head = '<thead><tr><th class="matrix__rowhead matrix__corner" scope="col">Ausstattungsmerkmal</th>' +
      ps.map(function (p) {
        return '<th scope="col"><div class="matrix__head-prod">' +
          '<span>' + esc(p.brand) + '</span><b>' + esc(p.model) + '</b>' +
          '<span class="matrix__score">Ausstattung ' + ((p.scores && p.scores.ausstattung) || '–') + '</span>' +
        '</div></th>';
      }).join('') + '</tr></thead>';

    var rows = G.groups.map(function (grp) {
      return '<tr class="matrix__group"><th class="matrix__rowhead" scope="row">' + esc(grp.label) + '</th>' +
        ps.map(function () { return '<td></td>'; }).join('') + '</tr>' +
        grp.items.map(function (it) {
          return '<tr><th class="matrix__rowhead" scope="row">' + esc(it.label) +
            (it.hint ? '<span class="matrix__hint">' + esc(it.hint) + '</span>' : '') + '</th>' +
            ps.map(function (p) {
              return '<td>' + gadgetCell(p.gadgets && p.gadgets[it.key]) + '</td>';
            }).join('') + '</tr>';
        }).join('');
    }).join('');

    return '<div class="matrix-legend">' +
        '<span><span class="dot dot--yes"></span> serienmässig an Bord</span>' +
        '<span><span class="dot dot--opt"></span> gegen Aufpreis nachrüstbar</span>' +
        '<span><span class="dot dot--no"></span> nicht vorgesehen</span>' +
      '</div>' +
      '<div class="tablewrap">' +
        '<div class="tablewrap__hint">' + icon.swipe + '<span>In der Tabelle scrollen – Kopfzeile und Merkmalsspalte bleiben stehen.</span></div>' +
        '<div class="tablescroll tablescroll--tall"><table class="matrix">' + head + '<tbody>' + rows + '</tbody></table></div>' +
      '</div>';
  }

  /* ---------------- Datenvergleich ----------------------------- */

  function dataTable() {
    var ps = D.products, g = groupSpecFields();

    var head = '<thead><tr><th class="data__rowhead data__corner" scope="col">Modell</th>' +
      ps.map(function (p) {
        return '<th scope="col"><div class="data__prod">' +
          '<span class="card__brand">' + esc(p.brand) + '</span>' +
          '<strong>' + esc(p.model) + '</strong>' + gradeBlock(p, true) +
        '</div></th>';
      }).join('') + '</tr></thead>';

    function groupRow(label) {
      return '<tr class="data__group"><th class="data__rowhead" scope="row">' + esc(label) + '</th>' +
        ps.map(function () { return '<td></td>'; }).join('') + '</tr>';
    }

    var rows = groupRow('Bewertung') +
      '<tr><th class="data__rowhead" scope="row">Platzierung</th>' +
        ps.map(function (p, i) { return '<td>Platz ' + (i + 1) + (p.badge ? ' · ' + esc(p.badge) : '') + '</td>'; }).join('') + '</tr>' +
      '<tr><th class="data__rowhead" scope="row">Bestpreis</th>' +
        ps.map(function (p) { return '<td class="data__hl num">' + esc(chf(p.price.current)) + '</td>'; }).join('') + '</tr>';

    g.order.forEach(function (name) {
      rows += groupRow(name);
      g.byGroup[name].forEach(function (f) {
        rows += '<tr><th class="data__rowhead" scope="row">' + esc(f.label) + '</th>' +
          ps.map(function (p) {
            var cls = (f.highlight ? 'data__hl ' : '') + (f.mono ? 'num' : '');
            return '<td' + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + '>' +
              esc((p.specs && p.specs[f.key]) || '–') + '</td>';
          }).join('') + '</tr>';
      });
    });

    rows += groupRow('Urteil') +
      '<tr><th class="data__rowhead" scope="row">Dafür</th>' +
        ps.map(function (p) {
          return '<td><ul class="pc--pro" style="list-style:none;margin:0;padding:0;display:grid;gap:.25rem">' +
            p.pros.map(function (x) { return '<li style="position:relative;padding-left:1.2rem;font-size:.82rem">' + esc(x) + '</li>'; }).join('') +
          '</ul></td>';
        }).join('') + '</tr>' +
      '<tr><th class="data__rowhead" scope="row">Dagegen</th>' +
        ps.map(function (p) {
          return '<td><ul class="pc--con" style="list-style:none;margin:0;padding:0;display:grid;gap:.25rem">' +
            p.cons.map(function (x) { return '<li style="position:relative;padding-left:1.2rem;font-size:.82rem">' + esc(x) + '</li>'; }).join('') +
          '</ul></td>';
        }).join('') + '</tr>' +
      '<tr><th class="data__rowhead" scope="row">Zum Angebot</th>' +
        ps.map(function (p) {
          return '<td><div class="shops data__cta">' + shopButtons(p, { compact: true }) + '</div></td>';
        }).join('') + '</tr>';

    return '<div class="tablewrap">' +
      '<div class="tablewrap__hint">' + icon.swipe + '<span>In der Tabelle scrollen, um alle ' + ps.length +
        ' Modelle zu vergleichen – Kopfzeile und Merkmalsspalte bleiben stehen.</span></div>' +
      '<div class="tablescroll tablescroll--tall"><table class="data">' + head + '<tbody>' + rows + '</tbody></table></div>' +
    '</div>';
  }

  function rankingTable() {
    return '<div class="tablewrap"><div class="tablescroll"><table class="ranking">' +
      '<thead><tr><th scope="col">Platz</th><th scope="col">Modell</th><th scope="col">Testnote</th>' +
      '<th scope="col">Preis</th><th scope="col" class="ranking__cta">Angebot</th></tr></thead><tbody>' +
      D.products.map(function (p, i) {
        return '<tr><td>' + (i + 1) + '</td>' +
          '<td><div class="card__brand">' + esc(p.brand) + '</div>' +
            '<a href="#test-' + esc(slug(p.id)) + '" style="font-weight:600;color:inherit;text-decoration:none">' +
            esc(p.model) + '</a></td>' +
          '<td>' + gradeBlock(p) + '</td>' +
          '<td class="ranking__price">' + esc(chf(p.price.current)) + '</td>' +
          '<td class="ranking__cta"><div class="shops" style="grid-template-columns:1fr">' +
            shopButton(p, bestOfferKey(p), { compact: true }) + '</div></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  /* ---------------- Abschnittsregister ------------------------- */
  /* Eine Quelle für Rail-Navigation und Seitenaufbau. */

  function sectionRegister() {
    var s = [{ id: 'bestenliste', label: 'Bestenliste' }];
    if (D.quickPicker) s.unshift({ id: 'schnellwahl', label: D.quickPicker.title });
    s.push({ id: 'einzeltests', label: 'Einzeltests', children: D.products.map(function (p) {
      return { id: 'test-' + slug(p.id), label: p.brand + ' ' + p.model };
    }) });
    if (D.gadgets) s.push({ id: 'ausstattung', label: 'Ausstattung & Gadgets' });
    s.push({ id: 'methodik', label: 'So testen wir' });
    if (D.safety) s.push({ id: 'sicherheit', label: 'Sicher unterwegs' });
    s.push({ id: 'daten', label: 'Datenvergleich' });
    s.push({ id: 'fazit', label: 'Fazit & Rangliste' });
    s.push({ id: 'faq', label: 'Häufige Fragen' });
    return s;
  }

  function railHtml(sections) {
    var n = 0;
    return '<nav class="rail" aria-label="Abschnitte dieses Artikels">' +
      '<div class="rail__progress" aria-hidden="true"><i data-progress></i></div>' +
      '<div class="rail__title">Inhalt</div>' +
      '<ul class="rail__list">' +
        sections.map(function (s) {
          n++;
          var out = '<li><a class="rail__link" href="#' + esc(s.id) + '" data-rail="' + esc(s.id) + '">' +
            '<span class="rail__num">' + String(n).padStart(2, '0') + '</span>' +
            '<span>' + esc(s.label) + '</span></a></li>';
          if (s.children) {
            out += s.children.map(function (c) {
              return '<li><a class="rail__link rail__sub" href="#' + esc(c.id) + '" data-rail="' + esc(c.id) + '">' +
                '<span></span><span>' + esc(c.label) + '</span></a></li>';
            }).join('');
          }
          return out;
        }).join('') +
      '</ul></nav>';
  }

  /* ---------------- Kopfbereich -------------------------------- */

  function mastheadHtml() {
    var cats = ['Technik', 'Haushalt', 'Sommer', 'Garten', 'Sport', 'Auto', 'Deals'];
    var current = (D.meta.breadcrumb || [])[1];
    return (AFF.staging ?
      '<div class="topbar"><div class="shell topbar__inner">' +
        '<b>Staging-Umgebung</b><span>· Affiliate-Links sind Platzhalter. Ein Klick zeigt die Ziel-URL, ' +
        'die im Live-Betrieb aufgerufen würde.</span></div></div>' : '') +
    '<header class="masthead"><div class="shell masthead__bar">' +
      '<a class="brand" href="#top">' + brandMark() +
        '<span class="brand__word">verglich<em>mi</em></span></a>' +
      '<nav class="mainnav" aria-label="Kategorien">' +
        cats.map(function (c) {
          return '<a href="#top"' + (c === current ? ' aria-current="page"' : '') + '>' + esc(c) + '</a>';
        }).join('') +
      '</nav>' +
      '<button class="iconbtn" type="button" data-theme-toggle aria-label="Farbschema wechseln">' + icon.moon + '</button>' +
    '</div></header>';
  }

  /* Wortmarke: drei Wellenlinien in einem Kreis */
  function brandMark() {
    return '<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">' +
      '<circle cx="16" cy="16" r="15" fill="var(--brand)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round">' +
        '<path d="M7 12.5q3-2.6 6 0t6 0 6 0"/>' +
        '<path d="M7 17q3-2.6 6 0t6 0 6 0"/>' +
        '<path d="M7 21.5q3-2.6 6 0t6 0 6 0"/>' +
      '</g></svg>';
  }

  function heroHtml() {
    var m = D.meta;
    return '<div class="hero"><div class="prose">' +
      '<nav class="crumbs" aria-label="Brotkrumen-Navigation">' +
        (m.breadcrumb || []).map(function (b, i, arr) {
          return '<a href="#top">' + esc(b) + '</a>' + (i < arr.length - 1 ? '<span aria-hidden="true">/</span>' : '');
        }).join('') +
      '</nav>' +
      '<span class="hero__flag">' + esc(m.kicker) + '</span>' +
      '<h1>' + esc(m.title) + ' ' + esc(m.year) + '</h1>' +
      '<p class="hero__lead">' + rich(m.lead) + '</p>' +
      '<div class="byline">' +
        '<span class="avatar" aria-hidden="true">' + esc(m.author.initials) + '</span>' +
        '<div><div class="byline__name">' + esc(m.author.name) + '</div>' +
          '<div class="byline__meta">' + esc(m.author.role) + ' · Aktualisiert: ' +
          '<time datetime="' + esc(m.updated) + '">' + esc(deDate(m.updated)) + '</time>' +
          ' · ' + esc(m.readingTime) + ' Min. Lesezeit</div></div>' +
      '</div>' +
      '<div class="facts">' +
        (m.testFacts || []).map(function (f) {
          return '<div class="facts__item"><div class="facts__value">' + esc(f.value) + '</div>' +
                 '<div class="facts__label">' + esc(f.label) + '</div></div>';
        }).join('') +
      '</div>' +
      '<details class="promise" open><summary>' + icon.shield + esc(AFF.disclosureTitle) + '</summary>' +
        '<p>' + esc(AFF.disclosureText) + '</p></details>' +
      glossaryHtml() +
    '</div></div>';
  }

  function glossaryHtml() {
    var g = D.meta.glossary;
    if (!g) return '';
    return '<section class="glossary" aria-labelledby="glossar-titel">' +
      '<div class="glossary__head"><h2 id="glossar-titel">' + esc(g.title) + '</h2>' +
        '<p>' + esc(g.intro) + '</p></div>' +
      '<dl class="glossary__list">' + g.terms.map(function (t) {
        return '<div><dt>' + esc(t.term) + '</dt><dd>' + esc(t.def) + '</dd></div>';
      }).join('') + '</dl></section>';
  }

  /* ---------------- Schnellwahl -------------------------------- */

  function pickerHtml() {
    var q = D.quickPicker;
    if (!q) return '';
    return '<section class="section" id="schnellwahl">' +
      '<div class="section__head"><span class="eyebrow">' + esc(q.title) + '</span>' +
        '<h2>' + esc(q.headline) + '</h2><p>' + esc(q.intro) + '</p></div>' +
      '<div class="picker"><div class="picker__body">' +
        '<div class="picker__ask">' +
          q.axes.map(function (ax) {
            return '<div class="picker__axis"><span id="ax-' + esc(ax.key) + '">' + esc(ax.label) + '</span>' +
              '<div class="picker__opts" role="group" aria-labelledby="ax-' + esc(ax.key) + '">' +
                ax.options.map(function (o, i) {
                  return '<button type="button" class="picker__opt" data-axis="' + esc(ax.key) + '"' +
                    ' data-value="' + esc(o.v) + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
                    esc(o.label) + '</button>';
                }).join('') +
              '</div></div>';
          }).join('') +
        '</div>' +
        '<div class="picker__out" data-picker-out aria-live="polite"></div>' +
      '</div></div></section>';
  }

  function renderPickerResult() {
    var q = D.quickPicker, out = document.querySelector('[data-picker-out]');
    if (!q || !out) return;
    var key = q.axes.map(function (ax) {
      var btn = document.querySelector('.picker__opt[data-axis="' + ax.key + '"][aria-pressed="true"]');
      return btn ? btn.getAttribute('data-value') : ax.options[0].v;
    }).join('|');

    var res = q.results[key];
    if (!res) { out.innerHTML = '<p class="picker__why">Für diese Kombination haben wir keinen Vorschlag.</p>'; return; }
    var p = byId(res.id);
    if (!p) { out.innerHTML = '<p class="picker__why">Produkt nicht gefunden.</p>'; return; }

    out.innerHTML =
      '<div class="picker__label">Unser Vorschlag</div>' +
      '<div class="picker__pick"><figure>' + boatImage(p, '-pick') + '</figure>' +
        '<div><div class="picker__name">' + esc(p.brand + ' ' + p.model) + '</div>' +
          '<div class="picker__sub">Testnote ' + esc(gradeStr(p.grade)) + ' · ' + esc(chf(p.price.current)) + '</div>' +
        '</div></div>' +
      '<p class="picker__why">' + esc(res.why) + '</p>' +
      '<div class="picker__links">' +
        '<a class="shop shop--ghost" href="#test-' + esc(slug(p.id)) + '">Zum Einzeltest</a>' +
        shopButton(p, bestOfferKey(p), { compact: true }) +
      '</div>';
  }

  /* ---------------- Filter ------------------------------------- */

  function filterbarHtml() {
    if (!D.filters) return '';
    return '<div class="filterbar" role="group" aria-label="Bestenliste filtern">' +
      '<span class="filterbar__label">Filtern:</span>' +
      D.filters.map(function (f, i) {
        var n = f.id === 'alle' ? D.products.length
              : D.products.filter(function (p) { return (p.tags || []).indexOf(f.id) > -1; }).length;
        return '<button type="button" class="chipbtn" data-filter="' + esc(f.id) + '"' +
          ' aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(f.label) +
          '<span class="chipbtn__n">' + n + '</span></button>';
      }).join('') +
      '<span class="filterbar__count" data-filter-count></span>' +
    '</div>';
  }

  function applyFilter(id) {
    var shown = 0;
    document.querySelectorAll('#bestenliste .card').forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(' ');
      var ok = id === 'alle' || tags.indexOf(id) > -1;
      card.hidden = !ok;
      if (ok) shown++;
    });
    var out = document.querySelector('[data-filter-count]');
    if (out) out.textContent = shown + ' von ' + D.products.length + ' Modellen';
  }

  /* ---------------- Weitere Abschnitte ------------------------- */

  function methodHtml() {
    var m = D.method;
    return '<section class="section" id="methodik">' +
      '<div class="section__head"><span class="eyebrow">' + esc(m.kicker) + '</span>' +
        '<h2>' + esc(m.headline) + '</h2><p>' + rich(m.intro) + '</p></div>' +
      '<div class="criteria">' + (D.criteria || []).map(function (c) {
        return '<article class="criterion"><div class="criterion__w">' + c.weight + '%</div>' +
          '<div><h3>' + esc(c.label) + '</h3><p>' + esc(c.desc) + '</p></div></article>';
      }).join('') + '</div>' +
      '<p class="note" style="margin-top:1.1rem">' + icon.info + '<span>' + rich(m.outro) + '</span></p>' +
    '</section>';
  }

  function safetyHtml() {
    var s = D.safety;
    if (!s) return '';
    return '<section class="section" id="sicherheit">' +
      '<div class="section__head"><span class="eyebrow">' + esc(s.kicker) + '</span>' +
        '<h2>' + esc(s.headline) + '</h2><p>' + esc(s.intro) + '</p></div>' +
      '<div class="rules">' + s.rules.map(function (r) {
        return '<article class="rule"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></article>';
      }).join('') + '</div></section>';
  }

  function conclusionHtml() {
    var c = D.conclusion;
    return '<section class="section" id="fazit">' +
      '<div class="section__head"><span class="eyebrow">' + esc(c.kicker) + '</span>' +
        '<h2>' + esc(c.headline) + '</h2></div>' +
      '<div class="review__body">' +
        (c.paragraphs || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('') +
      '</div>' +
      (c.quote ? '<figure class="quote">' +
        '<blockquote class="quote__text">' + esc(c.quote.text) + '</blockquote>' +
        '<figcaption class="quote__by">' +
          '<span class="avatar" aria-hidden="true">' + esc(D.meta.author.initials) + '</span>' +
          '<span><strong>' + esc(c.quote.author) + '</strong><br>' +
          '<span class="quote__role">' + esc(c.quote.role) + '</span></span>' +
        '</figcaption></figure>' : '') +
      '<h3 style="margin:2.2rem 0 .9rem">Die Rangliste im Überblick</h3>' + rankingTable() +
    '</section>';
  }

  function faqHtml() {
    return '<section class="section" id="faq">' +
      '<div class="section__head"><span class="eyebrow">FAQ</span>' +
        '<h2>Häufige Fragen zu ' + esc(D.meta.categoryLong || D.meta.category) + '</h2></div>' +
      '<div class="faq">' + (D.faq || []).map(function (f, i) {
        return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary>' +
          '<div class="faq__a"><p>' + rich(f.a) + '</p></div></details>';
      }).join('') + '</div></section>';
  }

  function footerHtml() {
    var cols = [
      { h: 'Verglichmi', items: ['Über uns', 'So testen wir', 'Redaktion', 'Kontakt'] },
      { h: 'Kategorien', items: ['Technik', 'Haushalt', 'Sommer', 'Garten', 'Sport'] },
      { h: 'Rechtliches', items: ['Impressum', 'Datenschutz', 'AGB', 'Affiliate-Hinweis'] },
      { h: 'Transparenz', items: ['Testmethodik', 'Unabhängigkeit', 'Korrekturen melden'] },
    ];
    return '<footer class="footer"><div class="shell">' +
      '<div class="footer__grid">' + cols.map(function (c) {
        return '<div><h4>' + esc(c.h) + '</h4><ul>' +
          c.items.map(function (i) { return '<li><a href="#top">' + esc(i) + '</a></li>'; }).join('') +
        '</ul></div>';
      }).join('') + '</div>' +
      '<div class="footer__bottom">' +
        '<a class="brand" href="#top">' + brandMark() + '<span class="brand__word">verglich<em>mi</em></span></a>' +
        '<span>© ' + new Date().getFullYear() + ' Verglichmi · Alle Tests unabhängig und selbst finanziert</span>' +
        '<a class="totop" href="#top">↑ Nach oben</a>' +
      '</div></div></footer>';
  }

  /* ---------------- Strukturierte Daten ------------------------ */

  function jsonLd() {
    var itemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: D.meta.title + ' ' + D.meta.year,
      numberOfItems: D.products.length,
      itemListElement: D.products.map(function (p, i) {
        return { '@type': 'ListItem', position: i + 1, item: {
          '@type': 'Product', name: p.brand + ' ' + p.model,
          brand: { '@type': 'Brand', name: p.brand },
          review: { '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: p.grade, bestRating: 1, worstRating: 6 },
            author: { '@type': 'Person', name: D.meta.author.name } },
          offers: { '@type': 'Offer', price: p.price.current, priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock' },
        } };
      }),
    };
    var faqPage = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: (D.faq || []).map(function (f) {
        return { '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: String(f.a).replace(/<[^>]+>/g, '') } };
      }),
    };
    [itemList, faqPage].forEach(function (o) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(o);
      document.head.appendChild(s);
    });
  }

  /* ---------------- Interaktion -------------------------------- */

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem('vg-theme'); } catch (e) { /* Private Mode */ }
    if (stored === 'dark' || stored === 'light') document.documentElement.setAttribute('data-theme', stored);
  }

  function initEvents() {
    document.addEventListener('click', function (ev) {
      /* Farbschema */
      if (ev.target.closest('[data-theme-toggle]')) {
        var root = document.documentElement;
        var dark = root.getAttribute('data-theme') === 'dark' ||
          (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var next = dark ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('vg-theme', next); } catch (e) { /* ignoriert */ }
        return;
      }

      /* Schnellwahl */
      var opt = ev.target.closest('.picker__opt');
      if (opt) {
        document.querySelectorAll('.picker__opt[data-axis="' + opt.getAttribute('data-axis') + '"]')
          .forEach(function (b) { b.setAttribute('aria-pressed', String(b === opt)); });
        renderPickerResult();
        return;
      }

      /* Filter */
      var chip = ev.target.closest('.chipbtn[data-filter]');
      if (chip) {
        document.querySelectorAll('.chipbtn[data-filter]')
          .forEach(function (b) { b.setAttribute('aria-pressed', String(b === chip)); });
        applyFilter(chip.getAttribute('data-filter'));
        return;
      }

      /* Affiliate-Klick */
      var a = ev.target.closest('a[data-shop]');
      if (a) {
        var payload = {
          shop: a.getAttribute('data-shop'),
          product: a.getAttribute('data-product'),
          url: a.getAttribute('href'),
        };
        if (typeof window.vgTrackOffer === 'function') window.vgTrackOffer(payload);
        if (AFF.staging) {
          ev.preventDefault();
          toast('Staging – kein Weiterleiten. Live-Ziel wäre:\n' + payload.url);
        }
      }
    });
  }

  /* Rail: aktiven Abschnitt markieren und Lesefortschritt zeigen */
  function initRail() {
    var links = {};
    document.querySelectorAll('[data-rail]').forEach(function (a) { links[a.getAttribute('data-rail')] = a; });
    var targets = Object.keys(links)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!targets.length) return;

    var bar = document.querySelector('[data-progress]');
    var active = null;

    function update() {
      /* Aktiv ist der letzte Abschnitt, dessen Oberkante oberhalb der Mitte liegt. */
      var line = window.innerHeight * 0.32, found = null;
      targets.forEach(function (t) { if (t.getBoundingClientRect().top <= line) found = t; });
      if (found && found.id !== active) {
        if (active && links[active]) links[active].removeAttribute('aria-current');
        active = found.id;
        links[active].setAttribute('aria-current', 'true');
      }
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('vg-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'vg-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:200;' +
        'max-width:min(560px,92vw);background:var(--ink);color:var(--bg);padding:.8rem 1.05rem;' +
        'border-radius:10px;font-size:.84rem;line-height:1.45;box-shadow:var(--shadow-lg);' +
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
    document.title = D.meta.title + ' ' + D.meta.year + ' | Verglichmi';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content',
        D.products.length + ' ' + D.meta.category + ' im Test: Testsieger ist der ' +
        D.products[0].brand + ' ' + D.products[0].model + ' mit Note ' + gradeStr(D.products[0].grade) +
        '. Messwerte, Ausstattung und aktuelle Preise im Vergleich.');
    }

    var sections = sectionRegister();

    document.getElementById('vg-app').innerHTML =
      mastheadHtml() +
      /* Artikelkopf steht in derselben Spalte wie der Fliesstext,
         damit Titel und Abschnitte auf einer Kante sitzen. */
      '<main id="top"><div class="shell"><div class="layout">' +
        railHtml(sections) +
        '<div class="content">' +

          heroHtml() +
          pickerHtml() +

          '<section class="section" id="bestenliste">' +
            '<div class="section__head"><span class="eyebrow">Bestenliste</span>' +
              '<h2>Alle ' + D.products.length + ' Boote, sortiert nach Testnote</h2>' +
              '<p>Jede Box zeigt die vier wichtigsten Messwerte, was dafür und dagegen spricht sowie ' +
              'den Bestpreis bei drei Händlern. Die ausführlichen Einzeltests folgen darunter.</p></div>' +
            filterbarHtml() +
            '<div class="list">' +
              D.products.map(function (p, i) { return productCard(p, i + 1); }).join('') +
            '</div>' +
            '<p class="note" style="margin-top:1.1rem">' + icon.info +
              '<span><b>Zur Sortierung:</b> Bei gleicher Testnote entscheidet das interne Ergebnis, das ' +
              'wir auf drei Nachkommastellen führen. Preise werden mehrmals täglich aktualisiert.</span></p>' +
          '</section>' +

          '<section class="section" id="einzeltests">' +
            '<div class="section__head"><span class="eyebrow">Einzeltests</span>' +
              '<h2>Jedes Boot im ausführlichen Test</h2>' +
              '<p>Was hinter den Noten steckt: Messwerte, Eindruck auf dem Wasser und die Frage, für ' +
              'wen sich welches Boot wirklich lohnt.</p></div>' +
            wave +
            D.products.map(reviewSection).join('') +
          '</section>' +

          (D.gadgets ?
          '<section class="section" id="ausstattung">' +
            '<div class="section__head"><span class="eyebrow">Ausstattung</span>' +
              '<h2>' + esc(D.gadgets.title) + '</h2><p>' + rich(D.gadgets.intro) + '</p></div>' +
            gadgetMatrix() +
          '</section>' : '') +

          methodHtml() +
          safetyHtml() +

          '<section class="section" id="daten">' +
            '<div class="section__head"><span class="eyebrow">Direktvergleich</span>' +
              '<h2>Alle Messwerte und technischen Daten</h2>' +
              '<p>Die gemessenen Zeilen sind hervorgehoben – das sind die Werte, die wir selbst ' +
              'erhoben haben, nicht die Herstellerangaben.</p></div>' +
            dataTable() +
          '</section>' +

          conclusionHtml() +
          faqHtml() +
        '</div>' +
      '</div></div></main>' +
      footerHtml();

    renderPickerResult();
    applyFilter('alle');
    jsonLd();
    initRail();
  }

  /* ---------------- Start -------------------------------------- */

  initTheme();
  render();
  initEvents();

  /* Kleine öffentliche API für spätere Integration */
  window.VG = {
    data: D,
    offerUrl: offerUrl,
    bestOfferKey: bestOfferKey,
    formatPrice: chf,
    rerender: render,
  };
})();
