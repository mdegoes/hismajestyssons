const { useState, useEffect, useRef } = React;

// ---------- Components ----------
function Sigil({ size = 190, src = "assets/logo-long.svg" }) {
  return (
    <span className="sigil" style={{ width: size }}>
      <img src={src} alt="His Majesty’s Sons" />
    </span>
  );
}

function ThemeToggle({ onToggle }) {
  const [scheme, setScheme] = useState(window.CC.getScheme());
  useEffect(() => {
    const handler = (e) => setScheme(e.detail);
    window.addEventListener('cc-schemechange', handler);
    return () => window.removeEventListener('cc-schemechange', handler);
  }, []);
  const label = scheme === 'ink' ? 'Switch to light' : 'Switch to dark';
  return (
    <button className="theme-toggle" aria-label={label} data-tooltip={label} onClick={onToggle}>
      <svg className="icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg className="icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}

function Nav({ onJump, onToggleScheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const jump = (id) => { setMenuOpen(false); setResourcesOpen(false); onJump(id); };
  const toggleMenu = () => setMenuOpen((v) => {
    const next = !v;
    if (!next) setResourcesOpen(false);
    return next;
  });
  return (
    <nav className="nav" data-scrolled={scrolled} data-menu-open={menuOpen}>
      <a className="mark" href="#top" onClick={(e) => { e.preventDefault(); jump("top"); }} aria-label="His Majesty’s Sons — home">
        <Sigil size={190} />
      </a>
      <div className="nav-end">
        <div className="nav-links" id="nav-links">
          <a href="#manifesto" onClick={(e) => { e.preventDefault(); jump("manifesto"); }}>Mission</a>
          <a href="art.html">Art</a>
          <a href="music.html">Music</a>
          <div
            className="nav-drop"
            data-open={resourcesOpen}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              className="nav-drop-trigger"
              aria-haspopup="true"
              aria-expanded={resourcesOpen}
              aria-controls="nav-resources-panel"
              data-active="false"
              onClick={() => setResourcesOpen((v) => !v)}
            >
              Resources
              <svg className="chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="nav-drop-panel" id="nav-resources-panel">
              <div className="nav-drop-inner">
                <a href="resources.html">All Resources</a>
                <a href="family-prayer.html">Seven Days of Prayer</a>
                <a href="worthy-books.html">Worthy Books</a>
                <a href="worthy-men.html">Worthy Men</a>
              </div>
            </div>
          </div>
        </div>
        <ThemeToggle onToggle={onToggleScheme} />
        <button
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav-links"
          onClick={toggleMenu}
        >
          <span className="bars"><span></span><span></span><span></span></span>
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="wrap hero" id="top">
      <div>
        <div className="hero-eyebrow">Est. MMXXVI</div>
        <h1 className="hero-title">
          <span className="row">Serve the <em>Crown.</em></span>
          <span className="row world">Rise to your <em>Calling.</em></span>
        </h1>
        <p className="hero-strap">
          His Majesty’s Sons is a fellowship of men learning what it means to bow
          low before Christ and stand tall in the world He made — at the altar,
          at the desk, in the field, and at the door of our homes.
        </p>
        <div className="hero-actions">
          <a className="btn-ghost" href="#manifesto">Read the Mission ↓</a>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-photo">
          <img src="assets/images/home_page.png" alt="A father reading Scripture in the living room while his family gathers in the kitchen behind him" loading="lazy" />
          <div className="photo-caption">"Be strong, and show yourself a man." — 1 Kings 2:2</div>
        </div>
      </div>
    </header>
  );
}

function Manifesto() {
  return (
    <section className="manifesto-v2 wrap section" id="manifesto">
      <div className="m-rail">
        <span className="m-label">§ The Mission</span>
      </div>
      <div className="m-body">
        <p className="m-statement">
          Equipping men to live as <em>kings</em><br />
          under <em>The King.</em>
        </p>
        <div className="m-inscription" aria-hidden="true">
          <span>Home.</span>
          <span className="m-dot">·</span>
          <span>Work.</span>
          <span className="m-dot">·</span>
          <span>World.</span>
        </div>
        <p className="m-creed">
          No neutral ground. No compromise.<br />
          Christ claims it all<span className="m-em">—</span>now claim it for Him.
        </p>
      </div>
    </section>
  );
}

function Foot({ onJump }) {
  return (
    <footer className="foot">
      <div className="foot-brand">
        <Sigil size={160} src="assets/logo-vertical.svg" />
        <em>Deus vult</em>
      </div>
      <nav className="foot-links" aria-label="Site">
        <a href="#manifesto" onClick={(e) => { e.preventDefault(); onJump("manifesto"); }}>Mission</a>
        <a href="art.html">Art</a>
        <a href="music.html">Music</a>
        <a href="resources.html">Resources</a>
        <a href="family-prayer.html" className="foot-sub">Seven Days of Prayer</a>
        <a href="worthy-books.html" className="foot-sub">Worthy Books</a>
        <a href="worthy-men.html" className="foot-sub">Worthy Men</a>
      </nav>
      <div className="foot-social">
        <a href="https://www.instagram.com/hismajestyssons" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@hismajestyssons" target="_blank" rel="noopener">YouTube</a>
      </div>
    </footer>
  );
}

// ---------- App ----------
function App() {
  const onToggleScheme = () => window.CC.toggleScheme();

  const onJump = (id) => {
    const el = id === "top" ? document.body : document.getElementById(id);
    if (!el) return;
    const y = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <Nav onJump={onJump} onToggleScheme={onToggleScheme} />
      <Hero />
      <Manifesto />
      <Foot onJump={onJump} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
