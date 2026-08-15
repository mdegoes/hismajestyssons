# His Majesty’s Sons

*Equipping men to live as kings under The King.*

A multi-page static website built in HTML, CSS, and JSX. Serif-forward editorial design (Libre Baskerville / Baskerville) on a warm paper palette with an ink dark scheme.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home / landing page (React) |
| `art.html` | Art — Build |
| `music.html` | Music — Lead |
| `family-prayer.html` | Seven Days of Prayer — Lead |
| `worthy-books.html` | Worthy Books — Learn |
| `worthy-men.html` | Worthy Men — Learn |
| `make-war.html` | Make War (placeholder) |
| `theme-preview.html` | Internal theme/style reference (not linked from nav) |

Top nav: **Mission** (scrolls to the home page's manifesto) plus four dropdown categories — **Lead** (Music, Seven Days of Prayer), **Learn** (Worthy Books, Worthy Men), **Make War**, **Build** (Art).

## Project structure

```
.
├── index.html              # Home (React)
├── app.jsx                 # Home page components (Nav/Hero/Manifesto/Foot)
├── art.html
├── music.html
├── family-prayer.html
├── worthy-books.html
├── worthy-men.html
├── make-war.html
├── theme-preview.html
├── site.css                # Shared design tokens + nav/footer/buttons, linked by every page
├── home.css                 # Homepage-only hero/manifesto styles
├── theme.js                 # Light/dark scheme, runs before first paint
├── design-system/           # Live, un-indexed component reference (noindex)
├── assets/                  # Logos, favicons, brand assets
│   └── images/               # Photography (hero, album cover, book covers, roster photos)
├── hms-art/                 # Full-size + thumbnail JPGs for the art.html print collection
├── stripe-setup/             # Standalone Node tooling to provision Stripe payment links (not part of the site)
├── social-engine/            # Standalone Remotion tool for on-brand social video clips (not part of the site)
├── uploads/                 # User-supplied source images
├── screenshots/             # Design exploration captures (reference only)
└── CNAME                    # GitHub Pages custom domain
```

## Running locally

These are static pages — no build step required. Serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

> Fonts load from Google Fonts and React/Babel (for `index.html`'s `app.jsx`) loads from CDN, so an internet connection is needed for full fidelity.

## Design notes

- **Type:** Baskerville / Libre Baskerville throughout.
- **Palette:** warm paper (`#EFEDE8`) and ink (`#141006`), derived from a bronze/olive base (`#634e1d`) complementary to a single fixed accent (`#1D3263`, no picker).
- **Schemes:** light (`paper`) and dark (`ink`) — the only user-facing control is the nav's light/dark toggle; it follows the OS preference until manually switched.

See `CLAUDE.md` for the full architecture writeup (rendering strategy, theming internals, nav/footer structure, the art print shop, etc).

## License

Copyright © 2026. All rights reserved.
