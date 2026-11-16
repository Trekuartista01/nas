/** Homepage content blocks. Future admin data (BannerManager etc.). */
import type { CategoryCardItem } from "@/components/ui/CategoryCards";

export interface HeroSlide {
  start: number; // seconds into the hero video where this shot begins
  label: string;
}

/** Shot cut points in /videos/hero.mp4 (ends at 10.05s). */
export const heroVideo = {
  src: "/videos/hero.mp4",
  poster: "/videos/hero-poster.jpg",
  duration: 10.05,
  slides: [
    { start: 0, label: "Skuter në qytet" },
    { start: 2.875, label: "Adventure në rrugë" },
    { start: 5.0, label: "Sport në mal" },
    { start: 7.0, label: "ATV në terren" },
  ] satisfies HeroSlide[],
};

export const vehicleCategories: CategoryCardItem[] = [
  {
    num: "01",
    title: "SPORT BIKES",
    count: "[XX] MODELE",
    description: "Naked, sport dhe touring — nga 125cc deri në [XXX]cc.",
    photoLabel: "[FOTO MOTOR]",
    image: "/images/motoshpati-model-zontes-703rr.jpg",
    href: "/modelet?kategoria=sport",
  },
  {
    num: "02",
    title: "DIRT BIKES",
    count: "[XX] MODELE",
    description: "Enduro dhe motocross — për terren, shtigje dhe pista.",
    photoLabel: "[FOTO DIRT BIKE]",
    image: "/images/motoshpati-model-mrz-da250-enduro.jpg",
    href: "/modelet?kategoria=dirt",
  },
  {
    num: "03",
    title: "SCOOTERS",
    count: "[XX] MODELE",
    description: "Për qytetin: 50cc pa patentë A, maxi-skuterë deri në 350cc.",
    photoLabel: "[FOTO SKUTER]",
    image: "/images/motoshpati-cat-scooters.jpg",
    href: "/modelet?kategoria=skuter",
  },
  {
    num: "04",
    title: "ATVS",
    count: "[XX] MODELE",
    description: "Për mal, fermë dhe aventurë — 4x4 dhe utility.",
    photoLabel: "[FOTO ATV]",
    image: "/images/motoshpati-cat-atvs.jpg",
    href: "/modelet?kategoria=atv",
  },
];

export const accessoryCategories: CategoryCardItem[] = [
  {
    num: "01",
    title: "HELMETS",
    count: "[XX] PRODUKTE",
    description: "Full-face, modulare dhe open-face — të certifikuara.",
    photoLabel: "[FOTO KASKË]",
    image: "/images/motoshpati-acc-helmets.jpg",
    href: "/aksesoret?kategoria=kaska",
  },
  {
    num: "02",
    title: "APPAREL",
    count: "[XX] PRODUKTE",
    description: "Xhaketa, pantallona dhe kombinezone me mbrojtëse.",
    photoLabel: "[FOTO XHAKETË]",
    image: "/images/motoshpati-acc-apparel.jpg",
    href: "/aksesoret?kategoria=veshje",
  },
  {
    num: "03",
    title: "GLOVES & BOOTS",
    count: "[XX] PRODUKTE",
    description: "Dorëza dhe çizme për verë, dimër dhe terren.",
    photoLabel: "[FOTO DORËZA]",
    image: "/images/motoshpati-acc-gloves-boots.jpg",
    href: "/aksesoret?kategoria=doreza-cizme",
  },
  {
    num: "04",
    title: "BIKE PARTS",
    count: "[XX] PRODUKTE",
    description: "Top-case, çanta, kyçe, mbulesa dhe pjesë origjinale.",
    photoLabel: "[FOTO AKSESORË]",
    image: "/images/motoshpati-acc-parts.jpg",
    href: "/aksesoret?kategoria=pjese",
  },
];

/** Moto Shpati World tiles — photos from @moto.shpati, titles still placeholders. */
export const worldTiles = {
  feature: { tag: "EVENT · [DATA]", title: "RIDE-OUT: PEJË → RUGOVË", text: "Bashkohu me komunitetin. Regjistrimi falas.", image: "/images/motoshpati-world-ride-out.jpg" },
  small: [
    { tag: "LAJME", title: "Unboxing: QJMOTOR mbërriti në Pejë", image: "/images/motoshpati-world-qj-unboxing.jpg" },
    { tag: "MODEL I RI", title: "ZONTES 703 RR", image: "/images/motoshpati-world-new-model.jpg" },
    { tag: "KËSHILLA", title: "[Përgatit motorin për dimër]", image: "/images/motoshpati-world-tips.jpg" },
  ],
};

export const tickerItems = [
  "TEST RIDE FALAS",
  "FINANCIM ME KËSTE",
  "SERVIS I AUTORIZUAR",
  "PJESË ORIGJINALE",
  "PEJË, KOSOVË",
];

export interface Brand {
  name: string;
  /** Optional logo in /public/images/brands/. Until it arrives, the name is set as a wordmark. */
  logo?: string;
}

/** Every brand Moto Shpati sells (from the current catalog). Confirm the full list with the client. */
export const brands: Brand[] = [
  { name: "NAS" },
  { name: "QJMOTOR" },
  { name: "ZONTES" },
  { name: "MRZ" },
  { name: "DAZZLE" },
];
