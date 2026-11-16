import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  size?: "sm" | "md";
  /** Adds the red /// marks after the button (main hero CTA). */
  slashes?: boolean;
};

const slashClass = (size: "sm" | "md") =>
  `btn-sheen inline-block whitespace-nowrap bg-red font-extrabold italic text-white hover:text-white ${
    size === "sm" ? "slant-sm px-[22px] py-3.5 text-xs tracking-[0.08em]" : "slant px-[30px] py-4 text-xs tracking-[0.06em]"
  }`;

/** Signature red parallelogram button. */
export function SlashButton({ size = "md", slashes = false, className = "", children, ...rest }: LinkProps) {
  const button = (
    <Link {...rest} className={`${slashClass(size)} ${slashes ? "" : className}`}>
      {children}
    </Link>
  );
  if (!slashes) return button;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {button}
      <Slashes />
    </span>
  );
}

export function Slashes({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`ml-1 flex gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className="block h-[46px] w-[9px] -skew-x-[24deg] bg-red" />
      ))}
    </span>
  );
}

/** Same red parallelogram as SlashButton, for actions that are not links (e.g. "Provo përsëri"). */
export function SlashActionButton({ size = "md", className = "", type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" }) {
  return <button type={type} {...rest} className={`${slashClass(size)} cursor-pointer ${className}`} />;
}

/** Outlined button that fills white on hover. */
export function GhostButton({ className = "", children, ...rest }: Omit<ComponentProps<typeof Link>, "className"> & { className?: string }) {
  return (
    <Link
      {...rest}
      className={`btn-sheen inline-block border border-white px-5 py-3.5 text-xs font-extrabold tracking-[0.1em] text-white hover:bg-white hover:text-ink ${className}`}
    >
      {children}
    </Link>
  );
}
