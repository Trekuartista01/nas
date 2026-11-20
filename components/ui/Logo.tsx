import Link from "next/link";

/**
 * The logo mark (from nas-logo.svg), cropped to the artwork and drawn in currentColor.
 * The file's "MOTORCYCLE BORN IN ENGLAND" line was live text in Publica Sans (not on the site),
 * so it is left out here; add it back as outlined paths if it is wanted.
 */
export function LogoMark({
  className = "",
  title,
  accent = false,
  bare = false,
  sVariable = false,
  only,
}: {
  className?: string;
  title?: string;
  /** Red S, as on the Sport Line (NAS homepage design). */
  accent?: boolean;
  /** Without the ® mark. */
  bare?: boolean;
  /** S colour from the CSS variable --s-fill (for animating it; falls back to the text colour). */
  sVariable?: boolean;
  /** Draw only the N + A, or only the S (same viewBox, so stacked copies line up exactly). */
  only?: "na" | "s";
}) {
  const hideNA = only === "s" ? "invisible" : undefined;
  const sClass = [accent ? "fill-red" : "", only === "na" ? "invisible" : ""].filter(Boolean).join(" ") || undefined;
  return (
    <svg
      viewBox={bare ? "232 290 1576 356" : "112 240 1696 406"}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path className={bare ? "hidden" : undefined} d="M161.17,242.08c13.73,0,25.02,4.36,33.87,12.96,8.85,8.6,13.21,19.63,13.21,32.97s-4.36,24.38-13.21,32.97c-8.85,8.72-20.14,13.09-33.87,13.09s-24.89-4.36-33.74-13.09c-8.85-8.6-13.21-19.63-13.21-32.97s4.36-24.38,13.21-32.97c8.85-8.6,20.01-12.96,33.74-12.96ZM161.17,324.19c10.65,0,19.37-3.46,26.3-10.26,6.93-6.8,10.39-15.52,10.39-26.04s-3.46-18.99-10.39-25.79c-6.93-6.8-15.65-10.14-26.3-10.14s-19.37,3.34-26.3,10.14c-6.93,6.8-10.39,15.39-10.39,25.79s3.46,19.24,10.39,26.04,15.65,10.26,26.3,10.26ZM172.59,293.4l9.88,16.81h-13.73l-8.72-15.65h-5.77v15.65h-11.8v-44.52h23.73c9.11,0,15.39,6.03,15.39,14.37,0,6.16-3.46,11.29-8.98,13.34ZM154.24,276.46v8.98h8.98c2.69,0,4.62-1.67,4.62-4.62,0-2.69-1.67-4.36-4.62-4.36h-8.98Z" />
      <path className={hideNA} d="M582.69,644.78h132.13v-352.06h-157.81v177.33l-146.66-157.63c-11.64-12.52-28.13-19.7-45.22-19.7h-132.08s0,157.81,0,157.81h.68l.13,194.25h157.81l-.13-176.59,145.92,156.88c11.65,12.53,28.14,19.71,45.23,19.71Z" />
      <path className={hideNA} d="M1018.88,469.83l143.95,152.53c11.6,14.32,29.54,22.13,49.07,21.98l71.22-.13-.48-125.65-150.04-214.3c-4.65-6.65-12.27-10.83-20.36-11.19l-.78-.03-.14.03-182.09.11-2.19.29c-7.96-.44-15.54,3.31-20.13,9.88l-150.69,215.22-.48,125.65,82.54.13c.33,0,.66,0,.99,0,20.24,0,38.25-8.7,49.55-23.96l130.08-150.55Z" />
      <path className={sClass} style={sVariable ? { fill: "var(--s-fill, currentColor)" } : undefined} d="M1805.79,568.16c0-32.63-19.39-62-49.39-74.83l-10.48-5.2-157.99-67.53h217.86v-127.53h-400.4c-45.63,0-81.38,34.87-81.38,79.37v10.96c0,22.73,13.49,43.23,34.36,52.22l184.93,79.68h-219.29v129.04h424.91c31.35,0,56.86-25.51,56.86-56.86v-19.32Z" />
    </svg>
  );
}

/** Header logo, links home. */
export default function Logo() {
  return (
    <Link href="/" aria-label="NAS — faqja kryesore" className="flex shrink-0 items-center text-white transition-opacity hover:opacity-80">
      <LogoMark className="h-7 w-auto sm:h-8" />
    </Link>
  );
}
