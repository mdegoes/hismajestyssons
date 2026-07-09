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

- **`index.html` (home) is a React app.** It loads React 18 + ReactDOM + `@babel/standalone` from unpkg, then `app.jsx` as an in-browser-compiled `text/babel` script (no bundler — Babel transforms JSX at page load). `app.jsx` defines the Nav/Hero/Manifesto/Work/Music/CTA/Footer components, but `App()` only mounts Nav/Hero/Manifesto/Foot — see dead code note below.
- **Every other page** (`art.html`, `music.html`, `family-prayer.html`, `resources.html`, `worthy-books.html`, `worth-a-follow.html`, `theme-preview.html`) **is plain static HTML** with a small vanilla `<script>` at the bottom that just toggles the `.nav`'s `data-scrolled` attribute on scroll. No React on these pages.

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
- `tweaks-panel.jsx` (the accent/density/scheme dev-tool control kit) is **no longer loaded by any page** — it used to be script-tagged in `index.html` alongside `app.jsx`; that `<script>` tag and the `useTweaks`/`TweaksPanel` usage in `app.jsx` were removed. The file is still in the repo but is fully orphaned; don't assume it's live anywhere.

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
- Known drift already documented there: `.album-title` differs between `index.html` (84px max, but part of dead/unrendered CSS — see below) and `music.html` (96px max, the live page) — treat music.html's value as correct.
- `app.jsx` defines `Work()`, `Music()`, and `CTA()` components (with matching CSS in `index.html`'s `<style>`) that `App()` never mounts, and index.html also has an explicitly-commented `/* legacy */` `.pillars`/`.pillar` block with no matching markup. This dead code is called out on the design-system page; be aware it's not visible on the live homepage before "fixing" something that reads it.
- The design-system page's Dev Tool section documents `tweaks-panel.jsx` as an orphaned file (see Theming above) — it's kept there for reference only, not because anything on the site still loads it.
- `--accent` is now a fixed single value (`#8C2A1F`) with no user-facing picker — the design-system page no longer shows alternate accent swatches, since that picker was removed along with the rest of the Tweaks Panel.

## Working conventions

- Adding a new sub-page: copy the structure of an existing static page (`<link rel="stylesheet" href="site.css">`, `<script src="theme.js"></script>` in `<head>`, the scroll listener script before `</body>`) rather than the React pattern used by `index.html`.
- `.mark .sigil img { width: 100%; height: auto; }` in `site.css` only applies inside `.mark` — a bare `.sigil` (as used standalone on the design-system page) needs its own sizing rule or the logo SVG renders at native/huge size.
