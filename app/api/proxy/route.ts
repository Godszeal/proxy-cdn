import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "if-none-match",
  "if-modified-since",
  "if-range",
  "range",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "accept-ranges",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "expires",
  "last-modified",
] as const;

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, If-None-Match, If-Modified-Since, If-Range",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag, Last-Modified",
  });
}

function errorResponse(message: string, status: number) {
  const headers = corsHeaders();
  headers.set("Cache-Control", "no-store");
  return NextResponse.json({ error: message }, { status, headers });
}

function parseTargetUrl(rawTargetUrl: string): URL {
  // URLSearchParams has already decoded the query parameter once. Parse that
  // value first so encoded characters inside the target URL are not decoded a
  // second time. The fallback keeps compatibility with clients that encoded
  // the whole value twice.
  try {
    return new URL(rawTargetUrl);
  } catch {
    try {
      return new URL(decodeURIComponent(rawTargetUrl));
    } catch {
      throw new Error("url must be a valid absolute URL");
    }
  }
}

function isAllowedHost(hostname: string): boolean {
  const configuredHosts = process.env.ALLOWED_HOSTS?.split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  if (!configuredHosts || configuredHosts.length === 0) return true;

  const normalizedHostname = hostname.toLowerCase();
  return configuredHosts.some(
    (host) => normalizedHostname === host || normalizedHostname.endsWith(`.${host}`),
  );
}

function getExpiryTimestamp(targetUrl: URL): number | null {
  const value = targetUrl.searchParams.get("t");
  if (!value || !/^\d{9,}$/.test(value)) return null;

  const timestamp = Number(value);
  return Number.isSafeInteger(timestamp) ? timestamp : null;
}

function buildUpstreamRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  // Do not forge Host, Origin, or Referer. If an upstream requires one of
  // these headers, configure it explicitly in Vercel instead.
  const userAgent = process.env.UPSTREAM_USER_AGENT ?? request.headers.get("user-agent");
  if (userAgent) headers.set("User-Agent", userAgent);

  if (process.env.UPSTREAM_REFERER) {
    headers.set("Referer", process.env.UPSTREAM_REFERER);
  }

  if (process.env.UPSTREAM_ORIGIN) {
    headers.set("Origin", process.env.UPSTREAM_ORIGIN);
  }

  return headers;
}

function buildResponseHeaders(upstreamResponse: Response, targetUrl: URL): Headers {
  const headers = corsHeaders();

  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(name);
    if (value) headers.set(name, value);
  }

  headers.set("Cache-Control", "public, max-age=60, s-maxage=86400, stale-while-revalidate=60");
  headers.set("Vary", "Range");
  headers.set("X-Proxy-Upstream-Host", targetUrl.hostname);
  return headers;
}

async function proxyRequest(request: NextRequest) {
  const rawTargetUrl = request.nextUrl.searchParams.get("url");
  if (!rawTargetUrl) {
    return errorResponse("url is required", 400);
  }

  let targetUrl: URL;
  try {
    targetUrl = parseTargetUrl(rawTargetUrl);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "invalid url", 400);
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return errorResponse("url must use http or https", 400);
  }

  if (!isAllowedHost(targetUrl.hostname)) {
    return errorResponse("upstream host is not allowed", 403);
  }

  const expiryTimestamp = getExpiryTimestamp(targetUrl);
  const signedUrlExpired = expiryTimestamp !== null && expiryTimestamp * 1000 < Date.now();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: buildUpstreamRequestHeaders(request),
      redirect: "follow",
    });
  } catch (error) {
    const headers = corsHeaders();
    headers.set("Cache-Control", "no-store");
    return NextResponse.json(
      {
        error: "upstream fetch failed",
        message: error instanceof Error ? error.message : "unknown fetch error",
        upstreamHost: targetUrl.hostname,
        ...(signedUrlExpired ? { signedUrlExpired: true } : {}),
      },
      { status: 502, headers },
    );
  }

  if (!upstreamResponse.ok && upstreamResponse.status !== 304) {
    const headers = corsHeaders();
    headers.set("Cache-Control", "no-store");
    headers.set("X-Proxy-Upstream-Status", String(upstreamResponse.status));

    return NextResponse.json(
      {
        error: "upstream request failed",
        upstreamStatus: upstreamResponse.status,
        upstreamStatusText: upstreamResponse.statusText,
        upstreamHost: targetUrl.hostname,
        ...(signedUrlExpired ? { signedUrlExpired: true } : {}),
      },
      { status: upstreamResponse.status, headers },
    );
  }

  return new NextResponse(request.method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: buildResponseHeaders(upstreamResponse, targetUrl),
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request);
}

export async function OPTIONS() {
  const headers = corsHeaders();
  headers.set("Cache-Control", "public, max-age=86400");
  return new NextResponse(null, { status: 204, headers });
}
