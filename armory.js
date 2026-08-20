// The Armory — rendering + interaction. Depends on armory-data.js and
// armory-state.js (window.ARMORY_DATA/TIERS/RANKS, window.CC.armory),
// both of which must load first. Exposes window.Armory.init(), called
// once from armory.html after the page markup is in place.
(function () {
  var ARMORY_DATA = window.ARMORY_DATA;
  var ARMORY_TIERS = window.ARMORY_TIERS;
  var ARMORY_RANKS = window.ARMORY_RANKS;
  var CC = window.CC;

  var SIGILS = [
    { key: 'crown', label: 'Crown' }, { key: 'sword', label: 'Sword' }, { key: 'shield', label: 'Shield' },
    { key: 'anchor', label: 'Anchor' }, { key: 'wheel', label: "Ship's Wheel" }, { key: 'chalice', label: 'Chalice' },
    { key: 'helm', label: 'Helm' }, { key: 'banner', label: 'Banner' },
  ];
  var COLOR_OPTIONS = [
    { key: 't1', varName: '--t1' }, { key: 't2', varName: '--t2' },
    { key: 't3', varName: '--t3' }, { key: 't4', varName: '--t4' },
    { key: 'accent', varName: '--accent' }, { key: 'ink2', varName: '--ink-2' },
  ];

  var currentView = 'dossier';
  var currentQuery = '';
  var currentSinMapId = '';
  var profileOverlayMode = 'list';
  var pendingAvatar = { sigil: 'shield', color: 't3' };
  var pendingName = '';
  var editingProfileId = null;
  var pendingDrillVerseId = null;

  // ---------- utils ----------

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function findSinGlobal(sinId) {
    return ARMORY_DATA.find(function (s) { return s.id === sinId; }) || null;
  }
  function findVerseGlobal(verseId) {
    for (var i = 0; i < ARMORY_DATA.length; i++) {
      var sin = ARMORY_DATA[i];
      for (var j = 0; j < sin.verses.length; j++) {
        if (sin.verses[j].id === verseId) return { sin: sin, verse: sin.verses[j] };
      }
    }
    return null;
  }

  function sinViewModel(sin) {
    return { sin: sin, tier: ARMORY_TIERS[sin.tier], progress: CC.armory.getSinProgress(sin.id) };
  }

  // Search matches on the sin's own name/blurb/callsign AND every verse
  // tied to it (reference + full text) — so searching e.g. "wrath" or a
  // verse reference like "James 1" or a phrase from the verse itself
  // ("swift to hear") both find the right card/node.
  function sinSearchIndex(sin) {
    var verseText = sin.verses.map(function (v) { return v.ref + ' ' + v.text; }).join(' ');
    return (sin.name + ' ' + sin.blurb + ' ' + sin.callsign + ' ' + verseText).toLowerCase();
  }

  function avatarStage(level) {
    return Math.max(1, Math.min(5, Math.ceil(level / 2)));
  }

  function colorVar(key) {
    var found = COLOR_OPTIONS.find(function (c) { return c.key === key; });
    return found ? found.varName : '--t3';
  }
  function avatarSVG(sigil, colorKey, size) {
    size = size || 40;
    return '<svg class="avatar-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" ' +
      'style="--avatar-color: var(' + colorVar(colorKey) + ')"><use href="#sigil-' + sigil + '"></use></svg>';
  }

  // ---------- device detection / drill mode ----------

  function detectDefaultDrillMode() {
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var narrow = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    return (coarse || narrow) ? 'tap' : 'text';
  }
  function getEffectiveDrillMode(profileId) {
    var stored = CC.armory.getDrillMode(profileId);
    return stored === 'auto' ? detectDefaultDrillMode() : stored;
  }

  // ---------- free-text recall matching ----------

  function normalizeWords(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(function (w) { return w.replace(/^'+|'+$/g, ''); })
      .filter(Boolean);
  }

  // Word-level Levenshtein: each word is one comparison unit, so a wrong
  // word and a missing word are weighted equally (unlike char-level distance,
  // which would let a one-letter typo count the same as a whole extra word).
  function levenshteinWords(a, b) {
    var m = a.length, n = b.length;
    var dp = [];
    for (var i = 0; i <= m; i++) { dp.push(new Array(n + 1).fill(0)); dp[i][0] = i; }
    for (var j = 0; j <= n; j++) dp[0][j] = j;
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp;
  }

  // Backtrace the DP table to classify each correct-verse word as
  // match/substituted/missing, and collect answer words with no alignment
  // (extras) — reused for feedback highlighting, no second pass needed.
  function backtraceWords(dp, a, b) {
    var i = a.length, j = b.length;
    var perWord = new Array(a.length).fill('match');
    var extras = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
        perWord[i - 1] = 'match'; i--; j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        perWord[i - 1] = 'substituted'; i--; j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        perWord[i - 1] = 'missing'; i--;
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        extras.unshift(b[j - 1]); j--;
      } else { break; }
    }
    return { perWord: perWord, extras: extras };
  }

  // outcome: 'exact' (word-for-word after normalization) / 'close' (within
  // tolerance) / 'fail' — 'exact' and 'close' both count as a correct
  // attempt for mastery purposes, but get distinct feedback.
  function matchVerse(answerRaw, correctText) {
    var correctWords = normalizeWords(correctText);
    var answerWords = normalizeWords(answerRaw);
    var dp = levenshteinWords(correctWords, answerWords);
    var editDistance = dp[correctWords.length][answerWords.length];
    var allowed = Math.max(2, Math.ceil(correctWords.length * 0.15));
    var trace = backtraceWords(dp, correctWords, answerWords);
    var outcome = editDistance === 0 ? 'exact' : (editDistance <= allowed ? 'close' : 'fail');
    return {
      correct: outcome !== 'fail', outcome: outcome, editDistance: editDistance, allowed: allowed,
      correctWords: correctWords, perWord: trace.perWord, extras: trace.extras,
    };
  }

  // ---------- shared verse row ----------

  function progressStateClass(progress) {
    if (progress.conquered) return 'is-complete';
    if (progress.masteredCount === 0) return 'is-none';
    return 'is-partial';
  }

  // Mirrors the .card-progress.is-* color rules in armory.html so the
  // dossier card's left border always matches its own "verses mastered" text.
  // 'is-none' (nothing attempted yet) deliberately uses the site's own
  // --accent blue, not a --t* threat-tier color — every card starts in this
  // state, so a tier color here (especially --t4's red) would read as the
  // page's dominant/primary color on a fresh visit instead of a neutral default.
  var PROGRESS_STATE_COLOR_VAR = { 'is-none': '--accent', 'is-partial': '--t2', 'is-complete': '--t1' };

  // A verse masters at 2 correct passes in a row (see recordAttempt in
  // armory-state.js) — this renders that as 2 dots so progress toward it is
  // visible everywhere a verse shows up (card rows, map sheet, drill modal),
  // not just discoverable after finishing a drill.
  var MASTERY_PASSES_NEEDED = 2;
  function masteryDotsHTML(state) {
    var mastered = state.status === 'mastered';
    var filled = mastered ? MASTERY_PASSES_NEEDED : Math.min(state.streak, MASTERY_PASSES_NEEDED);
    var dots = '';
    for (var i = 0; i < MASTERY_PASSES_NEEDED; i++) {
      dots += '<span class="mastery-dot' + (i < filled ? ' is-filled' : '') + '"></span>';
    }
    var title = mastered ? 'Mastered' : (filled > 0 ? filled + ' of ' + MASTERY_PASSES_NEEDED + ' correct passes' : 'Needs ' + MASTERY_PASSES_NEEDED + ' correct passes in a row to master');
    return '<span class="mastery-dots' + (mastered ? ' is-complete' : '') + '" title="' + title + '">' + dots + '</span>';
  }

  function renderVerseRowHTML(verse) {
    var state = CC.armory.getVerseState(verse.id);
    var mastered = state.status === 'mastered';
    return '<div class="verse-row" data-verse-id="' + verse.id + '">'
      + '<div><div class="verse-ref">' + escapeHTML(verse.ref) + '</div>'
      + '<p class="verse-text">' + escapeHTML(verse.text) + '</p>'
      + masteryDotsHTML(state)
      + '</div>'
      + '<button type="button" class="drill-btn" data-verse-id="' + verse.id + '">' + (mastered ? 'Review' : 'Drill') + '</button>'
      + '</div>';
  }

  // ---------- dossier view ----------

  function dossierCardInnerHTML(sin, vm) {
    var verseRows = sin.verses.map(renderVerseRowHTML).join('');
    return '<div class="card-top">'
      + '<div class="card-id">FILE &middot; ' + sin.tag + '</div>'
      + '</div>'
      + '<h3 class="card-name">' + escapeHTML(sin.name) + '</h3>'
      + '<p class="card-blurb">' + escapeHTML(sin.blurb) + '</p>'
      + '<div class="card-progress ' + progressStateClass(vm.progress) + '">' + vm.progress.masteredCount + ' / ' + vm.progress.total + ' verses mastered'
      + (vm.progress.conquered ? ' <span class="conquered-tag">CONQUERED</span>' : '') + '</div>'
      + '<button type="button" class="expand-btn" aria-expanded="false">' + sin.verses.length + ' VERSES ARMED <span class="chev">&#8964;</span></button>'
      + '<div class="verse-list" hidden>' + verseRows + '</div>';
  }

  // Toggles a card's verse-list open/closed. Bound at the grid level (not
  // per-card) so it fires no matter where on the card was clicked; a
  // .drill-btn click is intercepted before this runs (see renderDossier),
  // so drilling a verse doesn't also collapse the card underneath it.
  function toggleCard(card) {
    var expandBtn = card.querySelector('.expand-btn');
    var list = card.querySelector('.verse-list');
    var open = expandBtn.getAttribute('aria-expanded') === 'true';
    expandBtn.setAttribute('aria-expanded', String(!open));
    list.hidden = open;
  }

  function renderDossier(stage) {
    var grid = document.createElement('div');
    grid.className = 'grid';
    grid.id = 'armoryGrid';
    ARMORY_DATA.forEach(function (sin) {
      var vm = sinViewModel(sin);
      var card = document.createElement('article');
      card.className = 'card' + (vm.progress.conquered ? ' is-conquered' : '');
      card.dataset.sinId = sin.id;
      card.dataset.search = sinSearchIndex(sin);
      card.style.setProperty('--card-color', 'var(' + PROGRESS_STATE_COLOR_VAR[progressStateClass(vm.progress)] + ')');
      card.innerHTML = dossierCardInnerHTML(sin, vm);
      grid.appendChild(card);
    });
    grid.addEventListener('click', function (e) {
      var drillBtn = e.target.closest('.drill-btn');
      if (drillBtn) { openDrill(drillBtn.dataset.verseId); return; }
      var card = e.target.closest('.card');
      if (card) toggleCard(card);
    });
    stage.appendChild(grid);
  }

  // ---------- map view ----------

  function renderMap(stage) {
    var frame = document.createElement('div');
    frame.className = 'map-frame';
    frame.id = 'mapFrame';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'supply-lines');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    [42, 33, 24, 15].forEach(function (r) {
      var ring = document.createElement('div');
      ring.className = 'range-ring';
      ring.style.width = ring.style.height = (r * 2) + '%';
      frame.appendChild(ring);
    });
    frame.appendChild(svg);

    var profile = CC.armory.getActiveProfile();
    var level = CC.armory.getLevel(profile ? profile.id : null).level;
    var commandWrap = document.createElement('div');
    commandWrap.className = 'command';
    commandWrap.setAttribute('data-level-stage', String(avatarStage(level)));
    commandWrap.innerHTML = '<span class="banner-flags"><span></span><span></span><span></span><span></span></span>'
      + '<div class="mark">&#9818;</div><div class="label">You</div>';
    frame.appendChild(commandWrap);

    var nodeLayer = document.createElement('div');
    nodeLayer.id = 'nodeLayer';
    var angleStep = 360 / ARMORY_DATA.length;

    ARMORY_DATA.forEach(function (sin, i) {
      var vm = sinViewModel(sin);
      var tierInfo = ARMORY_TIERS[sin.tier];
      var angleRad = (-90 + i * angleStep) * Math.PI / 180;
      var x = 50 + tierInfo.radius * Math.cos(angleRad);
      var y = 50 + tierInfo.radius * Math.sin(angleRad);

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 50); line.setAttribute('y1', 50);
      line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('data-sin-id', sin.id);
      if (vm.progress.conquered) line.classList.add('is-solid');
      svg.appendChild(line);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'node' + (sin.tier >= 3 ? ' high-threat' : '') + (vm.progress.conquered ? ' is-conquered' : '');
      btn.style.left = x + '%'; btn.style.top = y + '%';
      btn.dataset.sinId = sin.id;
      btn.dataset.search = sinSearchIndex(sin);
      btn.setAttribute('aria-label', sin.name + ' — ' + tierInfo.label + ' — ' + vm.progress.masteredCount + ' of ' + vm.progress.total + ' verses mastered');
      btn.innerHTML = '<span class="badge-wrap"><span class="badge-hex' + (vm.progress.conquered ? ' is-conquered-ring' : '') + '" style="--badge-color:var(--t' + sin.tier + ')">' + sin.callsign + '</span></span>'
        + '<span class="label">' + escapeHTML(sin.name) + '</span>'
        + '<span class="node-progress">' + vm.progress.masteredCount + '/' + vm.progress.total + '</span>';
      btn.addEventListener('click', function () { openSheet(sin); });
      nodeLayer.appendChild(btn);
    });
    frame.appendChild(nodeLayer);

    stage.appendChild(frame);
    var caption = document.createElement('p');
    caption.className = 'map-caption';
    caption.textContent = 'Range rings mark distance from your walls — not distance in miles';
    stage.appendChild(caption);
  }

  function openSheet(sin) {
    var vm = sinViewModel(sin);
    var sheet = document.getElementById('sheet');
    sheet.innerHTML = '<div class="sheet-top"><div><div class="sheet-id">FILE &middot; ' + sin.tag + '</div>'
      + '<h2 class="sheet-name">' + escapeHTML(sin.name) + '</h2></div>'
      + '<button type="button" class="sheet-close" id="sheetClose" aria-label="Close">&times;</button></div>'
      + '<p class="sheet-blurb">' + escapeHTML(sin.blurb) + '</p>'
      + '<div class="card-progress ' + progressStateClass(vm.progress) + '">' + vm.progress.masteredCount + ' / ' + vm.progress.total + ' verses mastered'
      + (vm.progress.conquered ? ' <span class="conquered-tag">CONQUERED</span>' : '') + '</div>'
      + '<div class="verse-list">' + sin.verses.map(renderVerseRowHTML).join('') + '</div>';
    document.getElementById('sheetClose').addEventListener('click', closeSheet);
    sheet.addEventListener('click', function (e) {
      var drillBtn = e.target.closest('.drill-btn');
      if (drillBtn) openDrill(drillBtn.dataset.verseId);
    });
    document.getElementById('sheetOverlay').classList.add('open');
  }
  function closeSheet() {
    var overlay = document.getElementById('sheetOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  // ---------- shared render dispatcher + search ----------

  function render() {
    var stage = document.getElementById('armoryStage');
    stage.innerHTML = '';
    if (currentView === 'dossier') renderDossier(stage);
    else renderMap(stage);
    applySearch();
    applySinMap();
  }

  function applySearch() {
    var q = currentQuery.toLowerCase();
    if (currentView === 'dossier') {
      document.querySelectorAll('#armoryStage .card').forEach(function (card) {
        card.hidden = q ? card.dataset.search.indexOf(q) === -1 : false;
      });
    } else {
      document.querySelectorAll('#armoryStage .node').forEach(function (node) {
        if (!q) { node.classList.remove('dimmed', 'match'); return; }
        var isMatch = node.dataset.search.indexOf(q) !== -1;
        node.classList.toggle('dimmed', !isMatch);
        node.classList.toggle('match', isMatch);
      });
    }
  }

  // Highlights the core sin(s) a chosen "common sin" (armory-sin-map.js)
  // maps to. Purely additive — unlike applySearch, it never hides/dims
  // anything, so it can be active at the same time as a search query.
  // Re-run after every render() since render() rebuilds #armoryStage's DOM.
  function applySinMap() {
    document.querySelectorAll('#sinMapChips .sinmap-chip').forEach(function (chip) {
      var isActive = chip.dataset.id === currentSinMapId;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
    document.querySelectorAll('#armoryStage .is-sin-match').forEach(function (el) {
      el.classList.remove('is-sin-match');
    });
    var entry = (window.ARMORY_SIN_MAP || []).find(function (e) { return e.id === currentSinMapId; });
    var summaryEl = document.getElementById('sinMapSummary');
    if (!entry) { summaryEl.hidden = true; summaryEl.textContent = ''; return; }
    entry.coreSins.forEach(function (cs) {
      var el = document.querySelector('#armoryStage [data-sin-id="' + cs.sinId + '"]');
      if (el) el.classList.add('is-sin-match');
    });
    summaryEl.hidden = false;
    summaryEl.textContent = entry.summary;
  }

  // ---------- drill modal ----------

  // ---------- drill result feedback (shared shape between both modes) ----------

  var DRILL_OUTCOME_ICON_PATHS = {
    exact: '<polyline points="4 13 9 18 20 6"/>',
    close: '<path d="M3 14c2-4 5-4 7 0s5 4 7 0 5-4 7 0"/>',
    fail: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  };
  function drillResultBadgeHTML(outcome) {
    return '<span class="drill-result-icon" aria-hidden="true">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
      + DRILL_OUTCOME_ICON_PATHS[outcome] + '</svg></span>';
  }
  // A correct attempt only masters a verse once its streak hits 2 (see
  // armory-state.js's recordAttempt) — so "correct" and "mastered" are NOT
  // the same thing, and the drill's message/button must say so. Otherwise
  // a first correct pass reads as "Finished" when the verse actually still
  // needs one more correct rep before it's mastered.
  function drillOutcomeMessage(outcome, mode, result) {
    if (outcome === 'fail') return mode === 'tap' ? 'Not quite — review the verse below.' : 'Not quite there yet.';
    var base = outcome === 'exact' ? (mode === 'tap' ? 'Perfect order!' : 'Word for word — well done!') : 'Close enough — well done.';
    if (result && result.nowMastered) return base + ' Verse mastered.';
    if (result && result.wasAlreadyMastered) return base;
    return base + ' One more correct pass and it’s mastered.';
  }
  function drillIsFinished(outcome, result) {
    return outcome !== 'fail' && !!result && (result.nowMastered || result.wasAlreadyMastered);
  }
  function drillResultCardHTML(outcome, mode, result) {
    return '<div class="drill-result-card is-' + outcome + '">'
      + drillResultBadgeHTML(outcome)
      + '<span class="drill-result-msg">' + drillOutcomeMessage(outcome, mode, result) + '</span>'
      + '</div>';
  }

  function openDrill(verseId) {
    var found = findVerseGlobal(verseId);
    if (!found) return;
    var profile = CC.armory.getActiveProfile();
    if (!profile) { pendingDrillVerseId = verseId; openProfileOverlay(); return; }
    var mode = getEffectiveDrillMode(profile.id);
    openDrillBody(found.sin, found.verse, mode, profile.id);
    document.getElementById('drillOverlay').classList.add('open');
  }
  function closeDrill() {
    document.getElementById('drillOverlay').classList.remove('open');
  }

  function openDrillBody(sin, verse, mode, profileId) {
    document.getElementById('drillHeadTitle').textContent = sin.name + ' · ' + verse.ref;
    document.getElementById('drillModeIndicator').textContent = mode === 'tap' ? 'TAP MODE' : 'TYPE MODE';
    var switchBtn = document.getElementById('drillModeSwitch');
    switchBtn.textContent = 'Switch to ' + (mode === 'tap' ? 'Type It' : 'Tap It');
    switchBtn.onclick = function () {
      var newMode = mode === 'tap' ? 'text' : 'tap';
      CC.armory.setDrillMode(profileId, newMode);
      openDrillBody(sin, verse, newMode, profileId);
    };
    if (mode === 'tap') renderTapDrill(sin, verse);
    else renderTextDrill(sin, verse);
  }

  function renderTapDrill(sin, verse) {
    var state = {
      tray: shuffle(verse.chunks.map(function (c, i) { return { text: c, orig: i }; })),
      assembled: [], resultShown: false, correct: null, result: null,
    };

    function tapBodyHTML() {
      var assembledSlots = verse.chunks.map(function (_, i) {
        var item = state.assembled[i];
        return item
          ? '<button type="button" class="assembled-chip" data-idx="' + i + '">' + escapeHTML(item.text) + '</button>'
          : '<span class="assembled-slot"></span>';
      }).join('');
      var trayChips = state.tray.map(function (item, i) {
        return '<button type="button" class="tray-chip" data-idx="' + i + '">' + escapeHTML(item.text) + '</button>';
      }).join('');
      var html = '<div class="drill-mastery-row"><span class="drill-mastery-label">Rounds</span>' + masteryDotsHTML(CC.armory.getVerseState(verse.id)) + '</div>'
        + '<div class="drill-progress">TAP THE PHRASES INTO ORDER</div>'
        + '<div class="assembled-row">' + assembledSlots + '</div>'
        + '<div class="tray-row">' + trayChips + '</div>';
      if (state.resultShown) {
        var outcome = state.correct ? 'exact' : 'fail';
        html += drillResultCardHTML(outcome, 'tap', state.result);
        if (outcome !== 'exact') html += '<blockquote class="drill-answer-key">' + escapeHTML(verse.text) + '</blockquote>';
        html += '<div class="drill-actions"><button type="button" class="btn-ghost2" id="drillRetry">Retry</button>'
          + '<button type="button" class="btn-solid" id="drillClose2">' + (drillIsFinished(outcome, state.result) ? 'Finished' : 'Close') + '</button></div>';
      }
      return html;
    }

    function renderBody() {
      var body = document.getElementById('drillBody');
      body.innerHTML = tapBodyHTML();
      if (!state.resultShown) {
        body.querySelectorAll('.tray-chip').forEach(function (chip) {
          chip.addEventListener('click', function () {
            var idx = Number(chip.dataset.idx);
            var item = state.tray.splice(idx, 1)[0];
            state.assembled.push(item);
            if (state.tray.length === 0) {
              state.correct = state.assembled.every(function (it, i) { return it.orig === i; });
              state.result = CC.armory.recordAttempt(verse.id, state.correct, 'tap');
              state.resultShown = true;
            }
            renderBody();
          });
        });
        body.querySelectorAll('.assembled-chip').forEach(function (chip) {
          chip.addEventListener('click', function () {
            var idx = Number(chip.dataset.idx);
            var item = state.assembled.splice(idx, 1)[0];
            state.tray.push(item);
            renderBody();
          });
        });
      } else {
        var retry = document.getElementById('drillRetry');
        if (retry) retry.addEventListener('click', function () { renderTapDrill(sin, verse); });
        var close2 = document.getElementById('drillClose2');
        if (close2) close2.addEventListener('click', closeDrill);
      }
    }
    renderBody();
  }

  function renderTextDrill(sin, verse) {
    var state = { resultShown: false, match: null, result: null };

    function renderBody() {
      var body = document.getElementById('drillBody');
      if (!state.resultShown) {
        body.innerHTML = '<div class="drill-mastery-row"><span class="drill-mastery-label">Rounds</span>' + masteryDotsHTML(CC.armory.getVerseState(verse.id)) + '</div>'
          + '<div class="drill-progress">TYPE THE VERSE FROM MEMORY</div>'
          + '<textarea id="drillAnswer" class="drill-textarea" placeholder="Type ' + escapeHTML(verse.ref) + ' from memory…" autocomplete="off" spellcheck="false"></textarea>'
          + '<div class="drill-actions"><button type="button" class="btn-solid" id="drillSubmit">Check</button></div>';
        document.getElementById('drillSubmit').addEventListener('click', function () {
          var answer = document.getElementById('drillAnswer').value;
          state.match = matchVerse(answer, verse.text);
          state.result = CC.armory.recordAttempt(verse.id, state.match.correct, 'text');
          state.resultShown = true;
          renderBody();
        });
      } else {
        var highlighted = state.match.correctWords.map(function (w, i) {
          return '<span class="word-' + state.match.perWord[i] + '">' + escapeHTML(w) + '</span>';
        }).join(' ');
        var extrasHTML = state.match.extras.length
          ? '<p class="drill-extras">Extra words: ' + escapeHTML(state.match.extras.join(' ')) + '</p>' : '';
        body.innerHTML = '<div class="drill-mastery-row"><span class="drill-mastery-label">Rounds</span>' + masteryDotsHTML(CC.armory.getVerseState(verse.id)) + '</div>'
          + drillResultCardHTML(state.match.outcome, 'text', state.result)
          + '<blockquote class="drill-answer-key">' + highlighted + '</blockquote>'
          + extrasHTML
          + '<div class="drill-actions"><button type="button" class="btn-ghost2" id="drillRetry">Retry</button>'
          + '<button type="button" class="btn-solid" id="drillClose2">' + (drillIsFinished(state.match.outcome, state.result) ? 'Finished' : 'Close') + '</button></div>';
        document.getElementById('drillRetry').addEventListener('click', function () { state.resultShown = false; renderBody(); });
        document.getElementById('drillClose2').addEventListener('click', closeDrill);
      }
    }
    renderBody();
  }

  // ---------- celebration ----------

  function showLevelUpBanner(level) {
    var rank = ARMORY_RANKS.find(function (r) { return r.level === level; });
    var el = document.createElement('div');
    el.className = 'armory-levelup-banner';
    el.textContent = 'Promoted to ' + (rank ? rank.title : 'Level ' + level) + '!';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  function triggerCelebration(sinId) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var container = document.querySelector('.card[data-sin-id="' + sinId + '"], .node[data-sin-id="' + sinId + '"]');
    if (!container) return;
    var badge = container.querySelector('.badge-hex');
    var badgeWrap = container.querySelector('.badge-wrap');

    if (badge && !reduceMotion) {
      badge.classList.add('armory-seal-anim');
      for (var i = 0; i < 8; i++) {
        (function (i) {
          var spark = document.createElement('span');
          spark.className = 'armory-spark';
          spark.style.setProperty('--angle', (i * 45) + 'deg');
          spark.style.animationDelay = (i * 28) + 'ms';
          badgeWrap.appendChild(spark);
          spark.addEventListener('animationend', function () { spark.remove(); });
        })(i);
      }
      setTimeout(function () { badge.classList.remove('armory-seal-anim'); }, 650);
    }

    if (currentView === 'map') {
      var line = document.querySelector('.supply-lines line[data-sin-id="' + sinId + '"]');
      if (line) line.classList.add('is-solid');
      var cmd = document.querySelector('.command .mark');
      if (cmd && !reduceMotion) {
        cmd.classList.add('armory-command-pulse');
        setTimeout(function () { cmd.classList.remove('armory-command-pulse'); }, 550);
      }
    }

    var sin = findSinGlobal(sinId);
    var banner = document.createElement('div');
    banner.className = 'armory-conquest-banner';
    banner.textContent = 'TERRITORY CONQUERED — ' + (sin ? sin.name.toUpperCase() : '');
    container.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('show'); });
    setTimeout(function () {
      banner.classList.remove('show');
      setTimeout(function () { banner.remove(); }, reduceMotion ? 0 : 300);
    }, 2000);
  }

  // ---------- profile chip + switcher ----------

  function renderProfileChip() {
    var chip = document.getElementById('armoryProfileChip');
    chip.hidden = false;
    var p = CC.armory.getActiveProfile();
    if (!p) {
      chip.innerHTML = '<button type="button" class="profile-chip-btn" id="profileChipBtn" aria-haspopup="true" aria-label="Who’s fighting? Set up a profile">'
        + '<span class="profile-chip-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>'
        + '<span class="profile-chip-text"><span class="profile-chip-name">Who&rsquo;s Fighting?</span></span>'
        + '<svg class="chip-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
        + '</button>';
      document.getElementById('profileChipBtn').addEventListener('click', function () { openProfileOverlay(); });
      return;
    }
    var level = CC.armory.getLevel(p.id);
    chip.innerHTML = '<button type="button" class="profile-chip-btn" id="profileChipBtn" aria-haspopup="true" aria-label="Switch player or add a new profile — currently playing as ' + escapeHTML(p.name) + '">'
      + '<span class="profile-chip-avatar" data-level-stage="' + avatarStage(level.level) + '">' + avatarSVG(p.avatar.sigil, p.avatar.color, 28) + '</span>'
      + '<span class="profile-chip-text"><span class="profile-chip-name">' + escapeHTML(p.name) + '</span>'
      + '<span class="profile-chip-rank">Lv ' + level.level + ' · ' + level.title + '</span></span>'
      + '<svg class="chip-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
      + '</button>';
    document.getElementById('profileChipBtn').addEventListener('click', function () { openProfileOverlay(); });
  }

  // Called once a profile is active (just created, or picked from the
  // list) — closes the overlay and, if this profile was set up in response
  // to a Drill click that had no profile yet, resumes straight into that
  // drill instead of leaving the visitor to click Drill a second time.
  function resumeAfterProfileReady() {
    document.getElementById('profileOverlay').classList.remove('open');
    renderProfileChip();
    render();
    if (pendingDrillVerseId) {
      var verseId = pendingDrillVerseId;
      pendingDrillVerseId = null;
      openDrill(verseId);
    }
  }

  function openProfileOverlay() {
    profileOverlayMode = CC.armory.listProfiles().length ? 'list' : 'create';
    renderProfileOverlay();
    document.getElementById('profileOverlay').classList.add('open');
  }

  function renderProfileOverlay() {
    var modal = document.getElementById('profileModal');
    var profiles = CC.armory.listProfiles();
    var closeBtnHTML = '<button type="button" class="sheet-close" id="profileOverlayClose" aria-label="Close">&times;</button>';

    if (profileOverlayMode === 'create' || profileOverlayMode === 'edit') {
      var isEdit = profileOverlayMode === 'edit';
      modal.innerHTML = '<div class="sheet-top"><h2 class="sheet-name">' + (isEdit ? 'Edit Profile' : 'New Profile') + '</h2>' + closeBtnHTML + '</div>'
        + '<label class="profile-field-label" for="profileNameInput">Name</label>'
        + '<input type="text" id="profileNameInput" class="profile-name-input" maxlength="24" placeholder="Your name" value="' + escapeHTML(pendingName) + '">'
        + '<div class="profile-field-label">Choose a sigil</div>'
        + '<div class="sigil-grid" id="sigilGrid">' + SIGILS.map(function (s) {
          return '<button type="button" class="sigil-option' + (pendingAvatar.sigil === s.key ? ' is-selected' : '') + '" data-sigil="' + s.key + '" title="' + s.label + '" aria-label="' + s.label + '"><svg width="22" height="22" viewBox="0 0 24 24"><use href="#sigil-' + s.key + '"></use></svg></button>';
        }).join('') + '</div>'
        + '<div class="profile-field-label">Choose a color</div>'
        + '<div class="color-grid" id="colorGrid">' + COLOR_OPTIONS.map(function (c) {
          return '<button type="button" class="color-option' + (pendingAvatar.color === c.key ? ' is-selected' : '') + '" data-color="' + c.key + '" style="--swatch: var(' + c.varName + ')" aria-label="' + c.key + '"></button>';
        }).join('') + '</div>'
        + '<div class="avatar-preview" id="avatarPreview">' + avatarSVG(pendingAvatar.sigil, pendingAvatar.color, 56) + '</div>'
        + '<div class="drill-actions">'
        + (isEdit || profiles.length ? '<button type="button" class="btn-ghost2" id="profileCancelBtn">Cancel</button>' : '')
        + '<button type="button" class="btn-solid" id="profileStartBtn">' + (isEdit ? 'Save' : 'Start') + '</button>'
        + '</div>';

      var nameInput = document.getElementById('profileNameInput');
      nameInput.addEventListener('input', function () { pendingName = nameInput.value; });
      // Surgical updates on sigil/color pick — never touch the name input,
      // so its focus/cursor/typed text survive choosing an avatar.
      modal.querySelectorAll('#sigilGrid .sigil-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          pendingAvatar.sigil = btn.dataset.sigil;
          modal.querySelectorAll('#sigilGrid .sigil-option').forEach(function (b) {
            b.classList.toggle('is-selected', b.dataset.sigil === pendingAvatar.sigil);
          });
          document.getElementById('avatarPreview').innerHTML = avatarSVG(pendingAvatar.sigil, pendingAvatar.color, 56);
        });
      });
      modal.querySelectorAll('#colorGrid .color-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          pendingAvatar.color = btn.dataset.color;
          modal.querySelectorAll('#colorGrid .color-option').forEach(function (b) {
            b.classList.toggle('is-selected', b.dataset.color === pendingAvatar.color);
          });
          document.getElementById('avatarPreview').innerHTML = avatarSVG(pendingAvatar.sigil, pendingAvatar.color, 56);
        });
      });
      var cancelBtn = document.getElementById('profileCancelBtn');
      if (cancelBtn) cancelBtn.addEventListener('click', function () {
        profileOverlayMode = 'list'; pendingName = ''; editingProfileId = null; renderProfileOverlay();
      });
      document.getElementById('profileStartBtn').addEventListener('click', function () {
        if (isEdit) {
          CC.armory.updateProfile(editingProfileId, { name: nameInput.value, sigil: pendingAvatar.sigil, color: pendingAvatar.color });
          editingProfileId = null;
          profileOverlayMode = 'list';
          pendingAvatar = { sigil: 'shield', color: 't3' };
          pendingName = '';
          renderProfileOverlay();
          renderProfileChip();
          render();
        } else {
          CC.armory.createProfile({ name: nameInput.value, sigil: pendingAvatar.sigil, color: pendingAvatar.color });
          pendingAvatar = { sigil: 'shield', color: 't3' };
          pendingName = '';
          resumeAfterProfileReady();
        }
      });
      // Autofocus + select so typing can start immediately (select() is a
      // no-op on an empty field, but matters when re-entering create/edit
      // mode with a name already present, e.g. after Cancel then + New Profile).
      nameInput.focus();
      nameInput.select();
    } else {
      var tiles = profiles.map(function (p) {
        var level = CC.armory.getLevel(p.id);
        return '<div class="profile-tile" data-id="' + p.id + '">'
          + '<button type="button" class="profile-tile-edit" data-id="' + p.id + '" aria-label="Edit ' + escapeHTML(p.name) + '">'
          + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
          + '</button>'
          + '<button type="button" class="profile-tile-delete" data-id="' + p.id + '" aria-label="Delete ' + escapeHTML(p.name) + '">&times;</button>'
          + '<button type="button" class="profile-tile-select" data-id="' + p.id + '">'
          + '<span class="profile-tile-avatar" data-level-stage="' + avatarStage(level.level) + '">' + avatarSVG(p.avatar.sigil, p.avatar.color, 48) + '</span>'
          + '<span class="profile-tile-name">' + escapeHTML(p.name) + '</span>'
          + '<span class="profile-tile-rank">Lv ' + level.level + ' · ' + level.title + '</span>'
          + '</button>'
          + '</div>';
      }).join('');
      modal.innerHTML = '<div class="sheet-top"><h2 class="sheet-name">Who&rsquo;s Fighting?</h2>' + closeBtnHTML + '</div>'
        + '<div class="profile-grid">' + tiles
        + '<button type="button" class="profile-tile profile-tile-new" id="profileNewTile"><span class="profile-tile-plus">+</span><span class="profile-tile-name">New Profile</span></button>'
        + '</div>';

      modal.querySelectorAll('.profile-tile-select').forEach(function (btn) {
        btn.addEventListener('click', function () {
          CC.armory.setActiveProfile(btn.dataset.id);
          resumeAfterProfileReady();
        });
      });
      modal.querySelectorAll('.profile-tile-edit').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var p = profiles.find(function (x) { return x.id === btn.dataset.id; });
          if (!p) return;
          editingProfileId = p.id;
          pendingName = p.name;
          pendingAvatar = { sigil: p.avatar.sigil, color: p.avatar.color };
          profileOverlayMode = 'edit';
          renderProfileOverlay();
        });
      });
      modal.querySelectorAll('.profile-tile-delete').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var p = profiles.find(function (x) { return x.id === btn.dataset.id; });
          if (window.confirm('Remove ' + (p ? p.name : 'this profile') + '’s progress? This can’t be undone.')) {
            CC.armory.deleteProfile(btn.dataset.id);
            profileOverlayMode = CC.armory.listProfiles().length ? 'list' : 'create';
            renderProfileOverlay();
            renderProfileChip();
            render();
          }
        });
      });
      document.getElementById('profileNewTile').addEventListener('click', function () {
        pendingAvatar = { sigil: 'shield', color: 't3' }; pendingName = ''; editingProfileId = null;
        profileOverlayMode = 'create'; renderProfileOverlay();
      });
    }

    document.getElementById('profileOverlayClose').addEventListener('click', function () {
      pendingDrillVerseId = null;
      document.getElementById('profileOverlay').classList.remove('open');
    });
  }

  // ---------- init ----------

  function init() {
    renderProfileChip();
    render();

    document.getElementById('armorySearch').addEventListener('input', function (e) {
      currentQuery = e.target.value.trim();
      applySearch();
    });

    var sinMapChips = document.getElementById('sinMapChips');
    var allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'sinmap-chip is-active';
    allChip.dataset.id = '';
    allChip.setAttribute('aria-pressed', 'true');
    allChip.textContent = 'All';
    sinMapChips.appendChild(allChip);
    (window.ARMORY_SIN_MAP || []).slice().sort(function (a, b) {
      return a.label.localeCompare(b.label);
    }).forEach(function (entry) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sinmap-chip';
      chip.dataset.id = entry.id;
      chip.setAttribute('aria-pressed', 'false');
      chip.textContent = entry.label;
      sinMapChips.appendChild(chip);
    });
    sinMapChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.sinmap-chip');
      if (!chip) return;
      currentSinMapId = chip.dataset.id;
      applySinMap();
    });

    document.querySelectorAll('.view-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (currentView === btn.dataset.view) return;
        currentView = btn.dataset.view;
        document.querySelectorAll('.view-toggle button').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        render();
      });
    });

    document.getElementById('drillClose').addEventListener('click', closeDrill);
    document.getElementById('drillOverlay').addEventListener('click', function (e) {
      if (e.target.id === 'drillOverlay') closeDrill();
    });
    document.getElementById('sheetOverlay').addEventListener('click', function (e) {
      if (e.target.id === 'sheetOverlay') closeSheet();
    });
    document.getElementById('profileOverlay').addEventListener('click', function (e) {
      if (e.target.id === 'profileOverlay') {
        pendingDrillVerseId = null;
        e.currentTarget.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeDrill();
      closeSheet();
      pendingDrillVerseId = null;
      document.getElementById('profileOverlay').classList.remove('open');
    });

    window.addEventListener('cc-armory-progresschange', function (e) {
      var detail = e.detail;
      render();
      renderProfileChip();
      if (detail.leveledUp) showLevelUpBanner(detail.levelAfter);
      if (detail.sinNowConquered) triggerCelebration(detail.sinId);
    });

    window.addEventListener('cc-armory-profilechange', function () {
      renderProfileChip();
      render();
    });
  }

  window.Armory = { init: init };
})();
