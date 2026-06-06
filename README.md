# Crown & Calling

*Equipping men to live as kings under The King.*

A multi-page static website built in HTML, CSS, and JSX. Serif-forward editorial design (Libre Baskerville / Baskerville) on a warm paper palette with an ink dark scheme.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home / landing page |
| `art.html` | Art |
| `music.html` | Music |
| `family-prayer.html` | Family prayer |
| `resources.html` | Resources |
| `worthy-books.html` | Worthy books |
| `worth-a-follow.html` | Worth a follow |

## Project structure

```
.
├── index.html              # Home
├── art.html
├── music.html
├── family-prayer.html
├── resources.html
├── worthy-books.html
├── worth-a-follow.html
├── site.css                # Shared styles
├── app.jsx                 # Shared interactive logic
├── tweaks-panel.jsx        # In-page tweak controls
├── assets/                 # Logos and brand assets
│   └── logo-vertical.svg
├── uploads/                # User-supplied source images
└── screenshots/            # Design exploration captures (reference only)
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

> Fonts load from Google Fonts and some scripts (React/Babel for the `.jsx` files) load from CDN, so an internet connection is needed for full fidelity.

## Design notes

- **Type:** Baskerville / Libre Baskerville throughout.
- **Palette:** warm paper (`#F1ECE0`) and ink (`#0E0E0C`), with a configurable accent (default `#8C2A1F`).
- **Schemes:** light (`paper`) and dark (`ink`), plus comfortable/compact density — toggled via the tweaks panel.

## License

Copyright © 2026. All rights reserved.
