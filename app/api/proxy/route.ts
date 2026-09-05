import { type NextRequest, NextResponse } from "next/server"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
}

const CDN_PROXY_HEADERS = {
  "User-Agent": "okhttp/4.12.0",
  Referer: "https://fmoviesunblocked.net/",
  Origin: "https://fmoviesunblocked.net",
  "X-Forwarded-For": "1.1.1.1",
  "CF-Connecting-IP": "1.1.1.1",
  "X-Real-IP": "1.1.1.1",
}

const HOST_URL = `https://${process.env.MOVIEBOX_API_HOST || "h5.aoneroom.com"}`

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60
const rateLimitStore = new Map<string, { count: number; reset: number }>()

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  return request.ip || "unknown"
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(clientIp)

  if (!entry || now > entry.reset) {
    rateLimitStore.set(clientIp, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfterMs: 0 }
  }

  entry.count += 1
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterMs = entry.reset - now
    return { allowed: false, retryAfterMs }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          creator: "God's Zeal",
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
          },
        },
      )
    }

    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get("url")
    const testMode = searchParams.get("test") === "true"

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "URL parameter is required", creator: "God's Zeal" },
        { status: 400, headers: corsHeaders },
      )
    }

    const decodedUrl = decodeURIComponent(targetUrl)

    // Test mode - just check if we can access the URL
    if (testMode) {
      try {
        const testResponse = await fetch(decodedUrl, {
          method: "HEAD",
          headers: CDN_PROXY_HEADERS,
        })

        return NextResponse.json(
          {
            success: testResponse.ok,
            message: testResponse.ok ? "Proxy working correctly" : "Proxy failed",
            status: testResponse.status,
            url: decodedUrl,
            creator: "God's Zeal",
          },
          { status: 200, headers: corsHeaders },
        )
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Test failed",
            creator: "God's Zeal",
          },
          { status: 500, headers: corsHeaders },
        )
      }
    }

    // Get range header for video streaming
    const rangeHeader = request.headers.get("range")

    let response: Response
    let fetchHeaders = {
      ...CDN_PROXY_HEADERS,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    }

    try {
      response = await fetch(decodedUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      })

      if (response.status === 403) {
        fetchHeaders = {
          "User-Agent": "okhttp/4.12.0",
          Referer: HOST_URL,
          Origin: HOST_URL,
          "X-Forwarded-For": "1.1.1.1",
          "CF-Connecting-IP": "1.1.1.1",
          "X-Real-IP": "1.1.1.1",
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        }

        response = await fetch(decodedUrl, {
          headers: fetchHeaders,
          redirect: "follow",
        })
      }
    } catch (err) {
      // If primary fails completely, try fallback with HOST_URL referer
      fetchHeaders = {
        "User-Agent": "okhttp/4.12.0",
        Referer: HOST_URL,
        Origin: HOST_URL,
        "X-Forwarded-For": "1.1.1.1",
        "CF-Connecting-IP": "1.1.1.1",
        "X-Real-IP": "1.1.1.1",
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      }

      response = await fetch(decodedUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      })
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch resource`,
          status: response.status,
          statusText: response.statusText,
          creator: "God's Zeal",
        },
        { status: response.status, headers: corsHeaders },
      )
    }

    const contentType = response.headers.get("content-type") || "video/mp4"
    const contentLength = response.headers.get("content-length")
    const contentRange = response.headers.get("content-range")
    const acceptRanges = response.headers.get("accept-ranges")

    const proxyHeaders: HeadersInit = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Accept-Ranges": acceptRanges || "bytes",
      "Cache-Control": "public, max-age=31536000",
    }

    if (contentLength) proxyHeaders["Content-Length"] = contentLength
    if (contentRange) proxyHeaders["Content-Range"] = contentRange

    return new NextResponse(response.body, {
      status: response.status,
      headers: proxyHeaders,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Proxy request failed",
        creator: "God's Zeal",
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

