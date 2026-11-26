/** localStorage key for the visitor's language (shared by the head script and components/i18n/lang.ts). */
export const LANG_KEY = "nas-lang";

/**
 * Runs in <head> before the page paints: applies a saved English choice, so the page never shows
 * Albanian first. Plain module (not "use client"), so the root layout can inline the string.
 */
export const LANG_SCRIPT = `try{if(localStorage.getItem("${LANG_KEY}")==="en"){var d=document.documentElement;d.setAttribute("data-lang","en");d.lang="en"}}catch(e){}`;
