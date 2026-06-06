// Anti-FOUC: runs synchronously in <head> to apply saved scheme before first paint
(function () {
  var s = localStorage.getItem('cc-scheme');
  document.documentElement.setAttribute('data-scheme', s !== null ? s : 'ink');
})();

window.CC = {
  getScheme: function () {
    return document.documentElement.getAttribute('data-scheme') || '';
  },
  toggleScheme: function () {
    var next = window.CC.getScheme() === 'ink' ? 'paper' : 'ink';
    document.documentElement.setAttribute('data-scheme', next);
    localStorage.setItem('cc-scheme', next);
    window.dispatchEvent(new CustomEvent('cc-schemechange', { detail: next }));
  }
};
