import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";
import Reveal from "@/components/ui/Reveal";

export interface CategoryCardItem {
  num: string;
  title: string;
  count: string;
  description: string;
  photoLabel: string;
  href: string;
  image?: string;
}

/**
 * Cards that widen on hover (design: `.cat`). Shared by Find your vehicle and Gear up.
 */
export default function CategoryCards({ items, height = 560 }: { items: CategoryCardItem[]; height?: number }) {
  return (
    <Reveal>
      <div className="flex flex-col gap-4 md:flex-row" style={{ minHeight: height }}>
        {items.map((item) => (
          <Link
            key={item.num}
            href={item.href}
            className="group relative flex min-h-[260px] flex-1 flex-col justify-between overflow-hidden border border-line p-7 text-white transition-[flex-grow] duration-700 ease-moto hover:text-white md:min-h-0 md:hover:grow-[2]"
          >
            <div className="hatch absolute inset-0 transition-transform duration-1000 ease-moto group-hover:scale-[1.08]">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="size-full object-cover" />
              )}
            </div>
            {item.image && (
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55)_0%,rgba(10,10,10,.05)_30%,rgba(10,10,10,.25)_60%,rgba(10,10,10,.9)_100%)]"
              />
            )}
            <div className="relative flex justify-between text-xs tracking-[0.14em] text-faint">
              <span>{item.num}</span>
              <span>{item.count}</span>
            </div>
            {!item.image && (
              <div className="relative self-center text-[11px] tracking-[0.14em] text-[#6f6f6f]">{item.photoLabel}</div>
            )}
            <div className="relative">
              <p className="mb-3.5 max-w-[280px] translate-y-3 text-sm text-[#bdbdbd] opacity-0 transition-all delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
                {item.description}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="wide text-[26px] font-black md:text-3xl">{item.title}</h3>
                  <div className="mt-2.5 h-[3px] w-full origin-left scale-x-25 bg-red transition-transform duration-600 group-hover:scale-x-100" />
                </div>
                <span className="flex size-12 flex-none items-center justify-center rounded-full border border-[#333] transition-all duration-400 group-hover:translate-x-2 group-hover:border-red group-hover:bg-red">
                  <TbArrowRight size={18} aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
