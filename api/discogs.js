const DISCOGS_BASE = "https://api.discogs.com";
function sendError(res, status, message, retryAfter) {
  if (retryAfter) res.setHeader("Retry-After", retryAfter);
  return res.status(status).json({ error: message });
}
export default async function handler(req, res) {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) return sendError(res, 500, "The Discogs connection has not been configured.");
  const { kind, id, ...params } = req.query;
  const path = kind === "search" ? "/database/search" : kind === "release" && /^\d+$/.test(String(id || "")) ? /releases/${id} : null;
  if (!path) return sendError(res, 400, "Invalid Discogs request.");
  const url = new URL(path, DISCOGS_BASE);
  if (kind === "search") Object.entries(params).forEach(([key, value]) => { if (typeof value === "string") url.searchParams.set(key, value); });
  url.searchParams.set("token", token);
  try {
    const upstream = await fetch(url, { headers: { "User-Agent": "RandomDiscovery/1.0" } });
    const retryAfter = upstream.headers.get("retry-after");
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return sendError(res, upstream.status, data.message || "Discogs could not complete that request.", retryAfter);
    res.setHeader("Cache-Control", kind === "release" ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
