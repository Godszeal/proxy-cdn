export default function Home() {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://zst-proxy-cdn.vercel.app";
  const exampleUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent("https://bcdnxw.hakunaymatata.com/bt/389b4c34fb6caa951b142aa49c5787a3.mp4?sign=42f9ec167c6e89ad12f37b467f2ce2f9&t=1786912161")}`;

  return (
    <div style={{
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      background: "#0b0f17",
      color: "#e5e7eb",
      minHeight: "100vh",
      margin: 0,
      padding: "40px 20px",
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "28px",
        maxWidth: "720px",
        width: "100%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}>
        <h1 style={{ fontSize: "22px", margin: "0 0 6px" }}>ZST CDN Proxy</h1>
        <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 22px" }}>Vercel-backed CDN proxy for MovieBox media URLs</p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6 }}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: "#064e3b", color: "#a7f3d0", fontSize: "12px", border: "1px solid #065f46" }}>Operational</span>
            </div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Base URL</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6, wordBreak: "break-all" }}>
              <a href={baseUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>{baseUrl}</a>
            </div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Protocol</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6 }}>HTTP/1.1 + HTTP/2</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Use case</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6 }}>CDN bypass proxy</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Auth</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6 }}>None required</div>
          </div>
          <div style={{ flex: "1 1 200px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Retry / fallbacks</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginTop: 6 }}>Direct -&gt; Public proxies</div>
          </div>
        </div>

        <div style={{ color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Example endpoint</div>
        <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: "12px", padding: "14px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "13px", color: "#d1d5db", wordBreak: "break-all" }}>
          <a href={exampleUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>/api/proxy?url=...</a>
        </div>
      </div>
    </div>
  );
}
