import Marquee from "@/components/ui/Marquee";
import { tickerItems } from "@/data/home";

export default function Ticker() {
  return (
    <div className="-mt-2 -skew-y-[1.2deg] bg-red py-5">
      <Marquee>
        <p className="wide whitespace-nowrap pr-12 text-[clamp(22px,2.4vw,34px)] font-black italic tracking-[-0.01em]">
          {tickerItems.map((item) => (
            <span key={item}>
              {item} <span className="opacity-50">{"//"}</span>{" "}
            </span>
          ))}
        </p>
      </Marquee>
    </div>
  );
}
