import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { OPEN_GRAPH_DEFAULTS } from "@/lib/site";

// Title and description come from the layout defaults; this adds the canonical URL.
export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { ...OPEN_GRAPH_DEFAULTS, url: "/" } };

export default function Page() {
  return <HomePage />;
}
