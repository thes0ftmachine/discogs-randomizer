import React, { useState, useMemo, useEffect, useCallback, useRef, useContext, createContext } from "react";

// ---- Controlled vocab (mirrors Discogs' own genre/style taxonomy, trimmed to common picks) ----
const GENRE_STYLES = {
  "Any Genre": [],
"Blues": [
"Boogie Woogie",
"Chicago Blues",
"Country Blues",
"Delta Blues",
"East Coast Blues",
"Electric Blues",
"Harmonica Blues",
"Hill Country Blues",
"Jump Blues",
"Louisiana Blues",
"Memphis Blues",
"Modern Electric Blues",
"Piano Blues",
"Piedmont Blues",
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
"Acid House",
"Ambient",
"Big Beat",
"Breakbeat",
"Breakcore",
"Breaks",
"Broken Beat",
"Chillwave",
"Dark Ambient",
"Darkwave",
"Deep House",
"Deep Techno",
"Disco",
"Downtempo",
"Drone",
"Drum n Bass",
"Dub Techno",
"Dubstep",
"EBM",
"Electro",
"Euro House",
"Euro Trance",
"Eurodance",
"French House",
"Future House",
"Gabber",
"Garage House",
"Glitch",
"Goa Trance",
"Happy Hardcore",
"Hard Techno",
"Hard Trance",
"Hardcore",
"Hardstyle",
"Hi NRG",
"Hip-House",
"House",
"IDM",
"Industrial",
"Italo-Disco",
"Jungle",
"Leftfield",
"Minimal",
"Minimal Techno",
"New Beat",
"Noise",
"Nu-Disco",
"Progressive House",
"Progressive Trance",
"Psy-Trance",
"Synth-pop",
"Synthwave",
"Tech House",
"Tech Trance",
"Techno",
"Trance",
"Tribal House",
"Trip Hop",
"UK Garage",
"Vaporwave"
  ],
  "Folk, World, & Country": [
"African",
"Afrobeat",
"Bluegrass",
"Cajun",
"Celtic",
"Country",
"Fado",
"Flamenco",
"Folk",
"Gamelan",
"Highlife",
"Honky Tonk",
"Indian Classical",
"Klezmer",
"Laïkó",
"Latin",
"Nordic",
"Polka",
"Qawwali",
"Rebetiko",
"Samba",
"Shamisen",
"Soukous",
"Volksmusik",
"Zydeco"
  ],
  "Funk / Soul": [
"Bayou Funk",
"Boogie",
"Contemporary R&B",
"Disco",
"Doo Wop",
"Free Funk",
"Funk",
"Go-Go",
"Gospel",
"Minneapolis Sound",
"Neo Soul",
"New Jack Swing",
"P.Funk",
"Rhythm & Blues",
"RnB/Swing",
"Soul",
"Swingbeat",
"UK Street Soul"
  ],
  "Hip Hop": [
"Boom Bap",
"Cloud Rap",
"Conscious",
"Crunk",
"Cut-up/DJ",
"Drill",
"G-Funk",
"Gangsta",
"Glitch Hop",
"Grime",
"Hardcore Hip-Hop",
"Horrorcore",
"Instrumental",
"Jazzy Hip-Hop",
"Phonk",
"Pop Rap",
"Ragga HipHop",
"Thug Rap",
"Trap",
"Trip Hop"
  ],
  "Jazz": [
"Acid Jazz",
"Afro-Cuban Jazz",
"Afrobeat",
"Avant-garde Jazz",
"Big Band",
"Bop",
"Bossa Nova",
"Cape Jazz",
"Contemporary Jazz",
"Cool Jazz",
"Dark Jazz",
"Dixieland",
"Easy Listening",
"Free Improvisation",
"Free Jazz",
"Fusion",
"Future Jazz",
"Gypsy Jazz",
"Hard Bop",
"Jazz-Funk",
"Jazz-Rock",
"Latin Jazz",
"Lounge",
"Modal",
"Post Bop",
"Ragtime",
"Smooth Jazz",
"Soul-Jazz",
"Space-Age",
"Spiritual Jazz",
"Swing"
  ],
  "Latin": [
    "Afro-Cuban",
    "Axé",
    "Bachata",
    "Baião",
    "Batucada",
    "Bolero",
    "Boogaloo",
    "Bossa Nova",
    "Cha-Cha",
    "Charanga",
    "Choro",
    "Conjunto",
    "Corrido",
    "Cumbia",
    "Danzon",
    "Descarga",
    "Forró",
    "Guajira",
    "Guaracha",
    "Huayno",
    "Lambada",
    "Mambo",
    "Merengue",
    "MPB",
    "Norteño",
    "Nueva Cancion",
    "Pachanga",
    "Pasodoble",
    "Plena",
    "Porro",
    "Ranchera",
    "Reggaeton",
    "Rumba",
    "Salsa",
    "Sertanejo",
    "Son",
    "Son Montuno",
    "Tango",
    "Tejano",
    "Vallenato",
    "Zamba",
    "Zouk"
  ],
  "Pop": [
"Alt-Pop",
"Ballad",
"Baroque Pop",
"Bollywood",
"Bubblegum",
"Cantopop",
"Chanson",
"City Pop",
"Dance-pop",
"Enka",
"Ethno-pop",
"Europop",
"Hokkien Pop",
"Indie Pop",
"Indo-Pop",
"J-pop",
"K-pop",
"Kayōkyoku",
"Latin Pop",
"Mandopop",
"Music Hall",
"Novelty",
"Reggae-Pop",
"Russian Pop",
"Schlager",
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
"Acid Rock",
"Alternative Metal",
"Alternative Rock",
"Arena Rock",
"Art Rock",
"Black Metal",
"Blues Rock",
"Britpop",
"Classic Rock",
"Country Rock",
"Death Metal",
"Deathcore",
"Doom Metal",
"Dream Pop",
"Emo",
"Folk Rock",
"Funk Metal",
"Garage Rock",
"Glam",
"Goth Rock",
"Gothic Metal",
"Grindcore",
"Groove Metal",
"Grunge",
"Hard Rock",
"Hardcore",
"Heavy Metal",
"Indie Rock",
"Industrial Metal",
"Jangle Pop",
"Krautrock",
"Math Rock",
"Melodic Death Metal",
"Melodic Hardcore",
"Metalcore",
"New Wave",
"Noise Rock",
"Nu Metal",
"Pop Rock",
"Post Rock",
"Post-Hardcore",
"Post-Metal",
"Post-Punk",
"Power Metal",
"Power Pop",
"Prog Rock",
"Progressive Metal",
"Psychedelic Rock",
"Psychobilly",
"Pub Rock",
"Punk",
"Rock & Roll",
"Rockabilly",
"Shoegaze",
"Sludge Metal",
"Soft Rock",
"Southern Rock",
"Space Rock",
"Speed Metal",
"Stoner Rock",
"Symphonic Metal",
"Symphonic Rock",
"Technical Death Metal",
"Thrash",
"Viking Metal"
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

// A release is physically one medium family, never more than one at once. LP/7"/10"/12" are
// all sizes of Vinyl, so they belong to the same family as "Vinyl" itself — LP + CD is just
// as impossible as Vinyl + CD. "Box Set" isn't tied to a medium (a box set can be vinyl, CD,
// or cassette), so it's left out of this map and stays compatible with anything.
const FORMAT_FAMILY = {
  Vinyl: "vinyl",
  LP: "vinyl",
  "7\"": "vinyl",
  "10\"": "vinyl",
  "12\"": "vinyl",
  CD: "cd",
  Cassette: "cassette",
};

// "Cinder & Rust" (dark) and "Record Bin" (light) — same warm, earthy crate-digging
// identity in both modes: near-black brown or sandy cream background, burnt-orange
// accent for primary actions, and a gold/ochre tone reserved for links and secondary
// highlights so it reads as a deliberate accent, not noise.
const DARK_PALETTE = {
  bg: "#1A1310",
  card: "#241A16",
  border: "#453629",
  borderStrong: "#5A4634",
  primary: "#EDE2D3",
  muted: "#C9B8A0",
  mutedLight: "#9C8973",
  accent: "#E0713F",
  accentDark: "#D9BA6A",
  success: "#6B9C5E",
  danger: "#D9695F",
  warn: "#B98B3E",
};

const LIGHT_PALETTE = {
  bg: "#EDE9DE",
  card: "#F7F4EC",
  border: "#C9C0A8",
  borderStrong: "#A67C2E",
  primary: "#241A16",
  muted: "#5F5346",
  mutedLight: "#8A8073",
  accent: "#C1502E",
  accentDark: "#8C6A1F",
  success: "#4B7A3E",
  danger: "#B23A30",
  warn: "#8C6A1F",
};

// Provides the active palette AND the palette-derived style objects to components
// that render outside App's own scope (icons, tabs, game screens), without threading
// `palette`/`styles` props through every level. Default value covers the (rare) case
// of a component rendering outside the provider, e.g. in tests.
const PaletteContext = createContext({ palette: DARK_PALETTE, styles: null });

// Discogs' image CDN occasionally 404s on an otherwise valid URL. Rather than giving up
// immediately, retry the same URL once (with a cache-busting param) before falling back to
// a placeholder — smooths over what's usually just a transient hiccup.
// Mimics CSS object-fit: cover for a manual canvas draw — returns the rectangle to crop
// out of the source image so that scaling it to dstW×dstH fills the box without distorting
// the aspect ratio (crops the overflow instead of stretching it).
function coverCropRect(srcW, srcH, dstW, dstH) {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  if (srcAspect > dstAspect) {
    const sh = srcH;
    const sw = srcH * dstAspect;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh };
  }
  const sw = srcW;
  const sh = srcW / dstAspect;
  return { sx: 0, sy: (srcH - sh) / 2, sw, sh };
}

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

      // Crop the source down to the container's aspect ratio first — same idea as CSS
      // object-fit: cover — so a non-square box (like the Higher/Lower game cards) crops
      // instead of squishing the image to fit.
      const { sx, sy, sw, sh } = coverCropRect(img.naturalWidth || W, img.naturalHeight || H, W, H);

      // Coarse -> fine block sizes. Each step draws the (already-cropped) source into a
      // tiny offscreen canvas, then blows it up with smoothing off — that upscale is what
      // produces the blocky look. Last step is a normal full-res draw.
      const steps = [28, 14, 7, 3, 1];
      let i = 0;

      function drawStep() {
        if (cancelled) return;
        const block = steps[i];
        if (block === 1) {
          ctx.imageSmoothingEnabled = true;
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
          setRevealed(true);
          return;
        }
        const w = Math.max(1, Math.round(W / block));
        const h = Math.max(1, Math.round(H / block));
        const tiny = document.createElement("canvas");
        tiny.width = w;
        tiny.height = h;
        tiny.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

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
  // Discogs' remaining-requests-in-this-window count, forwarded through our proxy. Read it
  // regardless of ok/error status — it's just as useful for pacing ahead of a 429 as it is
  // for confirming we're clear after one.
  const rateLimitRemaining = Number(res.headers.get("X-Discogs-Ratelimit-Remaining"));
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Discogs lookup failed (${res.status}).`);
    error.retryAfter = Number(res.headers.get("Retry-After")) || 0;
    error.rateLimitRemaining = Number.isFinite(rateLimitRemaining) ? rateLimitRemaining : null;
    throw error;
  }
  const data = await res.json();
  if (Number.isFinite(rateLimitRemaining)) data.__rateLimitRemaining = rateLimitRemaining;
  return data;
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

// Adds a release to the logged-in person's own Discogs collection (Uncategorized folder) or
// wantlist. Only meaningful when they're logged in — the proxy checks the session itself, so
// this surfaces that as a normal thrown error rather than assuming the caller already knows.
async function addToDiscogs(action, releaseId, signal) {
  const res = await fetch("/api/collection-write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, releaseId }),
    signal,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `That didn't go through (${res.status}).`);
  return body;
}

// Callers pass exclusions in whatever shape is convenient — a Set of seen ids, a single id,
// or nothing at all. Normalizing here means a bare id or a null can't blow up the filter below.
function toIdSet(excluded) {
  if (excluded instanceof Set) return excluded;
  if (Array.isArray(excluded)) return new Set(excluded.filter((v) => v != null));
  if (excluded == null) return new Set();
  return new Set([excluded]);
}

// Discogs' /database/search accepts a general free-text `q`, but also dedicated `catno` and
// `barcode` fields — and for exact codes those are meaningfully more reliable than `q`, whose
// relevance ranking is tuned for artist/title text and can bury or miss an exact catalog number
// or barcode match. So a query that looks like one of those gets routed to the matching
// dedicated field instead of `q`; anything else (the overwhelming majority of searches — an
// artist name, an album title, a phrase with spaces) goes through `q` exactly as before.
function normalizeBarcode(value) {
  return String(value || "").replace(/\D/g, "");
}

// Treat the UPC/EAN digits as the canonical value, but also generate the common Discogs/GS1
// display forms so equivalent UPC-A and EAN-13 values resolve to the same release.
function barcodeVariants(q) {
  const digits = normalizeBarcode(q);
  const variants = new Set();
  if (!digits || digits.length < 6 || digits.length > 14) return [];
  variants.add(digits);

  const addUpcDisplay = (upc) => {
    if (upc.length !== 12) return;
    variants.add(upc.slice(0, 1) + " " + upc.slice(1, 6) + " " + upc.slice(6, 11) + " " + upc.slice(11));
  };
  const addEanDisplay = (ean) => {
    if (ean.length !== 13) return;
    variants.add(ean.slice(0, 1) + " " + ean.slice(1, 7) + " " + ean.slice(7, 12) + " " + ean.slice(12));
    variants.add(ean.slice(0, 1) + " " + ean.slice(1, 6) + " " + ean.slice(6, 12) + " " + ean.slice(12));
  };

  if (digits.length === 12) {
    addUpcDisplay(digits);
    const ean = "0" + digits;
    variants.add(ean);
    addEanDisplay(ean);
  } else if (digits.length === 13 && digits.startsWith("0")) {
    const upc = digits.slice(1);
    variants.add(upc);
    addUpcDisplay(upc);
    addEanDisplay(digits);
  } else if (digits.length === 13) {
    addEanDisplay(digits);
  }

  return [...variants];
}

function looksLikeBarcode(q) {
  const trimmed = q.trim();
  if (!/^[\d\s]+$/.test(trimmed)) return false;
  const digits = normalizeBarcode(trimmed);
  return digits.length >= 6 && digits.length <= 14;
}
function looksLikeCatalogNumber(q) {
  const t = q.trim();
  if (looksLikeBarcode(t)) return false; // digits-only that long is a barcode, not a catalog number
  if (!t || t.length > 24) return false;
  if (!/\d/.test(t)) return false; // catalog numbers always carry at least one digit
  if (!/^[A-Za-z0-9][A-Za-z0-9\-./ ]*$/.test(t)) return false; // only characters catalog numbers actually use
  if (t.split(/\s+/).filter(Boolean).length > 2) return false; // catalog numbers are rarely more than two tokens; a real phrase almost always is
  return true;
}

// Discogs stops serving search results somewhere around the 10,000th item, so there's no
// point rolling a page number beyond that — deep pages just error or come back empty.
const SEARCH_PER_PAGE = 100; // Discogs' max
const MAX_SAMPLE_PAGES = 100; // 100 × 100 = the ~10k ceiling

// Shared random-pick engine: read the match count off page one, jump to a random page,
// grab the whole (filtered, shuffled) page rather than a single item. Page one doubles as
// the count probe so a draw still costs 1–2 calls, not 4.
//
// Returning the full list (not just [0]) lets callers that need to clear an extra detail
// check (artwork, rating, extraCheck) walk several candidates from the page already in
// hand before burning a whole "attempt" on a fresh page fetch — see findRelease below.
async function randomReleaseSearch(baseParams, excluded, signal) {
  const excludedIds = toIdSet(excluded);
  const pageParams = { ...baseParams, per_page: String(SEARCH_PER_PAGE) };

  const firstPage = await discogsFetch({ ...pageParams, page: "1" }, signal);
  if (!firstPage?.pagination?.items) return [];

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
  if (items.length === 0) return [];

  return shuffle(items);
}

// ============================== COLLECTION MODE ==============================
// Discogs' collection endpoint doesn't accept genre/style/decade/format filters — it just
// returns pages of everything in a folder. So instead of one search per draw (like the
// global-catalog flow above), we page through the whole collection once per username, cache
// it, and filter/sample client-side against that cached list from then on.

const COLLECTION_PER_PAGE = 100;

// A page request has no built-in timeout, so a stalled mobile connection (switching
// networks, backgrounding the tab mid-load) could otherwise leave the caller's promise
// pending forever with no error and no way to recover except reloading. This wraps a
// single apiFetch call with its own timeout, independent of the outer AbortController that
// governs the whole multi-page operation, and turns a stall into a normal thrown error.
async function apiFetchWithTimeout(params, signal, timeoutMs = 15000) {
  const localController = new AbortController();
  const onOuterAbort = () => localController.abort();
  if (signal) {
    if (signal.aborted) localController.abort();
    else signal.addEventListener("abort", onOuterAbort);
  }
  const timer = setTimeout(() => localController.abort(), timeoutMs);
  try {
    return await apiFetch(params, localController.signal);
  } catch (e) {
    // Only relabel this as a timeout if OUR timer fired — if the caller's own signal was
    // aborted (e.g. the user disconnected, or a newer request superseded this one), that's
    // a normal cancellation and should keep behaving like one (e.name === "AbortError").
    if (localController.signal.aborted && !(signal && signal.aborted)) {
      const timeoutError = new Error("That request to Discogs took too long and timed out.");
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw e;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onOuterAbort);
  }
}

// Like sleep(), but resolves early (without throwing) if the signal aborts mid-wait, so
// cancelling a collection load doesn't have to sit through a pacing delay or a retry
// backoff before it actually stops.
function abortableSleep(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Discogs throttles authenticated requests to 60/min as a moving 60s-window average (see
// https://www.discogs.com/developers, "Rate Limiting") and explicitly asks clients to
// throttle themselves locally rather than just reacting to 429s. A 9,000+ item collection
// is 90+ pages, and firing those back-to-back with no pacing reliably outruns that limit —
// which is what was producing the generic "Discogs could not complete that request" error.
// Spacing page *starts* at least this far apart caps us at ~54 req/min, comfortably under
// the ceiling even with zero network latency.
const MIN_PAGE_INTERVAL_MS = 1100;
// If Discogs tells us we're down to a handful of requests left in the current window,
// ease off harder than the baseline pace instead of waiting to actually get throttled.
const RATE_LIMIT_LOW_WATERMARK = 5;
const RATE_LIMIT_COOLDOWN_MS = 5000;

// Fetches one page with a timeout, retrying on a stall, a transient hiccup, or a genuine
// rate-limit response before giving up — so a single flaky request degrades to a visible
// error instead of an infinite spinner. maxAttempts is higher than a typical single-resource
// fetch because paging a huge collection makes an occasional 429 an expected event to
// recover from, not a rare failure.
async function fetchCollectionPage(params, signal, maxAttempts = 6) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      throw abortError;
    }
    try {
      return await apiFetchWithTimeout(params, signal);
    } catch (e) {
      if (e.name === "AbortError") throw e;
      lastError = e;
      // Prefer Discogs' own Retry-After when it sent one (a real rate-limit response);
      // otherwise fall back to a growing pause for ordinary transient errors.
      const waitMs = e.retryAfter ? e.retryAfter * 1000 : 800 * (attempt + 1);
      if (attempt < maxAttempts - 1) await abortableSleep(waitMs, signal);
    }
  }
  throw lastError || new Error("Couldn't load that page of the collection.");
}

// resumeItems/resumePage let a caller pick a paginated load back up where a prior attempt
// left off (e.g. it got aborted when the tab was backgrounded), instead of re-paging a large
// collection from page 1 every time. onProgress is handed the running items array itself
// (not just its length) after every page so the caller can stash it for a future resume.
async function fetchFullCollection({ username, useAuth = false, resumeItems, resumePage } = {}, signal, onProgress) {
  let page = resumePage && resumePage > 1 ? resumePage : 1;
  let pages = 1;
  const items = Array.isArray(resumeItems) ? resumeItems.slice() : [];
  do {
    const params = useAuth
      ? { kind: "my-collection", page: String(page), per_page: String(COLLECTION_PER_PAGE) }
      : { kind: "collection", username, page: String(page), per_page: String(COLLECTION_PER_PAGE) };
    const requestStarted = Date.now();
    const data = await fetchCollectionPage(params, signal);
    pages = data?.pagination?.pages || 1;
    items.push(...(data?.releases || []));
    page++;
    onProgress?.(items.length, data?.pagination?.items || items.length, page, items);

    if (page <= pages && !signal?.aborted) {
      // Stay ahead of the throttle rather than reacting to it: always leave at least
      // MIN_PAGE_INTERVAL_MS between the start of one page request and the next, and back
      // off further still if Discogs says our remaining quota for this window is low.
      const remaining = data?.__rateLimitRemaining;
      const elapsed = Date.now() - requestStarted;
      const pacingWait = Math.max(0, MIN_PAGE_INTERVAL_MS - elapsed);
      const lowQuotaWait = Number.isFinite(remaining) && remaining <= RATE_LIMIT_LOW_WATERMARK ? RATE_LIMIT_COOLDOWN_MS : 0;
      const waitMs = Math.max(pacingWait, lowQuotaWait);
      if (waitMs > 0) await abortableSleep(waitMs, signal);
    }
  } while (page <= pages);
  return items;
}

// Reshapes a Discogs collection entry into the same rough shape as a /database/search
// result, so the rest of the app (rendering, detail lookups, exclusion tracking) doesn't
// need to know whether a pick came from the global catalog or a personal collection.
function collectionItemToPick(item, extrasMap) {
  const info = item.basic_information || {};
  const artistNames = (info.artists || []).map((a) => a.name).filter(Boolean).join(", ");
  const extras = extrasMap && info.id in extrasMap ? extrasMap[info.id] : null;
  return {
    id: info.id,
    master_id: info.master_id || null,
    resource_url: info.resource_url,
    title: artistNames ? `${artistNames} - ${info.title}` : info.title,
    year: info.year || null,
    // The bulk collection listing doesn't include country, barcode, or runout/matrix info —
    // those come from the separate background enrichment cache (see
    // useCollectionReleaseEnrichment) when available, and stay empty for anything not
    // enriched yet.
    country: extras?.country || null,
    identifiers: extras?.identifiers || [],
    genre: info.genres || [],
    style: info.styles || [],
    format: (info.formats || []).flatMap((f) => [f.name, ...(f.descriptions || [])]).filter(Boolean),
    cover_image: info.cover_image || info.thumb || null,
    thumb: info.thumb || null,
    uri: info.id ? `/release/${info.id}` : null,
    label: (info.labels || []).map((l) => l.name),
    // Catalog number lives on each label entry in the bulk listing itself — no enrichment
    // fetch needed for this one.
    catno: (info.labels || []).map((l) => l.catno).filter(Boolean),
  };
}

function collectionPickMatchesFilters(pick, filters) {
  const { genre, style, decade, formats } = filters;
  if (genre && genre !== "Any Genre" && !(pick.genre || []).includes(genre)) return false;
  if (style && !(pick.style || []).includes(style)) return false;
  if (decade && decade !== "Any Decade") {
    const start = parseInt(decade.slice(0, 4), 10);
    const y = Number(pick.year);
    if (!y || y < start || y >= start + 10) return false;
  }
  if (formats && formats.length > 0) {
    // AND across selected chips, not OR — same reasoning as the global-catalog path: "Vinyl"
    // alone would otherwise match every 7"/10"/12" single too.
    const matches = formats.every((f) => (pick.format || []).some((pf) => pf.toLowerCase().includes(f.toLowerCase())));
    if (!matches) return false;
  }
  return true;
}

// Collection-scoped counterpart to randomReleaseSearch. Since the whole collection is
// already in memory, this filters + shuffles once instead of retrying network calls; when a
// detail check is needed (rating, artwork, custom extraCheck) it walks the shuffled
// candidates until one clears it or the candidate pool runs out.
async function randomFromCollection(items, filters, excluded, needsDetail, extraCheck, signal, extrasMap) {
  const excludedIds = toIdSet(excluded);
  const candidates = shuffle(
    (items || [])
      .map((it) => collectionItemToPick(it, extrasMap))
      .filter((p) => p.id && !excludedIds.has(p.id) && !(p.master_id && excludedIds.has(p.master_id)))
      .filter((p) => collectionPickMatchesFilters(p, filters))
  );
  if (candidates.length === 0) return { found: null, foundDetail: null, anyResultsAtAll: false };
  if (!needsDetail) return { found: candidates[0], foundDetail: null, anyResultsAtAll: true };

  const maxCheck = Math.min(candidates.length, 15);
  for (let i = 0; i < maxCheck; i++) {
    const pick = candidates[i];
    try {
      const full = await discogsFetchDetail(pick.resource_url, signal);
      if (extraCheck && !extraCheck(full, pick)) continue;
      return { found: pick, foundDetail: full, anyResultsAtAll: true };
    } catch (e) {
      if (e.name === "AbortError") throw e;
      continue;
    }
  }
  return { found: null, foundDetail: null, anyResultsAtAll: true };
}

function Turntable({ size = 64 }) {
  const { palette: PALETTE } = useContext(PaletteContext);
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

const THEME_STORAGE_KEY = "discogs-randomizer-theme";

// Reads any previously-saved choice first; if there isn't one, defers to the OS/browser
// light-vs-dark setting so a first-time visitor sees the mode they already prefer elsewhere.
function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage can throw in private-browsing/blocked-storage contexts — fall through.
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export default function App() {
  const [tab, setTab] = useState("discover"); // 'discover' | 'search' | 'games'
  const [collectionSource, setCollectionSource] = useState(null); // { username } | null
  const [collectionItems, setCollectionItems] = useState(null); // cached array, or null if not connected
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const extrasMap = useCollectionReleaseEnrichment(collectionItems, collectionSource?.username || null, collectionLoading);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Same private-browsing/blocked-storage case as above — theme still works for this
      // session, it just won't be remembered next visit.
    }
  }, [theme]);

  const PALETTE = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  const styles = useMemo(() => buildStyles(PALETTE), [PALETTE]);
  const contextValue = useMemo(() => ({ palette: PALETTE, styles }), [PALETTE, styles]);

  return (
    <PaletteContext.Provider value={contextValue}>
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
  <div style={{ flex: 1 }}>
    <h1 style={styles.title}>Discogs Randomizer</h1>
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
            style={{ ...styles.tabButton, ...(tab === "search" ? styles.tabButtonActive : {}) }}
            onClick={() => setTab("search")}
          >
            Search
          </button>
          <button
            style={{ ...styles.tabButton, ...(tab === "games" ? styles.tabButtonActive : {}) }}
            onClick={() => setTab("games")}
          >
            Games
          </button>

          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 62,
              height: 36,
              padding: 2,
              borderRadius: 999,
              border: `1px solid ${PALETTE.mutedLight}`,
              background: "transparent",
              color: PALETTE.mutedLight,
              cursor: "pointer",
              transition: "border-color 0.25s ease",
              boxSizing: "border-box",
              marginLeft: "auto",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 3,
                left: theme === "dark" ? 3 : 31,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: PALETTE.mutedLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PALETTE.bg,
                fontSize: 16,
                lineHeight: 1,
                transition: "left 0.25s ease",
              }}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              )}
            </span>
          </button>
        </div>

        <CollectionBar
          collectionSource={collectionSource}
          setCollectionSource={setCollectionSource}
          collectionItems={collectionItems}
          setCollectionItems={setCollectionItems}
          loading={collectionLoading}
          setLoading={setCollectionLoading}
          error={collectionError}
          setError={setCollectionError}
        />

        {tab === "discover" && (
          <DiscoverTab collectionSource={collectionSource} collectionItems={collectionItems} extrasMap={extrasMap} />
        )}
        {tab === "search" && (
          <SearchTab collectionSource={collectionSource} collectionItems={collectionItems} extrasMap={extrasMap} />
        )}
        {tab === "games" && (
          <GamesTab collectionSource={collectionSource} collectionItems={collectionItems} />
        )}
      </div>
    </div>
    </PaletteContext.Provider>
  );
}

// A full collection load is the slowest thing this app does, and it's genuinely slow for a
// large collection — pagination-with-timeouts fixes the "stuck forever" failure mode, but a
// multi-hundred (or multi-thousand) item collection still takes real wall-clock time to
// re-page from scratch on every single visit. Caching the last successful load means a
// same-session (or same-day) reopen — including a full page reload/navigation, not just an
// in-app tab switch — can skip the network entirely and show the collection instantly.
//
// This is IndexedDB rather than localStorage on purpose. localStorage caps out around 5-10MB
// per origin depending on the browser, and a real collection in the thousands-of-releases
// range (cover art URLs, artist/label/format text, etc. per item) lands right around or past
// that ceiling — so the write was silently failing for exactly the people with the biggest,
// slowest-to-rebuild collections, i.e. the ones this cache matters most for. IndexedDB's quota
// is in the hundreds of MB to GB range, so it doesn't hit that wall.
const COLLECTION_CACHE_VERSION = "v1";
const COLLECTION_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — "Sync now" is always right there for a manual refresh, so it's fine to let a passive reopen ride on a same-day cache instead of re-paging.
const COLLECTION_DB_NAME = "discogs-randomizer-cache";
const COLLECTION_DB_VERSION = 2;
const COLLECTION_STORE_NAME = "collections";
// Pressing-country lookups require a full per-release fetch (the bulk collection listing
// doesn't include it at all), so once a release's country is known it's cached here forever —
// keyed globally by release id rather than by username, since a release's country is a fact
// about the release, not about whose collection it's sitting in.
// Pressing country, barcode, and matrix/runout data all require a full per-release fetch (the
// bulk collection listing doesn't include any of them), so once a release has been looked up
// once, everything from that lookup is cached here forever — keyed globally by release id
// rather than by username, since these are facts about the release, not about whose collection
// it's sitting in.
const RELEASE_EXTRAS_STORE_NAME = "releaseCountries"; // kept as-is from the original country-only cache so existing entries aren't orphaned; it now holds { country, identifiers } per release.

function collectionCacheKey(type, username) {
  return `discogs-collection-cache:${COLLECTION_CACHE_VERSION}:${type}:${username.toLowerCase()}`;
}

function openCollectionDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = window.indexedDB.open(COLLECTION_DB_NAME, COLLECTION_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(COLLECTION_STORE_NAME)) {
        request.result.createObjectStore(COLLECTION_STORE_NAME);
      }
      if (!request.result.objectStoreNames.contains(RELEASE_EXTRAS_STORE_NAME)) {
        request.result.createObjectStore(RELEASE_EXTRAS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Couldn't open the local cache database."));
  });
}

async function readCollectionCache(type, username) {
  try {
    const db = await openCollectionDB();
    const parsed = await new Promise((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE_NAME, "readonly");
      const req = tx.objectStore(COLLECTION_STORE_NAME).get(collectionCacheKey(type, username));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.timestamp !== "number") return null;
    if (Date.now() - parsed.timestamp > COLLECTION_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null; // corrupted entry, IndexedDB unavailable (private browsing in some browsers), etc. — just skip caching
  }
}

async function writeCollectionCache(type, username, items) {
  try {
    const db = await openCollectionDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE_NAME, "readwrite");
      tx.objectStore(COLLECTION_STORE_NAME).put({ items, timestamp: Date.now() }, collectionCacheKey(type, username));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Storage unavailable (private browsing, disabled storage, etc.) — caching is a
    // nice-to-have, not load-bearing, so fail silently rather than surfacing an error.
  }
}

async function clearCollectionCache(type, username) {
  try {
    const db = await openCollectionDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE_NAME, "readwrite");
      tx.objectStore(COLLECTION_STORE_NAME).delete(collectionCacheKey(type, username));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // no-op
  }
}

// Reads the whole release-extras cache as { [releaseId]: { country, identifiers } }. It's
// global and just short strings, so even a well-enriched collection stays tiny — reading it all
// at once is fine. Older entries written before identifiers were tracked are plain country
// strings; those are normalized to the current shape here rather than needing a migration.
async function readReleaseExtrasCache() {
  try {
    const db = await openCollectionDB();
    const map = await new Promise((resolve, reject) => {
      const tx = db.transaction(RELEASE_EXTRAS_STORE_NAME, "readonly");
      const result = {};
      const req = tx.objectStore(RELEASE_EXTRAS_STORE_NAME).openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const value = cursor.value;
          result[cursor.key] =
            typeof value === "string" ? { country: value, identifiers: [] } : value || { country: "", identifiers: [] };
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
    return map;
  } catch {
    return {};
  }
}

function writeReleaseExtrasCacheEntry(releaseId, extras) {
  openCollectionDB()
    .then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(RELEASE_EXTRAS_STORE_NAME, "readwrite");
          tx.objectStore(RELEASE_EXTRAS_STORE_NAME).put(extras, releaseId);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        })
    )
    .catch(() => {
      // A missed write just means this release gets asked for again on a future visit —
      // not load-bearing, so no need to surface or retry it here.
    });
}

// Trickles country + barcode/matrix-runout lookups in for a connected collection, well under
// Discogs' rate limit and never competing with a real foreground load (the initial sync, or a
// forced re-sync) for request budget. Both come off the same per-release fetch, so this covers
// both at no extra request cost. Each result is cached forever, so this is genuinely one-time
// cost spread thin across normal use rather than a big wait imposed on anyone — search on
// either field starts out only as complete as whatever's been gathered so far and fills in from
// there.
const RELEASE_ENRICH_INTERVAL_MS = 1500;

function useCollectionReleaseEnrichment(collectionItems, collectionKey, collectionLoading) {
  const [extrasMap, setExtrasMap] = useState({});
  const extrasMapRef = useRef({});

  // The moment a collection connects, pick up whatever's already been learned in a previous
  // session — search benefits immediately from prior enrichment without waiting on new fetches.
  useEffect(() => {
    let cancelled = false;
    if (!collectionKey) {
      extrasMapRef.current = {};
      setExtrasMap({});
      return;
    }
    readReleaseExtrasCache().then((cached) => {
      if (cancelled) return;
      extrasMapRef.current = cached;
      setExtrasMap(cached);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionKey]);

  useEffect(() => {
    if (!collectionItems || collectionItems.length === 0) return;
    let cancelled = false;
    let timer = null;

    async function tick() {
      if (cancelled) return;
      // A real foreground load (initial sync, forced re-sync) gets priority on rate-limit
      // budget — just wait and check again rather than racing it.
      if (collectionLoading) {
        timer = setTimeout(tick, RELEASE_ENRICH_INTERVAL_MS);
        return;
      }
      const next = collectionItems.find((it) => {
        const id = it.basic_information?.id;
        return id && !(id in extrasMapRef.current);
      });
      if (!next) return; // everything currently in view is enriched — nothing more to do for now

      const id = next.basic_information.id;
      try {
        const detail = await apiFetch({ kind: "release", id: String(id) });
        if (cancelled) return;
        const extras = {
          country: detail?.country || "",
          identifiers: (detail?.identifiers || [])
            .map((ident) => ident.value)
            .filter(Boolean),
        };
        extrasMapRef.current = { ...extrasMapRef.current, [id]: extras };
        setExtrasMap(extrasMapRef.current);
        writeReleaseExtrasCacheEntry(id, extras);
      } catch {
        // Leave it uncached — it's still missing next tick and further visits, so it'll get
        // picked up again rather than silently skipped forever.
      }
      if (!cancelled) timer = setTimeout(tick, RELEASE_ENRICH_INTERVAL_MS);
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [collectionItems, collectionLoading]);

  return extrasMap;
}

// ============================== COLLECTION BAR ==============================
// Always-visible strip between the tabs and whichever tab is active. Connecting here scopes
// both Discover and Games to the connected collection — it isn't a separate destination.

function CollectionBar({ collectionSource, setCollectionSource, collectionItems, setCollectionItems, loading, setLoading, error, setError }) {
  const { palette: PALETTE, styles } = useContext(PaletteContext);
  const [draftUsername, setDraftUsername] = useState("");
  const [progress, setProgress] = useState(null); // { loaded, total } | null
  const requestRef = useRef(null);
  // Tracks what the in-flight request is for, so a visibilitychange handler firing later
  // knows whether (and how) to resume it.
  const pendingLoadRef = useRef(null); // { type: "private", username } | { type: "public", username } | null
  // Snapshot of whatever pages a load has fetched so far, keyed by "type:username". Getting
  // backgrounded mid-load aborts the in-flight request (see the visibilitychange handler
  // below) but this survives that, so resuming re-enters fetchFullCollection at the next
  // unfetched page with the already-fetched items intact, instead of re-paging a large
  // collection from page 1 every time you step away for a few seconds mid-sync.
  const partialLoadRef = useRef(null); // { key, items, nextPage } | null

  const loadPrivateCollection = useCallback(
    async (username, { forceRefresh = false } = {}) => {
      requestRef.current?.abort();
      pendingLoadRef.current = { type: "private", username };
      setError("");

      if (!forceRefresh) {
        const cached = await readCollectionCache("private", username);
        if (cached) {
          setCollectionSource({ username, private: true });
          setCollectionItems(cached.items);
          setLoading(false);
          setProgress(null);
          pendingLoadRef.current = null;
          partialLoadRef.current = null;
          return;
        }
      }

      const key = `private:${username}`;
      const partial = !forceRefresh && partialLoadRef.current?.key === key ? partialLoadRef.current : null;
      if (forceRefresh) partialLoadRef.current = null;

      const controller = new AbortController();
      requestRef.current = controller;
      setLoading(true);
      setProgress(partial ? { loaded: partial.items.length, total: null } : null);
      setCollectionItems(partial ? partial.items : null);
      try {
        const items = await fetchFullCollection(
          { useAuth: true, resumeItems: partial?.items, resumePage: partial?.nextPage },
          controller.signal,
          (loaded, total, nextPage, itemsSoFar) => {
            setProgress({ loaded, total });
            partialLoadRef.current = { key, items: itemsSoFar, nextPage };
          }
        );
        if (controller.signal.aborted) return;
        setCollectionSource({ username, private: true });
        setCollectionItems(items);
        await writeCollectionCache("private", username, items);
        setLoading(false);
        pendingLoadRef.current = null;
        partialLoadRef.current = null;
      } catch (e) {
        if (e.name === "AbortError") return; // partialLoadRef keeps whatever we had — next call resumes from there
        setError(
          e.name === "TimeoutError"
            ? "Discogs stopped responding while loading your collection (this can happen on a spotty mobile connection). Tap Retry."
            : e.message || "Couldn't load your collection."
        );
        setLoading(false);
        pendingLoadRef.current = null;
        partialLoadRef.current = null;
      }
    },
    [setCollectionSource, setCollectionItems, setError, setLoading]
  );

  // On mount: pick up either a just-finished login redirect (?login=success/failed) or an
  // already-active session from a previous visit, so a returning visitor doesn't have to
  // click "Log in with Discogs" again every time.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loginResult = searchParams.get("login");
    if (loginResult) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (loginResult === "failed") {
      setError("Discogs login didn't go through. Please try again.");
      return;
    }
    fetch("/api/auth-status")
      .then((r) => r.json())
      .then((status) => {
        if (status.authenticated) loadPrivateCollection(status.username);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile browsers can pause or kill in-flight network requests when a tab is backgrounded
  // (locking the phone, switching apps mid-load). Without this, a paginated collection load
  // that gets backgrounded partway through can come back to a foreground tab with a promise
  // that will now never settle — `loading` stays true forever with no error and no recourse
  // but a manual refresh. Aborting on hide and re-kicking the same load on the next visible
  // turns that into a normal retry instead of a silent hang.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        if (loading) requestRef.current?.abort();
        return;
      }
      // visible again
      const pending = pendingLoadRef.current;
      if (!pending) return;
      if (pending.type === "private") loadPrivateCollection(pending.username);
      else if (pending.type === "public") connectPublicRef.current?.(pending.username);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadPrivateCollection]);

  // connectPublic is defined below and referenced by the visibility handler above; a ref
  // avoids having to reorder declarations or wrap connectPublic in its own useCallback.
  const connectPublicRef = useRef(null);

  async function connectPublic(username, { forceRefresh = false } = {}) {
    requestRef.current?.abort();
    pendingLoadRef.current = { type: "public", username };
    setError("");

    if (!forceRefresh) {
      const cached = await readCollectionCache("public", username);
      if (cached) {
        setCollectionSource({ username, private: false });
        setCollectionItems(cached.items);
        setLoading(false);
        setProgress(null);
        pendingLoadRef.current = null;
        partialLoadRef.current = null;
        return;
      }
    }

    const key = `public:${username}`;
    const partial = !forceRefresh && partialLoadRef.current?.key === key ? partialLoadRef.current : null;
    if (forceRefresh) partialLoadRef.current = null;

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setProgress(partial ? { loaded: partial.items.length, total: null } : null);
    setCollectionItems(partial ? partial.items : null);
    try {
      const items = await fetchFullCollection(
        { username, resumeItems: partial?.items, resumePage: partial?.nextPage },
        controller.signal,
        (loaded, total, nextPage, itemsSoFar) => {
          setProgress({ loaded, total });
          partialLoadRef.current = { key, items: itemsSoFar, nextPage };
        }
      );
      if (controller.signal.aborted) return;
      if (items.length === 0) {
        setError("That collection came back empty — double check the username, or that the collection isn't empty.");
        setLoading(false);
        pendingLoadRef.current = null;
        partialLoadRef.current = null;
        return;
      }
      setCollectionSource({ username, private: false });
      setCollectionItems(items);
      await writeCollectionCache("public", username, items);
      setLoading(false);
      pendingLoadRef.current = null;
      partialLoadRef.current = null;
    } catch (e) {
      if (e.name === "AbortError") return; // partialLoadRef keeps whatever we had — next call resumes from there
      setError(
        e.name === "TimeoutError"
          ? "Discogs stopped responding while loading that collection. Tap Connect to retry."
          : e.message || "Couldn't load that collection."
      );
      setLoading(false);
      pendingLoadRef.current = null;
      partialLoadRef.current = null;
    }
  }
  connectPublicRef.current = connectPublic;

  async function disconnect() {
    requestRef.current?.abort();
    pendingLoadRef.current = null;
    partialLoadRef.current = null;
    if (collectionSource?.private) {
      await clearCollectionCache("private", collectionSource.username);
      try {
        await fetch("/api/auth-logout", { method: "POST" });
      } catch {
        // Non-fatal — the cookie will just get overwritten on the next login attempt.
      }
    }
    setCollectionSource(null);
    setCollectionItems(null);
    setError("");
  }

  function syncNow() {
    if (!collectionSource || loading) return;
    if (collectionSource.private) loadPrivateCollection(collectionSource.username, { forceRefresh: true });
    else connectPublic(collectionSource.username, { forceRefresh: true });
  }

  function retry() {
    const pending = pendingLoadRef.current;
    if (pending?.type === "private") loadPrivateCollection(pending.username);
    else if (pending?.type === "public") connectPublic(pending.username);
    else if (draftUsername.trim()) connectPublic(draftUsername.trim());
  }

  if (collectionSource) {
    return (
      <div style={styles.collectionBar}>
        <span>
          🔒 Playing from <strong>{collectionSource.username}</strong>'s collection ({collectionItems?.length ?? 0} releases)
          {collectionSource.private ? " · private" : ""}
        </span>
        <button style={styles.collectionChangeBtn} onClick={syncNow} disabled={loading}>
          {loading ? "Syncing…" : "Sync now"}
        </button>
        <button style={styles.collectionChangeBtn} onClick={disconnect}>
          {collectionSource.private ? "Log out" : "Change"}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.collectionBar}>
      <input
        style={styles.collectionInput}
        placeholder="Discogs username (public collection)"
        value={draftUsername}
        onChange={(e) => setDraftUsername(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && draftUsername.trim() && connectPublic(draftUsername.trim())}
        disabled={loading}
      />
      <button
        style={styles.collectionConnectBtn}
        onClick={() => draftUsername.trim() && connectPublic(draftUsername.trim())}
        disabled={loading || !draftUsername.trim()}
      >
        {loading
          ? progress?.total
            ? `Loading… ${progress.loaded}/${progress.total}`
            : "Loading…"
          : "Connect"}
      </button>
      <a href="/api/auth-start" style={styles.collectionLoginBtn}>
        🔒 Log in with Discogs
      </a>
      {loading && (
        <button type="button" style={styles.collectionChangeBtn} onClick={() => requestRef.current?.abort()}>
          Cancel
        </button>
      )}
      {error && (
        <div style={{ ...styles.hintText, width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: PALETTE.danger }}>{error}</span>
          <button type="button" style={styles.collectionChangeBtn} onClick={retry}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// ============================== DISCOVER TAB ==============================

// A collapsed-by-default "Expand ▾" link that reveals the same Tracklist used in Search.
// Deliberately a separate component (rather than a useState in DiscoverTab itself) so that
// mounting it inside the result card's key={result.id} wrapper means a fresh draw always
// starts collapsed again, instead of carrying an expanded tracklist over from the last pick.
function TracklistToggle({ tracklist, videos }) {
  const { styles } = useContext(PaletteContext);
  const [expanded, setExpanded] = useState(false);
  if (!tracklist || tracklist.length === 0) return null;
  return (
    <>
      <button type="button" style={styles.expandToggle} onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
        {expanded ? "Collapse" : "Expand"}{" "}
        <span style={{ ...styles.expandToggleArrow, ...(expanded ? styles.expandToggleArrowOpen : {}) }} aria-hidden="true">▾</span>
      </button>
      {expanded && <Tracklist tracklist={tracklist} videos={videos} />}
    </>
  );
}

// A compact "+" button next to the artist name on a random draw, for adding straight to
// the logged-in person's wantlist without leaving the card. Lives inside the result card's
// key={result.id} wrapper (like TracklistToggle) so it resets to idle on every new draw
// rather than showing "✓ Added" for whatever record happened to be up before.
function WantlistButton({ releaseId }) {
  const { styles } = useContext(PaletteContext);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleClick() {
    if (state === "loading" || state === "done") return;
    setState("loading");
    setErrorMsg("");
    try {
      await addToDiscogs("wantlist", releaseId);
      setState("done");
    } catch (e) {
      setState("error");
      setErrorMsg(e.message || "That didn't go through.");
    }
  }

  const label = state === "loading" ? "…" : state === "done" ? "✓" : state === "error" ? "!" : "+";
  const title =
    state === "done"
      ? "Added to your wantlist"
      : state === "error"
        ? `Couldn't add to wantlist — tap to retry. (${errorMsg})`
        : "Add to wantlist";

  return (
    <button
      type="button"
      style={{
        ...styles.wantlistButton,
        ...(state === "done" ? styles.wantlistButtonDone : {}),
        ...(state === "error" ? styles.wantlistButtonError : {}),
      }}
      onClick={handleClick}
      disabled={state === "loading" || state === "done"}
      title={title}
      aria-label={title}
    >
      {label}
    </button>
  );
}

function DiscoverTab({ collectionSource, collectionItems, extrasMap }) {
  const { palette: PALETTE, styles } = useContext(PaletteContext);
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

  // Only true when the connected collection is the logged-in person's own — same signal
  // Search uses for its write actions.
  const loggedIn = collectionSource?.private === true;

  // Same three-way scope as Search: 'in' draws only from the connected collection (the
  // original, only behavior this tab had), 'out' draws from the live catalog with owned
  // releases excluded, 'both' draws from the live catalog without excluding them. Only
  // meaningful once a collection is connected.
  const [scope, setScope] = useState("in"); // 'in' | 'out' | 'both'
  const ownedIds = useMemo(
    () => new Set((collectionItems || []).map((it) => it.basic_information?.id).filter(Boolean)),
    [collectionItems]
  );
  // Reset to the default scope on every new connection so switching collections (or logging
  // out and back in) doesn't leave a stale "outside"/"both" choice from before.
  useEffect(() => {
    setScope("in");
  }, [collectionSource?.username]);

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
    setFormats((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      const family = FORMAT_FAMILY[f];
      if (family) {
        // Drop any already-selected chip from a different medium family (e.g. LP replaces
        // CD, 7" replaces Cassette) — same-family chips (LP + 12") and family-less chips
        // (Box Set) are left alone since they can genuinely coexist.
        return [...prev.filter((x) => !FORMAT_FAMILY[x] || FORMAT_FAMILY[x] === family), f];
      }
      return [...prev, f];
    });
  }

  function buildParams(yearOverride) {
    const params = { type: "release" };
    if (genre !== "Any Genre") {
      params.genre = genre;
    } else {
      // Same fix as the games: an unfiltered vinyl search has tens of millions of matches,
      // far more than our page cap can meaningfully sample, so it skews toward whatever
      // Discogs' default ranking favors (heavily Electronic, then Rock). Picking a random
      // genre per attempt keeps "Any Genre" spread evenly across the whole taxonomy instead.
      params.genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
    }
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
      const inCollectionMode = scope === "in" && !!(collectionItems && collectionItems.length);

      let found = null;
      let foundDetail = null;
      let anyResultsAtAll = false;

      if (inCollectionMode) {
        // Collection mode: filter the cached collection client-side rather than hitting search.
        const filters = {
          genre: genreOverride || genre,
          style: styleOverride !== undefined ? styleOverride : style,
          decade: decadeOverride || decade,
          formats,
        };
        const outcome = await randomFromCollection(
          collectionItems,
          filters,
          seenIdsRef.current,
          needsDetailForSelection,
          (full, pick) => {
            if (onlyArtwork && !full.images?.some((image) => image.uri || image.uri150)) return false;
            const rating = full.community?.rating;
            if (needsRatingCheck && (!rating || rating.count === 0 || rating.average < minRating)) return false;
            if (extraCheck && !extraCheck(full, pick)) return false;
            return true;
          },
          controller.signal,
          extrasMap
        );
        found = outcome.found;
        foundDetail = outcome.foundDetail;
        anyResultsAtAll = outcome.anyResultsAtAll;
      } else {
        // How many candidates from a single already-fetched page to check before treating
        // the attempt as a bust and rolling a fresh page. Only matters when a detail check
        // is in play (onlyArtwork/minRating/extraCheck) — checking one item per page fetch
        // was the actual bug: a narrow genre+style pair (Rabbit Hole) plus onlyArtwork
        // defaulting to true meant 10 attempts = 10 total releases checked, so it was easy
        // to whiff 10/10 purely on artwork-less releases even though plenty of qualifying
        // releases were sitting unchecked on the same page.
        const CANDIDATES_PER_PAGE = 15;

        for (let i = 0; i < maxAttempts; i++) {
          if (i > 0) await sleep(150);
          const yearForAttempt = randomYearInDecade(decadeOverride || decade);
          const baseParams = buildParams(yearForAttempt);
          if (genreOverride) baseParams.genre = genreOverride;
          if (styleOverride !== undefined) {
            if (styleOverride) baseParams.style = styleOverride;
            else delete baseParams.style;
          }

          let candidates;
          try {
            candidates = await randomReleaseSearch(baseParams, seenIdsRef.current, controller.signal);
          } catch (e) {
            if (e.name === "AbortError") return;
            if (String(e?.message || "").includes("rate-limiting")) await sleep(1200);
            continue; // transient hiccup on the search itself — retry rather than failing outright
          }
          if (!candidates.length) break; // Discogs genuinely has zero matches for these filters

          // "Outside collection" means outside — Discogs' search can't exclude owned
          // releases itself, so drop them from this page before treating it as a page of
          // real candidates. "Both" leaves them in on purpose.
          if (scope === "out" && ownedIds.size) {
            candidates = candidates.filter((c) => !ownedIds.has(c.id));
            if (!candidates.length) continue;
          }
          anyResultsAtAll = true;

          if (needsClientFormatCheck) {
            // Every selected chip must be present (AND, not OR) — otherwise "Vinyl" alone
            // already matches every 7"/10"/12" single, since they're all vinyl too.
            candidates = candidates.filter((c) => formats.every((f) => (c.format || []).includes(f)));
            if (!candidates.length) continue;
          }

          if (needsDetailForSelection) {
            const toCheck = candidates.slice(0, CANDIDATES_PER_PAGE);
            let matched = false;
            for (const pick of toCheck) {
              try {
                const full = await discogsFetchDetail(pick.resource_url, controller.signal);
                const rating = full.community?.rating;
                if (onlyArtwork && !full.images?.some((image) => image.uri || image.uri150)) continue;
                if (needsRatingCheck && (!rating || rating.count === 0 || rating.average < minRating)) continue;
                if (extraCheck && !extraCheck(full, pick)) continue;
                found = pick;
                foundDetail = full;
                matched = true;
                break;
              } catch (e) {
                if (e.name === "AbortError") return;
                continue;
              }
            }
            if (matched) break;
          } else {
            found = candidates[0];
            break;
          }
        }
      }

      if (controller.signal.aborted) return;
      if (!found) {
        setEmptyNotice(
          inCollectionMode
            ? (anyResultsAtAll
                ? "Found matches in the collection, but none cleared the extra filters. Try loosening things a bit or just try again - Discogs can get stuck trying to find stuff."
                : "Nothing in this collection matched that combination. Try loosening a filter or just trying again.")
            : (anyResultsAtAll
                ? "Found matches, but couldn't find one that also cleared the extra filters after several tries. Try loosening things a bit or just trying again."
                : "Nothing matched that combination. Try loosening a filter — style and country are the most restrictive. Though you might actually be able to try again and see what happens.")
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
  const inCollectionModeForRender = !!collectionSource && scope === "in";

  return (
    <>
      {collectionSource && (
        <div style={{ ...styles.scopeToggleRow, marginBottom: 16 }} role="group" aria-label="Discover scope">
          <button
            type="button"
            style={{ ...styles.scopeToggleButton, ...(scope === "in" ? styles.scopeToggleButtonActive : {}) }}
            onClick={() => setScope("in")}
          >
            In collection
          </button>
          <button
            type="button"
            style={{ ...styles.scopeToggleButton, ...(scope === "out" ? styles.scopeToggleButtonActive : {}) }}
            onClick={() => setScope("out")}
          >
            Outside collection
          </button>
          <button
            type="button"
            style={{ ...styles.scopeToggleButton, ...(scope === "both" ? styles.scopeToggleButtonActive : {}) }}
            onClick={() => setScope("both")}
          >
            Both
          </button>
        </div>
      )}

      <div style={styles.form} ref={formRef}>
        <p style={styles.formHeading}>
          {!collectionSource
            ? "Find me…"
            : scope === "in"
              ? `Find me… (from ${collectionSource.username}'s collection)`
              : scope === "out"
                ? `Find me… (outside ${collectionSource.username}'s collection)`
                : `Find me… (catalog + ${collectionSource.username}'s collection)`}
        </p>

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
          <label style={styles.label}>Country of release</label>
          <select style={styles.select} value={country} onChange={(e) => setCountry(e.target.value)} disabled={inCollectionModeForRender}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {inCollectionModeForRender ? (
            <p style={styles.hintText}>Discogs doesn't expose pressing country on collection data, so this filter is off while browsing the connected collection.</p>
          ) : (
            <p style={styles.hintText}>This is the country the pressing was released in — not the artist's nationality.</p>
          )}
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
            {(artist || loggedIn) && (
              <div style={styles.cardArtistRow}>
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
                {loggedIn && !inCollectionModeForRender && !ownedIds.has(result.id) && (
                  <WantlistButton releaseId={result.id} />
                )}
              </div>
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

            <TracklistToggle tracklist={detail?.tracklist} videos={detail?.videos} />

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
            ↕️ High Ratings, Low Haves
          </button>
        </div>
      ) : (
        <div style={styles.discoveryModeRow}>
          <button style={{ ...styles.modeButton, ...(loading ? styles.modeButtonDisabled : {}) }} onClick={handleHiddenGem} disabled={loading}>
            ↕️ High Ratings, Low Haves
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


// ============================== SEARCH TAB ==============================
// Straight, non-randomized Discogs search: type a query, get a page of results back. Shares
// the same /api/discogs "search" and "release" endpoints as Discover, just without the
// random-page sampling — page 1 of a normal query is exactly what's shown.

const SEARCH_RESULTS_PER_PAGE = 20;

// Search's format filter is single-select (unlike Discover's multi-select chips) to keep the
// filter row compact — "Any Format" stands in for no filter.
const SEARCH_FORMAT_OPTIONS = ["Any Format", ...FORMAT_OPTIONS];

const SORT_OPTIONS = [
  { value: "relevance", label: "Best match" },
  { value: "artist_asc", label: "Artist A–Z" },
  { value: "year_desc", label: "Newest first" },
  { value: "year_asc", label: "Oldest first" },
];

// Discogs' search endpoint only sorts by one field at a time — there's no native
// "relevance, then year" compound sort. "Best match" leaves sort unset (Discogs' own
// relevance ranking); the other options are there for when relevance isn't what's wanted —
// "Artist A–Z" in particular is the natural order for browsing rather than searching.
function sortParamsFor(sortMode) {
  if (sortMode === "year_desc") return { sort: "year", sort_order: "desc" };
  if (sortMode === "year_asc") return { sort: "year", sort_order: "asc" };
  if (sortMode === "artist_asc") return { sort: "artist", sort_order: "asc" };
  return {};
}

// Name-search helpers: when a multi-word artist search produces a true artist-name match,
// also search the final name token so alternate/credited names such as "Pretty Purdie" can
// appear below true "Bernard Purdie" matches without broadening ordinary title searches.
function normalizeSearchName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function searchResultArtist(result) {
  const raw = String(result?.title || "");
  const separator = raw.indexOf(" - ");
  return separator >= 0 ? raw.slice(0, separator).trim() : "";
}

function isMultiWordNameQuery(query) {
  return normalizeSearchName(query).split(" ").filter(Boolean).length >= 2;
}

function artistNameContainsQuery(artist, query) {
  const a = normalizeSearchName(artist);
  const q = normalizeSearchName(query);
  return !!a && !!q && (a === q || a.includes(q));
}

function artistNameHasPartialLastToken(artist, query) {
  const a = normalizeSearchName(artist);
  const words = normalizeSearchName(query).split(" ").filter(Boolean);
  if (!a || words.length < 2) return false;
  const last = words[words.length - 1];
  return a.split(" ").includes(last) && !artistNameContainsQuery(a, query);
}

function searchResultMatchesArtistQuery(result, query) {
  return artistNameContainsQuery(searchResultArtist(result), query);
}

// Collection-scoped counterpart: when a collection is connected, Search runs entirely
// client-side against the already-cached collection instead of hitting Discogs' global
// search. "Best match" has no real relevance signal to sort by here, so it just keeps
// whatever order the substring filter produced.
function sortCollectionMatches(items, sortMode) {
  if (sortMode === "year_desc") return [...items].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  if (sortMode === "year_asc") return [...items].sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
  if (sortMode === "artist_asc") return [...items].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return items;
}

// A blank query is normally not searchable — but a genre/style/format filter on its own is
// a valid "browse the catalog by filter" request, same idea as Discover's filters minus the
// randomization. Collection-connected browsing (no filters needed) is handled separately.
function isAnyFilterActive(f) {
  return (f.genre && f.genre !== "Any Genre") || !!f.style || (f.format && f.format !== "Any Format");
}

// Shared by scope "in" (collection-only) and "both" (collection preview + live catalog):
// every connected-collection item that matches the current text query and filters, sorted
// the same way collection-scoped search always has. Text matching covers every field the
// collection endpoint actually gives us per item — title/artist, label, catalog number, genre,
// and style — plus country and barcode/runout identifiers wherever the background enrichment
// cache (see useCollectionReleaseEnrichment) has already learned them; anything not enriched
// yet just won't match on those two until it is.
function collectionMatches(items, q, sort, filters, extrasMap) {
  const rawQuery = q.trim();
  const needle = rawQuery.toLowerCase();
  const barcodeQuery = looksLikeBarcode(rawQuery);
  const normalizedNeedle = normalizeBarcode(rawQuery);
  const nameQuery = isMultiWordNameQuery(rawQuery);
  const picks = (items || [])
    .map((it) => collectionItemToPick(it, extrasMap))
    .filter((p) => p.id);

  // Only broaden a name search when the collection actually contains a true artist-name
  // match. This keeps ordinary multi-word album/title searches from becoming surname searches.
  const hasExactNameMatch =
    nameQuery && picks.some((p) => searchResultMatchesArtistQuery({ title: p.title }, rawQuery));

  const matches = picks
    .map((p) => {
      const textValues = [
        p.title,
        ...(p.label || []),
        ...(p.catno || []),
        ...(p.genre || []),
        ...(p.style || []),
        p.country || "",
      ];
      const textMatch = textValues.join(" ").toLowerCase().includes(needle);
      let matched = textMatch;
      let partialNameMatch = false;

      if (!matched && !barcodeQuery) {
        matched = (p.identifiers || []).join(" ").toLowerCase().includes(needle);
      }

      if (!matched && hasExactNameMatch) {
        partialNameMatch = artistNameHasPartialLastToken(p.title.split(" - ")[0], rawQuery);
        matched = partialNameMatch;
      }

      return { p, matched, partialNameMatch };
    })
    .filter((entry) => entry.matched)
    .filter((entry) =>
      collectionPickMatchesFilters(entry.p, {
        genre: filters.genre,
        style: filters.style,
        decade: "Any Decade",
        formats: filters.format && filters.format !== "Any Format" ? [filters.format] : [],
      })
    );

  if (sort === "relevance") {
    return matches
      .sort((a, b) => Number(a.partialNameMatch) - Number(b.partialNameMatch))
      .map((entry) => entry.p);
  }
  return sortCollectionMatches(matches.map((entry) => entry.p), sort);
}


const BOTH_MODE_PREVIEW_COUNT = 5;

function SearchTab({ collectionSource, collectionItems, extrasMap }) {
  const { styles } = useContext(PaletteContext);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [releasesOnly, setReleasesOnly] = useState(true);
  const [sortMode, setSortMode] = useState("relevance");
  // Only meaningful once a collection is connected — "in" mirrors the old behavior (search
  // scoped entirely to the connected collection). "out" and "both" both hit the live Discogs
  // catalog, so they carry a real network search and the releases-only/sort controls apply.
  const [scope, setScope] = useState("in"); // 'in' | 'out' | 'both'
  const [collectionPreview, setCollectionPreview] = useState([]); // 'both' mode only: top few in-collection matches
  const [collectionPreviewTotal, setCollectionPreviewTotal] = useState(0);
  const [filterGenre, setFilterGenre] = useState("Any Genre");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterFormat, setFilterFormat] = useState("Any Format");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const requestRef = useRef(null);
  const detailRequestRef = useRef(null);
  const filterStyleOptions = useMemo(() => GENRE_STYLES[filterGenre] || [], [filterGenre]);
  // Only true when the connected collection is the logged-in person's own — write actions
  // (adding to collection/wantlist) only make sense against your own Discogs account.
  const loggedIn = collectionSource?.private === true;
  const ownedIds = useMemo(
    () => new Set((collectionItems || []).map((it) => it.basic_information?.id).filter(Boolean)),
    [collectionItems]
  );

  const runSearch = useCallback(async (q, pageNum, only, sort, source, items, filters, scopeArg, extrasMapArg) => {
    const effectiveScope = source ? scopeArg : "out";
    // A blank query is only valid when there's something else doing the narrowing — a
    // connected collection to browse, or a genre/style/format filter set.
    if (!q.trim() && !source && !isAnyFilterActive(filters)) return;
    requestRef.current?.abort();

    if (effectiveScope === "in") {
      // Collection-scoped: everything's already cached, so this is just a synchronous
      // filter + sort + slice, no network call and no "releases only" toggle to apply
      // (collection releases are, well, always releases). A blank query matches everything,
      // which is what makes this double as a browse-the-whole-collection mode.
      setLoading(true);
      setError("");
      setCollectionPreview([]);
      setCollectionPreviewTotal(0);
      const sorted = collectionMatches(items, q, sort, filters, extrasMapArg);
      const perPage = SEARCH_RESULTS_PER_PAGE;
      const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
      const clampedPage = Math.min(Math.max(pageNum, 1), totalPages);
      const slice = sorted.slice((clampedPage - 1) * perPage, clampedPage * perPage);
      setResults(slice);
      setPagination({ page: clampedPage, pages: totalPages, items: sorted.length });
      setLoading(false);
      return;
    }

    // "out" and "both" both hit the live catalog, and both need to know what's already in
    // the collection — "out" to hide it from the results, "both" for the preview strip above them.
    const collectionIdSet = source
      ? new Set((items || []).map((it) => it.basic_information?.id).filter(Boolean))
      : null;

    if (effectiveScope === "both") {
      const sorted = collectionMatches(items, q, sort, filters, extrasMapArg);
      setCollectionPreview(sorted.slice(0, BOTH_MODE_PREVIEW_COUNT));
      setCollectionPreviewTotal(sorted.length);
    } else {
      setCollectionPreview([]);
      setCollectionPreviewTotal(0);
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const baseParams = {
        page: String(pageNum),
        per_page: String(SEARCH_RESULTS_PER_PAGE),
        ...sortParamsFor(sort),
      };
      if (only) baseParams.type = "release";
      if (filters.genre && filters.genre !== "Any Genre") baseParams.genre = filters.genre;
      if (filters.style) baseParams.style = filters.style;
      if (filters.format && filters.format !== "Any Format") baseParams.format = filters.format;

      // Discogs' search treats an empty q as a literal (and mostly fruitless) filter rather
      // than "no text filter" — only send it when there's actually something to search for,
      // same as Discover never sends q at all for its filter-only queries. A query shaped like
      // a barcode or catalog number is routed to Discogs' dedicated field for that instead of
      // the general text field, since that's a much more reliable match for an exact code (see
      // looksLikeBarcode/looksLikeCatalogNumber above).
      const trimmedQuery = q.trim();
      // An ordered list of param sets to try in turn, stopping at the first that finds
      // anything. For a structured (barcode/catalog number) query this can be more than one
      // attempt:
      //   - Barcode and catalog number only ever exist on release-type entries — every
      //     structured attempt forces that scope regardless of the "Releases only" toggle,
      //     since pairing one of these fields with an unscoped (or artist/master-inclusive)
      //     type is the kind of thing that can make Discogs' index come back empty even for a
      //     real, correctly typed code.
      //   - A barcode specifically gets tried in both its 12-digit UPC-A and 13-digit EAN-13
      //     forms. Those are frequently the exact same physical barcode (EAN-13 is usually just
      //     UPC-A with a leading zero), but Discogs' index is an exact match against whichever
      //     digit string it actually has stored, so typing the "wrong" one of the two can come
      //     back empty even though the code is genuinely right.
      //   - Whatever's left of these (a thrown error or every variant coming back with zero
      //     total matches) falls through to one last plain-text q attempt, since Discogs' own
      //     general search — as on discogs.com — is often more forgiving about exactly this
      //     kind of formatting than the dedicated field is.
      // Exact identifier searches should not inherit genre/style/format/country filters.
      // A barcode or catalog number identifies a specific release; carrying unrelated search
      // filters into the identifier lookup can make a valid Discogs match disappear. We still
      // preserve pagination and the user's sort choice for the results UI.
      const structuredBaseParams = {
        page: String(pageNum),
        per_page: String(SEARCH_RESULTS_PER_PAGE),
        ...sortParamsFor(sort),
        type: "release",
      };

      const attempts = [];
      const structuredTextFallbacks = [];
      let usedStructuredField = false;
      if (trimmedQuery) {
        if (looksLikeBarcode(trimmedQuery)) {
          usedStructuredField = true;
          const barcodeCandidates = barcodeVariants(trimmedQuery);

          // First use Discogs' dedicated barcode index. If that index is stale or incomplete
          // for a particular release, we then retry the same representations through q.
          // Discogs.com's own search can sometimes find identifier text that the dedicated
          // barcode field does not, so this gives us a second API-side route without scraping
          // Discogs.com or introducing a third-party barcode service.
          for (const barcode of barcodeCandidates) {
            attempts.push({ ...structuredBaseParams, barcode });
            structuredTextFallbacks.push(barcode);
          }
        } else if (looksLikeCatalogNumber(trimmedQuery)) {
          usedStructuredField = true;
          attempts.push({ ...structuredBaseParams, catno: trimmedQuery });
          structuredTextFallbacks.push(trimmedQuery);
        } else {
          attempts.push({ ...baseParams, q: trimmedQuery });
        }
      } else {
        attempts.push({ ...baseParams });
      }

      // If Discogs' dedicated identifier index does not return anything, retry the identifier
      // through the general text index. This is intentionally still Discogs API-only: we don't
      // scrape the Discogs website or send the user's barcode to an unrelated lookup service.
      // For barcodes we try the same UPC/EAN display variants we already generated above.
      if (usedStructuredField) {
        const seenTextFallbacks = new Set();
        for (const fallbackQuery of structuredTextFallbacks) {
          const key = String(fallbackQuery).toLowerCase();
          if (seenTextFallbacks.has(key)) continue;
          seenTextFallbacks.add(key);
          attempts.push({
            page: String(pageNum),
            per_page: String(SEARCH_RESULTS_PER_PAGE),
            ...sortParamsFor(sort),
            type: "release",
            q: fallbackQuery,
          });
        }
      }

      let effectiveData = null;
      for (const attempt of attempts) {
        try {
          effectiveData = await discogsFetch(attempt, controller.signal);
        } catch (e) {
          if (e.name === "AbortError") throw e;
          effectiveData = null;
        }
        if (controller.signal.aborted) return;
        if ((effectiveData?.pagination?.items || 0) > 0) break;
      }

      // Once the primary search proves this is an artist-name search, do one optional
      // surname/last-token pass. This is how "Bernard Purdie" can also surface "Pretty Purdie"
      // without making every multi-word title search unexpectedly broaden.
      if (
        pageNum === 1 &&
        trimmedQuery &&
        isMultiWordNameQuery(trimmedQuery) &&
        effectiveData?.results?.length
      ) {
        const primaryResults = effectiveData.results || [];
        const hasExactNameMatch = primaryResults.some((r) =>
          searchResultMatchesArtistQuery(r, trimmedQuery)
        );
        if (hasExactNameMatch) {
          const words = normalizeSearchName(trimmedQuery).split(" ").filter(Boolean);
          const lastNameToken = words[words.length - 1];
          if (lastNameToken) {
            try {
              const secondaryParams = { ...baseParams, q: lastNameToken };
              delete secondaryParams.barcode;
              delete secondaryParams.catno;
              const secondaryData = await discogsFetch(secondaryParams, controller.signal);
              if (controller.signal.aborted) return;

              const primaryIds = new Set(primaryResults.map((r) => r.id));
              const partialResults = (secondaryData?.results || [])
                .filter((r) => !primaryIds.has(r.id))
                .filter((r) => artistNameHasPartialLastToken(searchResultArtist(r), trimmedQuery))
                .slice(0, 4);

              if (partialResults.length) {
                // Reserve a few slots for useful name variants while keeping the search page
                // at its normal 20-result size. True matches always come first.
                const primaryLimit = Math.max(
                  0,
                  SEARCH_RESULTS_PER_PAGE - partialResults.length
                );
                effectiveData = {
                  ...effectiveData,
                  results: [
                    ...primaryResults.slice(0, primaryLimit),
                    ...partialResults,
                  ],
                };
              }
            } catch (e) {
              if (e.name === "AbortError") throw e;
              // Keep the primary results if the optional variant lookup fails.
            }
          }
        }
      }

      // Discogs' search can't exclude "things I already own" itself, so this filters the
      // page we got back rather than the query — a page can come back short of per_page as
      // a result, an acceptable tradeoff for "don't show records I already have" over
      // trying to backfill from the next page.
      const raw = effectiveData?.results || [];
      const filtered = collectionIdSet ? raw.filter((r) => !collectionIdSet.has(r.id)) : raw;
      setResults(filtered);
      setPagination(effectiveData?.pagination || null);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message || "That search didn't go through. Try again.");
      setResults([]);
      setPagination(null);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // If the person connects (or disconnects) a collection while a search is already showing,
  // re-run it against the new scope instead of silently leaving stale, mismatched results up.
  // Disconnecting mid-browse (blank query, no collection left to browse) has nothing left to
  // scope to, so that case resets back to the empty/unsearched state instead.
  const collectionKey = collectionSource?.username || null;
  const currentFilters = () => ({ genre: filterGenre, style: filterStyle, format: filterFormat });

  useEffect(() => {
    // Reset to the default scope on every new connection so switching collections (or
    // logging out and back in) doesn't leave a stale "outside"/"both" choice from before.
    setScope("in");
    if (!hasSearched) return;
    if (!submittedQuery.trim() && !collectionSource && !isAnyFilterActive(currentFilters())) {
      setHasSearched(false);
      setResults([]);
      setPagination(null);
      return;
    }
    setPage(1);
    runSearch(submittedQuery, 1, releasesOnly, sortMode, collectionSource, collectionItems, currentFilters(), "in", extrasMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionKey]);


  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    const filters = currentFilters();
    if (!q && !collectionSource && !isAnyFilterActive(filters)) return; // nothing to search or browse by
    setSubmittedQuery(q);
    setHasSearched(true);
    setPage(1);
    runSearch(q, 1, releasesOnly, sortMode, collectionSource, collectionItems, filters, scope, extrasMap);
  }

  function changePage(next) {
    if (!hasSearched || next < 1) return;
    setPage(next);
    runSearch(submittedQuery, next, releasesOnly, sortMode, collectionSource, collectionItems, currentFilters(), scope, extrasMap);
  }

  function changeScope(next) {
    if (next === scope) return;
    setScope(next);
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, releasesOnly, sortMode, collectionSource, collectionItems, currentFilters(), next, extrasMap);
    }
  }

  function handleToggleReleasesOnly() {
    const next = !releasesOnly;
    setReleasesOnly(next);
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, next, sortMode, collectionSource, collectionItems, currentFilters(), scope, extrasMap);
    }
  }

  function handleSortChange(e) {
    const next = e.target.value;
    setSortMode(next);
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, releasesOnly, next, collectionSource, collectionItems, currentFilters(), scope, extrasMap);
    }
  }

  function handleGenreChange(e) {
    const nextGenre = e.target.value;
    setFilterGenre(nextGenre);
    setFilterStyle(""); // style options depend on genre — a stale style could otherwise filter out everything
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, releasesOnly, sortMode, collectionSource, collectionItems, {
        genre: nextGenre,
        style: "",
        format: filterFormat,
      }, scope, extrasMap);
    }
  }

  function handleStyleChange(e) {
    const nextStyle = e.target.value;
    setFilterStyle(nextStyle);
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, releasesOnly, sortMode, collectionSource, collectionItems, {
        genre: filterGenre,
        style: nextStyle,
        format: filterFormat,
      }, scope, extrasMap);
    }
  }

  function handleFormatChange(e) {
    const nextFormat = e.target.value;
    setFilterFormat(nextFormat);
    if (hasSearched) {
      setPage(1);
      runSearch(submittedQuery, 1, releasesOnly, sortMode, collectionSource, collectionItems, {
        genre: filterGenre,
        style: filterStyle,
        format: nextFormat,
      }, scope, extrasMap);
    }
  }

  function openResult(r) {
    setSelected(r);
    setSelectedDetail(null);
    setSelectedImageIndex(0);
    setDetailError("");
    detailRequestRef.current?.abort();
    if (r.type === "master") {
      // Masters have no per-pressing detail (community stats, marketplace price, extra
      // images) to fetch — the search result already has everything we can show.
      setDetailLoading(false);
      return;
    }
    const controller = new AbortController();
    detailRequestRef.current = controller;
    setDetailLoading(true);
    discogsFetchDetail(r.resource_url, controller.signal)
      .then((detail) => {
        if (controller.signal.aborted) return;
        setSelectedDetail(detail);
        setDetailLoading(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setDetailError(e.message || "Couldn't load the full details for that release.");
        setDetailLoading(false);
      });
  }

  function closeModal() {
    detailRequestRef.current?.abort();
    setSelected(null);
    setSelectedDetail(null);
    setDetailError("");
  }

  const totalPages = pagination?.pages || 1;
  const filtersActive = isAnyFilterActive({ genre: filterGenre, style: filterStyle, format: filterFormat });

  return (
    <>
      <form style={styles.searchBar} onSubmit={handleSubmit}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder={
            collectionSource
              ? "Search, or leave blank to browse the whole collection…"
              : "Search, or set a filter below and leave blank to browse…"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          style={styles.searchButton}
          disabled={loading || (!query.trim() && !collectionSource && !filtersActive)}
        >
          {loading ? "Loading…" : query.trim() ? "Search" : "Browse all"}
        </button>
      </form>

      <div style={styles.searchFilterChipRow}>
        <select
          style={{ ...styles.searchFilterChip, ...(filterGenre !== "Any Genre" ? styles.searchFilterChipActive : {}) }}
          value={filterGenre}
          onChange={handleGenreChange}
        >
          {Object.keys(GENRE_STYLES).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          style={{ ...styles.searchFilterChip, ...(filterStyle ? styles.searchFilterChipActive : {}) }}
          value={filterStyle}
          onChange={handleStyleChange}
          disabled={filterStyleOptions.length === 0}
        >
          <option value="">Any Style</option>
          {filterStyleOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          style={{ ...styles.searchFilterChip, ...(filterFormat !== "Any Format" ? styles.searchFilterChipActive : {}) }}
          value={filterFormat}
          onChange={handleFormatChange}
        >
          {SEARCH_FORMAT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {collectionSource && (
        <>
          <div style={styles.scopeToggleRow} role="group" aria-label="Search scope">
            <button
              type="button"
              style={{ ...styles.scopeToggleButton, ...(scope === "in" ? styles.scopeToggleButtonActive : {}) }}
              onClick={() => changeScope("in")}
            >
              In collection
            </button>
            <button
              type="button"
              style={{ ...styles.scopeToggleButton, ...(scope === "out" ? styles.scopeToggleButtonActive : {}) }}
              onClick={() => changeScope("out")}
            >
              Outside collection
            </button>
            <button
              type="button"
              style={{ ...styles.scopeToggleButton, ...(scope === "both" ? styles.scopeToggleButtonActive : {}) }}
              onClick={() => changeScope("both")}
            >
              Both
            </button>
          </div>
          <p style={styles.modeNotice}>
            {scope === "in" &&
              `${hasSearched && !submittedQuery.trim() ? "Browsing" : "Searching within"} ${collectionSource.username}'s collection (${collectionItems?.length ?? 0} releases).`}
            {scope === "out" &&
              `Searching the Discogs catalog, outside ${collectionSource.username}'s collection (owned releases are hidden).`}
            {scope === "both" &&
              `Searching ${collectionSource.username}'s collection and the wider Discogs catalog.`}
          </p>
          {(scope === "in" || scope === "both") &&
            collectionItems &&
            collectionItems.length > 0 &&
            (() => {
              const enrichedCount = collectionItems.filter(
                (it) => it.basic_information?.id && it.basic_information.id in (extrasMap || {})
              ).length;
              return enrichedCount < collectionItems.length ? (
                <p style={styles.hintText}>
                  Pressing-country and barcode/runout data is still being gathered in the background ({enrichedCount}{" "}
                  of {collectionItems.length} releases so far) — searching by those will get more complete over
                  time. Catalog number is already fully searchable.
                </p>
              ) : null;
            })()}
        </>
      )}

      <div style={styles.searchControlsRow}>
        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={releasesOnly}
            onChange={handleToggleReleasesOnly}
            disabled={scope === "in"}
          />
          Releases only (hide masters)
        </label>
        <select style={styles.sortSelect} value={sortMode} onChange={handleSortChange}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {scope === "in" && (
        <p style={styles.hintText}>A connected collection only holds releases, so this filter doesn't apply.</p>
      )}

      {!hasSearched && !loading && (
        <p style={styles.hintText}>
          {collectionSource
            ? "Type something to search, or hit Browse all to page through the whole collection."
            : "Search Discogs directly, or set a genre/style/format filter and hit Browse all to page through matches with no text search."}
        </p>
      )}

      {loading && (
        <div style={styles.digBox}>
          <span style={styles.digSpinner} aria-hidden="true" />
          <span>{query.trim() ? "Searching…" : "Loading…"}</span>
        </div>
      )}

      {!loading && error && <div style={styles.errorBox}>{error}</div>}

      {!loading && scope === "both" && collectionPreview.length > 0 && (
        <div style={styles.collectionPreviewBox}>
          <p style={styles.collectionPreviewTitle}>
            In your collection {collectionPreviewTotal > BOTH_MODE_PREVIEW_COUNT ? `(${collectionPreviewTotal})` : ""}
          </p>
          <div style={styles.collectionPreviewRow}>
            {collectionPreview.map((p) => (
              <button
                type="button"
                key={`preview-${p.id}`}
                style={styles.collectionPreviewCard}
                onClick={() => openResult({ id: p.id, type: "release", title: p.title, cover_image: p.cover_image, year: p.year, format: p.format, uri: p.uri })}
              >
                <SmartImage src={p.cover_image} alt={p.title} style={styles.collectionPreviewCover} placeholderStyle={styles.coverPlaceholder} />
              </button>
            ))}
          </div>
          {collectionPreviewTotal > BOTH_MODE_PREVIEW_COUNT && (
            <button type="button" style={styles.collectionPreviewMore} onClick={() => changeScope("in")}>
              See all {collectionPreviewTotal} in collection →
            </button>
          )}
        </div>
      )}

      {!loading && hasSearched && !error && results.length === 0 && (
        <div style={styles.emptyBox}>
          {scope === "in"
            ? "Nothing in the collection matched that."
            : 'Nothing matched that search. Try a broader term, or turn off "Releases only."'}
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div style={styles.searchGrid} className="discovery-stagger">
            {results.map((r) => {
              const { artist, title } = splitArtistTitle(r, null);
              const tags = (r.style?.length ? r.style : r.genre) || [];
              return (
                <button
                  type="button"
                  key={`${r.type || "release"}-${r.id}`}
                  style={styles.searchCard}
                  onClick={() => openResult(r)}
                >
                  <SmartImage
                    src={r.cover_image}
                    alt={title || r.title}
                    style={styles.searchCardCover}
                    placeholderStyle={styles.coverPlaceholder}
                  />
                  <div style={styles.searchCardBody}>
                    <p style={styles.searchCardTitle}>{title || r.title}</p>
                    {artist && <p style={styles.searchCardArtist}>{artist}</p>}
                    <p style={styles.searchCardMeta}>
                      {[r.year, r.format?.[0]].filter(Boolean).join(" · ")}
                    </p>
                    {tags.length > 0 && (
                      <div style={styles.searchTagRow}>
                        {tags.slice(0, 2).map((t) => (
                          <span style={styles.searchTag} key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={styles.paginationRow}>
            <button
              type="button"
              style={{ ...styles.paginationButton, ...(page <= 1 ? styles.paginationButtonDisabled : {}) }}
              onClick={() => changePage(page - 1)}
              disabled={loading || page <= 1}
            >
              ← Prev
            </button>
            <span style={styles.pageIndicator}>Page {page} of {totalPages}</span>
            <button
              type="button"
              style={{ ...styles.paginationButton, ...(page >= totalPages ? styles.paginationButtonDisabled : {}) }}
              onClick={() => changePage(page + 1)}
              disabled={loading || page >= totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {selected && (
        <SearchResultModal
          result={selected}
          detail={selectedDetail}
          loading={detailLoading}
          error={detailError}
          imageIndex={selectedImageIndex}
          setImageIndex={setSelectedImageIndex}
          onClose={closeModal}
          loggedIn={loggedIn}
          alreadyOwned={ownedIds.has(selected.id)}
        />
      )}
    </>
  );
}

// Discogs doesn't host audio previews itself — the closest thing the release endpoint
// offers is a community-submitted `videos` list (almost always YouTube links, and not
// necessarily one per track, or in track order). We line these up with tracklist entries by
// loosely matching titles, so "Play" can show up next to the right song when Discogs has one.
function normalizeTrackTitle(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchTrackVideo(track, unmatchedVideos) {
  const norm = normalizeTrackTitle(track?.title);
  if (norm.length < 3) return null; // too short/generic ("Intro") to match safely
  const idx = unmatchedVideos.findIndex((v) => {
    const vNorm = normalizeTrackTitle(v.title);
    return vNorm.length >= 3 && (vNorm.includes(norm) || norm.includes(vNorm));
  });
  if (idx === -1) return null;
  return unmatchedVideos.splice(idx, 1)[0];
}

function youtubeEmbedId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function formatVideoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function TrackVideoPlayer({ video }) {
  const { styles } = useContext(PaletteContext);
  const videoId = youtubeEmbedId(video.uri);
  if (!videoId) {
    // Not a YouTube link (rare, but Discogs allows other hosts) — just link out instead.
    return (
      <a href={video.uri} target="_blank" rel="noreferrer" style={styles.link}>
        Listen: {video.title} →
      </a>
    );
  }
  return (
    <div style={styles.videoEmbedWrap}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={video.title}
        style={styles.videoEmbed}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Tracklist({ tracklist, videos }) {
  const { styles } = useContext(PaletteContext);
  const [playingKey, setPlayingKey] = useState(null);

  if (!tracklist || tracklist.length === 0) return null;

  // Consume videos as we match them left-to-right so the same video isn't offered twice,
  // then whatever's left over (no confident title match) still gets listed below.
  const remainingVideos = [...(videos || [])];
  const rows = tracklist.map((t, i) => ({
    ...t,
    key: `${t.position || ""}-${i}`,
    video: t.type_ === "track" || !t.type_ ? matchTrackVideo(t, remainingVideos) : null,
  }));

  return (
    <div style={styles.trackSection}>
      <h3 style={styles.trackSectionTitle}>Tracklist</h3>
      <div style={styles.trackList}>
        {rows.map((t) =>
          t.type_ === "heading" ? (
            <div key={t.key} style={styles.trackHeading}>{t.title}</div>
          ) : (
            <div key={t.key}>
              <div style={styles.trackRow}>
                <span style={styles.trackPosition}>{t.position}</span>
                <span style={styles.trackTitle}>
                  {t.title}
                  {t.extraartists?.length > 0 && (
                    <span style={styles.trackCredit}>
                      {" "}— {t.extraartists.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </span>
                <span style={styles.trackDuration}>{t.duration || ""}</span>
                {t.video && (
                  <button
                    type="button"
                    style={styles.trackPlayButton}
                    onClick={() => setPlayingKey((k) => (k === t.key ? null : t.key))}
                    aria-label={playingKey === t.key ? `Hide video for ${t.title}` : `Play ${t.title}`}
                  >
                    {playingKey === t.key ? "✕" : "▶"}
                  </button>
                )}
              </div>
              {playingKey === t.key && t.video && <TrackVideoPlayer video={t.video} />}
            </div>
          )
        )}
      </div>

      {remainingVideos.length > 0 && (
        <div style={styles.videoFallbackSection}>
          <h4 style={styles.trackSectionTitle}>Other videos</h4>
          {remainingVideos.map((v, i) => (
            <div key={`${v.uri}-${i}`}>
              <div style={styles.trackRow}>
                <span style={styles.trackTitle}>{v.title}</span>
                <span style={styles.trackDuration}>{formatVideoDuration(v.duration) || ""}</span>
                <button
                  type="button"
                  style={styles.trackPlayButton}
                  onClick={() => setPlayingKey((k) => (k === `extra-${i}` ? null : `extra-${i}`))}
                  aria-label={playingKey === `extra-${i}` ? `Hide video for ${v.title}` : `Play ${v.title}`}
                >
                  {playingKey === `extra-${i}` ? "✕" : "▶"}
                </button>
              </div>
              {playingKey === `extra-${i}` && <TrackVideoPlayer video={v} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Buttons to add the open release straight to the logged-in person's own Discogs collection
// or wantlist. Each button tracks its own idle/loading/done/error state so one succeeding
// (or failing) doesn't affect the other, and a completed add shows a plain confirmation
// rather than trying to reflect Discogs' state back with a toggle — this app has no reliable
// way to know if something was *removed* on Discogs' side since the collection was cached.
function CollectionActions({ releaseId, alreadyOwned }) {
  const { styles } = useContext(PaletteContext);
  const [state, setState] = useState({ collection: "idle", wantlist: "idle" });
  const [errorMsg, setErrorMsg] = useState({ collection: "", wantlist: "" });

  async function handleAdd(action) {
    setState((s) => ({ ...s, [action]: "loading" }));
    setErrorMsg((s) => ({ ...s, [action]: "" }));
    try {
      await addToDiscogs(action, releaseId);
      setState((s) => ({ ...s, [action]: "done" }));
    } catch (e) {
      setState((s) => ({ ...s, [action]: "error" }));
      setErrorMsg((s) => ({ ...s, [action]: e.message || "That didn't go through." }));
    }
  }

  function buttonLabel(action, doneLabel, idleLabel) {
    if (state[action] === "loading") return "Adding…";
    if (state[action] === "done") return doneLabel;
    return idleLabel;
  }

  return (
    <div style={styles.collectionActionsRow}>
      <button
        type="button"
        style={{ ...styles.collectionActionButton, ...(state.collection === "done" ? styles.collectionActionButtonDone : {}) }}
        onClick={() => handleAdd("collection")}
        disabled={state.collection === "loading" || state.collection === "done"}
      >
        {alreadyOwned && state.collection === "idle" ? "✓ In your collection" : buttonLabel("collection", "✓ Added", "+ Add to Collection")}
      </button>
      <button
        type="button"
        style={{ ...styles.collectionActionButton, ...(state.wantlist === "done" ? styles.collectionActionButtonDone : {}) }}
        onClick={() => handleAdd("wantlist")}
        disabled={state.wantlist === "loading" || state.wantlist === "done"}
      >
        {buttonLabel("wantlist", "✓ Added", "+ Add to Wantlist")}
      </button>
      {(errorMsg.collection || errorMsg.wantlist) && (
        <p style={styles.collectionActionError}>{errorMsg.collection || errorMsg.wantlist}</p>
      )}
    </div>
  );
}

function SearchResultModal({ result, detail, loading, error, imageIndex, setImageIndex, onClose, loggedIn, alreadyOwned }) {
  const { styles } = useContext(PaletteContext);
  const isMaster = result.type === "master";
  const images = detail?.images || [];
  const coverSrc = images[imageIndex]?.uri || images[imageIndex]?.uri150 || result.cover_image || null;
  const { artist, title } = splitArtistTitle(result, detail);
  const releaseUrl = "https://www.discogs.com" + (result.uri || "");
  const ratingInfo = detail?.community?.rating;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>

        <div style={styles.coverWrap}>
          <a href={releaseUrl} target="_blank" rel="noreferrer" style={styles.coverLink} aria-label={`View ${title} on Discogs`}>
            <SmartImage
              src={coverSrc}
              alt={title}
              style={styles.modalCover}
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

        <div style={styles.modalBody}>
          <h2 style={styles.cardTitle}>{title}</h2>
          {artist && <p style={styles.cardArtist}>{artist}</p>}

          {isMaster && (
            <p style={styles.modeNotice}>
              This is a master release, grouping several pressings — open it on Discogs to see individual versions.
            </p>
          )}

          {loggedIn && !isMaster && <CollectionActions releaseId={result.id} alreadyOwned={alreadyOwned} />}

          {(detail?.genres || result.genre || []).length > 0 && (
            <div style={styles.metaRow}>
              {(detail?.genres || result.genre).map((g) => (
                <span style={styles.genreTag} key={g}>{g}</span>
              ))}
            </div>
          )}
          {(detail?.styles || result.style || []).length > 0 && (
            <div style={styles.styleChipRow}>
              {(detail?.styles || result.style).map((s) => (
                <span style={styles.tag} key={s}>{s}</span>
              ))}
            </div>
          )}

          {loading && (
            <div style={styles.digBox}>
              <span style={styles.digSpinner} aria-hidden="true" />
              <span>Loading details…</span>
            </div>
          )}
          {!loading && error && <div style={styles.errorBox}>{error}</div>}

          {!loading && !error && (
            <>
              {ratingInfo && ratingInfo.count > 0 && (
                <p style={styles.metaLine}>
                  <span style={styles.stars}>{renderStars(ratingInfo.average)}</span>{" "}
                  <span style={styles.hintText}>{ratingInfo.average.toFixed(2)} ({ratingInfo.count} ratings)</span>
                </p>
              )}
              {detail?.community && (
                <p style={styles.metaLine}>
                  ❤ {detail.community.have ?? 0} have it &nbsp;·&nbsp; ☆ {detail.community.want ?? 0} want it
                </p>
              )}
              {(detail?.lowest_price != null || detail?.num_for_sale != null) && (
                <p style={styles.metaLine}>
                  <strong>Marketplace:</strong>{" "}
                  {detail?.lowest_price != null ? `from $${detail.lowest_price.toFixed(2)}` : "no active listings"}
                  {detail?.num_for_sale != null ? ` · ${detail.num_for_sale} for sale` : ""}
                </p>
              )}
              {((detail?.labels && detail.labels.length > 0) || (result.label && result.label.length > 0)) && (
                <p style={styles.metaLine}>
                  <strong>Label:</strong> {(detail?.labels?.map((l) => l.name) || result.label).join(", ")}
                </p>
              )}
              {(detail?.labels?.[0]?.catno || result.catno) && (
                <p style={styles.metaLine}>
                  <strong>Catalog #:</strong> {detail?.labels?.[0]?.catno || result.catno}
                </p>
              )}
              <p style={styles.cardSubline}>
                {[detail?.year || result.year, detail?.country || result.country, result.format?.[0]]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <Tracklist tracklist={detail?.tracklist} videos={detail?.videos} />
            </>
          )}

          <a href={releaseUrl} target="_blank" rel="noreferrer" style={styles.link}>
            View on Discogs →
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================== GAMES TAB ==============================

function GamesTab({ collectionSource, collectionItems }) {
  const { styles } = useContext(PaletteContext);
  const [game, setGame] = useState("genre"); // 'higherlower' | 'genre'

  return (
    <>
      {collectionSource && (
        <p style={styles.modeNotice}>Playing within {collectionSource.username}'s collection.</p>
      )}
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

      {game === "higherlower" ? (
        <HigherLowerGame collectionItems={collectionItems} />
      ) : (
        <GuessGenreGame collectionItems={collectionItems} />
      )}
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

async function drawValidRelease(statKey, excludeId, collectionItems, attempts) {
  const excluded = toIdSet(excludeId);

  if (collectionItems && collectionItems.length) {
    const maxCollectionAttempts = attempts ?? 20;
    const candidates = shuffle(
      collectionItems
        .map(collectionItemToPick)
        .filter((p) => p.id && !excluded.has(p.id) && !(p.master_id && excluded.has(p.master_id)))
    );
    for (let i = 0; i < Math.min(candidates.length, maxCollectionAttempts); i++) {
      const pick = candidates[i];
      try {
        const detail = await discogsFetchDetail(pick.resource_url);
        const value = getStatValue(detail, statKey);
        if (value != null) return { pick, detail, value };
      } catch {
        continue;
      }
    }
    return null;
  }

  // Plenty of obscure vinyl has no active listings, so price needs more swings to land one.
  const maxAttempts = attempts ?? (statKey === "price" ? 8 : 6);

  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) await sleep(150); // small gap between attempts eases pressure on the rate limit
    try {
      // A fully unfiltered vinyl search has tens of millions of matches, far more than our
      // page cap can meaningfully sample, so it ends up skewed toward whatever Discogs'
      // default ranking favors (heavily Electronic). Picking a random genre first and
      // searching within it keeps each genre's odds even instead.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const candidates = await randomReleaseSearch(
        { type: "release", format: "Vinyl", genre, year: String(randomGameYear()) },
        excluded
      );
      if (!candidates.length) continue;
      const pick = candidates[0];
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

function HigherLowerGame({ collectionItems }) {
  const { palette: PALETTE, styles } = useContext(PaletteContext);
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
      const first = await drawValidRelease(key, null, collectionItems);
      if (runIdRef.current !== runId) return; // a newer round took over
      if (!first) throw new Error("Couldn't find a release... Try waiting a second or just refreshing. Discogs is probably on a bathroom break.");
      const second = await drawValidRelease(key, first.pick.id, collectionItems);
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
  }, [collectionItems]);

  useEffect(() => {
    startNewRound(statKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statKey, collectionItems]);

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
          const next = await drawValidRelease(statKey, challenger.pick.id, collectionItems);
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
  const { palette: PALETTE, styles } = useContext(PaletteContext);
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

async function drawGenreRound(excludeId, collectionItems, attempts) {
  const excluded = toIdSet(excludeId);

  if (collectionItems && collectionItems.length) {
    const maxCollectionAttempts = attempts ?? 20;
    const candidates = shuffle(
      collectionItems
        .map(collectionItemToPick)
        .filter((p) => p.id && !excluded.has(p.id) && !(p.master_id && excluded.has(p.master_id)))
        .filter((p) => (p.genre || []).some((g) => GAME_GENRES.includes(g)))
    );
    for (let i = 0; i < Math.min(candidates.length, maxCollectionAttempts); i++) {
      const pick = candidates[i];
      let detail = null;
      try {
        detail = await discogsFetchDetail(pick.resource_url);
      } catch {
        continue;
      }
      if (!detail?.images?.length && !pick.cover_image) continue;
      return { pick, detail };
    }
    return null;
  }

  const maxAttempts = attempts ?? 6;
  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) await sleep(150);
    try {
      // Same fix as Higher/Lower: search within a randomly chosen genre each attempt so the
      // draw is spread evenly across genres instead of skewed by Discogs' default ranking.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const candidates = await randomReleaseSearch(
        { type: "release", format: "Vinyl", genre, year: String(randomGameYear()) },
        excluded
      );
      if (!candidates.length) continue;
      // The answer has to be one of the buttons on the grid, or the round is unwinnable.
      const pick = candidates.find((c) => (c.genre || []).some((g) => GAME_GENRES.includes(g)));
      if (!pick) continue;

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

function GuessGenreGame({ collectionItems }) {
  const { palette: PALETTE, styles } = useContext(PaletteContext);
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
      const next = await drawGenreRound(excludeId, collectionItems);
      if (runIdRef.current !== runId) return; // a newer round took over
      if (!next) throw new Error("Couldn't pull a fresh release right now. Try again in a moment. Most likely Discogs is just being lazy.");
      setRound(next);
    } catch (e) {
      if (runIdRef.current !== runId) return;
      setError(e.message || "Something went wrong. And by something, I mean Discogs... it's sooo lazy. Try refreshing.");
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, [collectionItems]);

  useEffect(() => {
    startRound(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionItems]);

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

// Takes the active palette so switching themes recomputes every style that depends on
// color; called once per palette change via useMemo in App, not on every render.
function buildStyles(PALETTE) {
  return {
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

  tabRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    borderBottom: `1px solid ${PALETTE.border}`,
  },
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

  collectionBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    padding: "12px 14px",
    marginBottom: 18,
    borderRadius: 10,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    fontSize: 13,
    color: PALETTE.primary,
  },
  collectionInput: {
    flex: 1,
    minWidth: 140,
    padding: "9px 10px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.bg,
    color: PALETTE.primary,
    fontSize: 13,
  },
  collectionConnectBtn: {
    padding: "9px 14px",
    borderRadius: 7,
    border: "none",
    background: PALETTE.accent,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  collectionChangeBtn: {
    marginLeft: "auto",
    padding: "6px 12px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.muted,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  collectionLoginBtn: {
    padding: "9px 14px",
    borderRadius: 7,
    border: `1px solid ${PALETTE.accentDark}`,
    background: PALETTE.card,
    color: PALETTE.accentDark,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  gameTabRow: { display: "flex", gap: 8, marginBottom: 18 },
  gameTabButton: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.muted}`,
    background: PALETTE.card,
    fontSize: 13,
    fontWeight: 600,
    color: PALETTE.muted,
    cursor: "pointer",
    outlineColor: PALETTE.accent,
    outlineOffset: 2,
  },
  gameTabButtonActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },

  scopeToggleRow: { display: "flex", gap: 8, marginTop: 10 },
  scopeToggleButton: {
    flex: 1,
    padding: "7px 8px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.muted}`,
    background: PALETTE.card,
    fontSize: 12.5,
    fontWeight: 600,
    color: PALETTE.muted,
    cursor: "pointer",
    outlineColor: PALETTE.accent,
    outlineOffset: 2,
  },
  scopeToggleButtonActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },

  collectionPreviewBox: {
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    margin: "10px 0",
    background: PALETTE.card,
  },
  collectionPreviewTitle: { fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: PALETTE.muted, margin: "0 0 8px" },
  collectionPreviewRow: { display: "flex", gap: 8, overflowX: "auto" },
  collectionPreviewCard: { border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0 },
  collectionPreviewCover: { width: 56, height: 56, borderRadius: 6, objectFit: "cover" },
  collectionPreviewMore: {
    display: "block",
    marginTop: 8,
    border: "none",
    background: "none",
    padding: 0,
    fontSize: 13,
    fontWeight: 700,
    color: PALETTE.accentDark,
    textDecoration: "underline",
    cursor: "pointer",
  },

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
    background: PALETTE.card,
    color: PALETTE.primary,
  },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginTop: 4, color: PALETTE.primary },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
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
    background: "#3A211D",
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
    background: "#3A2E19",
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
  cardArtistRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  wantlistButton: {
    marginLeft: "auto",
    marginBottom: 6,
    flexShrink: 0,
    width: 26,
    height: 26,
    borderRadius: 999,
    border: `1px solid ${PALETTE.accentDark}`,
    background: PALETTE.card,
    color: PALETTE.accentDark,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "24px",
    textAlign: "center",
    cursor: "pointer",
  },
  wantlistButtonDone: { background: PALETTE.accentDark, color: "#fff" },
  wantlistButtonError: { borderColor: PALETTE.danger, color: PALETTE.danger },
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
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    padding: "5px 10px",
    borderRadius: 999,
    color: PALETTE.primary,
    cursor: "pointer",
  },
  stars: { color: PALETTE.accent, fontSize: 14, letterSpacing: 1 },
  metaLine: { fontSize: 13, color: PALETTE.primary, margin: "6px 0" },
  link: { display: "inline-block", marginTop: 10, fontSize: 14, color: PALETTE.accentDark, fontWeight: 700, textDecoration: "underline" },
  expandToggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    marginRight: 12,
    border: "none",
    background: "none",
    padding: 0,
    fontSize: 14,
    fontWeight: 700,
    color: PALETTE.accentDark,
    textDecoration: "underline",
    cursor: "pointer",
  },
  expandToggleArrow: { display: "inline-block", transition: "transform 0.15s" },
  expandToggleArrowOpen: { transform: "rotate(180deg)" },

  trackSection: { marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PALETTE.border}` },
  trackSectionTitle: { fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: PALETTE.muted, margin: "0 0 8px" },
  trackList: { display: "flex", flexDirection: "column", gap: 2 },
  trackHeading: { fontSize: 12, fontWeight: 700, color: PALETTE.accentDark, margin: "10px 0 2px" },
  trackRow: { display: "flex", alignItems: "baseline", gap: 8, padding: "5px 0", fontSize: 13.5 },
  trackPosition: { color: PALETTE.muted, minWidth: 24, fontSize: 12 },
  trackTitle: { flex: 1, color: PALETTE.primary },
  trackCredit: { color: PALETTE.muted, fontSize: 12 },
  trackDuration: { color: PALETTE.muted, fontSize: 12, fontVariantNumeric: "tabular-nums" },
  trackPlayButton: {
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.accentDark,
    borderRadius: 999,
    width: 26,
    height: 26,
    fontSize: 12,
    lineHeight: "24px",
    textAlign: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  videoEmbedWrap: { position: "relative", width: "100%", paddingTop: "56.25%", margin: "6px 0 10px", borderRadius: 8, overflow: "hidden", background: "#000" },
  videoEmbed: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 },
  videoFallbackSection: { marginTop: 12 },

  collectionActionsRow: { display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0" },
  collectionActionButton: {
    flex: "1 1 auto",
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.accentDark}`,
    background: PALETTE.card,
    color: PALETTE.accentDark,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  collectionActionButtonDone: { background: PALETTE.accentDark, color: "#fff" },
  collectionActionError: { flexBasis: "100%", fontSize: 12, color: PALETTE.danger || "#c0392b", margin: "2px 0 0" },

  historySection: { marginTop: 24 },
  discoveryModeRow: { display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" },
  modeButton: {
    flex: 1,
    minWidth: 110,
    padding: "10px 10px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
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
    background: PALETTE.card,
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
    background: PALETTE.card,
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
    background: PALETTE.card,
    color: PALETTE.muted,
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
    background: PALETTE.card,
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  searchBar: { display: "flex", gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.primary,
    fontSize: 14,
  },
  searchButton: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: PALETTE.accent,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  searchFilterChipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  searchFilterChip: {
    fontSize: 12,
    fontWeight: 600,
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    padding: "6px 10px",
    borderRadius: 999,
    color: PALETTE.muted,
    maxWidth: 140,
  },
  searchFilterChipActive: { background: PALETTE.accent, color: "#fff", borderColor: PALETTE.accent },
  searchControlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  sortSelect: {
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.muted,
    fontSize: 13,
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginTop: 4,
  },
  searchCard: {
    textAlign: "left",
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    font: "inherit",
    color: "inherit",
  },
  searchCardCover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: PALETTE.border, display: "block" },
  searchCardBody: { padding: "10px 12px 12px" },
  searchCardTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    margin: "0 0 2px",
    lineHeight: 1.25,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  searchCardArtist: {
    fontSize: 12.5,
    fontWeight: 600,
    color: PALETTE.accentDark,
    margin: "0 0 4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  searchCardMeta: { fontSize: 11.5, color: PALETTE.muted, margin: "0 0 6px" },
  searchTagRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  searchTag: {
    fontSize: 10.5,
    fontWeight: 600,
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    padding: "2px 7px",
    borderRadius: 999,
    color: PALETTE.muted,
  },
  paginationRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 },
  paginationButton: {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.primary,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  paginationButtonDisabled: { opacity: 0.4, cursor: "default" },
  pageIndicator: { fontSize: 13, color: PALETTE.muted },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modalCard: {
    position: "relative",
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    maxWidth: 420,
    width: "100%",
    maxHeight: "88vh",
    overflowY: "auto",
    animation: "discoveryCardReveal 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
  modalCover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: PALETTE.border, display: "block" },
  modalBody: { padding: "18px 20px 20px" },
  };
}
