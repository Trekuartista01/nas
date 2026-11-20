"use client";

import { useInView } from "react-intersection-observer";
import { LogoMark } from "@/components/ui/Logo";

/** The NAS wordmark in black whose S turns red once it is on screen ("One letter. One signal."). */
export default function RedSLogo({ className = "" }: { className?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.6, delay: 250 });
  return (
    <div
      ref={ref}
      className={`[&_path:last-child]:transition-[fill] [&_path:last-child]:delay-300 [&_path:last-child]:duration-1000 [&_path:last-child]:ease-nas ${inView ? "[&_path:last-child]:fill-red" : ""} ${className}`}
    >
      <LogoMark title="NAS" className="h-auto w-full text-ink" />
    </div>
  );
}
