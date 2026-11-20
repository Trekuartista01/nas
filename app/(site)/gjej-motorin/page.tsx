import type { Metadata } from "next";
import BikeFinderPage from "@/components/pages/BikeFinderPage";
import { getModels } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Gjej motorin",
  description: "Tre pyetje: patenta, si e përdor dhe buxheti. Gjej motorin ose skuterin që të përshtatet në NAS.",
  path: "/gjej-motorin",
});

export default async function Page() {
  return <BikeFinderPage models={await getModels()} />;
}
