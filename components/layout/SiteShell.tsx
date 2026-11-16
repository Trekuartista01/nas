import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollToTop from "@/components/layout/ScrollToTop";

/**
 * The public site's chrome: Header, Footer and ScrollToTop around the page.
 * Used by app/(site)/layout.tsx and by the root not-found page, so every public page has it
 * and the admin panel (app/admin) does not.
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
