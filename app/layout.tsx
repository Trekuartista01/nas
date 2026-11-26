import type { Metadata } from "next";
import "./globals.css";
import { publica } from "./fonts";
import { LANG_SCRIPT } from "@/components/i18n/script";
import MotionProvider from "@/components/layout/MotionProvider";
import { OPEN_GRAPH_DEFAULTS, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — NAS",
  },
  description: SITE_DESCRIPTION,
  // Defaults for link previews. A page that sets its own openGraph must repeat siteName/locale (Next merges shallowly).
  openGraph: OPEN_GRAPH_DEFAULTS,
  twitter: { card: "summary_large_image" },
};

// Header/Footer live in app/(site)/layout.tsx (public pages) so the admin panel can have its own chrome.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the head script may switch lang / data-lang to English before React hydrates.
    <html lang="sq" className={`${publica.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Saved language (SQ / EN switch in the header), applied before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
        {/* Without JavaScript, nothing waits for a reveal animation: show everything as is. */}
        <noscript>
          <style>{`[data-anim]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-ink font-sans text-white">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
