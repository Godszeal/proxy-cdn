import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://zst-proxy-cdn.vercel.app";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZST CDN Proxy</title>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      background: #0b0f17;
      color: #e5e7eb;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 28px;
      max-width: 720px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .sub { color: #9ca3af; font-size: 14px; margin-bottom: 22px; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
    .box { flex: 1 1 200px; background: #0b0f17; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
    .label { color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .value { font-size: 18px; font-weight: 600; margin-top: 6px; word-break: break-all; }
    a { color: #60a5fa; text-decoration: none; }
    .endpoint { background: #0b0f17; border: 1px solid #1f2937; border-radius: 12px; padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #d1d5db; word-break: break-all; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #064e3b; color: #a7f3d0; font-size: 12px; border: 1px solid #065f46; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ZST CDN Proxy</h1>
    <div class="sub">Vercel-backed CDN proxy for MovieBox media URLs</div>
    <div class="row">
      <div class="box">
        <div class="label">Status</div>
        <div class="value"><span class="badge">Operational</span></div>
      </div>
      <div class="box">
        <div class="label">Base URL</div>
        <div class="value"><a href="${baseUrl}" target="_blank">${baseUrl}</a></div>
      </div>
      <div class="box">
        <div class="label">Protocol</div>
        <div class="value">HTTP/1.1 + HTTP/2</div>
      </div>
    </div>
    <div class="row">
      <div class="box">
        <div class="label">Use case</div>
        <div class="value">CDN bypass proxy</div>
      </div>
      <div class="box">
        <div class="label">Auth</div>
        <div class="value">None required</div>
      </div>
      <div class="box">
        <div class="label">Retry / fallbacks</div>
        <div class="value">Direct -> Public proxies</div>
      </div>
    </div>
    <div class="label">Example endpoint</div>
    <div class="endpoint">/api/proxy?url=https%3A%2F%2Fbcdnxw.hakunaymatata.com%2Fbt%2F389b4c34fb6caa951b142aa49c5787a3.mp4%3Fsign%3D42f9ec167c6e89ad12f37b467f2ce2f9%26t%3D1786912161</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
