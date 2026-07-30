const DISCOGS_BASE = "https://api.discogs.com";

function sendError(res, status, message, retryAfter) {
  if (retryAfter) res.setHeader("Retry-After", retryAfter);
  return res.status(status).json({ error: message });
}

export default async function handler(req, res) {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) return sendError(res, 500, "The Discogs connection has not been configured.");

  const { kind, id, ...params } = req.query;

  const path =
    kind === "search" ? "/database/search" :
    kind === "release" && /^\d+$/.test(String(id || "")) ? `/releases/${id}` :
    kind === "artistReleases" && /^\d+$/.test(String(id || "")) ? `/artists/${id}/releases` :
    null;

  if (!path) return sendError(res, 400, "Invalid Discogs request.");

  const url = new URL(path, DISCOGS_BASE);
  // search and artistReleases both take query params (page, per_page, sort, genre, q, etc.) —
  // release lookups are id-only, so there's nothing to forward there.
  if (kind === "search" || kind === "artistReleases") {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") url.searchParams.set(key, value);
    });
  }
  url.searchParams.set("token", token);

  try {
    const upstream = await fetch(url, { headers: { "User-Agent": "RandomDiscovery/1.0" } });
    const retryAfter = upstream.headers.get("retry-after");
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return sendError(res, upstream.status, data.message || "Discogs could not complete that request.", retryAfter);
    // Artist discographies don't change minute-to-minute — cache like release detail does.
    res.setHeader("Cache-Control", kind === "release" || kind === "artistReleases" ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
    return res.status(200).json(data);
  } catch {
    return sendError(res, 502, "Discogs is temporarily unavailable (because it's rubbish). Please try again.");
  }
}
