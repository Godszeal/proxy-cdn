# ZST CDN Proxy for Vercel

A small Next.js API that proxies arbitrary URLs and returns them with hardened CDN-style response headers suitable for use behind Vercel (or any CDN). Use this as a lightweight "CDN proxy" for fetching remote assets while applying consistent caching and security headers.

- Exposes: `GET /api/proxy?url=<target-url>`
- Intended for deployment as a standalone Next.js app on Vercel.

Table of contents
- [Features](#features)
- [Requirements](#requirements)
- [Quick start](#quick-start)
  - [Deploy to Vercel](#deploy-to-vercel)
  - [Run locally](#run-locally)
- [Configuration](#configuration)
- [API](#api)
  - [GET /api/proxy](#get-apiproxy)
  - [Examples](#examples)
- [Security & hardening](#security--hardening)
- [Caching & CDN headers](#caching--cdn-headers)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features
- Simple single endpoint proxy for fetching remote URLs.
- Applies hardened headers meant for CDN consumption (cache control, security headers).
- Small Next.js codebase intended for quick deploy on Vercel.

## Requirements
- Node.js (recommended v16+)
- Yarn or npm
- A Vercel account (for deployment)
- (Optional) GitHub repo to connect with Vercel

## Quick start

### Deploy to Vercel
1. Push this folder to a new GitHub repository (or use an existing one).
2. Import the repository into Vercel (https://vercel.com/new).
3. Configure environment variables (see [Configuration](#configuration) below).
4. Deploy. After the deployment finishes you will have a URL such as `https://zst-cdn-proxy.vercel.app`.

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

## Configuration

This project may support — and should be configured with — the following environment variables (add them in Vercel or your .env file). Adjust names to match your implementation.

- ALLOWED_HOSTS (optional) — comma-separated list of hostnames allowed to be proxied. If empty, proxy may allow all hosts (not recommended).
- ALLOWED_ORIGINS (optional) — comma-separated list of allowed origins for CORS.
- CACHE_CONTROL_DEFAULT (optional) — default `Cache-Control` header value for proxied responses.
- RATE_LIMIT (optional) — simple rate-limit value (requests per minute) to protect the endpoint.
- PROXY_TIMEOUT_MS (optional) — request timeout for upstream fetches (milliseconds).
- LOG_LEVEL (optional) — info, warn, error, debug.

Important: Do not place secrets in query strings. If you need to proxy requests that require credentials, use secure server-side configuration and never expose credentials to the client.

## API

### GET /api/proxy
Fetches the provided URL, applies security and CDN-style headers, and returns the response.

Query parameters:
- url (required) — full URL of the resource to fetch (URL-encoded). Example: `https://example.com/image.png`

Optional query parameters may be implemented depending on the repository (e.g., `cache`, `as`, `s-maxage`); check code for specifics.

Responses:
- 200 — proxied content returned with headers applied.
- 400 — missing or invalid `url` parameter.
- 403 — host not allowed (if ALLOWED_HOSTS is enabled).
- 504 / 502 — upstream timeout or fetch error.

Headers applied (examples)
- Cache-Control: `public, max-age=...`
- Surrogate-Control / Surrogate-Key: for CDN caching (if implemented)
- Content-Security-Policy: tightened policy (if implemented)
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- Referrer-Policy: `no-referrer`

Make sure to review the code to see the exact headers set and adjust to your needs.

### Examples

Fetch a remote image (cURL):
```bash
curl -v "https://<your-deploy-url>/api/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png"
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
- Set appropriate Cache-Control (and optionally Surrogate-Control) headers so Vercel / the CDN caches responses.
- Consider adding Surrogate-Key or other cache-tagging headers if your CDN supports them.
- If resources change upstream, use cache-busting strategies (unique URLs, query string versioning).

## Troubleshooting
- 400 Bad Request: check that `url` is present and properly URL-encoded.
- 403 Forbidden: check ALLOWED_HOSTS and host validation logic.
- 504 Gateway Timeout: increase PROXY_TIMEOUT_MS or check upstream server health.
- Unexpected content-type: verify upstream response headers are preserved or normalized based on your needs.

## Contributing
Contributions, issues, and feature requests are welcome. For small changes:
1. Fork the repo.
2. Create a branch for your feature or fix.
3. Open a pull request describing your change.

If you want me to commit this README directly to the repository, tell me and I'll create a branch and push the change.

## License
Add a license to the repository (for example, `MIT`) or see the repository root for an existing LICENSE file.
