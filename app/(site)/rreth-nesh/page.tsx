import type { Metadata } from "next";
import BrandPage from "@/components/pages/BrandPage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "The Brand",
  description: "NAS: një markë moderne motoçikletash me identitet britanik, e ndërtuar për besim, karakter dhe performancë.",
  path: "/rreth-nesh",
});

export default function Page() {
  return <BrandPage />;
}
