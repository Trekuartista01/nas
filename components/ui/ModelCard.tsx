import Link from "next/link";
import { TYPE_LABEL, type Model } from "@/data/models";
import { eur } from "@/lib/format";
import { fromMonthly } from "@/lib/finance";

export default function ModelCard({ model }: { model: Model }) {
  return (
    <article className="group flex h-full flex-col border border-[#222] bg-[#0b0b0b] transition-[transform,border-color] duration-500 ease-moto hover:-translate-y-2.5 hover:border-red">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="hatch absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.14em] text-[#6f6f6f] transition-transform duration-700 group-hover:scale-[1.06]">
          {model.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.image} alt={`${model.brand} ${model.name}`} className="size-full object-cover" />
          ) : (
            <span>[FOTO · {model.name}]</span>
          )}
        </div>
        {model.isNew && (
          <span className="absolute left-3.5 top-3.5 bg-highlight px-2.5 py-1.5 text-[11px] font-black tracking-[0.12em] text-ink">
            E RE
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-[11px] tracking-[0.14em] text-faint">
          {model.brand} · {TYPE_LABEL[model.type]}
        </div>
        <h3 className="wide text-[22px] font-black leading-[1.05]">{model.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="border border-[#2c2c2c] px-2 py-1 text-[11px] font-bold text-[#cfcfcf]">{model.cc}cc</span>
          <span className="border border-[#2c2c2c] px-2 py-1 text-[11px] font-bold text-[#cfcfcf]">
            PATENTA {model.licence}
          </span>
        </div>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <div className="text-[26px] font-extrabold">{eur(model.price)}</div>
          <div className="text-xs text-muted">ose {eur(fromMonthly(model.price))}/muaj</div>
        </div>
        <Link
          href={`/modelet/${model.slug}`}
          className="btn-sheen bg-red p-3.5 text-center text-xs font-extrabold tracking-[0.1em] text-white transition-[letter-spacing] duration-400 hover:text-white group-hover:tracking-[0.14em]"
        >
          SHIKO DETAJET
        </Link>
      </div>
    </article>
  );
}
