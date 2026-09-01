# ZST CDN Proxy for Vercel

A small Next.js API that proxies arbitrary URLs and returns them with hardened CDN-style response headers suitable for use behind Vercel (or any CDN). Use this as a lightweight "CDN proxy" for fetching remote assets while applying consistent caching and security headers.

- Exposes: `GET` and `HEAD /api/proxy?url=<target-url>` plus CORS preflight via `OPTIONS`.
- Preserves byte-range requests and response metadata for browser video playback.
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

The following environment variables are supported. Add them in Vercel or in a local `.env` file.

- `ALLOWED_HOSTS` (optional) — comma-separated hostnames allowed to be proxied. When unset, all HTTP(S) hosts are accepted; set this in production to reduce SSRF exposure.
- `UPSTREAM_USER_AGENT` (optional) — explicit User-Agent to send upstream. By default, the incoming client User-Agent is forwarded.
- `UPSTREAM_REFERER` (optional) — explicit Referer for upstreams that require one.
- `UPSTREAM_ORIGIN` (optional) — explicit Origin for upstreams that require one.

The handler forwards `Range`, conditional request headers, and `Accept`, while it deliberately does not forge `Host`, `Origin`, or `Referer`. This avoids sending a host-specific spoofed request that can cause an upstream CDN to reject the request. CORS is handled at the proxy boundary.

Important: Do not place secrets in query strings. If you need to proxy resources that require credentials, use secure server-side configuration and never expose credentials to the client.

## API

### GET /api/proxy
Fetches the provided URL, preserves streaming and byte-range behavior, applies CORS and CDN cache headers, and returns the response. `HEAD` is also supported for media metadata, and `OPTIONS` responds to CORS preflight requests.

Query parameters:
- url (required) — full URL of the resource to fetch (URL-encoded). Example: `https://example.com/image.png`

Optional query parameters may be implemented depending on the repository (e.g., `cache`, `as`, `s-maxage`); check code for specifics.

Responses:
- `200`, `206`, or another successful upstream status — proxied content returned with content type and range metadata.
- `400` — missing, malformed, or unsupported `url` parameter.
- `403` — host not allowed when `ALLOWED_HOSTS` is enabled.
- `502` — the proxy could not connect to the upstream.
- The upstream status is returned for an upstream HTTP error, together with `X-Proxy-Upstream-Status` and a JSON diagnostic body.

The proxy sets `Access-Control-Allow-Origin: *`, exposes the range and entity headers needed by media clients, and uses `Cache-Control: public, max-age=60, s-maxage=86400, stale-while-revalidate=60` for successful responses. Error responses are not cached.

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

A signed media URL is a temporary credential, not a permanent file URL. If the target URL contains a `t=<unix-timestamp>` parameter and that timestamp is in the past, the proxy reports `signedUrlExpired: true` in its JSON error response. Generate a fresh media URL from the source service; changing the proxy cannot renew the signature.

For an upstream `401`, `403`, `410`, `429`, or `426`, first test the target URL directly and check the upstream status shown in the proxy response. If the upstream requires a specific header, set `UPSTREAM_REFERER`, `UPSTREAM_ORIGIN`, or `UPSTREAM_USER_AGENT` in Vercel rather than hard-coding it in the route. For range playback, ensure the client sends `Range` and that the upstream supports byte ranges.

## Contributing
Contributions, issues, and feature requests are welcome. For small changes:
1. Fork the repo.
2. Create a branch for your feature or fix.
3. Open a pull request describing your change.

If you want me to commit this README directly to the repository, tell me and I'll create a branch and push the change.

## License
Add a license to the repository (for example, `MIT`) or see the repository root for an existing LICENSE file.
