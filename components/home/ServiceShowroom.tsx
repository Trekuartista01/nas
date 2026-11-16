import Link from "next/link";
import { TbMotorbike, TbTool } from "react-icons/tb";
import { GhostButton } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/data/business";

export default function ServiceShowroom() {
  return (
    <section id="servisi" className="border-t border-[#1c1c1c] bg-surface">
      <div className="container-moto py-28">
        <SectionHeading lines={["MË SHUMË SE", "NJË SHITJE"]} className="!mb-8" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <Reveal className="flex min-h-[280px] flex-col gap-3.5 border border-line-2 p-8">
            <TbMotorbike size={32} className="text-red" aria-hidden />
            <h3 className="wide text-2xl font-black">TEST RIDE</h3>
            <p className="flex-1 text-[15px] leading-normal text-muted-2">Provo çdo model para se të vendosësh. Sill vetëm patentën.</p>
            <Link
              href="/servisi#test-ride"
              className="btn-sheen self-start bg-red px-5 py-3.5 text-xs font-extrabold tracking-[0.1em] text-white hover:text-white"
            >
              REZERVO
            </Link>
          </Reveal>
          <Reveal delay={0.08} className="flex min-h-[280px] flex-col gap-3.5 border border-line-2 p-8">
            <TbTool size={32} className="text-red" aria-hidden />
            <h3 className="wide text-2xl font-black">SERVIS & PJESË</h3>
            <p className="flex-1 text-[15px] leading-normal text-muted-2">
              Servis i autorizuar dhe pjesë origjinale për çdo model që shesim.
            </p>
            <GhostButton href="/servisi#servis" className="self-start">
              CAKTO TERMIN
            </GhostButton>
          </Reveal>
          <Reveal delay={0.16} className="hatch flex min-h-[280px] flex-col gap-2.5 border border-line-2 p-8">
            <div className="flex items-center gap-2.5 text-xs tracking-[0.12em] text-[#d8d8d8]">
              <i className="block size-2 animate-pulse-dot rounded-full bg-highlight" />
              E HAPUR TANI
            </div>
            <h3 className="wide text-2xl font-black">SHOWROOM PEJË</h3>
            <p className="flex-1 text-[15px] leading-relaxed text-[#cfcfcf]">
              {BUSINESS.street}, {BUSINESS.city} {BUSINESS.postalCode}
              <br />
              Hën–Sht [ORARI]
              <br />
              <a href={`tel:${BUSINESS.phone}`} className="hover:text-red">
                {BUSINESS.phoneDisplay}
              </a>
            </p>
            <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="text-[13px] font-bold hover:text-red">
              Hap në Google Maps →
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
