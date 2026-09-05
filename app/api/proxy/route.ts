import { type NextRequest, NextResponse } from "next/server"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
}

const IP_POOL = [
  "1.1.1.1",
  "1.0.0.1",
  "8.8.8.8",
  "8.8.4.4",
  "9.9.9.9",
  "149.112.112.9",
  "208.67.222.222",
  "208.67.220.220",
  "64.6.64.6",
  "64.6.65.6",
]

let ipIndex = 0

function nextIp() {
  const ip = IP_POOL[ipIndex % IP_POOL.length]
  ipIndex += 1
  return ip
}

function buildProxyHeaders(rangeHeader: string | null) {
  const ip = nextIp()
  return {
    "User-Agent": "okhttp/4.12.0",
    Referer: "https://fmoviesunblocked.net/",
    Origin: "https://fmoviesunblocked.net",
    "X-Forwarded-For": ip,
    "CF-Connecting-IP": ip,
    "X-Real-IP": ip,
    ...(rangeHeader ? { Range: rangeHeader } : {}),
  }
}

const HOST_URL = `https://${process.env.MOVIEBOX_API_HOST || "h5.aoneroom.com"}`

function getProxyUrl(): string | undefined {
  const value = process.env.UPSTREAM_PROXY
  if (!value) return undefined
  try {
    new URL(value)
    return value
  } catch {
    return undefined
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
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
    const proxyUrl = getProxyUrl()

    if (testMode) {
      try {
        const testResponse = await fetch(decodedUrl, {
          method: "HEAD",
          headers: buildProxyHeaders(null),
          ...(proxyUrl ? { proxy: proxyUrl } : {}),
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

    const rangeHeader = request.headers.get("range")

    let response: Response
    let fetchHeaders = buildProxyHeaders(rangeHeader)

    try {
      response = await fetch(decodedUrl, {
        headers: fetchHeaders,
        redirect: "follow",
        ...(proxyUrl ? { proxy: proxyUrl } : {}),
      })

      if (response.status === 403) {
        fetchHeaders = {
          "User-Agent": "okhttp/4.12.0",
          Referer: HOST_URL,
          Origin: HOST_URL,
          "X-Forwarded-For": nextIp(),
          "CF-Connecting-IP": nextIp(),
          "X-Real-IP": nextIp(),
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        }

        response = await fetch(decodedUrl, {
          headers: fetchHeaders,
          redirect: "follow",
          ...(proxyUrl ? { proxy: proxyUrl } : {}),
        })
      }
    } catch (err) {
      fetchHeaders = {
        "User-Agent": "okhttp/4.12.0",
        Referer: HOST_URL,
        Origin: HOST_URL,
        "X-Forwarded-For": nextIp(),
        "CF-Connecting-IP": nextIp(),
        "X-Real-IP": nextIp(),
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      }

      response = await fetch(decodedUrl, {
        headers: fetchHeaders,
        redirect: "follow",
        ...(proxyUrl ? { proxy: proxyUrl } : {}),
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
