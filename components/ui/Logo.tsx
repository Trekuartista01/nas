import Link from "next/link";

/** Text logo until the real logo file arrives ([ATTACH LOGO]). */
export default function Logo() {
  return (
    <Link href="/" aria-label="Moto Shpati — faqja kryesore" className="wide flex flex-col leading-[0.9]">
      <span className="text-[11px] font-extrabold tracking-[0.12em]">MOTO</span>
      <span className="text-2xl font-black italic tracking-tight text-red">SHPATI</span>
    </Link>
  );
}
