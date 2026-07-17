# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build step, package manager, or test suite — this is a static site.

```bash
# Serve locally (either works)
python3 -m http.server 8000
npx serve .
```

Open `http://localhost:8000`. An internet connection is required for full fidelity: Google Fonts (Libre Baskerville) and the React/Babel CDN scripts used by `index.html` both load remotely.

## Architecture

### Two rendering strategies, split by page

- **`index.html` (home) is a React app.** It loads React 18 + ReactDOM + `@babel/standalone` from unpkg, then `app.jsx` as an in-browser-compiled `text/babel` script (no bundler — Babel transforms JSX at page load). `app.jsx` defines and `App()` mounts Nav/Hero/Manifesto/Foot — that's the whole homepage.
- **Every other page** (`art.html`, `music.html`, `family-prayer.html`, `resources.html`, `worthy-books.html`, `worth-a-follow.html`, `theme-preview.html`) **is plain static HTML** with a small vanilla `<script>` at the bottom that toggles the `.nav`'s `data-scrolled` attribute on scroll and wires up the mobile hamburger menu (see Mobile nav below). No React on these pages.

Don't assume a change to `app.jsx` affects any page besides `index.html`.

### Styling: shared tokens + per-page duplication

- `site.css` defines the shared design tokens (`:root` custom properties for `--paper`, `--ink`, `--accent`, fonts, spacing) plus the `[data-scheme="ink"]` dark-mode overrides, nav, and footer. All non-home pages link it.
- `index.html` does **not** use `site.css` — it redefines the same tokens in its own inline `<style>` block. If you change a design token (color, spacing, font stack), it must be updated in **both** `site.css` and `index.html`'s inline styles or the pages will visually drift apart.
- Each page additionally has its own inline `<style>` block for page-specific layout (e.g. `art.html`'s `.collection-plate`), on top of the shared tokens.

### Theming (light/dark)

Theme is a first-class, user-facing feature (not a dev tool) — there is no accent-color or density picker anywhere on the site anymore; the only user control is the light/dark toggle.

- `theme.js` runs synchronously in `<head>` (before first paint, to avoid FOUC) and sets `data-scheme` (`"ink"` or `"paper"`) on `<html>`. On first visit (no `localStorage['cc-scheme']` yet) it follows the OS `prefers-color-scheme` media query, falling back to `"ink"` if that's unsupported/unset; once a visitor manually toggles, that choice is saved to `localStorage['cc-scheme']` and wins from then on.
- If no manual preference is saved, `theme.js` also listens for OS `prefers-color-scheme` **changes** and live-updates `data-scheme` accordingly.
- `window.CC.toggleScheme()` flips the scheme, persists it, updates the toggle button's tooltip/`aria-label` (via `_ccUpdateTooltips`), and fires a `cc-schemechange` event.
- `theme.js` adds `html.theme-ready` one frame after load (via `requestAnimationFrame`), which is what enables the `0.25s` background/color/border-color transitions in `site.css`/`index.html` — this ordering matters: transitions must stay off until after first paint or you get a FOUC-adjacent flash.
- On `index.html`, `app.jsx`'s `ThemeToggle` no longer holds its own state — it just reads `window.CC.getScheme()` and re-renders on `cc-schemechange`, calling `window.CC.toggleScheme()` directly on click. There is no more `useTweaks`/`TweaksPanel` wiring on the home page.
- `tweaks-panel.jsx` (the old accent/density/scheme dev-tool control kit) has been deleted along with its design-system Dev Tool section — it was fully orphaned (no page loaded it) and kept no reference value once theme became a first-class OS-aware feature.

### Mobile nav (hamburger menu)

- Below 720px, `.nav-links` hides itself and a `.nav-toggle` hamburger button (in `.nav-end`, next to the theme toggle) becomes the only way to reach nav links. Clicking it sets `data-menu-open="true"` on `.nav`, which drops `.nav-links` into an absolutely-positioned panel below the bar; the CSS lives in `site.css` for static pages and is duplicated in `index.html`'s inline `<style>` — same drift risk as any other shared token, keep both in sync.
- On static pages, each trailing `<script>` queries `.nav-toggle`, toggles `data-menu-open` on click, and closes the menu when a `.nav-links a` is clicked. It also flips the button's `aria-expanded` **and** `aria-label` (`"Open menu"` / `"Close menu"`) — don't drop the `aria-label` update when touching this script, it's easy to regress into a static label that never reflects state.
- On `index.html`, `app.jsx`'s `Nav` component holds `menuOpen` in React state instead and does the equivalent (`data-menu-open`, `aria-expanded`, `aria-label` all derived from state); it also closes the menu on nav-link click via a wrapped `jump()` handler.
- There's no click-outside-to-close or Escape-to-close handling anywhere (static pages or React) — closing only happens via the toggle button itself or clicking a link. That's consistent site-wide, not an oversight to "fix" on just one page.

### Content structure

- `assets/` — brand assets (e.g. `logo-vertical.svg`, inverted via CSS filter in dark mode).
- `crown-n-calling-art/` — the artwork collection shown on `art.html`; each piece ships a full-size and a `-sm` thumbnail JPG, numbered by display order (`01-...`, `02-...`, etc).
- `uploads/` — source images supplied by the user (raw material, not necessarily used directly on-site).
- `screenshots/` — design exploration captures, reference only, not loaded by any page.
- `CNAME` — GitHub Pages custom domain (`crownandcalling.org`); this repo deploys via GitHub Pages directly from static files. Pages are normally plain files at the repo root; a page needs its own folder with an `index.html` only if it wants a clean, extension-less URL (see `design-system/` below).

### Design system reference (`/design-system`)

- `design-system/index.html` + `design-system/design-system.css` — a live, un-indexed catalog (`<meta name="robots" content="noindex, nofollow">`, not linked from any nav) of every color, type style, spacing value, and component pattern in use across the site, organized as tokens → atoms → molecules → organisms. It's the canonical reference: **when adding or changing a component pattern, check here first, and update this page too so it doesn't drift from reality.**
- It reuses real classes from `site.css` directly (`.btn-primary`, `.eyebrow`, `.back-link`, etc.) so those specimens can't silently go stale. Page-specific patterns that don't have a shared class yet (`.photo-tag`, `.goto`, follow/piece cards) get their CSS copied into `design-system.css` as the documented spec.
- It also **introduces two new canonical classes that don't exist elsewhere yet**: `.divider` (consolidates the 4 near-duplicate "roman numeral + heading" dividers — `.collection-plate` in art.html, `.shelf-section` in worthy-books.html, `.tracks-head` in music.html, `.band` in worth-a-follow.html) and `.list-row` (consolidates the 3 near-duplicate "indexed row" patterns — `.track`, `.book`, `.forthcoming-list li`). Existing pages still use their own original classes; only adopt `.divider`/`.list-row` on a page if actually asked to migrate it.
- `.album-title` lives only in `music.html` now (96px max) — its old, smaller (84px) dead-code copy in `index.html` was deleted, so there's no drift to reconcile anymore.
- The formerly-dead `Work()`/`Music()`/`CTA()` components (and their matching CSS, and the legacy `.pillars`/`.pillar` block) have been deleted from `app.jsx`/`index.html` — they were never mounted by `App()`. The "Card grid" and "Album hero" specimens on the design-system page are now the only surviving reference for those patterns; `music.html`'s `.album-hero` is the one live copy (96px title max — treat it as correct if anything else claims otherwise).
- `--accent` is now a fixed single value (`#8C2A1F`) with no user-facing picker — the design-system page no longer shows alternate accent swatches, since that picker was removed along with the rest of the Tweaks Panel.

## Working conventions

- Adding a new sub-page: copy the structure of an existing static page (`<link rel="stylesheet" href="site.css">`, `<script src="theme.js"></script>` in `<head>`, the `.nav-toggle` button and `id="nav-links"` in the nav markup, the scroll-listener + hamburger-menu script before `</body>`) rather than the React pattern used by `index.html`.
- `.mark .sigil img { width: 100%; height: auto; }` in `site.css` only applies inside `.mark` — a bare `.sigil` (as used standalone on the design-system page) needs its own sizing rule or the logo SVG renders at native/huge size.
