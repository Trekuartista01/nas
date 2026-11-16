import localFont from "next/font/local";

// Archivo variable (wght 100–900, wdth 62–125%), self-hosted so builds never depend on Google Fonts.
export const archivo = localFont({
  src: [
    { path: "./fonts/Archivo-Variable.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/Archivo-Variable-Italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
