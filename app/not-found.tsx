import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import NotFoundPage from "@/components/pages/NotFoundPage";

export const metadata: Metadata = {
  title: "Faqja nuk u gjet",
  description: "Kjo faqe nuk ekziston ose është zhvendosur. Shiko modelet dhe aksesorët e Moto Shpatit.",
};

// Renders under the root layout only, so it brings the site chrome itself (same SiteShell as app/(site)).
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundPage />
    </SiteShell>
  );
}
