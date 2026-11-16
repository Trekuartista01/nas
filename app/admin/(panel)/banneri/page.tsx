import type { Metadata } from "next";
import { Suspense } from "react";
import BannerForm, { type BannerInitial } from "@/components/admin/forms/BannerForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { getBanner } from "@/lib/admin/queries";
import { heroVideo as localHero } from "@/data/home";

export const metadata: Metadata = { title: "Banneri", description: "Videoja e faqes kryesore dhe pjesët e saj." };

export default function Page() {
  return (
    <>
      <PageHeader title="Banneri" description="Videoja në krye të faqes kryesore dhe shiritat e progresit për çdo pamje." />
      <Suspense fallback={<AdminLoading />}>
        <Banner />
      </Suspense>
    </>
  );
}

async function Banner() {
  const { video, slides } = await getBanner();
  // Until a banner is saved, the site shows the original video (data/home.ts): start the form from it.
  const usingLocal = !video || slides.length === 0;
  const initial: BannerInitial = usingLocal
    ? {
        video_path: localHero.src,
        poster_path: localHero.poster,
        duration: localHero.duration,
        slides: localHero.slides.map((s) => ({ start_seconds: s.start, label: s.label })),
      }
    : {
        video_path: video.video_path,
        poster_path: video.poster_path,
        duration: Number(video.duration),
        slides: slides.map((s) => ({ start_seconds: Number(s.start_seconds), label: s.label })),
      };
  return <BannerForm initial={initial} usingLocal={usingLocal} />;
}
