import Marquee from "@/components/ui/Marquee";
import SectionHeading from "@/components/ui/SectionHeading";
import { brands, type Brand } from "@/data/home";

/** Repeat the list so one copy is always wider than the widest screen. */
const REPEAT = 3;

const rowClass = "wide whitespace-nowrap text-[clamp(80px,10vw,160px)] font-black italic leading-[1.05] tracking-[-0.03em]";

/** Original look: outlined and red names alternate on the top row; the bottom row is solid dark grey. */
function Row({ items, reverse }: { items: Brand[]; reverse?: boolean }) {
  const list = Array.from({ length: REPEAT }, () => items).flat();
  return (
    <Marquee duration={40} reverse={reverse} className={rowClass}>
      {list.map((b, i) => {
        const tone = reverse
          ? "text-[#2a2a2a]"
          : i % 2 === 0
            ? "text-transparent [-webkit-text-stroke:2px_#fff]"
            : "text-red";
        return (
          <span key={`${b.name}-${i}`} className="flex-none pr-[0.3em]">
            <span className={tone}>{b.name}</span>
            <span className={reverse ? "text-[#2a2a2a]" : "text-red"}> /</span>
          </span>
        );
      })}
    </Marquee>
  );
}

export default function Brands() {
  // Second row starts mid-list so the same brand never sits above itself.
  const offset = Math.ceil(brands.length / 2);
  const second = [...brands.slice(offset), ...brands.slice(0, offset)];

  return (
    <section id="brendet" className="overflow-hidden pb-36 pt-10">
      <div className="container-moto">
        <SectionHeading
          lines={["THE BRANDS", "BEHIND THE RIDE"]}
          aside={
            <p className="max-w-[360px] text-[15px] leading-normal text-muted">
              Përfaqësues [ZYRTAR] i NAS dhe QJMOTOR në Kosovë — me garanci, servis dhe pjesë origjinale.
            </p>
          }
        />
      </div>
      <div role="img" aria-label={`Brendet: ${brands.map((b) => b.name).join(", ")}`}>
        <Row items={brands} />
        <Row items={second} reverse />
      </div>
    </section>
  );
}
