import localFont from "next/font/local";

// Publica Sans (5 weights, upright only), self-hosted so builds never depend on a font service.
// No italic files: `italic` text gets the browser's slanted version. No 900: font-black uses 800.
// The font has no width axis, so the `wide` utility (font-stretch: 125%) no longer changes anything.
export const publica = localFont({
  src: [
    { path: "./fonts/PublicaSans-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/PublicaSans-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/PublicaSans-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/PublicaSans-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/PublicaSans-ExtraBold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-publica",
  display: "swap",
});
