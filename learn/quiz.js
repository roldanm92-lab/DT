(function () {
  var D = window.DT_DATA, S = window.DTStore, U = window.DTUtil;
  var picker = document.getElementById('picker');
  var stage = document.getElementById('stage');
  var EXAM_SIZE = 20;
  var state = null;

  function allQuestions() {
    var out = [];
    Object.keys(D.quizzes).forEach(function (id) {
      D.quizzes[id].questions.forEach(function (q) { out.push(Object.assign({ lesson: id }, q)); });
    });
    return out;
  }

  function prepare(q) {
    // Shuffle options but remember which one is correct.
    var opts = q.options.map(function (t, i) { return { text: t, correct: i === q.answer }; });
    return Object.assign({}, q, { opts: U.shuffle(opts) });
  }

  function drawPicker(active) {
    var html = '';
    D.lessons.forEach(function (l) {
      var best = S.bestQuiz(l.id);
      html += '<button class="chip' + (active === l.id ? ' on' : '') + '" data-id="' + l.id + '">' +
        'L' + l.num + ' · ' + U.esc(l.title) +
        (best != null ? '<span class="best">' + best + '%</span>' : '') + '</button>';
    });
    var eb = S.bestQuiz('exam');
    html += '<button class="chip' + (active === 'exam' ? ' on' : '') + '" data-id="exam">★ Practice exam' +
      (eb != null ? '<span class="best">' + eb + '%</span>' : '') + '</button>';
    picker.innerHTML = html;
    var on = picker.querySelector('.chip.on');
    if (on) picker.scrollLeft = on.offsetLeft - picker.offsetLeft - 16;
  }

  picker.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    start(b.getAttribute('data-id'));
  });

  function start(id, onlyThese) {
    var qs, title;
    if (onlyThese) {
      qs = onlyThese; title = state.title + ' — retry missed';
    } else if (id === 'exam') {
      qs = U.shuffle(allQuestions()).slice(0, EXAM_SIZE); title = 'Practice exam';
    } else {
      qs = U.shuffle(D.quizzes[id].questions.map(function (q) { return Object.assign({ lesson: id }, q); }));
      title = 'Lesson ' + parseInt(id, 10) + ' · ' + D.quizzes[id].title;
    }
    state = { id: id, title: title, qs: qs.map(prepare), i: 0, right: 0, missed: [], answered: false,
              retry: !!onlyThese };
    drawPicker(id);
    history.replaceState(null, '', id === 'exam' ? '?mode=exam' : '?lesson=' + id);
    show();
  }

  function show() {
    var q = state.qs[state.i];
    var n = state.qs.length;
    var lessonTag = state.id === 'exam' ? ' · Lesson ' + parseInt(q.lesson, 10) : '';
    stage.innerHTML =
      '<div class="card">' +
      '<div class="meta"><span>' + U.esc(state.title) + '</span><span>Question ' + (state.i + 1) + ' of ' + n + lessonTag + '</span></div>' +
      '<div class="bar"><i style="width:' + (state.i / n * 100) + '%"></i></div>' +
      '<p class="question">' + U.esc(q.q) + '</p>' +
      '<div class="options">' + q.opts.map(function (o, k) {
        return '<button class="opt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + U.esc(o.text) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="feedback" id="fb" aria-live="polite"></div>' +
      '<div class="actions"><span class="hint">Keys: A–D to answer, Enter for next</span>' +
      '<button class="btn primary" id="next" disabled>' + (state.i + 1 === n ? 'See results' : 'Next question') + '</button></div>' +
      '</div>';
    state.answered = false;
    stage.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () { answer(parseInt(b.getAttribute('data-k'), 10)); });
    });
    document.getElementById('next').addEventListener('click', next);
  }

  function answer(k) {
    if (state.answered) return;
    state.answered = true;
    var q = state.qs[state.i];
    var ok = q.opts[k].correct;
    if (ok) state.right++; else state.missed.push(q);
    stage.querySelectorAll('.opt').forEach(function (b, j) {
      b.disabled = true;
      if (q.opts[j].correct) b.classList.add('correct');
      else if (j === k) b.classList.add('wrong');
    });
    var fb = document.getElementById('fb');
    fb.innerHTML = (ok ? '<strong class="ok">Correct.</strong> ' : '<strong class="no">Not quite.</strong> ') + U.esc(q.explain);
    fb.classList.add('show');
    var nb = document.getElementById('next');
    nb.disabled = false; nb.focus();
  }

  function next() {
    if (!state.answered) return;
    state.i++;
    if (state.i < state.qs.length) show(); else results();
  }

  function results() {
    var n = state.qs.length, pct = Math.round(state.right / n * 100);
    var newBest = state.retry ? false : S.recordQuiz(state.id, pct);
    var pass = pct >= U.PASS;
    var verdict = pass ? (pct === 100 ? 'Perfect score!' : 'Passed — nice work.') : 'Not passed yet — review and retry.';
    var notesLink = state.id !== 'exam'
      ? '<a class="btn" href="../' + D.lessons.filter(function (l) { return l.id === state.id; })[0].notes + '">Review the notes</a>'
      : '<a class="btn" href="../docs/09-cram-sheet-and-final-review.html">Open the cram sheet</a>';
    var missedHtml = state.missed.length ? '<div class="review"><h3>Review what you missed</h3><ol>' +
      state.missed.map(function (q) {
        var right = q.opts.filter(function (o) { return o.correct; })[0].text;
        return '<li>' + U.esc(q.q) + '<br><span class="ans">' + U.esc(right) + '</span><br><span class="exp">' + U.esc(q.explain) + '</span></li>';
      }).join('') + '</ol></div>' : '';
    stage.innerHTML =
      '<div class="card result">' +
      '<div class="verdict">' + verdict + '</div>' +
      '<div class="big" style="color:var(--' + (pass ? 'good' : 'bad') + ')">' + pct + '%</div>' +
      '<p class="hint">' + state.right + ' of ' + n + ' correct' + (newBest ? ' · new best score saved' : '') +
      (state.retry ? ' · retry rounds don\'t change your best score' : '') + '</p>' +
      '<div class="actions" style="justify-content:center">' +
      (state.missed.length ? '<button class="btn primary" id="retry">Retry the ' + state.missed.length + ' missed</button>' : '') +
      '<button class="btn" id="again">' + (state.id === 'exam' ? 'New exam' : 'Retake quiz') + '</button>' +
      notesLink + '</div>' + missedHtml + '</div>';
    drawPicker(state.id);
    var r = document.getElementById('retry');
    if (r) r.addEventListener('click', function () {
      start(state.id, state.missed.map(function (q) { return Object.assign({}, q, { opts: undefined }); }));
    });
    document.getElementById('again').addEventListener('click', function () { start(state.id); });
  }

  document.addEventListener('keydown', function (e) {
    if (!state || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = 'abcd'.indexOf(e.key.toLowerCase());
    if (k >= 0 && !state.answered && stage.querySelector('.opt[data-k="' + k + '"]')) { answer(k); e.preventDefault(); }
    else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && state.answered && document.getElementById('next')) { next(); e.preventDefault(); }
  });

  var lesson = U.param('lesson'), mode = U.param('mode');
  drawPicker(null);
  if (mode === 'exam') start('exam');
  else if (lesson && D.quizzes[lesson]) start(lesson);
  else stage.innerHTML = '<div class="card"><p class="question">Choose a quiz above to begin.</p>' +
    '<p class="hint">Lesson quizzes have 6–8 questions. The practice exam draws ' + EXAM_SIZE + ' random questions from all lessons.</p></div>';
})();
