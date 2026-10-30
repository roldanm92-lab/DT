(function () {
  var D = window.DT_DATA, S = window.DTStore, U = window.DTUtil;
  var picker = document.getElementById('picker');
  var stage = document.getElementById('stage');
  var st = null;

  function deckFor(id, onlyUnknown) {
    var cards = D.flashcards.filter(function (c) { return id === 'all' || c.lesson === id; });
    if (onlyUnknown) cards = cards.filter(function (c) { return !S.isKnown(c.term); });
    return cards;
  }

  function drawPicker(active) {
    var html = '<button class="chip' + (active === 'all' ? ' on' : '') + '" data-id="all">All terms <span class="best">' + D.flashcards.length + '</span></button>';
    D.lessons.forEach(function (l) {
      var deck = deckFor(l.id);
      if (!deck.length) return;
      var known = deck.filter(function (c) { return S.isKnown(c.term); }).length;
      html += '<button class="chip' + (active === l.id ? ' on' : '') + '" data-id="' + l.id + '">L' + l.num + ' · ' +
        U.esc(l.title) + ' <span class="best">' + known + '/' + deck.length + '</span></button>';
    });
    picker.innerHTML = html;
    var on = picker.querySelector('.chip.on');
    if (on) picker.scrollLeft = on.offsetLeft - picker.offsetLeft - 16;
  }

  picker.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (b) start(b.getAttribute('data-id'));
  });

  function start(id, onlyUnknown) {
    var deck = deckFor(id, onlyUnknown);
    st = { id: id, queue: U.shuffle(deck), done: 0, total: deck.length, again: 0, flipped: false };
    drawPicker(id);
    history.replaceState(null, '', '?lesson=' + id);
    if (!deck.length) {
      stage.innerHTML = '<div class="card result"><div class="verdict">You know every card in this deck.</div>' +
        '<div class="actions" style="justify-content:center"><button class="btn" id="all">Study the whole deck anyway</button></div></div>';
      document.getElementById('all').addEventListener('click', function () { start(id, false); });
      return;
    }
    show();
  }

  function lessonName(id) {
    var l = D.lessons.filter(function (x) { return x.id === id; })[0];
    return l ? 'Lesson ' + l.num + ' · ' + l.title : '';
  }

  function show() {
    var c = st.queue[0];
    st.flipped = false;
    stage.innerHTML =
      '<div class="meta"><span>' + U.esc(lessonName(c.lesson)) + '</span><span>' + st.done + ' of ' + st.total + ' learned this round</span></div>' +
      '<div class="bar"><i style="width:' + (st.done / st.total * 100) + '%"></i></div>' +
      '<div class="flip" id="flip" role="button" tabindex="0" aria-label="Flashcard. Press Space to flip.">' +
      '<div class="flip-inner"><div class="face front"><span class="label">Term</span><div class="term">' + U.esc(c.term) + '</div>' +
      '<p class="hint" style="margin-top:14px">Tap to reveal the definition</p></div>' +
      '<div class="face back" aria-hidden="true"><span class="label">' + U.esc(c.term) + '</span><div class="def">' + U.esc(c.def) + '</div></div></div></div>' +
      '<div class="actions"><span class="hint">Space: flip · 1: again · 2: got it</span><span>' +
      '<button class="btn" id="again">Again</button> <button class="btn primary" id="got">Got it</button></span></div>';
    var f = document.getElementById('flip');
    f.addEventListener('click', flip);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') { flip(); e.preventDefault(); } });
    document.getElementById('again').addEventListener('click', function () { rate(false); });
    document.getElementById('got').addEventListener('click', function () { rate(true); });
  }

  function flip() {
    st.flipped = !st.flipped;
    var f = document.getElementById('flip');
    f.classList.toggle('flipped', st.flipped);
    f.querySelector('.front').setAttribute('aria-hidden', st.flipped);
    f.querySelector('.back').setAttribute('aria-hidden', !st.flipped);
  }

  function rate(known) {
    var c = st.queue.shift();
    if (known) { S.setKnown(c.term, true); st.done++; }
    else {
      S.setKnown(c.term, false); st.again++;
      // Put it back a few cards later so it comes around again this round.
      st.queue.splice(Math.min(3, st.queue.length), 0, c);
    }
    if (st.queue.length) show(); else finish();
  }

  function finish() {
    drawPicker(st.id);
    var left = deckFor(st.id, true).length;
    stage.innerHTML = '<div class="card result"><div class="verdict">Deck complete!</div>' +
      '<div class="big" style="color:var(--good)">' + st.total + '</div><p class="hint">cards learned · ' + st.again + ' "again" taps along the way</p>' +
      '<div class="actions" style="justify-content:center"><button class="btn primary" id="re">Shuffle and go again</button>' +
      '<a class="btn" href="quiz.html' + (st.id !== 'all' ? '?lesson=' + st.id : '?mode=exam') + '">Test yourself with a quiz</a></div>' +
      (left ? '<p class="hint" style="margin-top:14px">' + left + ' card' + (left > 1 ? 's' : '') + ' in this deck still marked "again".</p>' : '') + '</div>';
    document.getElementById('re').addEventListener('click', function () { start(st.id); });
  }

  document.addEventListener('keydown', function (e) {
    if (!st || !st.queue.length || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!document.getElementById('flip')) return;
    if (e.key === ' ') { flip(); e.preventDefault(); }
    else if (e.key === '1') rate(false);
    else if (e.key === '2') rate(true);
  });

  var l = U.param('lesson');
  drawPicker(null);
  if (l === 'all' || (l && deckFor(l).length)) start(l);
  else start('all');
})();
