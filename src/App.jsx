import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ---- Controlled vocab (mirrors Discogs' own genre/style taxonomy, trimmed to common picks) ----
const GENRE_STYLES = {
  "Any Genre": [],
"Blues": [
    "Chicago Blues",
  "Country Blues",
    "Delta Blues",
    "Electric Blues",
  "Hill Country Blues",
   "Louisiana Blues",
  "Memphis Blues",
  "Modern Electric Blues",
  "Texas Blues"
  
  ],
  "Classical": [
    "Baroque",
    "Contemporary",
    "Modern",
    "Romantic"
  ],
  "Electronic": [
    "Acid",
    "Ambient",
    "Disco",
    "Downtempo",
    "Electro",
    "House",
    "IDM",
    "Synth-pop",
    "Techno"
  ],
  "Folk, World, & Country": [
    "African",
    "Afrobeat",
     "Celtic",
    "Country",
    "Flamenco",
    "Folk",
    "Highlife",
    "Indian Classical",
    "Latin",
    "Samba",
    "Shamisen"
  ],
  "Funk / Soul": [
    "Disco",
    "Funk",
    "Neo Soul",
    "P.Funk",
    "Rhythm & Blues",
    "Soul"
  ],
  "Hip Hop": [
    "Boom Bap",
    "Conscious",
    "G-Funk",
    "Gangsta",
    "Instrumental",
    "Trip Hop"
  ],
  "Jazz": [
    "Afro-Cuban Jazz",
    "Afrobeat",
    "Avant-garde Jazz",
    "Big Band",
    "Bop",
    "Bossa Nova",
    "Cape Jazz",
    "Contemporary Jazz",
    "Cool Jazz",
    "Free Improvisation",
    "Free Jazz",
    "Fusion",
    "Hard Bop",
    "Jazz-Funk",
    "Jazz-Rock",
    "Latin Jazz",
    "Modal",
    "Post Bop",
    "Smooth Jazz",
    "Soul-Jazz",
    "Space-Age"
  ],
  "Latin": [
    "Afro-Cuban",
    "Boogaloo",
    "Bossa Nova",
    "Cha-Cha",
    "Cumbia",
    "Guaracha",
    "Mambo",
    "MPB",
    "Salsa",
    "Tango"
  ],
  "Pop": [
    "Ballad",
    "Bollywood",
    "Bubblegum",
    "Chanson",
    "City Pop",
    "Europop",
    "Indie Pop",
    "J-pop",
    "K-pop",
    "Kayōkyoku",
    "Synth-pop",
    "Vocal"
  ],
  "Reggae": [
    "Dancehall",
    "Dub",
    "Roots Reggae",
    "Ska"
  ],
  "Rock": [
    "AOR",
    "Alternative Rock",
    "Art Rock",
    "Black Metal",
    "Blues Rock",
    "Classic Rock",
    "Country Rock",
    "Death Metal",
    "Doom Metal",
    "Folk Rock",
    "Garage Rock",
    "Glam",
    "Heavy Metal",
    "Indie Rock",
    "Krautrock",
    "New Wave",
    "Nu Metal",
    "Post-Punk",
    "Power Pop",
    "Prog Rock",
    "Psychedelic Rock",
    "Punk",
    "Shoegaze",
    "Sludge Metal",
    "Soft Rock",
    "Thrash"
  ]
};

const DECADES = ["Any Decade", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

// Curated list of pressing-country values as Discogs tends to store them. Best-effort —
// Discogs' country field is free text tied to what's on the release, so obscure or
// multi-country pressings won't always match a single value here.
const COUNTRIES = [
  "Any Country", "US", "UK", "Germany", "France", "Japan", "Netherlands", "Italy",
  "Canada", "Australia", "Spain", "Sweden", "Belgium", "Brazil", "Poland", "Mexico",
  "South Korea", "Yugoslavia", "USSR", "Czechoslovakia", "Argentina", "Portugal",
];

// Discogs' search "format" param only takes one value at a time. When the person selects
// more than one, we broaden the query and filter candidates client-side instead.
const FORMAT_OPTIONS = ["Vinyl", "LP", "CD", "Cassette", "7\"", "10\"", "12\"", "Box Set"];

// Warm-earthy palette — leans toward "flipping through record bins" rather than a
// generic utilitarian gray/white/black app.
const PALETTE = {
  bg: "#F4EDE1",
  card: "#FFFFFF",
  border: "#E3D9C6",
  borderStrong: "#D0C2A8",
  primary: "#2E2A22",
  muted: "#7C7259",
  mutedLight: "#948B72",
  accent: "#598396",
  accentDark: "#2754a8",
  success: "#4E8B5D",
  danger: "#B3402E",
  warn: "#8A6A1F",
};

// Discogs' image CDN occasionally 404s on an otherwise valid URL. Rather than giving up
// immediately, retry the same URL once (with a cache-busting param) before falling back to
// a placeholder — smooths over what's usually just a transient hiccup.
function SmartImage({ src, alt, style, placeholderStyle, placeholderText = "No image" }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    setRevealed(false);
  }, [src]);

  useEffect(() => {
    if (!src || failed) return;
    let cancelled = false;
    const effectiveSrc = attempt === 0 ? src : src + (src.includes("?") ? "&" : "?") + "retry=" + attempt;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const box = containerRef.current;
      if (!canvas || !box) return;

      const W = (canvas.width = box.clientWidth || 400);
      const H = (canvas.height = box.clientHeight || 400);
      const ctx = canvas.getContext("2d");

      // Coarse -> fine block sizes. Each step draws the source into a tiny offscreen
      // canvas, then blows it up with smoothing off — that upscale is what produces
      // the blocky look. Last step is a normal full-res draw.
      const steps = [28, 14, 7, 3, 1];
      let i = 0;

      function drawStep() {
        if (cancelled) return;
        const block = steps[i];
        if (block === 1) {
          ctx.imageSmoothingEnabled = true;
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          setRevealed(true);
          return;
        }
        const w = Math.max(1, Math.round(W / block));
        const h = Math.max(1, Math.round(H / block));
        const tiny = document.createElement("canvas");
        tiny.width = w;
        tiny.height = h;
        tiny.getContext("2d").drawImage(img, 0, 0, w, h);

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(tiny, 0, 0, w, h, 0, 0, W, H);

        i++;
        setTimeout(() => requestAnimationFrame(drawStep), 55);
      }
      requestAnimationFrame(drawStep);
    };

    img.onerror = () => {
      if (cancelled) return;
      if (attempt < 1) setTimeout(() => setAttempt((a) => a + 1), 400);
      else setFailed(true);
    };

    img.src = effectiveSrc;
    return () => {
      cancelled = true;
    };
  }, [src, attempt, failed]);

  if (!src || failed) {
    return <div style={{ ...style, ...placeholderStyle }}>{!src ? placeholderText : "Image unavailable"}</div>;
  }

  return (
    <div ref={containerRef} style={style} role="img" aria-label={alt}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", opacity: revealed ? 1 : 0.98 }}
      />
    </div>
  );
}

// token should allow more api calls per minute
const detailCache = new Map();

// Decorative loading copy — the "fake number is fine as long as it reads as decorative"
// idea, mixed with plain honest copy so it doesn't feel gimmicky every single time.
const DIG_MESSAGES = [
  "Digging through crates…",
  "Digging…",
  "Flipping through the stacks…",
  "Searching a few million releases…",
  "Blowing the dust off a sleeve…",
];

// Discogs' search result "title" field is "Artist - Title" combined; the full release
// detail has clean separate fields. Prefer the clean version, fall back to a best-effort
// split on the first " - " (imperfect for titles that contain " - " themselves).
function splitArtistTitle(result, detail) {
  if (detail?.title && detail?.artists?.length) {
    return { artist: detail.artists.map((a) => a.name).join(", "), title: detail.title };
  }
  const raw = result?.title || "";
  const idx = raw.indexOf(" - ");
  if (idx === -1) return { artist: "", title: raw };
  return { artist: raw.slice(0, idx), title: raw.slice(idx + 3) };
}

function renderStars(average) {
  const rounded = Math.round(average);
  return "★".repeat(Math.max(0, Math.min(5, rounded))) + "☆".repeat(Math.max(0, 5 - rounded));
}

function randomYearInDecade(decade) {
  if (decade === "Any Decade") return null;
  const start = parseInt(decade.slice(0, 4), 10);
  return start + Math.floor(Math.random() * 10);
}

async function apiFetch(params, signal) {
  const res = await fetch("/api/discogs?" + new URLSearchParams(params), { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Discogs lookup failed (${res.status}).`);
    error.retryAfter = Number(res.headers.get("Retry-After")) || 0;
    throw error;
  }
  return res.json();
}

async function discogsFetch(params, signal) {
  return apiFetch({ kind: "search", ...params }, signal);
}

// The search endpoint's cover_image is unreliable (often a stale or generic spacer
// image). Following up on the release's own resource_url gives the real images array
// plus fields the search endpoint doesn't return at all, like lowest_price / community.rating.
async function discogsFetchDetail(resourceUrl, signal) {
  const id = String(resourceUrl || "").match(/\/releases\/(\d+)/)?.[1];
  if (!id) throw new Error("That Discogs release is unavailable.");
  if (detailCache.has(id)) return detailCache.get(id);
  const detail = await apiFetch({ kind: "release", id }, signal);
  detailCache.set(id, detail);
  return detail;
}

// Callers pass exclusions in whatever shape is convenient — a Set of seen ids, a single id,
// or nothing at all. Normalizing here means a bare id or a null can't blow up the filter below.
function toIdSet(excluded) {
  if (excluded instanceof Set) return excluded;
  if (Array.isArray(excluded)) return new Set(excluded.filter((v) => v != null));
  if (excluded == null) return new Set();
  return new Set([excluded]);
}

// Discogs stops serving search results somewhere around the 10,000th item, so there's no
// point rolling a page number beyond that — deep pages just error or come back empty.
const SEARCH_PER_PAGE = 100; // Discogs' max
const MAX_SAMPLE_PAGES = 100; // 100 × 100 = the ~10k ceiling

// Shared random-pick engine: read the match count off page one, jump to a random page,
// grab one item. Page one doubles as the count probe so a draw costs 1–2 calls, not 4.
async function randomReleaseSearch(baseParams, excluded, signal) {
  const excludedIds = toIdSet(excluded);
  const pageParams = { ...baseParams, per_page: String(SEARCH_PER_PAGE) };

  const firstPage = await discogsFetch({ ...pageParams, page: "1" }, signal);
  if (!firstPage?.pagination?.items) return null;

  const totalPages = Math.min(firstPage.pagination.pages || 1, MAX_SAMPLE_PAGES);
  let response = firstPage;

  if (totalPages > 1) {
    const page = 1 + Math.floor(Math.random() * totalPages);
    if (page !== 1) {
      try {
        response = await discogsFetch({ ...pageParams, page: String(page) }, signal);
      } catch (e) {
        if (e.name === "AbortError") throw e;
        response = firstPage; // deep page hiccuped — fall back to what we already have
      }
    }
  }

  const items = (response.results || []).filter((r) =>
    (r.type === "release" || !r.type) && !excludedIds.has(r.id) && !(r.master_id && excludedIds.has(r.master_id))
  );
  if (items.length === 0) return null;

  return shuffle(items)[0];
}

function Turntable({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* platter base */}
        <circle cx="50" cy="50" r="48" fill={PALETTE.borderStrong} />
        <circle cx="50" cy="50" r="44" fill={PALETTE.primary} />

        {/* spinning record */}
        <g className="discovery-record-spin" style={{ transformOrigin: "50px 50px" }}>
          <circle cx="50" cy="50" r="40" fill="#1b1b1b" />
          {/* grooves */}
          <circle cx="50" cy="50" r="34" fill="none" stroke="#333" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#333" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="22" fill="none" stroke="#333" strokeWidth="0.6" />
          {/* label */}
          <circle cx="50" cy="50" r="14" fill={PALETTE.accent} />
          <circle cx="50" cy="50" r="2.5" fill={PALETTE.bg} />
        </g>

        {/* tonearm */}
        <g>
          <circle cx="82" cy="22" r="5" fill={PALETTE.mutedLight} />
          <line x1="82" y1="22" x2="65" y2="39" stroke={PALETTE.mutedLight} strokeWidth="3" strokeLinecap="round" />
          <circle cx="65" cy="39" r="2.5" fill={PALETTE.accentDark} />
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("discover"); // 'discover' | 'games'

  return (
    <div style={styles.page}>
      <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { background: ${PALETTE.bg}; }

      @keyframes discoveryFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

 @keyframes discoveryCardReveal {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .discovery-card-reveal {
    animation: discoveryCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .discovery-stagger > * {
    opacity: 0;
    animation: discoveryFadeIn 0.4s ease forwards;
  }
  .discovery-stagger > *:nth-child(1) { animation-delay: 0.08s; }
  .discovery-stagger > *:nth-child(2) { animation-delay: 0.14s; }
  .discovery-stagger > *:nth-child(3) { animation-delay: 0.20s; }
  .discovery-stagger > *:nth-child(4) { animation-delay: 0.26s; }
  .discovery-stagger > *:nth-child(n+5) { animation-delay: 0.32s; }

  @keyframes discoveryFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes discoveryImageSharpen {
    from { filter: blur(10px); opacity: 0.4; }
    to { filter: blur(0); opacity: 1; }
  }
  @keyframes discoverySpin {
    to { transform: rotate(360deg); }
  }
  .discovery-cover-reveal {
    animation: discoveryImageSharpen 0.4s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .discovery-cover-reveal, .discovery-card-reveal, .discovery-stagger > * { animation: none; opacity: 1; }
  }
      
      @keyframes discoveryRecordSpin {
        to { transform: rotate(360deg); }
        }
      .discovery-record-spin {
        animation: discoveryRecordSpin 3s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
        .discovery-record-spin { animation: none; }
        }

        
        @keyframes discoveryFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes discoveryImageSharpen {
          from { filter: blur(10px); opacity: 0.4; }
          to { filter: blur(0); opacity: 1; }
        }
        @keyframes discoverySpin {
          to { transform: rotate(360deg); }
        }
        .discovery-cover-reveal {
          animation: discoveryImageSharpen 0.4s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .discovery-cover-reveal { animation: none; }
        }
      `}</style>
      <div style={styles.container}>
<header style={{ ...styles.header, display: "flex", alignItems: "center", gap: 16 }}>
  <Turntable size={64} />
  <div>
    <h1 style={styles.title}>Random Discovery</h1>
    <p style={styles.subtitle}>Explore the depths of Discogs releases at random (kind of) or play a few mini games.</p>
  </div>
</header>

        <div style={styles.tabRow}>
          <button
            style={{ ...styles.tabButton, ...(tab === "discover" ? styles.tabButtonActive : {}) }}
            onClick={() => setTab("discover")}
          >
            Discover
          </button>
          <button
            style={{ ...styles.tabButton, ...(tab === "games" ? styles.tabButtonActive : {}) }}
            onClick={() => setTab("games")}
          >
            Games
          </button>
        </div>

        {tab === "discover" ? <DiscoverTab /> : <GamesTab />}
      </div>
    </div>
  );
}

// ============================== DISCOVER TAB ==============================

function DiscoverTab() {
  const [genre, setGenre] = useState("Any Genre");
  const [style, setStyle] = useState("");
  const [decade, setDecade] = useState("Any Decade");
  const [country, setCountry] = useState("Any Country");
  const [formats, setFormats] = useState(["Vinyl"]); // empty array = any format
  const [minRating, setMinRating] = useState(0); // 0 = no rating filter
  const [onlyArtwork, setOnlyArtwork] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Digging…");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [detail, setDetail] = useState(null);
  const [emptyNotice, setEmptyNotice] = useState("");
  const [history, setHistory] = useState([]);
  const [modeNotice, setModeNotice] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const formRef = useRef(null);
  const resultRef = useRef(null);
  const statusRef = useRef(null);
  const requestRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const weirderCeilingRef = useRef(null);

  const styleOptions = useMemo(() => GENRE_STYLES[genre] || [], [genre]);

  // The discovery-mode buttons sit below the card, so a press from down there would
  // otherwise kick off a search with no visible sign anything is happening. Ride up to the
  // dig banner the moment a search starts…
  useEffect(() => {
    if (loading) {
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  // …then back down to the card once a result lands. Also handy on mobile generally, where
  // the filter form pushes the card below the fold.
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // A dig that comes back empty or errors is still an answer — make sure it's on screen
  // rather than leaving the person parked at the bottom wondering what happened.
  useEffect(() => {
    if ((error || emptyNotice) && statusRef.current) {
      statusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error, emptyNotice]);

  // Each new pick starts back at its first image rather than whatever slide the previous
  // release happened to be left on.
  useEffect(() => {
    setImageIndex(0);
  }, [result?.id]);

  function scrollToFilters() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleFormat(f) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function buildParams(yearOverride) {
    const params = { type: "release" };
    if (genre !== "Any Genre") params.genre = genre;
    if (style) params.style = style;
    if (country !== "Any Country") params.country = country;
    if (formats.length === 1) params.format = formats[0]; // Discogs only accepts one format value per query
    if (yearOverride) params.year = String(yearOverride);
    return params;
  }

  // Generalized search — the normal "Find something" button calls this with no overrides;
  // the discovery-mode buttons (Rabbit Hole, Hidden Gem, Another Like This, Weirder) call it
  // with a genre/style/decade pinned to the current result and/or an extraCheck predicate
  // evaluated against the full release detail.
  async function findRelease(opts = {}) {
    const { genreOverride, styleOverride, decadeOverride, extraCheck, syncForm = false, label } = opts;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setLoadingLabel(label || DIG_MESSAGES[Math.floor(Math.random() * DIG_MESSAGES.length)]);
    setError("");
    setEmptyNotice("");
    setModeNotice("");
    try {
      const needsClientFormatCheck = formats.length > 1;
      const needsRatingCheck = minRating > 0;
      const needsDetailForSelection = needsRatingCheck || onlyArtwork || !!extraCheck;
      const maxAttempts = 10;

      let found = null;
      let foundDetail = null;
      let anyResultsAtAll = false;

      for (let i = 0; i < maxAttempts; i++) {
        if (i > 0) await sleep(150);
        const yearForAttempt = randomYearInDecade(decadeOverride || decade);
        const baseParams = buildParams(yearForAttempt);
        if (genreOverride) baseParams.genre = genreOverride;
        if (styleOverride !== undefined) {
          if (styleOverride) baseParams.style = styleOverride;
          else delete baseParams.style;
        }

        let pick;
        try {
          pick = await randomReleaseSearch(baseParams, seenIdsRef.current, controller.signal);
        } catch (e) {
          if (e.name === "AbortError") return;
          if (String(e?.message || "").includes("rate-limiting")) await sleep(1200);
          continue; // transient hiccup on the search itself — retry rather than failing outright
        }
        if (!pick) break; // Discogs genuinely has zero matches for these filters
        anyResultsAtAll = true;

        if (needsClientFormatCheck) {
          const pickFormats = pick.format || [];
          const matches = formats.some((f) => pickFormats.includes(f));
          if (!matches) continue;
        }

        if (needsDetailForSelection) {
          try {
            const full = await discogsFetchDetail(pick.resource_url, controller.signal);
            const rating = full.community?.rating;
            if (onlyArtwork && !full.images?.some((image) => image.uri || image.uri150)) continue;
            if (needsRatingCheck && (!rating || rating.count === 0 || rating.average < minRating)) continue;
            if (extraCheck && !extraCheck(full, pick)) continue;
            found = pick;
            foundDetail = full;
            break;
          } catch (e) {
            if (e.name === "AbortError") return;
            continue;
          }
        } else {
          found = pick;
          break;
        }
      }

      if (controller.signal.aborted) return;
      if (!found) {
        setEmptyNotice(
          anyResultsAtAll
            ? "Found matches, but couldn't find one that also cleared the extra filters after several tries. Try loosening things a bit."
            : "Nothing matched that combination. Try loosening a filter — style and country are the most restrictive."
        );
        setLoading(false);
        return null;
      }

      if (syncForm) {
        if (genreOverride) setGenre(genreOverride);
        if (styleOverride !== undefined) setStyle(styleOverride || "");
      }

      setResult(found);
      seenIdsRef.current.add(found.id);
      if (found.master_id) seenIdsRef.current.add(found.master_id);
      setHistory((h) => [found, ...h].slice(0, 6));
      setLoading(false);

      let finalDetail = foundDetail;
      if (finalDetail) {
        setDetail(finalDetail);
      } else if (found.resource_url) {
        try {
          finalDetail = await discogsFetchDetail(found.resource_url);
          setDetail(finalDetail);
        } catch {
          // Non-fatal — card still renders with the search result's fallback fields.
        }
      }

      return { pick: found, detail: finalDetail };
    } catch (e) {
      setError(e.message || "Something went wrong. Don't blame me. It's more than likely Discogs. Try again in a second.");
      setLoading(false);
      return null;
    }
  }

  function primaryGenre() {
    return detail?.genres?.[0] || result?.genre?.[0] || null;
  }

  // "Rabbit Hole" — click a style chip on the current result to drill straight into that
  // genre + style combination instead of going back to the form.
  function handleRabbitHole(clickedStyle) {
    const g = primaryGenre();
    if (!g) return;
    weirderCeilingRef.current = null;
    setModeNotice(`Down the rabbit hole: ${g} → ${clickedStyle}`);
    findRelease({ genreOverride: g, styleOverride: clickedStyle, syncForm: true, label: "Falling down the rabbit hole…" });
  }

  // "Hidden Gem" — well-loved but rarely owned: rating > 4.2 with fewer than 100 haves.
  function handleHiddenGem() {
    weirderCeilingRef.current = null;
    setModeNotice("Hunting for a hidden gem (rating > 4.2, 10+ ratings, under 100 haves)…");
    findRelease({
      label: "Hunting for a hidden gem…",
      extraCheck: (full) => {
        const r = full.community?.rating;
        const have = full.community?.have;
        return !!r && r.count >= 10 && r.average > 4.2 && typeof have === "number" && have < 200;
      },
    });
  }

  // "Another Like This" — same genre, same decade as the current result, different artist.
  function handleAnotherLikeThis() {
    const g = primaryGenre();
    if (!g) return;
    // Search results don't always carry a year, and the detail object sometimes does.
    // Without one we just drop the decade pin rather than leaving the button inert.
    const year = Number(result?.year || detail?.year) || null;
    const decadeLabel = year ? `${Math.floor(year / 10) * 10}s` : null;
    const excludeArtistIds = new Set((detail?.artists || []).map((a) => a.id));
    weirderCeilingRef.current = null;
    setModeNotice(decadeLabel ? `Looking for more ${g}, ${decadeLabel}…` : `Looking for more ${g}…`);
    findRelease({
      genreOverride: g,
      decadeOverride: decadeLabel || undefined,
      syncForm: true,
      label: "Finding something in the same vein…",
      extraCheck: excludeArtistIds.size
        ? (full) => !(full.artists || []).some((a) => excludeArtistIds.has(a.id))
        : undefined,
    });
  }

  // "Weirder" — each press ratchets the have-count ceiling down within the same genre, so
  // the results drift toward more obscure territory. Not literal artist-similarity (Discogs
  // has no such API) — just progressively less-collected releases in the same genre.
  async function handleWeirder() {
    const g = primaryGenre(); // may be null — then we just don't pin the genre
    const baseline = weirderCeilingRef.current ?? detail?.community?.have ?? null;
    const ceiling = baseline != null ? Math.max(baseline - 1, 0) : null;
    setModeNotice(ceiling != null ? `Digging weirder (under ${ceiling} haves)…` : "Digging weirder…");
    const res = await findRelease({
      genreOverride: g || undefined,
      label: "Digging weirder…",
      extraCheck: ceiling != null ? (full) => (full.community?.have ?? Infinity) < ceiling : undefined,
    });
    if (res?.detail?.community?.have != null) {
      weirderCeilingRef.current = res.detail.community.have;
    }
  }

  const images = detail?.images || [];
  const coverSrc = images[imageIndex]?.uri || images[imageIndex]?.uri150 || result?.cover_image || null;
  const { artist, title } = splitArtistTitle(result, detail);
  const ratingInfo = detail?.community?.rating;
  const hasResultContext = !!result;
  const releaseUrl = result ? "https://www.discogs.com" + (result.uri || "") : "";

  return (
    <>
      <div style={styles.form} ref={formRef}>
        <p style={styles.formHeading}>Find me…</p>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Genre</label>
          <select
            style={styles.select}
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setStyle("");
            }}
          >
            {Object.keys(GENRE_STYLES).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Style</label>
          <select style={styles.select} value={style} onChange={(e) => setStyle(e.target.value)} disabled={styleOptions.length === 0}>
            <option value="">Any style</option>
            {styleOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Decade</label>
          <div style={styles.chipRow}>
            {DECADES.map((d) => (
              <button
                type="button"
                key={d}
                style={{ ...styles.chip, ...(decade === d ? styles.chipActive : {}) }}
                onClick={() => setDecade(d)}
              >
                {d === "Any Decade" ? "Any" : d}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Country</label>
          <select style={styles.select} value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>Format {formats.length === 0 ? "(any)" : ""}</label>
          <div style={styles.chipRow}>
            {FORMAT_OPTIONS.map((f) => (
              <button
                type="button"
                key={f}
                style={{ ...styles.chip, ...(formats.includes(f) ? styles.chipActive : {}) }}
                onClick={() => toggleFormat(f)}
              >
                {f}
              </button>
            ))}
            <button
              type="button"
              style={{ ...styles.chip, ...(formats.length === 0 ? styles.chipActive : {}) }}
              onClick={() => setFormats([])}
            >
              Any
            </button>
          </div>
        </div>

        <div style={styles.fieldRow}>
          <label style={styles.label}>
            Minimum rating {minRating > 0 ? `— ${minRating.toFixed(1)}+` : "— any"}
          </label>
          <input
            type="range"
            min="0"
            max="4.5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            style={styles.slider}
          />
          {minRating > 0 && (
            <p style={styles.hintText}>
              Fewer releases have ratings than have haves/wants — this filter takes a little longer and can come up empty on narrow combos.
            </p>
          )}
        </div>

        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={onlyArtwork} onChange={(e) => setOnlyArtwork(e.target.checked)} />
          Only show releases with artwork
        </label>

        <button style={styles.button} onClick={() => findRelease()} disabled={loading}>
          {loading ? loadingLabel : "Find something"}
        </button>
      </div>

      <div ref={statusRef}>
        {loading && (
          <div style={styles.digBox}>
            <span style={styles.digSpinner} aria-hidden="true" />
            <span>{loadingLabel}</span>
          </div>
        )}
        {!loading && error && <div style={styles.errorBox}>{error}</div>}
        {!loading && emptyNotice && <div style={styles.emptyBox}>{emptyNotice}</div>}
      </div>

      {result && (
        <div className="discovery-card-reveal" key={result.id} style={{ ...styles.card, ...(loading ? styles.cardDimmed : {}) }} ref={resultRef}>
          <div style={styles.coverWrap}>
            <a href={releaseUrl} target="_blank" rel="noreferrer" style={styles.coverLink} aria-label={`View ${title} on Discogs`}>
              <SmartImage
                src={coverSrc}
                alt={title}
                style={styles.cover}
                placeholderStyle={styles.coverPlaceholder}
              />
            </a>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  style={{ ...styles.imageArrow, left: 8 }}
                  onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  style={{ ...styles.imageArrow, right: 8 }}
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                >
                  ›
                </button>
                <span style={styles.imageDots}>{imageIndex + 1} / {images.length}</span>
              </>
            )}
          </div>
          <div className="discovery-stagger" style={styles.cardBody}>
            <h2 style={styles.cardTitle}>
              <a href={releaseUrl} target="_blank" rel="noreferrer" style={styles.titleLink}>{title}</a>
            </h2>
            {artist && (
              <p style={styles.cardArtist}>
                {detail?.artists?.length ? (
                  detail.artists.map((a, i) => (
                    <React.Fragment key={a.id ?? a.name}>
                      {i > 0 && ", "}
                      {a.id ? (
                        <a
                          href={`https://www.discogs.com/artist/${a.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.artistLink}
                        >
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  artist
                )}
              </p>
            )}

            <p style={styles.cardSubline}>
              {[result.year, result.country].filter(Boolean).join(" • ")}
            </p>

            {(detail?.genres || result.genre || []).length > 0 && (
              <div style={styles.metaRow}>
                {(detail?.genres || result.genre).map((g) => (
                  <span style={styles.genreTag} key={g}>{g}</span>
                ))}
                {(result.format || []).slice(0, 2).map((f) => (
                  <span style={styles.tag} key={f}>{f}</span>
                ))}
              </div>
            )}

            {result.style && result.style.length > 0 && (
              <div style={styles.styleChipRow}>
                {result.style.map((s) => (
                  <button
                    key={s}
                    type="button"
                    style={styles.styleChip}
                    onClick={() => handleRabbitHole(s)}
                    disabled={loading}
                    title="Dig into this genre + style"
                      >
                      <span style={{ color: PALETTE.accentDark, fontWeight: 700 }}>⟳</span> {s}
                      </button>
                ))}
              </div>
            )}

            {ratingInfo && ratingInfo.count > 0 && (
              <p style={styles.metaLine}>
                <span style={styles.stars}>{renderStars(ratingInfo.average)}</span>{" "}
                <span style={styles.hintText}>{ratingInfo.average.toFixed(2)} ({ratingInfo.count} ratings)</span>
              </p>
            )}

            {result.community && (
              <p style={styles.metaLine}>
                ❤ {result.community.have ?? 0} have it &nbsp;·&nbsp; ☆ {result.community.want ?? 0} want it
              </p>
            )}

            {detail && (detail.lowest_price != null || detail.num_for_sale != null) && (
              <p style={styles.metaLine}>
                <strong>Marketplace:</strong>{" "}
                {detail.lowest_price != null ? `from $${detail.lowest_price.toFixed(2)}` : "no active listings"}
                {detail.num_for_sale != null ? ` · ${detail.num_for_sale} for sale` : ""}
              </p>
            )}

            {result.label && result.label.length > 0 && (
              <p style={styles.metaLine}><strong>Label:</strong> {result.label.join(", ")}</p>
            )}

            <a
              href={"https://www.discogs.com" + (result.uri || "")}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              View on Discogs →
            </a>
          </div>
        </div>
      )}

      {modeNotice && <p style={styles.modeNotice}>{modeNotice}</p>}

      {hasResultContext ? (
        <div style={styles.discoveryModeRow}>
          <button style={{ ...styles.modeButton, ...(loading ? styles.modeButtonDisabled : {}) }} onClick={handleAnotherLikeThis} disabled={loading}>
            🔁 Another like this
          </button>
          <button style={{ ...styles.modeButton, ...(loading ? styles.modeButtonDisabled : {}) }} onClick={handleWeirder} disabled={loading}>
            🌀 Obscurer
          </button>
          <button style={{ ...styles.modeButton, ...(loading ? styles.modeButtonDisabled : {}) }} onClick={handleHiddenGem} disabled={loading}>
            💎 High Ratings, Low Haves
          </button>
        </div>
      ) : (
        <div style={styles.discoveryModeRow}>
          <button style={{ ...styles.modeButton, ...(loading ? styles.modeButtonDisabled : {}) }} onClick={handleHiddenGem} disabled={loading}>
            💎 High Ratings, Low Haves
          </button>
        </div>
      )}

      {result && (
        <button style={styles.backToFiltersButton} onClick={scrollToFilters}>
          ↑ Back to filters
        </button>
      )}

      {history.length > 1 && (
        <div style={styles.historySection}>
          <h3 style={styles.historyTitle}>Recently surfaced</h3>
          <div style={styles.historyRow}>
            {history.slice(1).map((h) => (
              <a
                key={h.id}
                href={"https://www.discogs.com" + (h.uri || "")}
                target="_blank"
                rel="noreferrer"
                style={styles.historyItem}
                title={h.title}
              >
                {h.thumb ? <img src={h.thumb} alt={h.title} style={styles.historyThumb} /> : <div style={{ ...styles.historyThumb, background: PALETTE.border }} />}
                <span style={styles.historyLabel}>{h.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}


// ============================== GAMES TAB ==============================

function GamesTab() {
  const [game, setGame] = useState("genre"); // 'higherlower' | 'genre'

  return (
    <>
      <div style={styles.gameTabRow}>
        <button
          style={{ ...styles.gameTabButton, ...(game === "genre" ? styles.gameTabButtonActive : {}) }}
          onClick={() => setGame("genre")}
        >
          Guess the Genre
        </button>
        <button
          style={{ ...styles.gameTabButton, ...(game === "higherlower" ? styles.gameTabButtonActive : {}) }}
          onClick={() => setGame("higherlower")}
        >
          Higher or Lower
        </button>
      </div>

      {game === "higherlower" ? <HigherLowerGame /> : <GuessGenreGame />}
    </>
  );
}

const STAT_OPTIONS = [
  { key: "have", label: "Haves", format: (v) => `${v} have it` },
  { key: "want", label: "Wants", format: (v) => `${v} want it` },
  { key: "rating", label: "Rating", format: (v) => `${v.toFixed(2)} / 5` },
  { key: "price", label: "Price", format: (v) => `$${v.toFixed(2)}` },
];

function getStatValue(detail, statKey) {
  if (!detail) return null;
  if (statKey === "have") return typeof detail.community?.have === "number" ? detail.community.have : null;
  if (statKey === "want") return typeof detail.community?.want === "number" ? detail.community.want : null;
  if (statKey === "rating") {
    const r = detail.community?.rating;
    return r && r.count > 0 ? r.average : null;
  }
  if (statKey === "price") return typeof detail.lowest_price === "number" ? detail.lowest_price : null;
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Randomizing the pressing year alongside the genre shrinks each search below Discogs'
// paging ceiling, so the draw samples the whole catalogue rather than the first 10k rows
// of its default ranking.
function randomGameYear() {
  return 1955 + Math.floor(Math.random() * 69);
}

async function drawValidRelease(statKey, excludeId, attempts) {
  // Plenty of obscure vinyl has no active listings, so price needs more swings to land one.
  const maxAttempts = attempts ?? (statKey === "price" ? 8 : 6);
  const excluded = toIdSet(excludeId);

  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) await sleep(150); // small gap between attempts eases pressure on the rate limit
    try {
      // A fully unfiltered vinyl search has tens of millions of matches, far more than our
      // page cap can meaningfully sample, so it ends up skewed toward whatever Discogs'
      // default ranking favors (heavily Electronic). Picking a random genre first and
      // searching within it keeps each genre's odds even instead.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const pick = await randomReleaseSearch(
        { type: "release", format: "Vinyl", genre, year: String(randomGameYear()) },
        excluded
      );
      if (!pick) continue;
      const detail = await discogsFetchDetail(pick.resource_url);
      const value = getStatValue(detail, statKey);
      if (value != null) return { pick, detail, value };
    } catch (e) {
      // Transient Discogs hiccups (stale search entries 404ing, brief rate-limiting) are
      // expected here — swallow and retry rather than surfacing an error mid-loop.
      if (String(e?.message || "").includes("rate-limiting")) {
        await sleep(1200);
      }
    }
  }
  return null;
}

function HigherLowerGame() {
  const [statKey, setStatKey] = useState("have");
  const [champion, setChampion] = useState(null); // { pick, detail, value }
  const [challenger, setChallenger] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statMeta = STAT_OPTIONS.find((s) => s.key === statKey);
  const runIdRef = useRef(0);

  const startNewRound = useCallback(async (key) => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError("");
    setRevealed(false);
    setLastCorrect(null);
    setScore(0);
    // Old cards hold values measured against the previous stat — clearing them stops a
    // stale pairing from sitting under a mismatched label while the new draw runs.
    setChampion(null);
    setChallenger(null);
    try {
      const first = await drawValidRelease(key, null);
      if (runIdRef.current !== runId) return; // a newer round took over
      if (!first) throw new Error("Couldn't find a release... Try waiting a second or just refreshing. Discogs is probably on a bathroom break.");
      const second = await drawValidRelease(key, first.pick.id);
      if (runIdRef.current !== runId) return;
      if (!second) throw new Error("Couldn't find a second release with that stat available so try refreshing. Discogs likes to throw fits like this.");
      setChampion(first);
      setChallenger(second);
    } catch (e) {
      if (runIdRef.current !== runId) return;
      setError(e.message || "Something went wrong. Likely because of Discogs... try again in a few seconds.");
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    startNewRound(statKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statKey]);

  async function guess(direction) {
    if (!champion || !challenger || revealed) return;
    setRevealed(true);
    const correct =
      direction === "higher" ? challenger.value >= champion.value : challenger.value <= champion.value;
    setLastCorrect(correct);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      setBest((b) => Math.max(b, newScore));
    }

    // Pause briefly on the reveal, then advance.
    setTimeout(async () => {
      if (correct) {
        setLoading(true);
        try {
          const next = await drawValidRelease(statKey, challenger.pick.id);
          if (!next) throw new Error("Couldn't find a fresh challenger. Try again. If you have no options to do anything, just refresh. Discogs is likely taking a break.");
          setChampion(challenger);
          setChallenger(next);
          setRevealed(false);
          setLastCorrect(null);
        } catch (e) {
          setError(e.message || "Something went wrong... but I don't know what. Most likely Discogs just gave up on life as it usually does.");
        } finally {
          setLoading(false);
        }
      } else {
        setScore(0);
        startNewRound(statKey);
      }
    }, 1400);
  }

  return (
    <>
      <div style={styles.statToggleRow}>
        {STAT_OPTIONS.map((s) => (
          <button
            key={s.key}
            style={{ ...styles.statToggleButton, ...(statKey === s.key ? styles.statToggleButtonActive : {}) }}
            onClick={() => setStatKey(s.key)}
            disabled={loading}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={styles.scoreRow}>
        <span>Streak: <strong>{score}</strong></span>
        <span>Best: <strong>{best}</strong></span>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading && !champion && <div style={styles.emptyBox}>Shuffling records…</div>}

      {champion && challenger && (
        <div style={styles.duelRow}>
          <GameCard release={champion} statMeta={statMeta} role="Champion" statRevealed value={champion.value} key={champion.pick.id} />
          <div style={styles.vsCol}>
            <span style={styles.vsText}>vs</span>
          </div>
          <GameCard
  release={challenger}
  key={challenger.pick.id}
            statMeta={statMeta}
            role="Challenger"
            statRevealed={revealed}
            value={challenger.value}
            resultBanner={revealed ? (lastCorrect ? "Correct!" : "Missed it") : null}
          />
        </div>
      )}

      {champion && challenger && !revealed && (
        <div style={styles.guessRow}>
          <button style={styles.guessButton} onClick={() => guess("higher")} disabled={loading}>
            Challenger is Higher ▲
          </button>
          <button style={styles.guessButton} onClick={() => guess("lower")} disabled={loading}>
            Challenger is Lower ▼
          </button>
        </div>
      )}
    </>
  );
}

function GameCard({ release, statMeta, role, statRevealed, value, resultBanner }) {
  const detail = release.detail;
  const pick = release.pick;
  const cover = detail?.images?.[0]?.uri || detail?.images?.[0]?.uri150 || pick?.cover_image || null;

  return (
    <div className="discovery-card-reveal" style={styles.gameCard}>
      <span style={styles.roleLabel}>{role}</span>
      <SmartImage
        src={cover}
        alt={pick.title}
        style={styles.gameCover}
        placeholderStyle={styles.coverPlaceholder}
      />
      <div style={styles.gameCardBody}>
        <p style={styles.gameCardTitle}>{pick.title}</p>
        <p style={styles.gameCardStat}>
          {statRevealed ? statMeta.format(value) : "??? " + statMeta.label}
        </p>
        {resultBanner && (
          <p style={{ ...styles.resultBanner, color: resultBanner === "Correct!" ? PALETTE.success : PALETTE.danger }}>
            {resultBanner}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================== GUESS THE GENRE GAME ==============================

// Canonical Discogs top-level genre list (15 total) — used both as the guess grid and as
// the source of truth we check guesses against.
const GAME_GENRES = [
  "Blues", "Brass & Military", "Children's", "Classical", "Electronic",
  "Folk, World, & Country", "Funk / Soul", "Hip Hop", "Jazz", "Latin",
  "Non-Music", "Pop", "Reggae", "Rock", "Stage & Screen",
];

// Search results use "genre"/"style" (singular field names, plural values); the full
// release detail object uses "genres"/"styles". Read from whichever is present.
function getGenres(round) {
  return round?.detail?.genres || round?.pick?.genre || [];
}
function getStyles(round) {
  return round?.detail?.styles || round?.pick?.style || [];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALL_CURATED_STYLES = Array.from(new Set(Object.values(GENRE_STYLES).flat()));

// Builds a multiple-choice list for the style bonus: the real style(s) plus a handful of
// plausible decoys, preferring decoys from the same genre's curated style list when we
// have one, falling back to the general style pool for genres we didn't curate.
function buildStyleOptions(round) {
  const actual = getStyles(round);
  if (actual.length === 0) return [];
  const genres = getGenres(round);
  let pool = [];
  genres.forEach((g) => {
    if (GENRE_STYLES[g]) pool.push(...GENRE_STYLES[g]);
  });
  if (pool.length < 5) pool.push(...ALL_CURATED_STYLES);
  pool = shuffle(Array.from(new Set(pool)).filter((s) => !actual.includes(s)));
  const decoyCount = Math.max(3, 5 - actual.length);
  return shuffle([...actual, ...pool.slice(0, decoyCount)]);
}

async function drawGenreRound(excludeId, attempts = 6) {
  const excluded = toIdSet(excludeId);

  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(150);
    try {
      // Same fix as Higher/Lower: search within a randomly chosen genre each attempt so the
      // draw is spread evenly across genres instead of skewed by Discogs' default ranking.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const pick = await randomReleaseSearch(
        { type: "release", format: "Vinyl", genre, year: String(randomGameYear()) },
        excluded
      );
      if (!pick) continue;
      // The answer has to be one of the buttons on the grid, or the round is unwinnable.
      if (!(pick.genre || []).some((g) => GAME_GENRES.includes(g))) continue;

      // The search result already carries genre, style and a cover, so the detail lookup is
      // only an upgrade (full-res image carousel). Don't burn an attempt when it 404s.
      let detail = null;
      try {
        detail = await discogsFetchDetail(pick.resource_url);
      } catch (e) {
        if (e.name === "AbortError") throw e;
      }
      if (!detail?.images?.length && !pick.cover_image) continue; // nothing to show, no round
      return { pick, detail };
    } catch (e) {
      if (String(e?.message || "").includes("rate-limiting")) await sleep(1200);
    }
  }
  return null;
}

function GuessGenreGame() {
  const [round, setRound] = useState(null); // { pick, detail }
  const [phase, setPhase] = useState("guessing"); // 'guessing' | 'revealed'
  const [guessedGenre, setGuessedGenre] = useState(null);
  const [bonusChoice, setBonusChoice] = useState("");
  const [bonusStatus, setBonusStatus] = useState(null); // null | 'correct' | 'incorrect' | 'skipped'
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [bonusCorrectCount, setBonusCorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const runIdRef = useRef(0);

  const startRound = useCallback(async (excludeId) => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError("");
    setPhase("guessing");
    setGuessedGenre(null);
    setBonusChoice("");
    setBonusStatus(null);
    setImageIndex(0);
    try {
      const next = await drawGenreRound(excludeId);
      if (runIdRef.current !== runId) return; // a newer round took over
      if (!next) throw new Error("Couldn't pull a fresh release right now. Try again in a moment. Most likely Discogs is just being lazy.");
      setRound(next);
    } catch (e) {
      if (runIdRef.current !== runId) return;
      setError(e.message || "Something went wrong. And by something, I mean Discogs... it's sooo lazy. Try refreshing.");
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    startRound(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitGenreGuess(g) {
    if (phase !== "guessing" || !round) return;
    const correct = getGenres(round).includes(g);
    setGuessedGenre(g);
    setPhase("revealed");
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
    } else {
      setStreak(0);
    }
  }

  function submitBonusGuess() {
    if (!bonusChoice) return;
    const correct = getStyles(round).includes(bonusChoice);
    setBonusStatus(correct ? "correct" : "incorrect");
    if (correct) setBonusCorrectCount((c) => c + 1);
  }

  function skipRound() {
    if (!round || loading) return;
    startRound(round.pick.id); // doesn't touch streak — a skip isn't a guess
  }

  const images = round?.detail?.images || [];
  const cover = images[imageIndex]?.uri || images[imageIndex]?.uri150 || round?.pick?.cover_image || null;
  const genreCorrect = round && guessedGenre ? getGenres(round).includes(guessedGenre) : false;
  const actualStyles = round ? getStyles(round) : [];
  const styleOptions = useMemo(() => (round && phase === "revealed" ? buildStyleOptions(round) : []), [round, phase]);

  return (
    <>
      <div style={styles.scoreRow}>
        <span>Streak: <strong>{streak}</strong></span>
        <span>Best: <strong>{best}</strong></span>
        <span>Style bonus: <strong>{bonusCorrectCount}</strong></span>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && !round && <div style={styles.emptyBox}>Pulling a cover…</div>}

      {round && (
        <div className="discovery-card-reveal" key={round.pick.id} style={styles.genreCard}>
          <div style={styles.coverWrap}>
            <SmartImage
              src={cover}
              alt={phase === "revealed" ? round.pick.title : "Guess the genre"}
              style={styles.genreCover}
              placeholderStyle={styles.coverPlaceholder}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  style={{ ...styles.imageArrow, left: 8 }}
                  onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  style={{ ...styles.imageArrow, right: 8 }}
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                >
                  ›
                </button>
                <span style={styles.imageDots}>{imageIndex + 1} / {images.length}</span>
              </>
            )}
          </div>

          {phase === "guessing" && (
            <>
              <div style={styles.genreGrid}>
                {GAME_GENRES.map((g) => (
                  <button key={g} style={styles.genreButton} onClick={() => submitGenreGuess(g)} disabled={loading}>
                    {g}
                  </button>
                ))}
              </div>
              <div style={styles.skipRow}>
                <button style={{ ...styles.bonusSkip, width: "100%" }} onClick={skipRound} disabled={loading}>
                  Skip this one →
                </button>
              </div>
            </>
          )}

          {phase === "revealed" && (
            <div style={styles.genreRevealBody}>
              <p style={styles.genreRevealTitle}>{round.pick.title}</p>
              <p style={{ ...styles.genreResultLine, color: genreCorrect ? PALETTE.success : PALETTE.danger }}>
                {genreCorrect ? "✓ Correct!" : `✗ You guessed ${guessedGenre}`}
                {!genreCorrect && ` — actually ${getGenres(round).join(", ")}`}
              </p>

              {actualStyles.length === 0 ? (
                <p style={styles.hintText}>No style listed for this one.</p>
              ) : bonusStatus === null ? (
                <div style={styles.bonusRow}>
                  <select
                    style={styles.bonusSelect}
                    value={bonusChoice}
                    onChange={(e) => setBonusChoice(e.target.value)}
                  >
                    <option value="">Bonus: guess the style…</option>
                    {styleOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button style={styles.bonusButton} onClick={submitBonusGuess} disabled={!bonusChoice}>Guess</button>
                  <button style={styles.bonusSkip} onClick={() => setBonusStatus("skipped")}>Skip</button>
                </div>
              ) : (
                <p style={{ ...styles.genreResultLine, color: bonusStatus === "correct" ? PALETTE.success : PALETTE.mutedLight }}>
                  {bonusStatus === "correct" ? "✓ Style guessed right!" : `Style: ${actualStyles.join(", ")}`}
                </p>
              )}

              {(actualStyles.length === 0 || bonusStatus !== null) && (
                <button style={styles.button} onClick={() => startRound(round.pick.id)} disabled={loading}>
                  {loading ? "Loading…" : "Next round →"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: PALETTE.bg,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    color: PALETTE.primary,
    padding: "32px 16px",
  },
  container: { maxWidth: 560, margin: "0 auto" },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 14, color: PALETTE.muted, marginTop: 6 },

  tabRow: { display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${PALETTE.border}` },
  tabButton: {
    padding: "10px 4px",
    marginRight: 16,
    border: "none",
    borderBottom: "2px solid transparent",
    background: "none",
    fontSize: 15,
    fontWeight: 600,
    color: PALETTE.mutedLight,
    cursor: "pointer",
  },
  tabButtonActive: { color: PALETTE.primary, borderBottomColor: PALETTE.accent },

  gameTabRow: { display: "flex", gap: 8, marginBottom: 18 },
  gameTabButton: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    fontSize: 13,
    fontWeight: 600,
    color: PALETTE.muted,
    cursor: "pointer",
  },
  gameTabButtonActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },

  comingSoon: {
    background: PALETTE.card,
    border: `1px dashed ${PALETTE.border}`,
    borderRadius: 10,
    padding: 18,
  },

  form: {
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    padding: "24px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  formHeading: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 4px",
    color: PALETTE.primary,
  },
  fieldRow: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  select: {
    padding: "11px 12px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.border}`,
    fontSize: 14,
    background: "#fff",
    color: PALETTE.primary,
  },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginTop: 4, color: PALETTE.primary },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: "#fff",
    fontSize: 12,
    fontWeight: 600,
    color: PALETTE.muted,
    cursor: "pointer",
  },
  chipActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },
  slider: { width: "100%", marginTop: 4, accentColor: PALETTE.accent },
  hintText: { fontSize: 12, color: PALETTE.mutedLight, marginTop: 4, lineHeight: 1.4 },
  button: {
    marginTop: 8,
    padding: "13px 16px",
    borderRadius: 8,
    border: "none",
    background: PALETTE.accent,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: "#F7E6E1",
    color: PALETTE.danger,
    fontSize: 14,
  },
  digBox: {
    marginTop: 16,
    padding: "14px 14px",
    borderRadius: 8,
    background: PALETTE.card,
    border: `1px solid ${PALETTE.borderStrong}`,
    color: PALETTE.muted,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  digSpinner: {
    width: 15,
    height: 15,
    borderRadius: "50%",
    border: `2px solid ${PALETTE.border}`,
    borderTopColor: PALETTE.accent,
    display: "inline-block",
    flexShrink: 0,
    animation: "discoverySpin 0.7s linear infinite",
  },
  cardDimmed: { opacity: 0.4, transition: "opacity 0.2s ease" },
  modeButtonDisabled: { opacity: 0.5, cursor: "default" },
  emptyBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: "#F3E9D2",
    color: PALETTE.warn,
    fontSize: 14,
  },
  modeNotice: {
    fontSize: 12.5,
    color: PALETTE.accentDark,
    fontStyle: "italic",
    margin: "10px 2px 0",
  },
  card: {
    marginTop: 20,
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    animation: "discoveryFadeIn 0.35s ease",
  },
  cover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: PALETTE.border, display: "block" },
  coverPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", color: PALETTE.mutedLight, fontSize: 13 },
  coverLink: { display: "block", cursor: "pointer" },
  cardBody: { padding: "20px 20px 18px" },
  cardTitle: { fontSize: 21, fontWeight: 800, margin: "0 0 2px", letterSpacing: -0.2 },
  titleLink: { color: "inherit", textDecoration: "none" },
  cardArtist: { fontSize: 15, fontWeight: 600, color: PALETTE.accentDark, margin: "0 0 6px" },
  artistLink: { color: "inherit", textDecoration: "none" },
  cardSubline: { fontSize: 13, color: PALETTE.muted, margin: "0 0 12px" },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  genreTag: {
    fontSize: 12,
    fontWeight: 700,
    background: PALETTE.accent,
    padding: "4px 10px",
    borderRadius: 999,
    color: "#fff",
  },
  tag: {
    fontSize: 12,
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    padding: "4px 8px",
    borderRadius: 999,
    color: PALETTE.muted,
  },
  styleChipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  styleChip: {
    fontSize: 12,
    fontWeight: 600,
    background: "#fff",
    border: `1px solid ${PALETTE.border}`,
    padding: "5px 10px",
    borderRadius: 999,
    color: PALETTE.primary,
    cursor: "pointer",
  },
  stars: { color: PALETTE.accent, fontSize: 14, letterSpacing: 1 },
  metaLine: { fontSize: 13, color: PALETTE.primary, margin: "6px 0" },
  link: { display: "inline-block", marginTop: 10, fontSize: 14, color: PALETTE.accentDark, fontWeight: 700, textDecoration: "underline" },
  historySection: { marginTop: 24 },
  discoveryModeRow: { display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" },
  modeButton: {
    flex: 1,
    minWidth: 110,
    padding: "10px 10px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: "#fff",
    color: PALETTE.primary,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  backToFiltersButton: {
    display: "block",
    width: "100%",
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: "#fff",
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  historyTitle: { fontSize: 13, fontWeight: 700, color: PALETTE.muted, marginBottom: 8 },
  historyRow: { display: "flex", gap: 10, overflowX: "auto" },
  historyItem: { display: "flex", flexDirection: "column", alignItems: "center", width: 64, textDecoration: "none", cursor: "pointer" },
  historyThumb: { width: 56, height: 56, objectFit: "cover", borderRadius: 8 },
  historyLabel: { fontSize: 10, color: PALETTE.mutedLight, marginTop: 4, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" },

  statToggleRow: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  statToggleButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: "#fff",
    fontSize: 12,
    fontWeight: 600,
    color: PALETTE.muted,
    cursor: "pointer",
  },
  statToggleButtonActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },

  scoreRow: { display: "flex", gap: 16, fontSize: 13, color: PALETTE.muted, marginBottom: 14 },

  duelRow: { display: "flex", alignItems: "stretch", gap: 8 },
  vsCol: { display: "flex", alignItems: "center", justifyContent: "center", width: 28 },
  vsText: { fontSize: 12, fontWeight: 700, color: PALETTE.mutedLight },

  gameCard: {
    flex: 1,
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  roleLabel: {
    display: "block",
    textAlign: "center",
    padding: "4px 6px",
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: PALETTE.muted,
    background: PALETTE.bg,
  },
  gameCover: { width: "100%", height: 180, objectFit: "cover", background: PALETTE.border },
  gameCardBody: { padding: 12 },
  gameCardTitle: { fontSize: 13, fontWeight: 700, margin: "0 0 6px", minHeight: 34, overflow: "hidden" },
  gameCardStat: { fontSize: 14, fontWeight: 700, margin: 0, color: PALETTE.primary },
  resultBanner: { fontSize: 12, fontWeight: 700, margin: "8px 0 0" },

  guessRow: { display: "flex", gap: 10, marginTop: 14 },
  guessButton: {
    flex: 1,
    padding: "12px 10px",
    borderRadius: 8,
    border: "none",
    background: PALETTE.accent,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  genreCard: {
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  genreCover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: PALETTE.border, display: "block" },
  coverWrap: { position: "relative" },
  imageArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 20,
    lineHeight: "36px",
    textAlign: "center",
    padding: 0,
    cursor: "pointer",
  },
  imageDots: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 999,
  },
  skipRow: { padding: "0 16px 16px" },
  genreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    padding: 16,
  },
  genreButton: {
    padding: "12px 6px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.bg,
    fontSize: 12.5,
    fontWeight: 600,
    color: PALETTE.primary,
    cursor: "pointer",
    lineHeight: 1.3,
  },
  genreRevealBody: { padding: 18 },
  genreRevealTitle: { fontSize: 17, fontWeight: 700, margin: "0 0 8px" },
  genreResultLine: { fontSize: 14, fontWeight: 600, margin: "0 0 12px" },
  bonusRow: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" },
  bonusSelect: {
    flex: 1,
    minWidth: 140,
    padding: "10px 12px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.border}`,
    fontSize: 14,
    background: "#fff",
  },
  bonusButton: {
    padding: "10px 14px",
    borderRadius: 7,
    border: "none",
    background: PALETTE.accent,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  bonusSkip: {
    padding: "10px 14px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.border}`,
    background: "#fff",
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
