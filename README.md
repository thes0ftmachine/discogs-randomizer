# Random Discovery

## Deploying securely on Vercel

1. Revoke the Discogs token that was previously committed to the browser app and create a replacement.
2. In Vercel, open **Project Settings → Environment Variables** and add it as `DISCOGS_TOKEN` for Production, Preview, and Development.
3. Redeploy. The Vercel function at `/api/discogs` keeps the token server-side; never create a `VITE_DISCOGS_TOKEN` variable.

The client calls the same-origin Vercel function for searches and release details. Release details are cached by Vercel and in the browser session to reduce Discogs requests.
