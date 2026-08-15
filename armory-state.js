// The Armory — progress/profile logic. No DOM. Mirrors theme.js's shape:
// one localStorage key, a window.CC sub-namespace of getter/setter
// functions, CustomEvents for cross-component reactivity. Depends on
// window.ARMORY_DATA / ARMORY_TIERS / ARMORY_RANKS from armory-data.js,
// which must load first.
(function () {
  var STORAGE_KEY = 'cc-armory';
  var SCHEMA_VERSION = 1;

  function freshStore() {
    return { schemaVersion: SCHEMA_VERSION, activeProfileId: null, profiles: {} };
  }

  function loadStore() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshStore();
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      backup('corrupt', raw);
      return freshStore();
    }
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      // Unrecognized/older schema — never silently discard existing
      // progress. Preserve it under a backup key so a future migration
      // could still recover it, then start fresh.
      backup(parsed && parsed.schemaVersion != null ? 'v' + parsed.schemaVersion : 'unknown', raw);
      return freshStore();
    }
    return parsed;
  }

  function backup(tag, raw) {
    var key = STORAGE_KEY + '-' + tag + '-backup';
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  }

  var store = loadStore();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function dispatchProfileChange() {
    window.dispatchEvent(new CustomEvent('cc-armory-profilechange', { detail: { activeProfileId: store.activeProfileId } }));
  }
  function dispatchProgressChange(detail) {
    window.dispatchEvent(new CustomEvent('cc-armory-progresschange', { detail: detail }));
  }

  function genId() {
    return 'p_' + Math.random().toString(36).slice(2, 8);
  }

  function getProfile(id) {
    return (id && store.profiles[id]) || null;
  }

  function requireProfileId(profileId) {
    return profileId || store.activeProfileId;
  }

  function findSin(sinId) {
    return window.ARMORY_DATA.find(function (s) { return s.id === sinId; }) || null;
  }

  function findVerse(verseId) {
    for (var i = 0; i < window.ARMORY_DATA.length; i++) {
      var sin = window.ARMORY_DATA[i];
      for (var j = 0; j < sin.verses.length; j++) {
        if (sin.verses[j].id === verseId) return { sin: sin, verse: sin.verses[j] };
      }
    }
    return null;
  }

  function getSinProgress(sinId, profileId) {
    var sin = findSin(sinId);
    if (!sin) return null;
    var p = getProfile(requireProfileId(profileId));
    var masteredCount = 0;
    sin.verses.forEach(function (v) {
      var vs = p && p.verses[v.id];
      if (vs && vs.status === 'mastered') masteredCount++;
    });
    return { masteredCount: masteredCount, total: sin.verses.length, conquered: masteredCount === sin.verses.length };
  }

  function isSinConquered(sinId, profileId) {
    var progress = getSinProgress(sinId, profileId);
    return !!(progress && progress.conquered);
  }

  function getXP(profileId) {
    var p = getProfile(requireProfileId(profileId));
    return p ? p.xp : 0;
  }

  function getLevel(profileId) {
    var xp = getXP(profileId);
    var ranks = window.ARMORY_RANKS;
    var current = ranks[0];
    for (var i = 0; i < ranks.length; i++) {
      if (xp >= ranks[i].xp) current = ranks[i]; else break;
    }
    var next = ranks[current.level] || null; // array index === next level's level number (0-indexed array, 1-indexed level)
    return {
      level: current.level, title: current.title, xp: xp,
      currentThreshold: current.xp,
      nextThreshold: next ? next.xp : null,
      nextTitle: next ? next.title : null,
    };
  }

  window.CC = window.CC || {};
  window.CC.armory = {
    // profiles
    listProfiles: function () {
      return Object.keys(store.profiles)
        .map(function (id) { return store.profiles[id]; })
        .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
    },
    getActiveProfile: function () { return getProfile(store.activeProfileId); },
    setActiveProfile: function (id) {
      if (!getProfile(id)) return false;
      store.activeProfileId = id;
      persist();
      dispatchProfileChange();
      return true;
    },
    createProfile: function (opts) {
      opts = opts || {};
      var id = genId();
      store.profiles[id] = {
        id: id,
        name: (opts.name || '').trim().slice(0, 24) || 'Recruit',
        avatar: { sigil: opts.sigil || 'shield', color: opts.color || 't3' },
        createdAt: new Date().toISOString(),
        settings: { drillMode: 'auto' },
        xp: 0,
        verses: {},
      };
      store.activeProfileId = id;
      persist();
      dispatchProfileChange();
      return store.profiles[id];
    },
    deleteProfile: function (id) {
      if (!store.profiles[id]) return;
      delete store.profiles[id];
      if (store.activeProfileId === id) store.activeProfileId = null;
      persist();
      dispatchProfileChange();
    },
    updateProfile: function (id, opts) {
      var p = getProfile(id);
      if (!p) return;
      opts = opts || {};
      if (opts.name != null) p.name = (opts.name || '').trim().slice(0, 24) || p.name;
      if (opts.sigil || opts.color) {
        p.avatar = { sigil: opts.sigil || p.avatar.sigil, color: opts.color || p.avatar.color };
      }
      persist();
      dispatchProfileChange();
    },

    // settings
    getDrillMode: function (profileId) {
      var p = getProfile(requireProfileId(profileId));
      return p ? p.settings.drillMode : 'auto';
    },
    setDrillMode: function (profileId, mode) {
      if (['auto', 'text', 'tap'].indexOf(mode) === -1) return;
      var p = getProfile(requireProfileId(profileId));
      if (!p) return;
      p.settings.drillMode = mode;
      persist();
    },

    // progress (read)
    getVerseState: function (verseId, profileId) {
      var p = getProfile(requireProfileId(profileId));
      if (p && p.verses[verseId]) return p.verses[verseId];
      return { status: 'unseen', streak: 0, attempts: 0, correctAttempts: 0 };
    },
    getSinProgress: getSinProgress,
    isSinConquered: isSinConquered,
    getXP: getXP,
    getLevel: getLevel,

    // progress (write)
    recordAttempt: function (verseId, correct, mode, profileId) {
      var id = requireProfileId(profileId);
      var p = getProfile(id);
      if (!p) return null;
      var found = findVerse(verseId);
      if (!found) return null;
      var sin = found.sin, verse = found.verse;

      var levelBefore = getLevel(id).level;
      var wasAlreadyMastered = !!(p.verses[verseId] && p.verses[verseId].status === 'mastered');
      var wasSinConqueredBefore = isSinConquered(sin.id, id);

      var vs = p.verses[verseId] || (p.verses[verseId] = { status: 'unseen', streak: 0, attempts: 0, correctAttempts: 0 });
      vs.attempts += 1;
      vs.lastMode = mode;
      if (correct) { vs.correctAttempts += 1; vs.streak += 1; } else { vs.streak = 0; }

      var nowMastered = false;
      var xpAwarded = 0;
      if (!wasAlreadyMastered && vs.streak >= 2) {
        vs.status = 'mastered';
        vs.masteredAt = new Date().toISOString();
        nowMastered = true;
        xpAwarded += verse.xp;
        p.xp += verse.xp;
      }

      var sinNowConquered = false;
      if (!wasSinConqueredBefore && isSinConquered(sin.id, id)) {
        sinNowConquered = true;
        var bonus = window.ARMORY_TIERS[sin.tier].conquestXP;
        xpAwarded += bonus;
        p.xp += bonus;
      }

      var levelAfter = getLevel(id).level;
      persist();

      var detail = {
        verseId: verseId, sinId: sin.id, correct: correct, mode: mode,
        wasAlreadyMastered: wasAlreadyMastered, nowMastered: nowMastered,
        xpAwarded: xpAwarded, leveledUp: levelAfter > levelBefore, levelAfter: levelAfter,
        sinNowConquered: sinNowConquered, profileId: id,
      };
      dispatchProgressChange(detail);
      return detail;
    },
  };
})();
