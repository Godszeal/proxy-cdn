# ZST CDN Proxy

A lightweight Next.js API that proxies arbitrary URLs with CDN-style response headers, optimized for video streaming and media playback. Deploy anywhere Node.js runs — VPS, Railway, Docker, or any Node.js hosting platform.

- Exposes: `GET` and `HEAD /api/proxy?url=<target-url>` plus CORS preflight via `OPTIONS`.
- Preserves byte-range requests and response metadata for browser video playback.
- Works with signed media URLs and handles referer/Origin fallbacks automatically.
- Standalone Next.js build for portable deployment.

### Stats
- **Size**: ~87kB first load JS
- **Routes**: `/api/proxy` (dynamic), `/` (static)
- **Runtime**: Edge-compatible, also works with standalone Node.js
- **Dependencies**: Next.js 14, React 18 (no external proxy libraries)

## Features
- Simple single endpoint proxy for fetching remote URLs.
- Applies hardened headers meant for CDN consumption (cache control, security headers).
- Small Next.js codebase deployable on any Node.js hosting platform.
- Automatic retry on 429/502/503/504 with exponential backoff.
- Test mode endpoint (`?test=true`) for health checks.
- Range request support for video streaming.
- CORS enabled for cross-origin media playback.

## Requirements
- Node.js (recommended v18+)
- npm or yarn
- A hosting platform account (VPS, Railway, Render, Fly.io, etc.)

## Quick start

### Run locally
1. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```
2. Start the Next.js dev server
   ```bash
   npm run dev
   # or
   yarn dev
   ```
3. Visit `http://localhost:3000/api/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png` (URL must be encoded)

### Deploy anywhere

This project uses `output: "standalone"` in `next.config.js`, which creates a portable build with all dependencies bundled. You can deploy it on any Node.js hosting platform.

### Deploy on Vercel
1. Push this folder to a GitHub repository.
2. Import the repository into Vercel (https://vercel.com/new).
3. Vercel will auto-detect Next.js and run `npm install && npm run build`.
4. No custom start command is needed; Vercel handles serverless functions automatically.
5. Deploy. Vercel will provide a URL like `https://zst-cdn-proxy.vercel.app`.

#### Deploy on VPS / Dedicated Server
1. Push this folder to your server or clone the repository.
2. Install dependencies: `npm install`
3. Build the app: `npm run build`
4. Start the production server:
   ```bash
   node .next/standalone/server.js
   ```
5. (Optional) Use PM2 or systemd to keep it running:
   ```bash
   pm2 start .next/standalone/server.js --name "cdn-proxy"
   ```

#### Deploy on Railway
1. Push this folder to a GitHub repository.
2. Create a new Railway project and connect your GitHub repo.
3. Railway will auto-detect the Node.js app and run `npm install && npm run build`.
4. Set the start command to: `node .next/standalone/server.js`
5. Deploy. Railway will provide a URL like `https://your-app.up.railway.app`.

#### Deploy on Render
1. Push this folder to a GitHub repository.
2. Create a new Render Web Service and connect your GitHub repo.
3. Set the build command: `npm run build`
4. Set the start command: `node .next/standalone/server.js`
5. Deploy. Render will provide a URL like `https://your-app.onrender.com`.

#### Deploy on Fly.io
1. Install the Fly CLI and authenticate.
2. Run `fly launch` in the project directory.
3. Choose a deployment region and confirm.
4. Fly will deploy the app automatically.

#### Deploy with Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Configuration

The following environment variables are supported. Add them in your hosting platform's environment settings or in a local `.env` file.

- `ALLOWED_HOSTS` (optional) — comma-separated hostnames allowed to be proxied. When unset, all HTTP(S) hosts are accepted; set this in production to reduce SSRF exposure.
- `UPSTREAM_USER_AGENT` (optional) — explicit User-Agent to send upstream. Defaults to `okhttp/4.12.0`.
- `UPSTREAM_REFERER` (optional) — explicit Referer for upstreams that require one. Defaults to `https://fmoviesunblocked.net/`.
- `UPSTREAM_ORIGIN` (optional) — explicit Origin for upstreams that require one. Defaults to `https://fmoviesunblocked.net`.
- `MOVIEBOX_API_HOST` (optional) — host for fallback referer/origin. Defaults to `h5.aoneroom.com`.

## API

### GET /api/proxy
Fetches the provided URL, preserves streaming and byte-range behavior, applies CORS and CDN cache headers, and returns the response. `HEAD` is also supported for media metadata, and `OPTIONS` responds to CORS preflight requests.

Query parameters:
- `url` (required) — full URL of the resource to fetch (URL-encoded). Example: `https://example.com/image.png`
- `test` (optional) — set to `true` to test connectivity without fetching the full resource. Returns JSON with status.

Responses:
- `200`, `206`, or another successful upstream status — proxied content returned with content type and range metadata.
- `400` — missing, malformed, or unsupported `url` parameter.
- `403` — host not allowed when `ALLOWED_HOSTS` is enabled, or upstream returned 403 after fallback.
- `502` — the proxy could not connect to the upstream.
- `504` — upstream request timed out or was rejected after retries.

The proxy sets `Access-Control-Allow-Origin: *`, exposes the range and entity headers needed by media clients, and uses `Cache-Control: public, max-age=31536000` for successful responses. Error responses are not cached.

### Examples

Fetch a remote image (cURL):
```bash
curl -v "https://<your-deploy-url>/api/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png"
```

Test proxy connectivity (cURL):
```bash
curl -v "https://<your-deploy-url>/api/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png&test=true"
```

Example using fetch in JavaScript:
```js
const target = encodeURIComponent('https://example.com/image.png');
const res = await fetch(`https://<your-deploy>/api/proxy?url=${target}`);
if (!res.ok) throw new Error(await res.text());
const blob = await res.blob();
// use the blob (image element, etc.)
```

Notes:
- Encode the `url` parameter.
- Respect the content-type and streaming behavior of the proxied response.

## Security & hardening
- Validate the `url` parameter and ensure only allowed hosts are proxied (use ALLOWED_HOSTS).
- Strip or sanitize dangerous response headers from upstream responses (e.g., `Set-Cookie`, `Content-Disposition`) if you do not intend to forward them.
- Apply rate limiting and monitoring to avoid abuse.
- Ensure timeouts and size limits for upstream responses to protect server resources.
- Consider token-based access or origin checks for private uses.

## Caching & CDN headers
This proxy is intended to make remote resources behave more like CDN-backed assets:
- Set appropriate Cache-Control (and optionally Surrogate-Control) headers so your CDN caches responses.
- Consider adding Surrogate-Key or other cache-tagging headers if your CDN supports them.
- If resources change upstream, use cache-busting strategies (unique URLs, query string versioning).

## Troubleshooting

A signed media URL is a temporary credential, not a permanent file URL. If the target URL contains a `t=<unix-timestamp>` parameter and that timestamp is in the past, the proxy reports `signedUrlExpired: true` in its JSON error response. Generate a fresh media URL from the source service; changing the proxy cannot renew the signature.

For an upstream `401`, `403`, `410`, `429`, or `426`, first test the target URL directly and check the upstream status shown in the proxy response. The proxy automatically retries on 429/502/503/504 with exponential backoff. If the upstream requires a specific header, set `UPSTREAM_REFERER`, `UPSTREAM_ORIGIN`, or `UPSTREAM_USER_AGENT` in your hosting environment rather than hard-coding it in the route. For range playback, ensure the client sends `Range` and that the upstream supports byte ranges.

## Contributing
Contributions, issues, and feature requests are welcome. For small changes:
1. Fork the repo.
2. Create a branch for your feature or fix.
3. Open a pull request describing your change.

## License
Add a license to the repository (for example, `MIT`) or see the repository root for an existing LICENSE file.
