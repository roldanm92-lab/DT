(function () {
  var D = window.DT_DATA, S = window.DTStore, PASS = DTUtil.PASS;

  function render() {
    var passed = 0, firstUnpassed = null;
    D.lessons.forEach(function (l) {
      var best = S.bestQuiz(l.id);
      var row = document.querySelector('.lesson[data-id="' + l.id + '"]');
      var cell = document.querySelector('[data-score="' + l.id + '"]');
      var ok = best != null && best >= PASS;
      if (ok) passed++; else if (!firstUnpassed) firstUnpassed = l;
      row.classList.toggle('passed', ok);
      cell.textContent = best == null ? '—' : best + '%';
      cell.title = best == null ? 'Quiz not taken yet' : 'Best quiz score';
    });
    document.getElementById('st-quizzes').textContent = passed + '/' + D.lessons.length;
    var exam = S.bestQuiz('exam');
    document.getElementById('st-exam').textContent = exam == null ? '—' : exam + '%';
    document.getElementById('st-cards').textContent = S.knownCount() + '/' + D.flashcards.length;
    document.getElementById('st-drill').textContent = S.get().drillBest;

    var c = document.getElementById('continue');
    var anyProgress = Object.keys(S.get().quiz).length > 0;
    if (anyProgress && firstUnpassed) {
      c.textContent = 'Continue: Lesson ' + firstUnpassed.num + ' quiz';
      c.href = 'learn/quiz.html?lesson=' + firstUnpassed.id;
    } else if (anyProgress && !firstUnpassed) {
      c.textContent = 'All lessons passed — try the exam';
      c.href = 'learn/quiz.html?mode=exam';
    }
  }

  document.getElementById('reset').addEventListener('click', function () {
    if (window.confirm('Clear your quiz scores, known flashcards and drill streak in this browser?')) {
      S.reset(); render();
    }
  });
  render();
})();
