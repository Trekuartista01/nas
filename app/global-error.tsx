"use client"; // Error boundaries must be Client Components

import "./globals.css";
import { publica } from "./fonts";
import ErrorPage from "@/components/pages/ErrorPage";

// Replaces the root layout when the layout itself crashes, so it brings its own <html>, styles and font.
// Header/Footer are left out on purpose: they may be what failed.
export default function GlobalError(props: { error: unknown; retry: () => void }) {
  return (
    <html lang="sq" className={`${publica.variable} antialiased`}>
      <body className="min-h-screen bg-ink font-sans text-white">
        <title>Gabim — NAS</title>
        <main>
          <ErrorPage {...props} />
        </main>
      </body>
    </html>
  );
}
