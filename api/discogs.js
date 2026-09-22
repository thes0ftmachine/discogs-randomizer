import { readSignedCookie } from "./_lib/cookies.js";
import { signedRequestHeader } from "./_lib/discogsAuth.js";

const DISCOGS_BASE = "https://api.discogs.com";
const USER_AGENT = "RandomDiscovery/1.0";

function sendError(res, status, message, retryAfter) {
  if (retryAfter) res.setHeader("Retry-After", retryAfter);
  return res.status(status).json({ error: message });
}

// Discogs' own message field is sometimes missing on throttling responses (an empty body,
// or a non-JSON edge/CDN page that our .json().catch(() => ({})) above turns into {}), which
// is how a real rate limit ends up surfacing to the user as an opaque "could not complete
// that request." Naming 429 explicitly here means that case always gets an accurate,
// actionable message regardless of what Discogs actually sent back.
function upstreamErrorMessage(status, data, kind) {
  if (status === 429) {
    return "Discogs is rate-limiting this connection right now. This happens on large collections — it will retry automatically.";
  }
  if (status === 404 && kind === "collection") {
    return "That collection is private or the username doesn't exist.";
  }
  return data.message || "Discogs could not complete that request.";
}

// Discogs' rate limit is a moving 60s window, not a hard per-request quota — so instead of
// only reacting after we get throttled, forward what Discogs told us about our remaining
// budget on *every* response. The client uses this to slow itself down proactively while
// paging a large collection, rather than firing requests as fast as possible until it trips
// the limit.
function forwardRateLimitHeaders(upstream, res) {
  const remaining = upstream.headers.get("x-discogs-ratelimit-remaining");
  const limit = upstream.headers.get("x-discogs-ratelimit");
  if (remaining != null) res.setHeader("X-Discogs-Ratelimit-Remaining", remaining);
  if (limit != null) res.setHeader("X-Discogs-Ratelimit", limit);
}

export default async function handler(req, res) {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) return sendError(res, 500, "The Discogs connection has not been configured.");
  const { kind, id, username, ...params } = req.query;

  // Authenticated path: the logged-in person's own collection, which may be private.
  // Ignores any username in the query on purpose — this always resolves to whoever the
  // session cookie says is logged in, so there's no way to request someone else's private
  // data by editing the query string.
  if (kind === "my-collection") {
    const session = readSignedCookie(req, "discogs_session");
    if (!session) return sendError(res, 401, "Not logged in to Discogs.");

    const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
    const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) return sendError(res, 500, "Discogs login has not been configured.");

    const url = new URL(`/users/${session.username}/collection/folders/0/releases`, DISCOGS_BASE);
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") url.searchParams.set(key, value);
    });

    const authHeader = signedRequestHeader({
      method: "GET",
      url: url.toString(),
      consumerKey,
      consumerSecret,
      token: session.token,
      tokenSecret: session.tokenSecret,
    });

    try {
      const upstream = await fetch(url, { headers: { Authorization: authHeader, "User-Agent": USER_AGENT } });
      const retryAfter = upstream.headers.get("retry-after");
      forwardRateLimitHeaders(upstream, res);
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return sendError(res, upstream.status, upstreamErrorMessage(upstream.status, data, kind), retryAfter);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(data);
    } catch {
      return sendError(res, 502, "Discogs is temporarily unavailable. Please try again.");
    }
  }

  const validUsername = /^[\w-]{1,50}$/.test(String(username || ""));
  const path =
    kind === "search" ? "/database/search"
    : kind === "release" && /^\d+$/.test(String(id || "")) ? `/releases/${id}`
    : kind === "collection" && validUsername ? `/users/${username}/collection/folders/0/releases`
    : null;
  if (!path) return sendError(res, 400, "Invalid Discogs request.");

  const url = new URL(path, DISCOGS_BASE);
  if (kind === "search" || kind === "collection") {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") url.searchParams.set(key, value);
    });
  }
  url.searchParams.set("token", token);

  try {
    const upstream = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const retryAfter = upstream.headers.get("retry-after");
    forwardRateLimitHeaders(upstream, res);
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return sendError(res, upstream.status, upstreamErrorMessage(upstream.status, data, kind), retryAfter);
    res.setHeader("Cache-Control", kind === "release" ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
    return res.status(200).json(data);
  } catch {
    return sendError(res, 502, "Discogs is temporarily unavailable. Please try again.");
  }
}
