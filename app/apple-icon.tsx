import { ImageResponse } from "next/og";

// iPhone home-screen icon. Placeholder until the real logo arrives (same /// mark as app/icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "#0a0a0a" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 22, height: 110, background: "#e10600", transform: "skewX(-20deg)" }} />
        ))}
      </div>
    ),
    size,
  );
}
