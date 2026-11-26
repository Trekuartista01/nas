"use client";

import { setLang, useLang, type Lang } from "@/components/i18n/lang";

const OPTIONS: { id: Lang; label: string; name: string }[] = [
  { id: "sq", label: "SQ", name: "Shqip" },
  { id: "en", label: "EN", name: "English" },
];

/**
 * SQ | EN switch next to the header CTA (and in the mobile menu). The active language is white on
 * the red bar under it; the other one is grey. Each button carries its language's own name for screen readers.
 */
export default function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  return (
    <div role="group" aria-label="Gjuha / Language" className={`flex items-center text-[12px] font-bold tracking-[0.12em] ${className}`}>
      {OPTIONS.map((o, i) => {
        const active = lang === o.id;
        return (
          <span key={o.id} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="mx-1 h-3 w-px bg-white/25">
                {" "}
              </span>
            )}
            <button
              type="button"
              lang={o.id}
              aria-label={o.name}
              aria-pressed={active}
              onClick={() => setLang(o.id)}
              className={`relative min-h-11 min-w-9 px-1.5 transition-colors duration-300 ${active ? "text-white" : "text-white/45 hover:text-white"}`}
            >
              {o.label}
              <span
                aria-hidden
                className={`absolute inset-x-1.5 bottom-2.5 h-[2px] origin-left bg-red transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          </span>
        );
      })}
    </div>
  );
}
