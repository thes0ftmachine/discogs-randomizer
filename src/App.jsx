import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ---- Controlled vocab (mirrors Discogs' own genre/style taxonomy, trimmed to common picks) ----
const GENRE_STYLES = {
  "Any Genre": [],
"Blues": [
    "Chicago Blues",
    "Delta Blues",
    "Electric Blues"
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
    "Country",
    "Flamenco",
    "Folk",
    "Latin"
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
    "Avant-garde Jazz",
    "Big Band",
    "Bop",
    "Free Jazz",
    "Fusion",
    "Latin Jazz",
    "Modal",
    "Post Bop",
    "Soul-Jazz"
  ],
  "Latin": [
    "Boogaloo",
    "Bossa Nova",
    "Cumbia",
    "MPB",
    "Salsa"
  ],
  "Pop": [
    "Ballad",
    "Bubblegum",
    "Chanson",
    "City Pop",
    "Europop",
    "Indie Pop",
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
    "Black Metal",
    "Death Metal",
    "Doom Metal",
    "Folk Rock",
    "Garage Rock",
    "Heavy Metal",
    "Krautrock",
    "Nu Metal",
    "Post-Punk",
    "Prog Rock",
    "Psychedelic Rock",
    "Punk",
    "Shoegaze",
    "Sludge Metal",
    "Speed Metal",
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

// token should allow more api calls per minute
const DISCOGS_TOKEN = "OuCkuNqsWZqxcNAePtBpdrvpkIQlVbBJOqgzJDpo";

function randomYearInDecade(decade) {
  if (decade === "Any Decade") return null;
  const start = parseInt(decade.slice(0, 4), 10);
  return start + Math.floor(Math.random() * 10);
}

async function discogsFetch(params) {
  const finalParams = DISCOGS_TOKEN ? { ...params, token: DISCOGS_TOKEN } : params;
  const url = "https://api.discogs.com/database/search?" + new URLSearchParams(finalParams).toString();
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 429) throw new Error("Discogs is rate-limiting us right now — wait a few seconds and try again.");
    throw new Error("Discogs lookup failed (" + res.status + ").");
  }
  return res.json();
}

// The search endpoint's cover_image is unreliable (often a stale or generic spacer
// image). Following up on the release's own resource_url gives the real images array
// plus fields the search endpoint doesn't return at all, like lowest_price / community.rating.
async function discogsFetchDetail(resourceUrl) {
  const url = DISCOGS_TOKEN
    ? resourceUrl + (resourceUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(DISCOGS_TOKEN)
    : resourceUrl;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Couldn't load release detail (" + res.status + "). I think Discogs is on break. Try refreshing in a second.");
  return res.json();
}

// Shared random-pick engine: probe for total matches, jump to a random page, grab one item.
async function randomReleaseSearch(baseParams, excludeId) {
  const probeParams = { ...baseParams, per_page: "1", page: "1" };
  const probe = await discogsFetch(probeParams);
  const totalItems = probe?.pagination?.items || 0;
  if (totalItems === 0) return null;

  const perPage = 50;
  const totalPages = Math.min(Math.ceil(totalItems / perPage), 400);
  const targetPage = 1 + Math.floor(Math.random() * totalPages);

  const pageParams = { ...baseParams, per_page: String(perPage), page: String(targetPage) };
  const pageData = await discogsFetch(pageParams);
  let items = (pageData.results || []).filter((r) => r.type === "release" || !r.type);
  if (excludeId) items = items.filter((r) => r.id !== excludeId);
  if (items.length === 0) return null;

  return items[Math.floor(Math.random() * items.length)];
}

export default function App() {
  const [tab, setTab] = useState("discover"); // 'discover' | 'games'

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Random Discovery</h1>
          <p style={styles.subtitle}>Explore the depths of Discogs releases at random (kind of) or play a few mini games.</p>
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [detail, setDetail] = useState(null);
  const [emptyNotice, setEmptyNotice] = useState("");
  const [history, setHistory] = useState([]);

  const formRef = useRef(null);
  const resultRef = useRef(null);

  const styleOptions = useMemo(() => GENRE_STYLES[genre] || [], [genre]);

  // Once a result lands, bring the card to the top of the viewport — handy on mobile where
  // the filter form pushes the card below the fold.
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

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

  async function findRelease() {
    setLoading(true);
    setError("");
    setEmptyNotice("");
    setResult(null);
    setDetail(null);
    try {
      const year = randomYearInDecade(decade);
      const baseParams = buildParams(year);
      const needsClientFormatCheck = formats.length > 1;
      const needsRatingCheck = minRating > 0;
      // Even with no extra filters, give it a few attempts — Discogs' search endpoint
      // occasionally throws a transient 404/429 on an otherwise valid request, and a single
      // hiccup shouldn't kill the whole search.
      const maxAttempts = needsClientFormatCheck || needsRatingCheck ? 10 : 4;

      let found = null;
      let foundDetail = null;
      let anyResultsAtAll = false;

      for (let i = 0; i < maxAttempts; i++) {
        if (i > 0) await sleep(150);

        let pick;
        try {
          pick = await randomReleaseSearch(baseParams);
        } catch (e) {
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

        if (needsRatingCheck) {
          try {
            const full = await discogsFetchDetail(pick.resource_url);
            const rating = full.community?.rating;
            if (!rating || rating.count === 0 || rating.average < minRating) continue;
            found = pick;
            foundDetail = full;
            break;
          } catch {
            continue;
          }
        } else {
          found = pick;
          break;
        }
      }

      if (!found) {
        setEmptyNotice(
          anyResultsAtAll
            ? "Found matches for genre/style/decade/country, but couldn't find one that also cleared the format or rating filter after several tries. Try loosening the rating minimum or format selection."
            : "Nothing matched that combination. Try loosening a filter — style and country are the most restrictive."
        );
        setLoading(false);
        return;
      }

      setResult(found);
      setHistory((h) => [found, ...h].slice(0, 6));
      setLoading(false);

      if (foundDetail) {
        setDetail(foundDetail);
      } else if (found.resource_url) {
        try {
          const full = await discogsFetchDetail(found.resource_url);
          setDetail(full);
        } catch {
          // Non-fatal — card still renders with the search result's fallback fields.
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Don't blame me. It's more than likely Discogs. Try again in a second.");
      setLoading(false);
    }
  }

  const coverSrc = detail?.images?.[0]?.uri || detail?.images?.[0]?.uri150 || result?.cover_image || null;

  return (
    <>
      <div style={styles.form} ref={formRef}>
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
          <select style={styles.select} value={decade} onChange={(e) => setDecade(e.target.value)}>
            {DECADES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
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

        <button style={styles.button} onClick={findRelease} disabled={loading}>
          {loading ? "Digging…" : "Find something"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {emptyNotice && <div style={styles.emptyBox}>{emptyNotice}</div>}

      {result && (
        <div style={styles.card} ref={resultRef}>
          {coverSrc ? (
            <img src={coverSrc} alt={result.title} style={styles.cover} />
          ) : (
            <div style={{ ...styles.cover, ...styles.coverPlaceholder }}>No image</div>
          )}
          <div style={styles.cardBody}>
            <h2 style={styles.cardTitle}>{result.title}</h2>
            <div style={styles.metaRow}>
              {result.year ? <span style={styles.tag}>{result.year}</span> : null}
              {result.country ? <span style={styles.tag}>{result.country}</span> : null}
              {(result.format || []).slice(0, 3).map((f) => (
                <span style={styles.tag} key={f}>{f}</span>
              ))}
            </div>
            {result.label && result.label.length > 0 && (
              <p style={styles.metaLine}><strong>Label:</strong> {result.label.join(", ")}</p>
            )}
            {result.style && result.style.length > 0 && (
              <p style={styles.metaLine}><strong>Style:</strong> {result.style.join(", ")}</p>
            )}
            {result.community && (
              <p style={styles.metaLine}>
                <strong>Discogs community:</strong> {result.community.have ?? 0} have it, {result.community.want ?? 0} want it
              </p>
            )}
            {detail && (detail.lowest_price != null || detail.num_for_sale != null) && (
              <p style={styles.metaLine}>
                <strong>Marketplace:</strong>{" "}
                {detail.lowest_price != null ? `from $${detail.lowest_price.toFixed(2)}` : "no active listings"}
                {detail.num_for_sale != null ? ` · ${detail.num_for_sale} for sale` : ""}
              </p>
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
              <div key={h.id} style={styles.historyItem} title={h.title}>
                {h.thumb ? <img src={h.thumb} alt={h.title} style={styles.historyThumb} /> : <div style={{ ...styles.historyThumb, background: "#e5e5e5" }} />}
                <span style={styles.historyLabel}>{h.title}</span>
              </div>
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

async function drawValidRelease(statKey, excludeId, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(150); // small gap between attempts eases pressure on the unauthenticated rate limit
    try {
      // A fully unfiltered vinyl search has tens of millions of matches, far more than our
      // page cap can meaningfully sample, so it ends up skewed toward whatever Discogs'
      // default ranking favors (heavily Electronic). Picking a random genre first and
      // searching within it keeps each genre's odds even instead.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const pick = await randomReleaseSearch({ type: "release", format: "Vinyl", genre }, excludeId);
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

  const startNewRound = useCallback(async (key) => {
    setLoading(true);
    setError("");
    setRevealed(false);
    setLastCorrect(null);
    setScore(0);
    try {
      const first = await drawValidRelease(key, null);
      if (!first) throw new Error("Couldn't find a release... Try waiting a second or just refreshing. Discogs is probably on a bathroom break.");
      const second = await drawValidRelease(key, first.pick.id);
      if (!second) throw new Error("Couldn't find a second release with that stat available so try refreshing. Discogs likes to throw fits like this.");
      setChampion(first);
      setChallenger(second);
    } catch (e) {
      setError(e.message || "Something went wrong. Likely because of Discogs... try again in a few seconds.");
    } finally {
      setLoading(false);
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
          <GameCard release={champion} statMeta={statMeta} role="Champion" statRevealed value={champion.value} />
          <div style={styles.vsCol}>
            <span style={styles.vsText}>vs</span>
          </div>
          <GameCard
            release={challenger}
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
    <div style={styles.gameCard}>
      <span style={styles.roleLabel}>{role}</span>
      {cover ? (
        <img src={cover} alt={pick.title} style={styles.gameCover} />
      ) : (
        <div style={{ ...styles.gameCover, ...styles.coverPlaceholder }}>No image</div>
      )}
      <div style={styles.gameCardBody}>
        <p style={styles.gameCardTitle}>{pick.title}</p>
        <p style={styles.gameCardStat}>
          {statRevealed ? statMeta.format(value) : "??? " + statMeta.label}
        </p>
        {resultBanner && (
          <p style={{ ...styles.resultBanner, color: resultBanner === "Correct!" ? "#1e7d32" : "#b3261e" }}>
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

async function drawGenreRound(excludeId, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(150);
    try {
      // Same fix as Higher/Lower: search within a randomly chosen genre each attempt so the
      // draw is spread evenly across genres instead of skewed by Discogs' default ranking.
      const genre = GAME_GENRES[Math.floor(Math.random() * GAME_GENRES.length)];
      const pick = await randomReleaseSearch({ type: "release", format: "Vinyl", genre }, excludeId);
      if (!pick) continue;
      if (!pick.genre || pick.genre.length === 0) continue;
      const detail = await discogsFetchDetail(pick.resource_url);
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

  const startRound = useCallback(async (excludeId) => {
    setLoading(true);
    setError("");
    setPhase("guessing");
    setGuessedGenre(null);
    setBonusChoice("");
    setBonusStatus(null);
    setImageIndex(0);
    try {
      const next = await drawGenreRound(excludeId);
      if (!next) throw new Error("Couldn't pull a fresh release right now. Try again in a moment. Most likely Discogs is just being lazy.");
      setRound(next);
    } catch (e) {
      setError(e.message || "Something went wrong. And by something, I mean Discogs... it's sooo lazy. Try refreshing.");
    } finally {
      setLoading(false);
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
        <div style={styles.genreCard}>
          <div style={styles.coverWrap}>
            {cover ? (
              <img src={cover} alt={phase === "revealed" ? round.pick.title : "Guess the genre"} style={styles.genreCover} />
            ) : (
              <div style={{ ...styles.genreCover, ...styles.coverPlaceholder }}>No image</div>
            )}
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
              <p style={{ ...styles.genreResultLine, color: genreCorrect ? "#1e7d32" : "#b3261e" }}>
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
                <p style={{ ...styles.genreResultLine, color: bonusStatus === "correct" ? "#1e7d32" : "#666" }}>
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
    background: "#fafafa",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    color: "#1a1a1a",
    padding: "32px 16px",
  },
  container: { maxWidth: 560, margin: "0 auto" },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 6 },

  tabRow: { display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e5e5e5" },
  tabButton: {
    padding: "10px 4px",
    marginRight: 16,
    border: "none",
    borderBottom: "2px solid transparent",
    background: "none",
    fontSize: 15,
    fontWeight: 600,
    color: "#888",
    cursor: "pointer",
  },
  tabButtonActive: { color: "#1a1a1a", borderBottomColor: "#1a1a1a" },

  gameTabRow: { display: "flex", gap: 8, marginBottom: 18 },
  gameTabButton: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #d4d4d4",
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
  },
  gameTabButtonActive: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },

  comingSoon: {
    background: "#fff",
    border: "1px dashed #d4d4d4",
    borderRadius: 10,
    padding: 18,
  },

  form: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  fieldRow: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 0.4 },
  select: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    fontSize: 14,
    background: "#fff",
  },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginTop: 4 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #d4d4d4",
    background: "#fff",
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
  },
  chipActive: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },
  slider: { width: "100%", marginTop: 4 },
  hintText: { fontSize: 12, color: "#888", marginTop: 4, lineHeight: 1.4 },
  button: {
    marginTop: 8,
    padding: "12px 16px",
    borderRadius: 6,
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    background: "#fdecea",
    color: "#8a1f11",
    fontSize: 14,
  },
  emptyBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    background: "#fff8e1",
    color: "#7a5c00",
    fontSize: 14,
  },
  card: {
    marginTop: 20,
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: "#f0f0f0" },
  coverPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 13 },
  cardBody: { padding: 18 },
  cardTitle: { fontSize: 19, fontWeight: 700, margin: "0 0 10px" },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  tag: {
    fontSize: 12,
    background: "#f0f0f0",
    padding: "4px 8px",
    borderRadius: 999,
    color: "#444",
  },
  metaLine: { fontSize: 13, color: "#444", margin: "4px 0" },
  link: { display: "inline-block", marginTop: 10, fontSize: 14, color: "#1a1a1a", fontWeight: 600, textDecoration: "underline" },
  historySection: { marginTop: 24 },
  backToFiltersButton: {
    display: "block",
    width: "100%",
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    background: "#fff",
    color: "#555",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  historyTitle: { fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 8 },
  historyRow: { display: "flex", gap: 10, overflowX: "auto" },
  historyItem: { display: "flex", flexDirection: "column", alignItems: "center", width: 64 },
  historyThumb: { width: 56, height: 56, objectFit: "cover", borderRadius: 6 },
  historyLabel: { fontSize: 10, color: "#777", marginTop: 4, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" },

  statToggleRow: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  statToggleButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #d4d4d4",
    background: "#fff",
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
  },
  statToggleButtonActive: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },

  scoreRow: { display: "flex", gap: 16, fontSize: 13, color: "#555", marginBottom: 14 },

  duelRow: { display: "flex", alignItems: "stretch", gap: 8 },
  vsCol: { display: "flex", alignItems: "center", justifyContent: "center", width: 28 },
  vsText: { fontSize: 12, fontWeight: 700, color: "#999" },

  gameCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #e5e5e5",
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
    color: "#666",
    background: "#f0f0f0",
  },
  gameCover: { width: "100%", height: 180, objectFit: "cover", background: "#f0f0f0" },
  gameCardBody: { padding: 12 },
  gameCardTitle: { fontSize: 13, fontWeight: 700, margin: "0 0 6px", minHeight: 34, overflow: "hidden" },
  gameCardStat: { fontSize: 14, fontWeight: 700, margin: 0, color: "#1a1a1a" },
  resultBanner: { fontSize: 12, fontWeight: 700, margin: "8px 0 0" },

  guessRow: { display: "flex", gap: 10, marginTop: 14 },
  guessButton: {
    flex: 1,
    padding: "12px 10px",
    borderRadius: 6,
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  genreCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    overflow: "hidden",
  },
  genreCover: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: "#f0f0f0", display: "block" },
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
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    background: "#fafafa",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#333",
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
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    fontSize: 14,
    background: "#fff",
  },
  bonusButton: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  bonusSkip: {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    background: "#fff",
    color: "#666",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
