import type { Metadata } from "next";
import SportLinePage from "@/components/pages/SportLinePage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sport Line",
  description: "NAS Sport Line: linja e performancës. S-ja e kuqe shënon çdo model të ndërtuar për një ngasje më agresive.",
  path: "/sport-line",
});

export default function Page() {
  return <SportLinePage />;
}
