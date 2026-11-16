import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Admin building blocks. Same tokens as the site (ink/surface/line/red, Archivo), but calm and
 * functional: normal-width type, square edges, no slanted buttons or motion (decided with the client).
 */

export const buttonClass = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 bg-red px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c00500] disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 border border-line-2 bg-surface px-4 text-sm font-semibold text-white transition-colors hover:border-[#3a3a3a] hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex min-h-10 items-center justify-center gap-2 border border-red/60 px-4 text-sm font-semibold text-red transition-colors hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60",
  small:
    "inline-flex min-h-8 items-center justify-center gap-1.5 border border-line-2 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-60",
};

export function ButtonLink({ variant = "primary", className = "", ...rest }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonClass }) {
  return <Link {...rest} className={`${buttonClass[variant]} ${className}`} />;
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-xs text-muted hover:text-white">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <div className="mt-1 text-sm text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-panel ${className}`}>
      {title && <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{title}</h2>}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line-2 px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

const badgeTone = {
  neutral: "border-line-2 text-muted-2",
  red: "border-red/50 bg-red/10 text-[#ff5a52]",
  amber: "border-highlight/40 bg-highlight/10 text-highlight",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap border px-2 py-0.5 text-[11px] font-semibold ${badgeTone[tone]}`}>{children}</span>;
}

/** Horizontal scroll on small screens instead of squashing columns. */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`border-b border-line bg-surface px-3 py-2.5 text-xs font-semibold text-muted ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`border-b border-line px-3 py-2.5 align-middle ${className}`}>{children}</td>;
}

/** Small square thumbnail for list rows. */
export function Thumb({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <span className="block size-11 border border-line bg-surface" aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails; no next/image pipeline on this site
  return <img src={src} alt={alt} className="size-11 border border-line bg-surface object-cover" loading="lazy" />;
}

export function AdminLoading() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Duke u ngarkuar">
      <div className="h-8 w-56 bg-surface" />
      <div className="h-4 w-80 bg-surface" />
      <div className="mt-6 h-64 border border-line bg-panel" />
    </div>
  );
}
