import type { ReactNode } from "react";

/**
 * One piece of copy in both languages (Albanian first, the site default). Both are in the HTML and
 * CSS shows the one matching `data-lang` on <html> (app/globals.css, "Language switch"), so it works in
 * server components, needs no JavaScript to render, and never flashes the wrong language: the saved
 * choice is applied before the first paint (LANG_SCRIPT in app/layout.tsx).
 * For text that can't be a node (aria-label, placeholder, alt), use `useT()` from components/i18n/lang.
 */
export default function T({ sq, en }: { sq: ReactNode; en: ReactNode }) {
  return (
    <>
      <span lang="sq" className="i18n-sq">
        {sq}
      </span>
      <span lang="en" className="i18n-en">
        {en}
      </span>
    </>
  );
}
