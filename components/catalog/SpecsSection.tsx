import { FiDownload } from "react-icons/fi";
import Reveal from "@/components/ui/Reveal";
import type { SpecGroup } from "@/data/models";

/**
 * SPECS on a model page (design: Frame 27764). Big italic title with an outlined echo behind it,
 * then one card per group: red top bar ending in two slanted marks, group title, label/value rows.
 * `sheetUrl`: the spec brochure PDF (/modelet/[slug]/broshura.pdf), downloaded from the button
 * on the right of the title. Left out = no button.
 */
export default function SpecsSection({ groups, sheetUrl }: { groups: SpecGroup[]; sheetUrl?: string }) {
  return (
    <section aria-labelledby="specs-title" className="bg-ink">
      <div className="container-moto py-20 lg:py-28">
        <Reveal className="mb-12 flex flex-wrap items-center justify-between gap-6 lg:mb-20">
          <h2 id="specs-title" className="relative text-[56px] font-extrabold italic uppercase leading-none tracking-[-0.03em] sm:text-[72px] lg:text-[84px]">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[0.28em] left-[0.45em] select-none whitespace-nowrap text-transparent [-webkit-text-stroke:1px_#5a5a5a]"
            >
              SPECS
            </span>
            <span className="relative">SPECS</span>
          </h2>
          {sheetUrl && (
            <a
              href={sheetUrl}
              download
              className="inline-flex min-h-11 items-center gap-2.5 bg-red px-4 text-[13px] font-medium uppercase tracking-[0.02em] text-white transition-colors hover:bg-[#c00500] hover:text-white"
            >
              <FiDownload aria-hidden className="size-4" />
              Download the brochure
            </a>
          )}
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {groups.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.08} className="flex flex-col bg-[#161616]">
              <TopBar />
              <h3 className="border-b border-[#222] px-4 py-6 text-[20px] font-extrabold uppercase leading-tight sm:text-[22px]">{group.title}</h3>
              <dl className="flex flex-col px-4 py-3">
                {group.rows.map((row) => (
                  <div key={row.label} className="grid min-h-16 grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center gap-4 py-2">
                    <dt className="text-[14px] font-bold uppercase leading-snug sm:text-[15px]">
                      {row.label}
                      {row.sub && <span className="block font-bold normal-case">{row.sub}</span>}
                    </dt>
                    <dd className="text-[14px] leading-snug text-[#dcdcdc] sm:text-[15px]">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Red bar across the card top, cut at the right into two slanted marks (same 24° as the /// marks). */
function TopBar() {
  const cut = "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)";
  return (
    <div aria-hidden className="flex h-[18px] gap-1.5">
      <span className="flex-1 bg-red" style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }} />
      <span className="w-[60px] bg-red" style={{ clipPath: cut }} />
      <span className="w-[40px] bg-red" style={{ clipPath: cut }} />
    </div>
  );
}
