// The Armory — "common sin" to core sin mapping layer. Deliberately kept as
// its own standalone file (not merged into armory-data.js) so it can be
// edited/grown independently. No logic, no DOM — see armory.js for how it's
// rendered/wired. Depends on nothing; window.ARMORY_DATA (armory-data.js)
// just needs to contain a matching id for every coreSins[].sinId used below.
//
// Each entry:
//   id       - stable slug, used as the chip's data-id and DOM lookups.
//              Never reassign once shipped.
//   label    - shown on the chip.
//   coreSins - ordered array of { sinId, role: "primary" | "secondary" }.
//              sinId must match an id in window.ARMORY_DATA. `role` isn't
//              rendered differently yet (v1: every listed core sin gets the
//              same gold outline) but is kept so a future pass could.
//   summary  - one/two sentence plain-language rationale shown once this
//              entry is chosen.
//   sources  - citations backing the summary. Not rendered on the page —
//              kept for editorial traceability when this list is revisited.

window.ARMORY_SIN_MAP = [
  {
    id: "disobedience",
    label: "Disobeys Parents",
    coreSins: [
      { sinId: "pride", role: "primary" },
      { sinId: "wrath", role: "secondary" },
    ],
    summary: "Rooted in pride — self-rule against the authority God has placed over a child (Rom. 1:30; Westminster Larger Catechism Q.130). Often surfaces as open, angry defiance rather than quiet doubt.",
    sources: [
      { name: "Ligonier — The Fifth Commandment", url: "https://learn.ligonier.org/devotionals/the-fifth-commandment" },
      { name: "Tim Challies — The Folly Bound Up in the Heart of a Child", url: "https://www.challies.com/articles/the-folly-bound-up-in-the-heart-of-a-child/" },
    ],
  },
  {
    id: "hatred",
    label: "Hates Someone",
    coreSins: [
      { sinId: "wrath", role: "primary" },
      { sinId: "envy", role: "secondary" },
    ],
    summary: "At root, hatred is nursed anger — Christ ties unresolved anger to murder-guilt (Matt. 5:21-26), and “whosoever hateth his brother is a murderer” (1 John 3:15). The Westminster Larger Catechism (Q.136) lists hatred alongside both anger and envy as sins against the sixth commandment; the paradigm case, Cain hating Abel, was envy-driven (Gen. 4).",
    sources: [
      { name: "Ligonier — No Murderer", url: "https://learn.ligonier.org/devotionals/no-murderer" },
      { name: "Westminster Larger Catechism Q.136", url: "https://thewestminsterstandard.org/westminster-larger-catechism/" },
    ],
  },
];
