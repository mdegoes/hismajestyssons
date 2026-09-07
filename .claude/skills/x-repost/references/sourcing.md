# Sourcing — research a topic, find candidates, score them

## A. Topic research pass  *(topic mode)*

Goal: a brief that captures the live conversation, not just a link dump.

1. **Web.** `WebSearch` the topic with a recency lean (the last ~14 days) *and* a
   second pass for the evergreen/foundational take. Then `WebFetch` the strongest
   3–6 results and pull the actual argument, not the headline.
   - Lean toward aligned outlets: `dougwils.com` (Blog & Mablog), `americanreformer.org`,
     `crosspolitic.com`, `founders.org`, `ligonier.org`, `wng.org` (WORLD),
     `canonpress.com`, `theopolisinstitute.com`.
   - Also read one or two mainstream pieces so the brief can name where the
     Reformed take diverges.
2. **X.** Via Claude-in-Chrome (owner's logged-in session):
   - `https://x.com/search?q=<topic>&f=top` and `&f=live`
   - obvious hashtags / phrases people use for it
   - Capture: post URL, author @handle, one-line gist, rough engagement, date.
3. Write the brief to `social-engine/posts/research/<YYYY-MM-DD>-<slug>.md` using
   the structure in `SKILL.md` step 2.

Recency note: today's date is available in the environment — use it for the
"last 14 days" window and the filename.

## B. Roster lane  *(topic + roster modes)*

The roster is the on-brand shortlist and changes over time — **read it live**:

- Parse `worthy-men.html`. Each `<article class="person roster-row">` carries:
  - `data-categories="pastoral-counsel classical-education …"` (space-separated follow-for tags)
  - `data-tier="tier-5"` (5 = Full Thanksgiving Meal … 1 = Caribbean Death Apple)
  - `<h3 class="name">` and `.desc`
  - `.person-links a[href*="x.com"]` → the X handle
- Pick the members whose `data-categories` intersect the topic, prioritising
  `tier-5` then `tier-4`. Open their X profiles, scroll a screen or two, collect
  recent posts worth amplifying.

## C. Discovery lane — beyond the roster  *(required in topic + roster modes)*

Do **not** hand back a shortlist sourced only from known accounts. Find new
brand-synergizing voices through:

1. **Topic authors** — the accounts posting the best material in the X search and
   writing the articles the web pass surfaced.
2. **Roster adjacency** — open a few roster members' recent timelines and note who
   they quote-post, reply to approvingly, or repost. Those are pre-vouched leads.
3. **Citations** — who the aligned outlets quote and link.

For **every** non-roster account, run `references/vetting.md` before it can appear
as a recommendation. Record the verdict (`amplify` / `amplify-with-care` / `pass`)
and a one-line reason. In the shortlist, mark the row **NEW — needs your eyeball**.

If a NEW voice is clearly excellent and durable, add a note suggesting the owner
add them to `worthy-men.html` (name, handle, suggested `data-categories`, a guess
at tier) — but don't edit that file from this skill.

## D. Link mode

Owner pasted a URL or quote. Open it, identify the **original** author (not the
account that reposted it into the owner's feed). If it's a screenshot of a post,
find the real post and use that link. Then go straight to drafting.

## E. Fit rubric  (record scores in each package's `source.md`)

Score each candidate:

| Criterion | Question | Notes |
|---|---|---|
| **Pillar** | Lead / Learn / Make War / Build? | If none fit cleanly, it's probably off-brand. |
| **Sound** | Reformed-defensible? | Check against `brand-voice.md` guardrails. |
| **Source trust** | roster tier, or NEW-account vetting verdict | Lead with tier 4–5 / `amplify`. |
| **Timeliness** | timely hook, or evergreen? | Both are fine; say which. |
| **Signal** | does this *add* to the timeline, or is it noise? | Skip dunks, doomerism, ragebait. |
| **Risk flags** | claims to verify? easy to misread? tone? | List them; they go in `post.md`. |

→ **Recommended treatment:** *straight repost* (rare — only for a perfect line
from a tier-5 source) · *quote-post + commentary* (the default) · *original post
inspired by* (when the source is good but not itself quotable, or not sound
enough to amplify directly).
