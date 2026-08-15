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

const NAV_DROPS = [
  {
    key: "lead",
    label: "Lead",
    panelId: "nav-lead-panel",
    links: [
      { href: "music.html", label: "Music" },
      { href: "family-prayer.html", label: "Seven Days of Prayer" },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    panelId: "nav-learn-panel",
    links: [
      { href: "worthy-books.html", label: "Worthy Books" },
      { href: "worthy-men.html", label: "Worthy Men" },
    ],
  },
  {
    key: "makeWar",
    label: "Make War",
    panelId: "nav-makewar-panel",
    links: [{ href: "make-war.html", label: "Coming Soon" }],
  },
  {
    key: "build",
    label: "Build",
    panelId: "nav-build-panel",
    links: [{ href: "art.html", label: "Art" }],
  },
];

function Nav({ onJump, onToggleScheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const jump = (id) => { setMenuOpen(false); setOpenDrop(null); onJump(id); };
  const toggleMenu = () => setMenuOpen((v) => {
    const next = !v;
    if (!next) setOpenDrop(null);
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
          {NAV_DROPS.map((drop) => (
            <div
              key={drop.key}
              className="nav-drop"
              data-open={openDrop === drop.key}
              onMouseEnter={() => setOpenDrop(drop.key)}
              onMouseLeave={() => setOpenDrop((v) => (v === drop.key ? null : v))}
            >
              <button
                type="button"
                className="nav-drop-trigger"
                aria-haspopup="true"
                aria-expanded={openDrop === drop.key}
                aria-controls={drop.panelId}
                data-active="false"
                onClick={() => setOpenDrop((v) => (v === drop.key ? null : drop.key))}
              >
                {drop.label}
                <svg className="chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className="nav-drop-panel" id={drop.panelId}>
                <div className="nav-drop-inner">
                  {drop.links.map((link) => (
                    <a key={link.href} href={link.href}>{link.label}</a>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
      <div className="hero-eyebrow">Est. MMXXVI</div>
      <h1 className="hero-title">
        <span className="row">For the <em>King.</em></span>
      </h1>
      <p className="hero-strap">
        HMS is a brotherhood sworn to taking ground for the kingdom. Every day.
        In every way. At our workbenches, in the pew, on our phones, and on
        our streets.
      </p>
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

function ExploreBand({ id, eyebrow, heading, strap, image, links }) {
  return (
    <section className="explore-band" id={id}>
      <div className="explore-band-media">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          style={image.zoom ? { transform: `scale(${image.zoom})` } : undefined}
        />
      </div>
      <div className="explore-band-scrim" aria-hidden="true"></div>
      <div className="explore-band-content">
        <div className="explore-eyebrow">{eyebrow}</div>
        <h3 className="explore-heading">{heading}</h3>
        <p className="explore-strap">{strap}</p>
        <div className="explore-ctas">
          {links.map((link, i) => (
            <a
              key={link.href}
              className={`explore-cta${i === 0 ? " explore-cta--primary" : ""}`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section className="explore" id="explore" aria-label="Explore His Majesty’s Sons">
      <ExploreBand
        id="explore-lead"
        eyebrow="§ 01 · Lead"
        heading={<>Lead your <em>home.</em></>}
        strap="Prayer at the table. Scripture on the shelf. A father who leads because someone has to, and it might as well be him."
        image={{ src: "assets/images/7_days_of_prayer.png", alt: "A father and his children kneeling together in prayer in their living room" }}
        links={[
          { label: "Worship", href: "music.html" },
          { label: "Lead in Prayer", href: "family-prayer.html" },
        ]}
      />
      <ExploreBand
        id="explore-learn"
        eyebrow="§ 02 · Learn"
        heading={<>Learn what’s <em>true.</em></>}
        strap="Books worth reading and men worth following — building a mind that can’t be moved by the next headline."
        image={{ src: "assets/images/worth_a_read.png", alt: "A quiet home library lined with leather-bound books" }}
        links={[
          { label: "Read the List", href: "worthy-books.html" },
          { label: "Follow Worthy Men", href: "worthy-men.html" },
        ]}
      />
      <ExploreBand
        id="explore-makewar"
        eyebrow="§ 03 · Make War"
        heading={<>Make war on the <em>enemy.</em></>}
        strap="Every man is conscripted. The only question is whether he shows up armed."
        image={{ src: "assets/images/worth_a_follow.png", alt: "A study with a Bible and a flintlock rifle mounted beneath a wooden cross" }}
        links={[{ label: "Answer the Call", href: "make-war.html" }]}
      />
      <ExploreBand
        id="explore-build"
        eyebrow="§ 04 · Build"
        heading={<>Build what <em>lasts.</em></>}
        strap="Scripture-grounded prints for the wall of a home that means to stand for a hundred years."
        image={{ src: "hms-art/01-the-church-sm.jpg", alt: "A pencil-sketch print of a church, from the His Majesty's Sons art collection", zoom: 1.15 }}
        links={[{ label: "Browse the Prints", href: "art.html" }]}
      />
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
        <a href="music.html">Lead</a>
        <a href="music.html" className="foot-sub">Music</a>
        <a href="family-prayer.html" className="foot-sub">Seven Days of Prayer</a>
        <a href="worthy-books.html">Learn</a>
        <a href="worthy-books.html" className="foot-sub">Worthy Books</a>
        <a href="worthy-men.html" className="foot-sub">Worthy Men</a>
        <a href="make-war.html">Make War</a>
        <a href="art.html">Build</a>
        <a href="art.html" className="foot-sub">Art</a>
      </nav>
      <div className="foot-social">
        <a href="https://www.instagram.com/hismajestyssons" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@hismajestyssons" target="_blank" rel="noopener">YouTube</a>
      </div>
      <div className="foot-legal">© 2026 His Majesty’s Sons. All rights reserved.</div>
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
      <Explore />
      <Manifesto />
      <Foot onJump={onJump} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
