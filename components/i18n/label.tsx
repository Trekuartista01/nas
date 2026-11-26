import type { ReactNode } from "react";
import T from "@/components/i18n/T";
import type { Copy } from "@/lib/i18n";

/** A label in one language (a string: names, numbers, codes) or in both ({ sq, en }). */
export type Label = string | Copy;

/** Render a label: a string as is, { sq, en } with <T>. */
export function labelNode(l: Label): ReactNode {
  return typeof l === "string" ? l : <T {...l} />;
}

/** A label as plain text in one language (for alt, aria-label, <option>). */
export function labelText(l: Label, lang: "sq" | "en"): string {
  return typeof l === "string" ? l : l[lang];
}
