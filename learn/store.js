// Progress storage (this browser only). Every access is guarded: storage can be unavailable.
window.DTStore = (function () {
  var KEY = 'dt.progress.v1';
  var mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { mem = {}; }
    mem.quiz = mem.quiz || {};      // { "01": bestPercent, "exam": bestPercent }
    mem.known = mem.known || {};    // { "term": true }
    mem.drillBest = mem.drillBest || 0;
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  return {
    get: load,
    bestQuiz: function (id) { return load().quiz[id]; },
    recordQuiz: function (id, pct) {
      var p = load();
      if (p.quiz[id] == null || pct > p.quiz[id]) { p.quiz[id] = pct; save(); return true; }
      return false;
    },
    isKnown: function (term) { return !!load().known[term]; },
    setKnown: function (term, v) { var p = load(); if (v) p.known[term] = true; else delete p.known[term]; save(); },
    knownCount: function () { return Object.keys(load().known).length; },
    recordStreak: function (n) { var p = load(); if (n > p.drillBest) { p.drillBest = n; save(); return true; } return false; },
    reset: function () { mem = { quiz: {}, known: {}, drillBest: 0 }; save(); }
  };
})();

window.DTUtil = {
  shuffle: function (a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  },
  param: function (k) { return new URLSearchParams(location.search).get(k); },
  esc: function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  PASS: 80
};
