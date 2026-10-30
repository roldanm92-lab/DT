// Theme: follow the system setting, with a manual toggle remembered per browser.
(function () {
  var r = document.documentElement;
  try { var t = localStorage.getItem('theme'); if (t) r.setAttribute('data-theme', t); } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.querySelector('.theme-btn');
    if (!b) return;
    b.addEventListener('click', function () {
      var cur = r.getAttribute('data-theme');
      var dark = cur === 'dark' || (!cur && matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';
      r.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });
})();
