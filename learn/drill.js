(function () {
  var D = window.DT_DATA, S = window.DTStore, U = window.DTUtil;
  var stage = document.getElementById('stage');
  var answers = D.drills.map(function (d) { return d.a; });
  var st = { streak: 0, total: 0, right: 0, order: [], cur: null, answered: false };

  function nextScenario() {
    if (!st.order.length) st.order = U.shuffle(D.drills);
    var d = st.order.pop();
    var wrong = U.shuffle(answers.filter(function (a) { return a !== d.a; })).slice(0, 3);
    st.cur = { q: d.q, a: d.a, opts: U.shuffle([d.a].concat(wrong)) };
    st.answered = false;
    show();
  }

  function meta() {
    document.getElementById('meta').innerHTML =
      '<span>Streak: <span class="streak">' + st.streak + '</span> · Best: <span class="streak">' + S.get().drillBest + '</span></span>' +
      '<span>' + st.right + ' / ' + st.total + ' this session</span>';
  }

  function show() {
    var c = st.cur;
    stage.innerHTML =
      '<div class="card">' +
      '<div class="meta" id="meta"></div>' +
      '<p class="hint" style="margin:0 0 6px">Which would you use?</p>' +
      '<p class="scenario">' + U.esc(c.q) + '</p>' +
      '<div class="options">' + c.opts.map(function (o, k) {
        return '<button class="opt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + U.esc(o) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="feedback" id="fb" aria-live="polite"></div>' +
      '<div class="actions"><span class="hint">Keys: A–D, Enter for next</span>' +
      '<button class="btn primary" id="next" disabled>Next scenario</button></div></div>';
    stage.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () { pick(parseInt(b.getAttribute('data-k'), 10)); });
    });
    document.getElementById('next').addEventListener('click', go);
    meta();
  }

  function pick(k) {
    if (st.answered) return;
    st.answered = true; st.total++;
    var c = st.cur, ok = c.opts[k] === c.a, msg;
    if (ok) {
      st.right++; st.streak++;
      var best = S.recordStreak(st.streak);
      msg = '<strong class="ok">Correct!</strong> ' + (best && st.streak > 1 ? 'New best streak: ' + st.streak + '.' : 'Streak: ' + st.streak + '.');
    } else {
      msg = '<strong class="no">Not this one.</strong> The answer is <strong>' + U.esc(c.a) + '</strong>.' +
        (st.streak > 1 ? ' Streak ended at ' + st.streak + '.' : '');
      st.streak = 0;
    }
    stage.querySelectorAll('.opt').forEach(function (b, j) {
      b.disabled = true;
      if (c.opts[j] === c.a) b.classList.add('correct'); else if (j === k) b.classList.add('wrong');
    });
    var fb = document.getElementById('fb'); fb.innerHTML = msg; fb.classList.add('show');
    meta();
    var nb = document.getElementById('next'); nb.disabled = false; nb.focus();
  }

  function go() { if (st.answered) nextScenario(); }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = 'abcd'.indexOf(e.key.toLowerCase());
    if (k >= 0 && !st.answered) { pick(k); e.preventDefault(); }
    else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && st.answered) { go(); e.preventDefault(); }
  });

  nextScenario();
})();
