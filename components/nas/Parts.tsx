import type { ReactNode } from "react";
import Lines from "@/components/motion/Lines";
import Rise from "@/components/motion/Rise";

/** Small red label above a heading ("THE IDEA", "THE LION", …). */
export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13px] font-bold tracking-[0.2em] text-red ${className}`}>{children}</p>;
}

/** Heading lines with a red full stop on the last one. */
export function headingLines(lines: string[]): ReactNode[] {
  return lines.map((line, i) =>
    i === lines.length - 1 && line.endsWith(".") ? (
      <span key={i}>
        {line.slice(0, -1)}
        <span className="text-red">.</span>
      </span>
    ) : (
      line
    ),
  );
}

/**
 * "THE IDEA" block (NAS Brand / Sport Line designs): label on the left, big heading and body on
 * the right two-thirds. Heading lines rise from their masks, then the body.
 */
export function IdeaSection({ kicker, lines, children }: { kicker: string; lines: string[]; children: ReactNode }) {
  return (
    <section className="bg-ink">
      <div className="container-moto grid gap-8 py-[clamp(90px,10vw,160px)] lg:grid-cols-[1fr_2fr]">
        <Rise>
          <Kicker className="lg:pt-4">{kicker}</Kicker>
        </Rise>
        <div>
          <Lines className="headline text-[clamp(40px,5.4vw,90px)]" lines={headingLines(lines)} />
          <Rise delay={0.25} className="mt-10 max-w-[620px]">
            <p className="text-[clamp(16px,1.25vw,19px)] leading-[1.65] text-body">{children}</p>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/** Section heading on the left, optional text on the right (Vision, Four things, In the line…). */
export function SectionHead({ lines, aside, dark = true }: { lines: string[]; aside?: ReactNode; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-8">
      <Lines className={`headline text-[clamp(44px,5.4vw,90px)] ${dark ? "" : "text-ink"}`} lines={headingLines(lines)} />
      {aside && (
        <Rise delay={0.2} className="max-w-[390px] pb-2">
          <p className="text-[17px] leading-[1.6] text-body">{aside}</p>
        </Rise>
      )}
    </div>
  );
}
