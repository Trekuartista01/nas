import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Preview image when a link is shared (WhatsApp, Facebook, Viber...). Inherited by every page
// that doesn't set its own. Uses next/og's built-in font: Archivo is only available as .woff2,
// which the image generator can't read. Replace with a designed image + real logo when ready.
export const alt = "NAS — motorë dhe skuterë";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const poster = `data:image/jpeg;base64,${await readFile(join(process.cwd(), "public/videos/hero-poster.jpg"), "base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0a", color: "#fff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" width={1200} height={675} style={{ position: "absolute", top: -22, left: 0, filter: "grayscale(1)", opacity: 0.55 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.8) 50%, rgba(10,10,10,0.35) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ fontSize: 132, fontWeight: 700, color: "#e10600", lineHeight: 1, letterSpacing: -4 }}>NAS</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 16, height: 96, background: "#e10600", transform: "skewX(-24deg)" }} />
              ))}
            </div>
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: "#d4d4d4" }}>Motorë · Skuterë</div>
          <div style={{ fontSize: 26, color: "#9a9a9a" }}>NAS · QJMOTOR</div>
        </div>
      </div>
    ),
    size,
  );
}
