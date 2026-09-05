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

    const rangeHeader = request.headers.get("range")

    let response: Response
    let fetchHeaders = {
      ...CDN_PROXY_HEADERS,
      ...(rangeHeader ? { Range: rangeHeader } : {}),
    }

    try {
      console.log("[v0] Fetching with fmoviesunblocked.net referer")
      response = await fetch(decodedUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      })

      if (response.status === 403) {
        console.log("[v0] Got 403 with fmoviesunblocked, trying HOST_URL referer")
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
      console.log("[v0] Primary CDN fetch failed, trying fallback with HOST_URL referer")
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
    console.error("[v0] Proxy error:", error)
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
