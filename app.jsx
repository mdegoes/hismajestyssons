const { useState, useEffect, useRef } = React;

// ---------- Data ----------
const works = [
  {
    n: "01",
    tag: "Film",
    title: "No Neutral Ground",
    desc: "A short film on reclaiming the workplace as holy ground.",
    meta: "Watch · 14 min",
    span: "span-6",
    photo: "men working / dim warehouse",
  },
  {
    n: "02",
    tag: "Cohort",
    title: "The King's Table",
    desc: "Six weeks. Twelve men. One shared rule of life.",
    meta: "Apply · Fall '26",
    span: "span-6",
    photo: "table, candles, hands",
  },
  {
    n: "03",
    tag: "Essay",
    title: "Home Is the First Kingdom",
    desc: "On fatherhood, headship, and the long obedience.",
    meta: "Read · 9 min",
    span: "span-4",
    photo: "father + son, golden hour",
  },
  {
    n: "04",
    tag: "Retreat",
    title: "Iron Sharpens Iron",
    desc: "Three days in the mountains. No phones. One Book.",
    meta: "Reserve · May '26",
    span: "span-4",
    photo: "ridge line, men hiking",
  },
  {
    n: "05",
    tag: "Letter",
    title: "Claim It For Him",
    desc: "A weekly dispatch for men under orders.",
    meta: "Subscribe · free",
    span: "span-4",
    photo: "open letter, ink + wax seal",
  },
];

const album = {
  title: "Christus Dominus",
  subtitle: "A Christian collection of war songs to inspire.",
  cover: "album art / illuminated manuscript",
};

const tracks = [
  { title: "Warsong",                       sub: "Track 01",  duration: "3:42", spotify: "#", youtube: "#" },
  { title: "Watchman's Ballad",             sub: "Track 02",  duration: "4:08", spotify: "#", youtube: "#" },
  { title: "A Mighty Fortress Is Our God",  sub: "Track 03",  duration: "4:51", spotify: "#", youtube: "#" },
  { title: "Canticle Of Turning",           sub: "Track 04",  duration: "5:14", spotify: "#", youtube: "#" },
  { title: "King Alfred's War Song",        sub: "Track 05",  duration: "4:33", spotify: "#", youtube: "#" },
  { title: "Rise Again Ye Lion Hearted",    sub: "Track 06",  duration: "3:57", spotify: "#", youtube: "#" },
  { title: "The Son Of God Goes Forth To War", sub: "Track 07", duration: "4:22", spotify: "#", youtube: "#" },
  { title: "Am I A Soldier Of The Cross",   sub: "Track 08",  duration: "5:06", spotify: "#", youtube: "#" },
];

// ---------- Components ----------
function Sigil({ size = 130 }) {
  return (
    <span className="sigil" style={{ width: size }}>
      <img src="assets/logo-vertical.svg" alt="Crown &amp; Calling" />
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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className="nav" data-scrolled={scrolled}>
      <a className="mark" href="#top" onClick={(e) => { e.preventDefault(); onJump("top"); }} aria-label="Crown &amp; Calling — home">
        <Sigil size={130} />
      </a>
      <div className="nav-end">
        <div className="nav-links">
          <a href="#manifesto" onClick={(e) => { e.preventDefault(); onJump("manifesto"); }}>Mission</a>
          <a href="art.html">Art</a>
          <a href="music.html">Music</a>
          <a href="resources.html">Resources</a>
        </div>
        <ThemeToggle onToggle={onToggleScheme} />
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
          Crown &amp; Calling is a fellowship of men learning what it means to bow
          low before Christ and stand tall in the world He made — at the altar,
          at the desk, in the field, and at the door of our homes.
        </p>
        <div className="hero-actions">
          <a className="btn-ghost" href="#manifesto">Read the Mission ↓</a>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-photo">
          <div className="photo-tag">PHOTO · 4:5 · MEN AT THE ALTAR</div>
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

function Work() {
  return (
    <section className="wrap section" id="work">
      <header className="sec-head">
        <h2>The Work <em>— what we are building</em></h2>
      </header>
      <div className="work-grid">
        {works.map((w) => (
          <article key={w.n} className={`work ${w.span}`}>
            <div className="img">
              <div className="tag">{w.tag.toUpperCase()}</div>
              <div className="num">{w.n}</div>
              <div
                style={{
                  position: "absolute", left: 12, bottom: 12, right: 12,
                  fontFamily: "ui-monospace, monospace", fontSize: 10,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "var(--ink-2)", opacity: 0.7,
                }}>
                /// {w.photo}
              </div>
            </div>
            <h3>{w.title}</h3>
            <p className="desc">{w.desc}</p>
            <div className="meta">{w.meta}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Music() {
  return (
    <section className="music" id="music">
      <div className="wrap section">
        <header className="sec-head">
          <h2>The Music <em>— anthems for the assembly</em></h2>
        </header>

        <div className="album-hero">
          <div className="album-cover">
            <div className="photo-tag">ALBUM ART · 1:1</div>
            <div className="cover-caption">/// {album.cover}</div>
          </div>
          <div className="album-info">
            <div className="album-eyebrow">An Album</div>
            <h3 className="album-title">{album.title}</h3>
            <p className="album-desc">{album.subtitle}</p>
            <div className="album-links">
              <a className="platform" href="#" aria-label="Listen on Spotify">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4c-.2.3-.6.4-.9.2-2.4-1.5-5.4-1.8-9-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3 1zm1.2-2.7c-.3.4-.7.5-1.1.3-2.7-1.7-6.9-2.2-10.1-1.2-.5.1-.9-.1-1.1-.6-.1-.4.1-.9.6-1 3.6-1.1 8.2-.5 11.3 1.4.4.2.6.7.4 1.1zm.1-2.9c-3.3-2-8.7-2.1-11.8-1.2-.5.2-1.1-.1-1.2-.7-.2-.5.1-1.1.7-1.2 3.6-1.1 9.6-.9 13.3 1.4.5.3.7 1 .4 1.5-.3.4-.9.6-1.4.2z"/></svg>
                Spotify
                <span className="arrow">↗</span>
              </a>
              <a className="platform" href="#" aria-label="Listen on YouTube Music">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18.2c-4.5 0-8.2-3.7-8.2-8.2S7.5 3.8 12 3.8s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2zM10 7.8v8.4L17 12 10 7.8z"/></svg>
                YouTube Music
                <span className="arrow">↗</span>
              </a>
            </div>
          </div>
        </div>

        <ol className="tracks">
          {tracks.map((t, i) => (
            <li key={i} className="track">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div className="title">{t.title}</div>
              <div className="duration">{t.duration}</div>
              <div className="track-links">
                <a className="goto" href={t.spotify} aria-label={`${t.title} on Spotify`}>
                  Spotify <span className="arrow">↗</span>
                </a>
                <a className="goto" href={t.youtube} aria-label={`${t.title} on YouTube Music`}>
                  YouTube <span className="arrow">↗</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(() => { setSent(false); setEmail(""); }, 2400);
  };
  return (
    <section className="cta wrap" id="contact">
      <div className="cta-grid">
        <div>
          <h2>
            Claim it<br/>
            <em>for Him.</em>
          </h2>
        </div>
        <div className="cta-side">
          <p>
            A weekly letter for men under orders. Scripture, sharpening,
            and the next assignment for Home, Work, and World.
          </p>
          <form className={`form ${sent ? "success" : ""}`} onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="your@inbox.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">{sent ? "Enlisted ✓" : "Enlist →"}</button>
          </form>
          <div className="cta-contact">
            <div>
              Write
              <a href="mailto:assembly@crownandcalling.co">assembly@crownandcalling.co</a>
            </div>
            <div>
              Visit
              <a>By appointment · Nashville, TN</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="foot">
      <div className="mark">
        <Sigil size={36} />
      </div>
      <div className="links">
        <a href="https://www.instagram.com/crown_n_calling" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.youtube.com/@crown-and-calling" target="_blank" rel="noopener">YouTube</a>
      </div>
      <div><em>Deus vult</em></div>
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
      <Foot />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
