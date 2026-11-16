import Reveal from "@/components/ui/Reveal";

interface SectionHeadingProps {
  /** Headline lines, e.g. ["FIND YOUR", "VEHICLE"]. The mark is added to the last line. */
  lines: string[];
  mark?: "." | "?";
  /** Right-side text / link. */
  aside?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}

export default function SectionHeading({ lines, mark = ".", aside, as: Tag = "h2", className = "" }: SectionHeadingProps) {
  return (
    <Reveal className={`mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-14 ${className}`}>
      <Tag className="headline text-[clamp(44px,5vw,80px)]">
        {lines.map((line, i) => (
          <span key={line} className="block">
            {line}
            {i === lines.length - 1 && <span className="text-red">{mark}</span>}
          </span>
        ))}
      </Tag>
      {aside}
    </Reveal>
  );
}
