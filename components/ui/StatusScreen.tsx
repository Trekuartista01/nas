import type { ReactNode } from "react";

interface StatusScreenProps {
  /** Giant outlined word behind the headline ("404", "GABIM"). */
  word: string;
  /** Small red label above the headline. */
  eyebrow: string;
  /** Headline lines; a red full stop is added after the last one. */
  lines: string[];
  text: ReactNode;
  actions: ReactNode;
}

/**
 * Full-screen status message (404, error). No design yet: built from the catalog hero's
 * outlined word and the homepage headline + buttons.
 */
export default function StatusScreen({ word, eyebrow, lines, text, actions }: StatusScreenProps) {
  return (
    <section className="relative overflow-hidden">
      <span
        aria-hidden
        className="wide pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(120px,24vw,380px)] font-black italic leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1.5px_#2a2a2a]"
      >
        {word}
      </span>
      <div className="container-moto relative flex min-h-[560px] flex-col items-center justify-center py-24 text-center lg:min-h-[680px]">
        <p className="text-xs font-semibold tracking-[0.18em] text-red">{eyebrow}</p>
        <h1 className="headline mt-4 text-[clamp(36px,6vw,76px)] leading-[0.95]">
          {lines.map((line, i) => (
            <span key={line} className="block">
              {line}
              {i === lines.length - 1 && <span className="text-red">.</span>}
            </span>
          ))}
        </h1>
        <div className="mt-6 max-w-[480px] text-muted">{text}</div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">{actions}</div>
      </div>
    </section>
  );
}
