/**
 * Local catalog for Milestone 1. Shaped like the future Supabase `models` table.
 *
 * Model names + photos come from Moto Shpati's Instagram (@moto.shpati).
 * Still to confirm with the client: exact cc, licence class and ALL prices (prices are DEMO).
 * "[MODELI] 50" stays a placeholder so the AM-licence path of the bike finder has a road scooter.
 */
import { buildIndex, normalize, type SearchIndex } from "@/lib/search";

export type VehicleType = "sport" | "dirt" | "scooter" | "atv";
export type Licence = "AM" | "A1" | "A2" | "A";

export interface Model {
  slug: string;
  brand: string;
  name: string;
  type: VehicleType;
  cc: number;
  licence: Licence;
  price: number;
  isNew: boolean;
  image?: string;
}

export const TYPE_LABEL: Record<VehicleType, string> = {
  sport: "SPORT",
  dirt: "DIRT",
  scooter: "SKUTER",
  atv: "ATV",
};

export const LICENCE_RANK: Record<Licence, number> = { AM: 0, A1: 1, A2: 2, A: 3 };

const img = (name: string) => `/images/motoshpati-model-${name}.jpg`;

export const models: Model[] = [
  { slug: "nas-max-x-125", brand: "NAS", name: "MAX-X 125", type: "scooter", cc: 125, licence: "A1", price: 3290, isNew: true, image: img("nas-max-x-125") },
  { slug: "nas-max-x-200", brand: "NAS", name: "MAX-X 200", type: "scooter", cc: 200, licence: "A2", price: 3990, isNew: false, image: img("nas-max-x-200") },
  { slug: "nas-sky-5-125", brand: "NAS", name: "SKY 5 125", type: "scooter", cc: 125, licence: "A1", price: 2290, isNew: false, image: img("nas-sky-5-125") },
  { slug: "skuter-50", brand: "[MARKA]", name: "[MODELI] 50", type: "scooter", cc: 50, licence: "AM", price: 1490, isNew: false, image: img("nas-max-x-125") }, // STAND-IN photo until the real 50cc model photo arrives
  { slug: "zontes-703rr", brand: "ZONTES", name: "703 RR", type: "sport", cc: 703, licence: "A", price: 6900, isNew: true, image: img("zontes-703rr") },
  { slug: "zontes-g1-200", brand: "ZONTES", name: "G1 200", type: "sport", cc: 200, licence: "A2", price: 2890, isNew: false, image: img("zontes-g1-200") },
  { slug: "mrz-da250-enduro", brand: "MRZ", name: "DA250 ENDURO", type: "dirt", cc: 250, licence: "A2", price: 3490, isNew: true, image: img("mrz-da250-enduro") },
  // ATV licence class: placeholder (A1) until the client confirms the rule in Kosovo.
  { slug: "dazzle-afc-250l", brand: "DAZZLE", name: "AFC 250L", type: "atv", cc: 250, licence: "A1", price: 4890, isNew: false, image: img("dazzle-afc-250l") },
  { slug: "dazzle-afp-125", brand: "DAZZLE", name: "AFP 125", type: "atv", cc: 125, licence: "A1", price: 2690, isNew: false, image: img("dazzle-afp-125") },
  { slug: "dazzle-afg-49", brand: "DAZZLE", name: "AFG 49", type: "atv", cc: 49, licence: "AM", price: 990, isNew: false, image: img("dazzle-afg-49") },
];

export function getModel(slug: string): Model | undefined {
  return models.find((m) => m.slug === slug);
}

const TYPE_TAGS: Record<VehicleType, string[]> = {
  sport: ["vehicle", "motorcycle", "sport"],
  dirt: ["vehicle", "motorcycle", "dirt"],
  scooter: ["vehicle", "scooter"],
  atv: ["vehicle", "atv"],
};

/** Search index: name/brand/cc/licence plus every synonym of the model's type, licence, brand and "new" groups. */
export function modelSearchIndex(m: Model): SearchIndex {
  const brandTag = `brand-${normalize(m.brand).replace(/ /g, "")}`;
  return buildIndex(
    [m.brand, m.name, TYPE_LABEL[m.type], m.cc, `${m.cc}cc`, m.licence],
    [...TYPE_TAGS[m.type], `licence-${m.licence.toLowerCase()}`, brandTag, ...(m.isNew ? ["new"] : [])],
  );
}
