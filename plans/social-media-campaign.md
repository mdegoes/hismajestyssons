# Social Media Campaign — @HisMajestysSons

_Written 2026-09-15._

## Audit: where @HisMajestysSons actually stands

Pulled from the live profile on 2026-09-14:

- **2 followers, 18 following, 7 posts total, joined January 2026.** This is a from-zero account, not an established one with a plateaued growth curve — the strategy has to be a bootstrap plan, not an optimization plan.
- **No avatar, no banner image, no bio.** Both image slots are still gray placeholders.
- **Display name is "Paul DeGoes," not "His Majesty's Sons."** The handle is branded but the name isn't — anyone landing on the profile sees a personal account, not a project.
- **The 7 posts are mixed-identity.** The oldest (Feb 14) is a personal Grok-video post ("Nice work @xai") with zero brand connection. Only the last 2 (Sep 7–8, from the `x-repost` skill) are on-brand — a Michael Foster quote card and an Ephesians 6:4 verse card, both well-produced but sitting at 11–16 impressions and 0 replies/likes/reposts.
- **You're already following the right people** — Auron MacIntyre, Owen Strachan, Eric Conn (New Christendom Press) show up in your following/suggestions, which is exactly the Worthy Men-adjacent niche. That's a usable asset, not something to build from scratch.

So the honest starting point: good content engine (`x-repost` skill), zero distribution, and a profile that doesn't visually read as a brand yet.

## Who we're actually targeting

Pulling straight from the site's own data model rather than guessing: `worthy-men.html`'s 21 Follow-For categories define the audience precisely — Reformed theology, biblical masculinity/patriarchy, Christian nationalism, homesteading, classical education, fatherhood, apologetics, postmillennialism, self-defense/2A, pastoral counsel. That's a young-to-middle-aged, theologically Reformed, politically engaged, family-building demographic already clustered around accounts like Doug Wilson, Auron MacIntyre, Michael Foster, and Blaze Media/Canon Press-adjacent voices. That's a real, densely-networked niche on X — not a mass audience.

## What the research says (2026)

- **Replies outweigh likes ~15x in ranking weight**, and a reply-to-your-reply from the original author is worth ~150x a like. Conversation quality, not follower count, is what the algorithm rewards. ([SocialPilot](https://www.socialpilot.co/blog/twitter-algorithm), [Postory](https://postory.io/blog/twitter-reply-strategy))
- **For a zero-follower account, "borrowed attention" via replies to larger niche accounts is the primary growth lever**, not original posting. 15–30 min/day replying with genuine add-on insight, a sharp question, or a respectful counterpoint to mid/large accounts in your niche — generic praise doesn't count. ([Medium](https://medium.com/@loganholdsworth/a-full-guide-to-early-x-account-growth-8f3aebabe419), [Postory](https://postory.io/blog/twitter-reply-strategy))
- **Threads build authority and follows better than single posts**; video gets ~10x the engagement of text; external links are actively suppressed for non-Premium accounts. ([SocialBee](https://socialbee.com/blog/twitter-algorithm/), [SocialPilot](https://www.socialpilot.co/blog/twitter-algorithm))
- **Consistency compounds** — the algorithm builds confidence in an account over time based on regular audience interaction; sporadic posting resets that. ([SocialBee](https://socialbee.com/blog/twitter-algorithm/))
- **Months 1–3 are genuinely slow** (0→500 followers) for any real account — no ad spend, no shortcuts. Treat early growth as a deliberate, unglamorous phase. ([grahammann.net](https://grahammann.net/blog/how-to-grow-on-x-twitter-2026))
- Christian-nationalist-adjacent accounts specifically grow by **deliberately targeting a younger demographic and building a tight "very online" community** around shared media/identity — not broad-reach content. ([GNET](https://gnet-research.org/2023/05/10/the-revitalisation-of-christian-identity-content-on-youtube-twitter-and-tiktok/), [WaPo](https://www.washingtonpost.com/religion/2021/10/19/christian-nationalism-social-media-gab/))

## The strategy

### Phase 0 — Fix the identity (do this before anything else, ~30 min) — ✅ done 2026-09-15

- Set display name to "His Majesty's Sons" (or "His Majesty's Sons ⚔️"), add avatar (the HMS ship/crown mark used in `assets/`) and a banner.
- Write a bio: short, verb-first, matches the established voice ("Catechize. Read scripture. Lead the table." register) — one line of mission, one link to hismajestyssons.com. Shipped: "A brotherhood sworn to taking ground for the kingdom. Lead. Learn. Make war. Build." (echoes the homepage Hero strap in `app.jsx:142-150` almost verbatim).
- Pin the strongest existing post (the Foster quote card) so first-time profile visitors see brand content, not the empty state.
- Decide whether the Feb 14 personal post stays — it's the one piece of content actively undermining the brand identity; consider deleting it.

### Phase 1 — Borrowed attention (ongoing, 15–30 min/day)

- Reply daily to 5–10 posts from the accounts already followed (MacIntyre, Strachan, Conn, Wilson, Foster, Sauvé, Sumpter, and the rest of the Worthy Men roster who post on X) with a real add-on point, a sharp question, or a respectful counterpoint — never a generic "great post." This is the actual growth engine at 2 followers, not original posting.
- Since Worthy Men entries already carry sourced X handles, this is a ready-made target list — no new research needed.
- The four reply formats that work: **add-on insight** (extend their point with something they didn't say), **specific question** (invite them or others to respond), **short story** (a concrete example illustrating their point), **respectful counterpoint** (genuine pushback, not contrarian-for-attention). No generic praise — it gets zero algorithmic credit.

#### Phase 1b — Trending topics (expand beyond the roster, same daily window)

Reply-worthy attention isn't limited to accounts you already follow — a trending topic's audience dwarfs any single account's, so jumping into the right trending conversation can out-reach a week of roster replies. But hot topics are usually combative, and the 2026 algorithm research found combative/negative-sentiment replies get throttled even when they generate raw engagement — a dunk reads as off-brand for HMS and hurts reach on top of it.

The rule: **treat "hot" as a filter, not a license.**

- Only jump into a trending topic when it clearly intersects one of the four pillars — Lead / Learn / Make War / Build (fatherhood, masculinity, Christian nationalism, homesteading, classical education, 2A, apologetics). If it doesn't map to a pillar, skip it regardless of how big it's trending.
- Hold the reply to the exact same bar as roster replies — add-on insight, sharp question, short story, or respectful counterpoint. Never a dunk, never outrage-bait, even when the topic itself is heated.
- Speed matters more here than with roster replies — a trending topic's algorithmic visibility window is short, so being early beats being thorough.
- This is an addition to the daily routine, not a replacement for it — don't let chasing trends crowd out the steady roster-reply habit that's the actual proven growth lever.

### Phase 2 — Content cadence & format

- Ship 1 `x-repost` post/day minimum (the pipeline already exists); when volume allows, aim toward the research's 3–5/day, spaced 3–4 hours apart.
- Add **threads** as a second format alongside the quote cards — e.g., walk through one Armory sin/scripture entry, or one Worthy Books argument, as a 5–8 tweet thread. Threads are the highest-leverage format for authority-building per the research, and structured long-form content (Armory data, book descriptions) is already available to adapt from.
- Where possible, prefer short native video/image over link-outs — links get suppressed for non-Premium accounts, so drive traffic via bio link and pinned post rather than in-post URLs.

### Phase 3 — Cross-promotion from existing assets

- The site's footer social links point to Instagram/YouTube — the same branded quote cards from `x-repost`/`social-engine` are reusable there with zero extra production cost. Don't build X in isolation from those.
- The Armory's common-sin lookup and Worthy Men roster are both content goldmines already structured as data — each entry is a ready-made post or thread, no new research per post.

## Targets, given the real starting point

- Weeks 1–2: profile fixed, posting daily, 20–30 quality replies/week logged. Don't expect follower movement yet.
- Months 1–3: 0 → 200–500 followers is a realistic, honest range per the research — treat anything faster as luck, not a broken plan.
- Track reply-engagement (replies received, not just given) as the leading indicator, not follower count — it's what the algorithm actually rewards first.

## Sources

- [Understanding how the X (Twitter) algorithm works in 2026 — SocialBee](https://socialbee.com/blog/twitter-algorithm/)
- [X (Twitter) Algorithm: Ranking Factors & Growth Tips (August 2026) — SocialPilot](https://www.socialpilot.co/blog/twitter-algorithm)
- [The Twitter/X Reply Strategy That Grows Accounts Faster Than Posting — Postory](https://postory.io/blog/twitter-reply-strategy)
- [How to Grow Your X (Twitter) Account from Scratch in 2026 — Medium](https://medium.com/@loganholdsworth/a-full-guide-to-early-x-account-growth-8f3aebabe419)
- [How to Grow Your Followers on X (Twitter): What's Actually Working in 2026 — grahammann.net](https://grahammann.net/blog/how-to-grow-on-x-twitter-2026)
- [The Revitalisation of Christian Identity Content on YouTube, Twitter, and TikTok — GNET](https://gnet-research.org/2023/05/10/the-revitalisation-of-christian-identity-content-on-youtube-twitter-and-tiktok/)
- [Christian nationalism and social media: Believers skirt the power of Big Tech — Washington Post](https://www.washingtonpost.com/religion/2021/10/19/christian-nationalism-social-media-gab/)

## Next steps

Candidates for follow-up work, not yet started:

- Turn one Armory entry or Worthy Men bio into a first thread using the `x-repost` skill's voice guide.
- Draft a few reply templates in the HMS voice (verb-first, hard-negation style) as a starting point for the daily Phase 1/1b routine.
