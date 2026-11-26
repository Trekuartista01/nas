/** Homepage content blocks. Future admin data (BannerManager etc.). */
import type { CategoryCardItem } from "@/components/ui/CategoryCards";
import type { VehicleType } from "@/data/models";
import { slugify } from "@/lib/format";

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

/** Find your vehicle card: a category card plus the model type it counts and its cut-out bike. */
export interface VehicleCategory extends CategoryCardItem {
  type: VehicleType;
  /** Giant outlined word behind the bike. */
  word: string;
  /** Transparent bike image. TEMP cut-outs made from the photos below; replace with studio cut-outs. */
  cutout?: string;
  /**
   * Scroll-section clip: the bike riding in from the right and ending on the left (16:9, no audio).
   * Scroll scrubs it, so encode all-keyframe (see VehicleScroll). Until it exists the cut-out slides.
   */
  video?: string;
  /** First frame of the video, shown while it loads. */
  poster?: string;
}

export const vehicleCategories: VehicleCategory[] = [
  {
    num: "01",
    title: "SPORT BIKES",
    count: "[XX] MODELE",
    description: "Naked, sport dhe touring — nga 125cc deri në [XXX]cc.",
    photoLabel: "[FOTO MOTOR]",
    image: "/images/nas-cat-nas-sport.jpg",
    type: "sport",
    word: "SPORT",
    cutout: "/images/nas-cat-nas-sport-cutout.webp",
    href: "/modelet?kategoria=sport",
  },
  {
    num: "02",
    title: "DIRT BIKES",
    count: "[XX] MODELE",
    description: "Enduro dhe motocross — për terren, shtigje dhe pista.",
    photoLabel: "[FOTO DIRT BIKE]",
    image: "/images/nas-cat-nas-dirt.jpg",
    type: "dirt",
    word: "DIRT",
    cutout: "/images/nas-cat-nas-dirt-cutout.webp",
    href: "/modelet?kategoria=dirt",
  },
  {
    num: "03",
    title: "SCOOTERS",
    count: "[XX] MODELE",
    description: "Për qytetin: 50cc pa patentë A, maxi-skuterë deri në 350cc.",
    photoLabel: "[FOTO SKUTER]",
    image: "/images/nas-model-nas-max-x-125.jpg",
    href: "/modelet?kategoria=skuter",
    type: "scooter",
    word: "SKUTER",
    cutout: "/images/nas-model-nas-max-x-125-cutout.webp",
  },
  // ATVs removed from the catalog (Nov 2026).
];

export const accessoryCategories: CategoryCardItem[] = [
  {
    num: "01",
    title: "HELMETS",
    count: "[XX] PRODUKTE",
    description: "Full-face, modulare dhe open-face — të certifikuara.",
    photoLabel: "[FOTO KASKË]",
    image: "/images/nas-acc-helmets.jpg",
    href: "/aksesoret?kategoria=kaska",
  },
  {
    num: "02",
    title: "APPAREL",
    count: "[XX] PRODUKTE",
    description: "Xhaketa, pantallona dhe kombinezone me mbrojtëse.",
    photoLabel: "[FOTO XHAKETË]",
    image: "/images/nas-acc-apparel.jpg",
    href: "/aksesoret?kategoria=veshje",
  },
  {
    num: "03",
    title: "GLOVES & BOOTS",
    count: "[XX] PRODUKTE",
    description: "Dorëza dhe çizme për verë, dimër dhe terren.",
    photoLabel: "[FOTO DORËZA]",
    image: "/images/nas-acc-gloves-boots.jpg",
    href: "/aksesoret?kategoria=doreza-cizme",
  },
  {
    num: "04",
    title: "BIKE PARTS",
    count: "[XX] PRODUKTE",
    description: "Top-case, çanta, kyçe, mbulesa dhe pjesë origjinale.",
    photoLabel: "[FOTO AKSESORË]",
    image: "/images/nas-acc-parts.jpg",
    href: "/aksesoret?kategoria=pjese",
  },
];

/** NAS World tiles — photos from the dealer Instagram, titles still placeholders. */
export const worldTiles = {
  feature: { tag: "EVENT · [DATA]", title: "RIDE-OUT: PEJË → RUGOVË", text: "Bashkohu me komunitetin. Regjistrimi falas.", image: "/images/nas-world-ride-out.jpg" },
  small: [
    { tag: "LAJME", title: "Unboxing: QJMOTOR mbërriti", image: "/images/nas-world-qj-unboxing.jpg" },
    { tag: "MODEL I RI", title: "ZONTES 703 RR", image: "/images/nas-world-new-model.jpg" },
    { tag: "KËSHILLA", title: "[Përgatit motorin për dimër]", image: "/images/nas-world-tips.jpg" },
  ],
};

export const tickerItems = [
  "TEST RIDE FALAS",
  "FINANCIM ME KËSTE",
  "SERVIS I AUTORIZUAR",
  "PJESË ORIGJINALE",
  "PEJË, KOSOVË",
];

/** Address of a brand page: /brendet/<slug>. Derived from the name (brands have no slug field). */
export const brandSlug = (name: string) => slugify(name);

export interface Brand {
  name: string;
  /** Optional logo in /public/images/brands/. Until it arrives, the name is set as a wordmark. */
  logo?: string;
}

/** Every brand NAS sells (from the current catalog). Confirm the full list with the client. */
export const brands: Brand[] = [
  { name: "NAS" },
  { name: "QJMOTOR" },
  { name: "ZONTES" },
  { name: "MRZ" },
  { name: "DAZZLE" },
];
