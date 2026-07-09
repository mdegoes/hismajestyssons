// Anti-FOUC: runs synchronously in <head> to apply saved scheme before first paint
(function () {
  var s = localStorage.getItem('cc-scheme');
  if (s === null) {
    s = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'ink' : 'paper';
  }
  document.documentElement.setAttribute('data-scheme', s);
})();

function _ccUpdateTooltips(scheme) {
  var label = scheme === 'ink' ? 'Switch to light' : 'Switch to dark';
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.setAttribute('data-tooltip', label);
    btn.setAttribute('aria-label', label);
  });
}

window.CC = {
  getScheme: function () {
    return document.documentElement.getAttribute('data-scheme') || '';
  },
  toggleScheme: function () {
    var next = window.CC.getScheme() === 'ink' ? 'paper' : 'ink';
    document.documentElement.setAttribute('data-scheme', next);
    localStorage.setItem('cc-scheme', next);
    _ccUpdateTooltips(next);
    window.dispatchEvent(new CustomEvent('cc-schemechange', { detail: next }));
  }
};

document.addEventListener('DOMContentLoaded', function () {
  _ccUpdateTooltips(window.CC.getScheme());

  // Enable smooth transitions after first paint (prevents transition on page load)
  requestAnimationFrame(function () {
    document.documentElement.classList.add('theme-ready');
  });

  // Follow OS preference changes only when user has not set a manual preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (localStorage.getItem('cc-scheme') === null) {
        var next = e.matches ? 'ink' : 'paper';
        document.documentElement.setAttribute('data-scheme', next);
        _ccUpdateTooltips(next);
        window.dispatchEvent(new CustomEvent('cc-schemechange', { detail: next }));
      }
    });
  }
});
