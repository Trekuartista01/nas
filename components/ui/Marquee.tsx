/** Infinite horizontal marquee. Content is rendered twice; the track moves -50%. */
export default function Marquee({
  children,
  className = "",
  duration = 28,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
