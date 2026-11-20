import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { BUSINESS } from "@/data/business";

/**
 * A form section on an inner page: headline and short text on the left, the form on the right.
 * No design yet: built from the homepage's headline style and bordered panels.
 */
export default function FormBlock({
  id,
  lines,
  intro,
  children,
  as: Tag = "h2",
}: {
  /** Anchor for links like /modelet/<slug>#test-ride. */
  id?: string;
  /** Headline lines; a red full stop is added to the last one. */
  lines: string[];
  intro: ReactNode;
  children: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#1c1c1c]">
      <div className="container-moto grid gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16 lg:py-28">
        <Reveal className="flex flex-col gap-6">
          <Tag className="headline text-[clamp(36px,4vw,64px)]">
            {lines.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i === lines.length - 1 && <span className="text-red">.</span>}
              </span>
            ))}
          </Tag>
          <div className="max-w-[440px] space-y-4 text-[15px] leading-relaxed text-muted-2">{intro}</div>
          <p className="text-sm text-muted">
            Më shpejt me telefon:{" "}
            <a href={`tel:${BUSINESS.phone}`} className="font-bold text-white hover:text-red">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
        </Reveal>
        <Reveal delay={0.08} className="border border-line-2 bg-panel p-6 sm:p-8">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
