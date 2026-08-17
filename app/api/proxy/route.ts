import type { NextRequest, NextResponse } from "next/server";

const CDN_HEADERS = {
  "User-Agent": "okhttp/4.12.0",
  Referer: "https://fmoviesunblocked.net/",
  Origin: "https://fmoviesunblocked.net",
};

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");
  if (!targetUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const decodedUrl = decodeURIComponent(targetUrl);
  const urlObj = new URL(decodedUrl);

  const response = await fetch(decodedUrl, {
    headers: {
      ...CDN_HEADERS,
      Host: urlObj.hostname,
      ...(request.headers.get("range") ? { Range: request.headers.get("range")! } : {}),
    },
    redirect: "follow",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `upstream ${response.status}` },
      { status: response.status >= 400 ? response.status : 502 }
    );
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  if (response.headers.get("content-length")) headers.set("Content-Length", response.headers.get("content-length")!);
  if (response.headers.get("content-range")) headers.set("Content-Range", response.headers.get("content-range")!);
  if (response.headers.get("accept-ranges")) headers.set("Accept-Ranges", response.headers.get("accept-ranges")!);
  headers.set("Cache-Control", "public, max-age=31536000");
  headers.set("Access-Control-Allow-Origin", "*");

  return new NextResponse(response.body, { status: response.status, headers });
}
