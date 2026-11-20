import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Size = "sm" | "md";

type LinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  size?: Size;
  /** The red /// marks after the button. On by default: every CTA uses the signature look. */
  slashes?: boolean;
};

/** Classes for the red parallelogram itself. Exported for the odd custom button (e.g. the finder's ignition). */
export const slashClass = (size: Size) =>
  `btn-sheen inline-flex items-center whitespace-nowrap bg-red font-extrabold italic text-white hover:text-white ${
    size === "sm" ? "slant-sm px-[30px] py-3.5 text-xs tracking-[0.08em]" : "slant px-[38px] py-4 text-xs tracking-[0.06em]"
  }`;

/** Lays the button and its /// marks side by side; the marks stretch to the button's height. */
export function SlashFrame({ size = "md", slashes = true, className = "", children }: { size?: Size; slashes?: boolean; className?: string; children: ReactNode }) {
  if (!slashes) return <span className={`group/slash inline-flex ${className}`}>{children}</span>;
  return (
    <span className={`group/slash inline-flex items-stretch ${size === "sm" ? "gap-1" : "gap-1.5"} ${className}`}>
      {children}
      <Slashes size={size} />
    </span>
  );
}

/** The three red slanted marks. They nudge forward when the button is hovered. */
export function Slashes({ size = "md", className = "" }: { size?: Size; className?: string }) {
  return (
    <span aria-hidden className={`ml-1 flex ${size === "sm" ? "gap-1" : "gap-1.5"} ${className}`}>
      {[0, 1, 2].map((i) => (
        <i
          key={i}
          style={{ transitionDelay: `${i * 40}ms` }}
          className={`block self-stretch -skew-x-[24deg] bg-red transition-transform duration-300 ease-out group-hover/slash:translate-x-1 motion-reduce:transition-none ${
            size === "sm" ? "w-[7px]" : "w-[9px]"
          }`}
        />
      ))}
    </span>
  );
}

/** Signature red parallelogram button with the /// marks. */
export function SlashButton({ size = "md", slashes = true, className = "", children, ...rest }: LinkProps) {
  return (
    <SlashFrame size={size} slashes={slashes} className={className}>
      <Link {...rest} className={slashClass(size)}>
        {children}
      </Link>
    </SlashFrame>
  );
}

/**
 * Main CTA (designs: Frame 27756, image 93; hero, header, dealer form). A red block with the top-left and bottom-right corners cut at the
 * same angle, followed by two smaller blocks of the same shape that interlock with it. 44px tall.
 */
const CHAMFER = "polygon(21px 0, 100% 0, 100% 15px, calc(100% - 21px) 100%, 0 100%, 0 29px)";

const blockMain =
  "btn-sheen inline-flex items-center whitespace-nowrap bg-red pl-[19px] pr-6 text-[12.5px] font-extrabold uppercase italic text-white hover:text-white focus-visible:outline-none";

/** The two smaller blocks after the button; they nudge forward on hover. */
function BlockMarks() {
  return (
    <>
      {[
        ["w-[59px]", "-ml-[3px]"],
        ["w-[38px]", "-ml-1"],
      ].map(([w, ml], i) => (
        <i
          key={w}
          aria-hidden
          style={{ clipPath: CHAMFER, transitionDelay: `${i * 40}ms` }}
          className={`block ${w} ${ml} bg-red transition-transform duration-300 ease-out group-hover/slash:translate-x-1 motion-reduce:transition-none`}
        />
      ))}
    </>
  );
}

/** `marks`: the two small blocks after the button (off in the navbar). */
export function BlockButton({
  className = "",
  marks = true,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & { className?: string; marks?: boolean }) {
  return (
    <span className={`group/slash inline-flex h-11 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-white ${className}`}>
      <Link {...rest} style={{ clipPath: CHAMFER }} className={blockMain}>
        {children}
      </Link>
      {marks && <BlockMarks />}
    </span>
  );
}

/**
 * Secondary CTA next to a BlockButton (NAS pages: "Become a dealer", "Find a dealer"): the same
 * cut-corner shape drawn as a 1px white outline; fills white with black text on hover.
 */
const OUTLINE =
  "polygon(evenodd, 21px 0, 100% 0, 100% 15px, calc(100% - 21px) 100%, 0 100%, 0 29px, 21px 0, 21.4px 1px, 1px 29.4px, 1px calc(100% - 1px), calc(100% - 21.4px) calc(100% - 1px), calc(100% - 1px) 15.4px, calc(100% - 1px) 1px, 21.4px 1px)";

export function OutlineBlockButton({ className = "", children, ...rest }: Omit<ComponentProps<typeof Link>, "className"> & { className?: string }) {
  return (
    <Link
      {...rest}
      style={{ clipPath: CHAMFER }}
      className={`group/outline relative inline-flex h-11 items-center whitespace-nowrap pl-[19px] pr-6 text-[12.5px] font-extrabold uppercase italic text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none ${className}`}
    >
      <span aria-hidden style={{ clipPath: OUTLINE }} className="absolute inset-0 bg-white/70" />
      <span className="relative">{children}</span>
    </Link>
  );
}

/** Same block button for form submits. */
export function BlockActionButton({ className = "", type = "button", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <span className={`group/slash inline-flex h-11 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-white ${className}`}>
      <button type={type} {...rest} style={{ clipPath: CHAMFER }} className={`${blockMain} cursor-pointer disabled:cursor-wait disabled:opacity-60`}>
        {children}
      </button>
      <BlockMarks />
    </span>
  );
}

/** Same button for actions that are not links (form submits, "Provo përsëri", …). */
export function SlashActionButton({
  size = "md",
  slashes = true,
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: Size; slashes?: boolean }) {
  return (
    <SlashFrame size={size} slashes={slashes} className={className}>
      <button type={type} {...rest} className={`${slashClass(size)} cursor-pointer disabled:cursor-wait disabled:opacity-60`} />
    </SlashFrame>
  );
}

/*
 * Rule: the red slanted button with /// (above) is for CTAs only: the main action of a section
 * or form. Every other button uses the plain style below: square, outlined, no slant or marks.
 */
const ghostClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap border border-[#3a3a3a] px-5 text-xs font-bold tracking-[0.08em] text-white transition-colors hover:border-white";

/** Plain secondary link. */
export function GhostButton({ className = "", children, ...rest }: Omit<ComponentProps<typeof Link>, "className"> & { className?: string }) {
  return (
    <Link {...rest} className={`${ghostClass} hover:text-white ${className}`}>
      {children}
    </Link>
  );
}

/** Plain secondary button (not a link). */
export function GhostActionButton({ className = "", type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...rest} className={`${ghostClass} cursor-pointer ${className}`} />;
}

/** 1.5px ring in the CTA's cut-corner shape (outer contour minus inner, evenodd). */
const OUTLINE_15 =
  "polygon(evenodd, 21px 0, 100% 0, 100% 15px, calc(100% - 21px) 100%, 0 100%, 0 29px, 21px 0, 21.6px 1.5px, 1.5px 29.6px, 1.5px calc(100% - 1.5px), calc(100% - 21.6px) calc(100% - 1.5px), calc(100% - 1.5px) 15.6px, calc(100% - 1.5px) 1.5px, 21.6px 1.5px)";

/**
 * Secondary CTA in the dealer section (chrome accent, used only there): the CTA's cut-corner shape
 * drawn as a 1.5px chrome outline with white text. Hover / focus: a glint runs along the outline and
 * the button fills with chrome, text black. A plain <a> so it can be a tel: or external link.
 */
export function ChromeOutlineButton({ className = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...rest}
      style={{ clipPath: CHAMFER }}
      className={`group/chrome relative inline-flex h-11 items-center whitespace-nowrap pl-[19px] pr-6 text-[12.5px] font-extrabold uppercase italic text-white transition-colors duration-300 hover:text-black focus-visible:text-black focus-visible:outline-none ${className}`}
    >
      {/* Chrome fill (hover) */}
      <span aria-hidden className="chrome absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/chrome:opacity-100 group-focus-visible/chrome:opacity-100" />
      {/* Chrome outline + the glint that runs along it on hover */}
      <span aria-hidden style={{ clipPath: OUTLINE_15 }} className="chrome absolute inset-0">
        <span className="glint absolute inset-0 group-hover/chrome:animate-[glint-sweep_0.9s_cubic-bezier(.7,0,.2,1)_both] group-focus-visible/chrome:animate-[glint-sweep_0.9s_cubic-bezier(.7,0,.2,1)_both]" />
      </span>
      <span className="relative">{children}</span>
    </a>
  );
}
