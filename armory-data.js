// The Armory — static content: threat tiers, sins/verses, rank ladder.
// No logic, no DOM. See armory-state.js for progress/profile logic and
// armory.js for rendering. Adding a verse means authoring both `text`
// (exact KJV wording) and `chunks` (clause-sized phrases whose ordered
// concatenation reproduces `text` exactly, joined by single spaces) —
// `chunks` feeds the tap word-order drill and can't be derived automatically
// from punctuation alone (KJV punctuation is too inconsistent).

window.ARMORY_TIERS = {
  1: { label: "Skirmish", color: "#5C6B47", colorDark: "#8FA06B", radius: 42, conquestXP: 25, verseXP: 10 },
  2: { label: "Siege", color: "#B4802A", colorDark: "#D79A3C", radius: 33, conquestXP: 40, verseXP: 15 },
  3: { label: "Stronghold", color: "#9C3F26", colorDark: "#C05A3A", radius: 24, conquestXP: 55, verseXP: 20 },
  4: { label: "Total War", color: "#6E1423", colorDark: "#C93A5A", radius: 15, conquestXP: 90, verseXP: 30 },
};

window.ARMORY_DATA = [
  {
    id: "lust", tag: "SIN-01", callsign: "LX", name: "Lust", tier: 3,
    blurb: "The eye enlists the heart before the body ever moves. Guard the gate.",
    verses: [
      {
        id: "lust-1cor10-13", ref: "1 Corinthians 10:13",
        text: "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape.",
        chunks: ["There hath no temptation taken you", "but such as is common to man:", "but God is faithful,", "who will not suffer you", "to be tempted above that ye are able;", "but will with the temptation", "also make a way to escape."],
      },
      {
        id: "lust-1cor6-18", ref: "1 Corinthians 6:18",
        text: "Flee fornication. Every sin that a man doeth is without the body; but he that committeth fornication sinneth against his own body.",
        chunks: ["Flee fornication.", "Every sin that a man doeth", "is without the body;", "but he that committeth fornication", "sinneth against his own body."],
      },
      {
        id: "lust-job31-1", ref: "Job 31:1",
        text: "I made a covenant with mine eyes; why then should I think upon a maid?",
        chunks: ["I made a covenant", "with mine eyes;", "why then should I think", "upon a maid?"],
      },
    ],
  },
  {
    id: "wrath", tag: "SIN-02", callsign: "WR", name: "Wrath", tier: 2,
    blurb: "Anger unchecked hands the devil a foothold before sundown.",
    verses: [
      {
        id: "wrath-james1-19", ref: "James 1:19-20",
        text: "Let every man be swift to hear, slow to speak, slow to wrath: for the wrath of man worketh not the righteousness of God.",
        chunks: ["Let every man be swift to hear,", "slow to speak,", "slow to wrath:", "for the wrath of man", "worketh not the righteousness of God."],
      },
      {
        id: "wrath-eph4-26", ref: "Ephesians 4:26-27",
        text: "Be ye angry, and sin not: let not the sun go down upon your wrath: neither give place to the devil.",
        chunks: ["Be ye angry,", "and sin not:", "let not the sun go down", "upon your wrath:", "neither give place to the devil."],
      },
      {
        id: "wrath-prov16-32", ref: "Proverbs 16:32",
        text: "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.",
        chunks: ["He that is slow to anger", "is better than the mighty;", "and he that ruleth his spirit", "than he that taketh a city."],
      },
    ],
  },
  {
    id: "pride", tag: "SIN-03", callsign: "PR", name: "Pride", tier: 3,
    blurb: "Pride goeth before the fall. Rise.",
    verses: [
      {
        id: "pride-prov16-18", ref: "Proverbs 16:18",
        text: "Pride goeth before destruction, and an haughty spirit before a fall.",
        chunks: ["Pride goeth before destruction,", "and an haughty spirit", "before a fall."],
      },
      {
        id: "pride-james4-6", ref: "James 4:6",
        text: "God resisteth the proud, but giveth grace unto the humble.",
        chunks: ["God resisteth the proud,", "but giveth grace", "unto the humble."],
      },
      {
        id: "pride-1pet5-6", ref: "1 Peter 5:6",
        text: "Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time.",
        chunks: ["Humble yourselves therefore", "under the mighty hand of God,", "that he may exalt you", "in due time."],
      },
    ],
  },
  {
    id: "fear", tag: "SIN-04", callsign: "FR", name: "Fear", tier: 2,
    blurb: "Fear would crush your heart, but God has not given us a spirit of timidity.",
    verses: [
      {
        id: "fear-2tim1-7", ref: "2 Timothy 1:7",
        text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
        chunks: ["For God hath not given us", "the spirit of fear;", "but of power,", "and of love,", "and of a sound mind."],
      },
      {
        id: "fear-phil4-6", ref: "Philippians 4:6-7",
        text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
        chunks: ["Be careful for nothing;", "but in every thing by prayer and supplication", "with thanksgiving", "let your requests be made known unto God.", "And the peace of God,", "which passeth all understanding,", "shall keep your hearts and minds", "through Christ Jesus."],
      },
      {
        id: "fear-isa41-10", ref: "Isaiah 41:10",
        text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.",
        chunks: ["Fear thou not;", "for I am with thee:", "be not dismayed;", "for I am thy God:", "I will strengthen thee;", "yea, I will help thee."],
      },
    ],
  },
  {
    id: "despair", tag: "SIN-05", callsign: "DS", name: "Despair", tier: 2,
    blurb: "Giant Despair lurks. Clobber him with hope.",
    verses: [
      {
        id: "despair-psalm34-18", ref: "Psalm 34:18",
        text: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
        chunks: ["The LORD is nigh", "unto them that are of a broken heart;", "and saveth such as be", "of a contrite spirit."],
      },
      {
        id: "despair-lam3-22", ref: "Lamentations 3:22-23",
        text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
        chunks: ["It is of the LORD's mercies", "that we are not consumed,", "because his compassions fail not.", "They are new every morning:", "great is thy faithfulness."],
      },
      {
        id: "despair-rom15-13", ref: "Romans 15:13",
        text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
        chunks: ["Now the God of hope", "fill you with all joy and peace", "in believing,", "that ye may abound in hope,", "through the power of the Holy Ghost."],
      },
    ],
  },
  {
    id: "sloth", tag: "SIN-06", callsign: "SL", name: "Sloth", tier: 1,
    blurb: "Idle hands are the devil's tools. Working hands are the Maker's.",
    verses: [
      {
        id: "sloth-prov6-6", ref: "Proverbs 6:6",
        text: "Go to the ant, thou sluggard; consider her ways, and be wise.",
        chunks: ["Go to the ant,", "thou sluggard;", "consider her ways,", "and be wise."],
      },
      {
        id: "sloth-col3-23", ref: "Colossians 3:23",
        text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men.",
        chunks: ["And whatsoever ye do,", "do it heartily,", "as to the Lord,", "and not unto men."],
      },
      {
        id: "sloth-eccl9-10", ref: "Ecclesiastes 9:10",
        text: "Whatsoever thy hand findeth to do, do it with thy might.",
        chunks: ["Whatsoever thy hand findeth", "to do,", "do it", "with thy might."],
      },
    ],
  },
  {
    id: "envy", tag: "SIN-07", callsign: "EN", name: "Envy", tier: 1,
    blurb: "A sound heart is life to the body. But envy is rottenness to the bones.",
    verses: [
      {
        id: "envy-gal6-4", ref: "Galatians 6:4",
        text: "But let every man prove his own work, and then shall he have rejoicing in himself alone, and not in another.",
        chunks: ["But let every man prove", "his own work,", "and then shall he have rejoicing", "in himself alone,", "and not in another."],
      },
      {
        id: "envy-james3-16", ref: "James 3:16",
        text: "For where envying and strife is, there is confusion and every evil work.",
        chunks: ["For where envying and strife is,", "there is confusion", "and every evil work."],
      },
      {
        id: "envy-prov14-30", ref: "Proverbs 14:30",
        text: "A sound heart is the life of the flesh: but envy the rottenness of the bones.",
        chunks: ["A sound heart", "is the life of the flesh:", "but envy", "the rottenness of the bones."],
      },
    ],
  },
  {
    id: "greed", tag: "SIN-08", callsign: "GR", name: "Greed", tier: 2,
    blurb: "Treasure buried in dust will judge the man who buried it there.",
    verses: [
      {
        id: "greed-1tim6-10", ref: "1 Timothy 6:10",
        text: "For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.",
        chunks: ["For the love of money", "is the root of all evil:", "which while some coveted after,", "they have erred from the faith,", "and pierced themselves through", "with many sorrows."],
      },
      {
        id: "greed-heb13-5", ref: "Hebrews 13:5",
        text: "Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.",
        chunks: ["Let your conversation be", "without covetousness;", "and be content", "with such things as ye have:", "for he hath said,", "I will never leave thee,", "nor forsake thee."],
      },
      {
        id: "greed-matt6-21", ref: "Matthew 6:21",
        text: "For where your treasure is, there will your heart be also.",
        chunks: ["For where your treasure is,", "there will your heart", "be also."],
      },
    ],
  },
  {
    id: "bondage", tag: "SIN-09", callsign: "BN", name: "Bondage", tier: 4,
    blurb: "Whatever chain feels permanent isn't. The Son sets free indeed.",
    verses: [
      {
        id: "bondage-2cor10-4", ref: "2 Corinthians 10:4",
        text: "For the weapons of our warfare are not carnal, but mighty through God to the pulling down of strong holds.",
        chunks: ["For the weapons of our warfare", "are not carnal,", "but mighty through God", "to the pulling down", "of strong holds."],
      },
      {
        id: "bondage-rom6-12", ref: "Romans 6:12",
        text: "Let not sin therefore reign in your mortal body, that ye should obey it in the lusts thereof.",
        chunks: ["Let not sin therefore reign", "in your mortal body,", "that ye should obey it", "in the lusts thereof."],
      },
      {
        id: "bondage-john8-36", ref: "John 8:36",
        text: "If the Son therefore shall make you free, ye shall be free indeed.",
        chunks: ["If the Son therefore", "shall make you free,", "ye shall be free indeed."],
      },
    ],
  },
];

// Assign per-verse XP from its sin's tier (kept as a real field, not derived,
// so a specific verse could be individually re-weighted later without a
// schema change).
window.ARMORY_DATA.forEach(function (sin) {
  var tierXP = window.ARMORY_TIERS[sin.tier].verseXP;
  sin.verses.forEach(function (v) { v.xp = tierXP; });
});

// Rank ladder — cosmetic only. Full v1-content mastery is ~860 XP
// (450 from 27 verses + 410 from 9 conquest bonuses), landing at Marshal
// (Lv 9) so the top rank stays a reach goal and future content has
// headroom to spend into.
window.ARMORY_RANKS = [
  { level: 1, title: "Squire", xp: 0 },
  { level: 2, title: "Man-at-Arms", xp: 40 },
  { level: 3, title: "Guardsman", xp: 100 },
  { level: 4, title: "Sentinel", xp: 180 },
  { level: 5, title: "Knight", xp: 280 },
  { level: 6, title: "Knight-Captain", xp: 400 },
  { level: 7, title: "Banneret", xp: 540 },
  { level: 8, title: "Commander", xp: 700 },
  { level: 9, title: "Marshal", xp: 880 },
  { level: 10, title: "Champion of the King", xp: 1080 },
];
