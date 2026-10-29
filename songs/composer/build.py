"""Assemble composer.html from src/.

src/page.html        head, styles and markup, with three placeholders
src/composer.js      the app
src/baladin-tunes.js the 13 hand-written Baladin chorus tunes (const TUNES = [...])
../baladin/lyrics-full.txt  the sample lyrics loaded on first visit

Usage: python3 build.py   (then publish composer.html as the artifact)
"""
import json
from pathlib import Path

here = Path(__file__).parent
page = (here / "src/page.html").read_text()
out = (page
       .replace("/*TUNES*/", "  " + (here / "src/baladin-tunes.js").read_text().strip())
       .replace("/*DEFAULT_TEXT*/", "  const DEFAULT_TEXT = " + json.dumps((here / "../baladin/lyrics-full.txt").read_text().strip() + "\n") + ";")
       .replace("/*COMPOSER_JS*/", (here / "src/composer.js").read_text().rstrip()))
(here / "composer.html").write_text(out)
print("wrote composer.html,", len(out), "bytes")
