"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LANG_KEY } from "@/components/i18n/script";

/** Site languages: Albanian (default) and English. The choice lives on <html data-lang> and in localStorage. */
export type Lang = "sq" | "en";

function read(): Lang {
  return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "sq";
}

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
  return () => obs.disconnect();
}

export function setLang(lang: Lang) {
  const html = document.documentElement;
  if (lang === "en") html.setAttribute("data-lang", "en");
  else html.removeAttribute("data-lang");
  html.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Private mode etc.: the switch still works for this visit.
  }
}

/** The current language. Albanian while prerendering and hydrating, then the visitor's choice. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "sq");
}

/** `t("Mbyll", "Close")`: pick a string for attributes (aria-label, placeholder, alt). For visible text use <T>. */
export function useT() {
  const lang = useLang();
  return useCallback((sq: string, en: string) => (lang === "en" ? en : sq), [lang]);
}
