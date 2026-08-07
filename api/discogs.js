import { readSignedCookie } from "./_lib/cookies.js";
import { signedRequestHeader } from "./_lib/discogsAuth.js";

const DISCOGS_BASE = "https://api.discogs.com";
const USER_AGENT = "RandomDiscovery/1.0";

function sendError(res, status, message, retryAfter) {
  if (retryAfter) res.setHeader("Retry-After", retryAfter);
  return res.status(status).json({ error: message });
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
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return sendError(res, upstream.status, data.message || "Discogs could not complete that request.", retryAfter);
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
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message =
        upstream.status === 404 && kind === "collection"
          ? "That collection is private or the username doesn't exist."
          : data.message || "Discogs could not complete that request.";
      return sendError(res, upstream.status, message, retryAfter);
    }
    res.setHeader("Cache-Control", kind === "release" ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
    return res.status(200).json(data);
  } catch {
    return sendError(res, 502, "Discogs is temporarily unavailable. Please try again.");
  }
}
