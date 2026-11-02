(function () {
  var D = window.DT_SEARCH, U = window.DTUtil;
  var G = D.glossary, SEC = D.sections;
  var bySlug = {}; G.forEach(function (e) { bySlug[e.slug] = e; });
  var lessonNum = {}; D.lessons.forEach(function (l) { lessonNum[l.id] = l.num; });

  var qEl = document.getElementById('q');
  var resEl = document.getElementById('results');
  var countEl = document.getElementById('count');
  var lessEl = document.getElementById('lessons');
  var azEl = document.getElementById('az');
  var lesson = 'all';
  var NOTES_SHOWN = 6;

  // ---------- text helpers
  function norm(s) {
    return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_/]+/g, ' ').replace(/[^\w\s.&()]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function words(q) { return norm(q).split(' ').filter(Boolean); }
  function lessonLabel(id) { return id === '09' ? 'Cram sheet' : 'Lesson ' + lessonNum[id]; }

  // Wrap every occurrence of any query word in <mark>, on already-escaped text.
  function highlight(text, ws) {
    var safe = U.esc(text);
    if (!ws.length) return safe;
    var parts = ws.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s\\-/]+'); });
    return safe.replace(new RegExp('(' + parts.join('|') + ')', 'gi'), '<mark>$1</mark>');
  }

  // Precompute normalized fields once.
  G.forEach(function (e) {
    e._t = norm(e.term);
    e._a = e.aliases.map(norm);
    e._d = norm(e.defs.map(function (d) { return d.text; }).join(' '));
  });
  SEC.forEach(function (s) { s._h = norm(s.heading); s._x = norm(s.text); });

  // ---------- scoring
  function scoreTerm(e, ws, full) {
    var s = 0, via = null;
    if (e._t === full) s += 1000;
    else if (e._t.indexOf(full) === 0) s += 600;
    else if ((' ' + e._t).indexOf(' ' + full) >= 0) s += 400;
    e._a.forEach(function (a, i) {
      if (a === full) { if (s < 700) { s = Math.max(s, 700); via = e.aliases[i]; } }
      else if (a.indexOf(full) === 0 && s < 350) { s = 350; via = e.aliases[i]; }
    });
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i], hit = false;
      if (e._t.indexOf(w) >= 0) { s += 60; hit = true; }
      if (e._a.some(function (a) { return a.indexOf(w) >= 0; })) {
        s += 30; hit = true;
        if (!via && e._t.indexOf(w) < 0) via = e.aliases.filter(function (a) { return norm(a).indexOf(w) >= 0; })[0];
      }
      if (e._d.indexOf(w) >= 0) { s += 10; hit = true; }
      if (!hit) return null;               // every word must appear somewhere
    }
    // Only explain the match when the term's own name doesn't already show it.
    if (ws.every(function (w) { return e._t.indexOf(w) >= 0; })) via = null;
    return { e: e, s: s, via: via };
  }

  function scoreSection(sec, ws, full) {
    var s = 0;
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i], h = sec._h.indexOf(w) >= 0, n = sec._x.split(w).length - 1;
      if (!h && !n) return null;
      s += (h ? 40 : 0) + Math.min(n, 8) * 5;
    }
    if (sec._x.indexOf(full) >= 0) s += 30;
    return { sec: sec, s: s };
  }

  function snippet(text, ws) {
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < ws.length && at < 0; i++) at = low.indexOf(ws[i]);
    if (at < 0) at = 0;
    var start = Math.max(0, at - 70), end = Math.min(text.length, at + 150);
    if (start > 0) start = text.indexOf(' ', start) + 1;
    return (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '');
  }

  // ---------- rendering
  function termCard(e, ws, via) {
    var multi = e.defs.length > 1;
    var defs = e.defs.map(function (d) {
      return '<p class="gdef">' + (multi ? '<span class="gfrom">' + lessonLabel(d.lesson) + '</span> ' : '') + highlight(d.text, ws) + '</p>';
    }).join('');
    var badges = e.lessons.map(function (id) { return '<span class="gbadge">' + lessonLabel(id) + '</span>'; }).join('');
    var mentions = e.mentions.map(function (m) {
      return '<a href="../' + m.href + '">' + lessonLabel(m.lesson) + '</a>';
    }).join('');
    var related = e.related.filter(function (s) { return bySlug[s]; }).map(function (s) {
      return '<a class="gchip" href="#' + s + '" data-goto="' + s + '">' + U.esc(bySlug[s].term) + '</a>';
    }).join('');
    return '<article class="gterm" id="' + e.slug + '">' +
      '<div class="ghead"><h3><a href="#' + e.slug + '" class="ganchor">' + highlight(e.term, ws) + '</a></h3>' + badges + '</div>' +
      (via ? '<p class="gvia">Matched “' + U.esc(via) + '”</p>' : '') +
      defs +
      '<div class="gfoot">' +
      '<span class="glinks"><span class="glabel">In the notes</span>' + mentions + '</span>' +
      (related ? '<span class="glinks"><span class="glabel">Related</span>' + related + '</span>' : '') +
      '</div></article>';
  }

  function inLesson(e) { return lesson === 'all' || e.lessons.indexOf(lesson) >= 0; }

  function render() {
    var q = qEl.value.trim();
    var ws = words(q), full = ws.join(' ');
    var html = '';
    if (!ws.length) {
      // Browse mode: alphabetical, grouped by letter.
      var list = G.filter(inLesson);
      azEl.hidden = false; drawAZ(list);
      countEl.textContent = list.length + ' term' + (list.length === 1 ? '' : 's') +
        (lesson === 'all' ? '' : ' introduced in ' + lessonLabel(lesson));
      var cur = '';
      list.forEach(function (e) {
        var L = letterOf(e.term);
        if (L !== cur) { cur = L; html += '<h2 class="gletter" id="letter-' + L + '">' + L + '</h2>'; }
        html += termCard(e, [], null);
      });
      resEl.innerHTML = html;
      return;
    }

    azEl.hidden = true;
    var terms = G.filter(inLesson).map(function (e) { return scoreTerm(e, ws, full); })
      .filter(Boolean).sort(function (a, b) { return b.s - a.s || a.e.term.localeCompare(b.e.term); });
    var secs = SEC.filter(function (s) { return lesson === 'all' || s.lesson === lesson; })
      .map(function (s) { return scoreSection(s, ws, full); })
      .filter(Boolean).sort(function (a, b) { return b.s - a.s; });

    countEl.textContent = terms.length + ' term' + (terms.length === 1 ? '' : 's') + ' · ' +
      secs.length + ' place' + (secs.length === 1 ? '' : 's') + ' in the notes';

    if (terms.length) {
      html += '<h2 class="gsec">Glossary</h2>' + terms.map(function (r) { return termCard(r.e, ws, r.via); }).join('');
    }
    if (secs.length) {
      html += '<h2 class="gsec">In the study notes</h2><div class="nres">' +
        secs.map(function (r, i) {
          var s = r.sec;
          return '<a class="nhit' + (i >= NOTES_SHOWN ? ' more' : '') + '" href="../' + s.page + '#' + s.id + '">' +
            '<span class="nwhere">' + U.esc(lessonLabel(s.lesson) + (s.lesson !== '09' ? ' · ' + s.where : '')) + '</span>' +
            '<span class="nhead">' + highlight(s.heading, ws) + '</span>' +
            '<span class="nsnip">' + highlight(snippet(s.text, ws), ws) + '</span></a>';
        }).join('') + '</div>' +
        (secs.length > NOTES_SHOWN ? '<button class="btn" id="morebtn" type="button">Show ' + (secs.length - NOTES_SHOWN) + ' more</button>' : '');
    }
    if (!terms.length && !secs.length) {
      html = '<div class="card gempty"><p class="question">Nothing matches “' + U.esc(q) + '”.</p>' +
        '<p class="hint">Try a shorter word, check the spelling, or ' +
        (lesson !== 'all' ? '<button class="linkish" id="alllessons" type="button">search all lessons</button>.' : 'browse the full list below.') + '</p>' +
        '<p class="gtry">Try: ' + ['Apdex', 'baseline', 'ActiveGate', 'XHR', 'Davis', 'bucket'].map(function (t) {
          return '<button class="gchip" type="button" data-try="' + t + '">' + t + '</button>';
        }).join(' ') + '</p></div>';
    }
    resEl.innerHTML = html;
    var mb = document.getElementById('morebtn');
    if (mb) mb.addEventListener('click', function () {
      resEl.querySelectorAll('.nhit.more').forEach(function (a) { a.classList.remove('more'); });
      mb.remove();
    });
    var al = document.getElementById('alllessons');
    if (al) al.addEventListener('click', function () { setLesson('all'); });
  }

  function letterOf(t) { var c = t.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; }

  function drawAZ(list) {
    var have = {}; list.forEach(function (e) { have[letterOf(e.term)] = true; });
    var out = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (L) {
      out += have[L] ? '<a href="#letter-' + L + '">' + L + '</a>' : '<span aria-hidden="true">' + L + '</span>';
    });
    azEl.innerHTML = out;
  }

  function drawLessons() {
    var html = '<button class="chip' + (lesson === 'all' ? ' on' : '') + '" data-l="all">All lessons</button>';
    D.lessons.forEach(function (l) {
      html += '<button class="chip' + (lesson === l.id ? ' on' : '') + '" data-l="' + l.id + '">L' + l.num + ' · ' + U.esc(l.title) + '</button>';
    });
    lessEl.innerHTML = html;
  }

  function setLesson(id) { lesson = id; drawLessons(); syncUrl(); render(); }

  function syncUrl() {
    var p = new URLSearchParams();
    if (qEl.value.trim()) p.set('q', qEl.value.trim());
    if (lesson !== 'all') p.set('lesson', lesson);
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  // ---------- events
  var t;
  qEl.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { syncUrl(); render(); }, 80);
  });
  qEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { qEl.value = ''; syncUrl(); render(); }
    if (e.key === 'Enter') {
      var first = resEl.querySelector('.gterm, .nhit');
      if (first) { e.preventDefault(); first.scrollIntoView({ block: 'start' }); flash(first); }
    }
  });
  lessEl.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (b) setLesson(b.getAttribute('data-l'));
  });
  resEl.addEventListener('click', function (e) {
    var go = e.target.closest('[data-goto]');
    if (go) { e.preventDefault(); goTo(go.getAttribute('data-goto')); return; }
    var tr = e.target.closest('[data-try]');
    if (tr) { qEl.value = tr.getAttribute('data-try'); syncUrl(); render(); qEl.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== qEl) { e.preventDefault(); qEl.focus(); qEl.select(); }
  });

  function flash(el) {
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }

  // Jump to a term, clearing any search/filter that would hide it.
  function goTo(slug) {
    if (!document.getElementById(slug)) {
      qEl.value = ''; lesson = 'all'; drawLessons(); render();
    }
    var el = document.getElementById(slug);
    if (!el) return;
    history.replaceState(null, '', location.pathname + location.search + '#' + slug);
    el.scrollIntoView({ block: 'start' });
    flash(el);
  }

  // ---------- init
  var q0 = U.param('q'), l0 = U.param('lesson');
  if (q0) qEl.value = q0;
  if (l0 && lessonNum[l0]) lesson = l0;
  document.getElementById('intro').textContent =
    G.length + ' Dynatrace terms from the course. Search by name, abbreviation, or any word in a definition — results also cover the full study notes.';
  drawLessons();
  render();
  if (location.hash.length > 1) {
    var h = decodeURIComponent(location.hash.slice(1));
    if (bySlug[h]) setTimeout(function () { goTo(h); }, 0);
  } else if (!q0 && matchMedia('(pointer: fine)').matches) {
    qEl.focus({ preventScroll: true });   // skip on phones so the keyboard doesn't pop up
  }
})();
