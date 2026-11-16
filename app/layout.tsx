import type { Metadata } from "next";
import "./globals.css";
import { archivo } from "./fonts";
import MotionProvider from "@/components/layout/MotionProvider";
import { OPEN_GRAPH_DEFAULTS, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Moto Shpati",
  },
  description: SITE_DESCRIPTION,
  // Defaults for link previews. A page that sets its own openGraph must repeat siteName/locale (Next merges shallowly).
  openGraph: OPEN_GRAPH_DEFAULTS,
  twitter: { card: "summary_large_image" },
};

// Header/Footer live in app/(site)/layout.tsx (public pages) so the admin panel can have its own chrome.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className={`${archivo.variable} antialiased`}>
      <body className="min-h-screen bg-ink font-sans text-white">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
