/**
 * Local catalog for Milestone 1. Shaped like the future Supabase `models` table.
 *
 * Model names + photos come from the dealer's Instagram.
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

const img = (name: string) => `/images/nas-model-${name}.jpg`;

export const models: Model[] = [
  { slug: "nas-max-x-125", brand: "NAS", name: "MAX-X 125", type: "scooter", cc: 125, licence: "A1", price: 3290, isNew: true, image: img("nas-max-x-125") },
  { slug: "nas-max-x-200", brand: "NAS", name: "MAX-X 200", type: "scooter", cc: 200, licence: "A2", price: 3990, isNew: false, image: img("nas-max-x-200") },
  { slug: "nas-sky-5-125", brand: "NAS", name: "SKY 5 125", type: "scooter", cc: 125, licence: "A1", price: 2290, isNew: false, image: img("nas-sky-5-125") },
  // PLACEHOLDER 4th NAS model (fills the lineup's row of four). Replace name/cc/licence/price/photo in Admin → Modelet.
  { slug: "nas-modeli", brand: "NAS", name: "[MODELI]", type: "scooter", cc: 125, licence: "A1", price: 2990, isNew: false },
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
export function modelSearchIndex(m: Pick<Model, "brand" | "name" | "type" | "cc" | "licence" | "isNew">): SearchIndex {
  const brandTag = `brand-${normalize(m.brand).replace(/ /g, "")}`;
  return buildIndex(
    [m.brand, m.name, TYPE_LABEL[m.type], m.cc, `${m.cc}cc`, m.licence],
    [...TYPE_TAGS[m.type], `licence-${m.licence.toLowerCase()}`, brandTag, ...(m.isNew ? ["new"] : [])],
  );
}

/** A model as a form dropdown option ("NAS MAX-X 125"). */
export function modelOption(m: Model): { value: string; label: string } {
  return { value: m.slug, label: `${m.brand} ${m.name}` };
}

/**
 * The public catalog shows only these brands, and no ATVs (decided with the client, Nov 2026).
 * Every other model stays in the admin panel untouched; widen this list to bring them back.
 * Used by lib/data/catalog.ts (pages) and proxy.ts (404s for hidden models).
 */
export const CATALOG_BRANDS = ["NAS"];

export function inPublicCatalog(m: Pick<Model, "brand" | "type">): boolean {
  return m.type !== "atv" && CATALOG_BRANDS.some((b) => b.toLowerCase() === m.brand.trim().toLowerCase());
}

/** One row of the SPECS section on a model page. `sub` is the small second line ("front / rear"). */
export interface SpecRow {
  label: string;
  sub?: string;
  value: string;
}
export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

/**
 * SPECS section (design: Frame 27764 — model detail page). Same three groups for every model.
 * Only the displacement is known (from cc); every other value stays a visible [XX] placeholder
 * until the client sends the spec sheets. Fill real values per model in MODEL_SPECS below.
 */
export function modelSpecs(m: Pick<Model, "slug" | "cc">): SpecGroup[] {
  const v = (key: string, fallback: string) => MODEL_SPECS[m.slug]?.[key] ?? fallback;
  return [
    {
      title: "MOTORI",
      rows: [
        { label: "DISPLACEMENT", value: v("displacement", `${m.cc} CC`) },
        { label: "MAX POWER", value: v("maxPower", "[XX] KW @ [X,XXX] RPM") },
        { label: "MAX TORQUE", value: v("maxTorque", "[XX] NM @ [X,XXX] RPM") },
        { label: "COOLING", value: v("cooling", "[XX]") },
        { label: "GEARS", value: v("gears", "[XX]") },
        { label: "CONSUMPTION", value: v("consumption", "[X.X] L/100 KM") },
      ],
    },
    {
      title: "DIMENSIONS & WEIGHT",
      rows: [
        { label: "LENGTH", value: v("length", "[XXXX] mm") },
        { label: "SEAT LENGTH", value: v("seatLength", "[XXX] mm") },
        { label: "GROUND CLEARANCE", value: v("groundClearance", "[XXX] mm") },
        { label: "KERB WEIGHT", value: v("kerbWeight", "[XXX] kg") },
        { label: "FUEL TANK", value: v("fuelTank", "[XX] L") },
      ],
    },
    {
      title: "CHASSIS & BRAKES",
      rows: [
        { label: "FRAME", value: v("frame", "[XX]") },
        { label: "TYRES,", sub: "front / rear", value: v("tyres", "[XX] / [XX]") },
        { label: "DISCS,", sub: "front / rear", value: v("discs", "[XXX] / [XXX] mm") },
        { label: "ABS", value: v("abs", "[XX]") },
        { label: "LIGHTING", value: v("lighting", "[XX]") },
      ],
    },
  ];
}

/**
 * Full technical data for the downloadable brochure (/modelet/[slug]/broshura.pdf), laid out like
 * the manufacturer's "Technical Data" sheet: three columns of label/value rows. Shares the keys of
 * MODEL_SPECS with the SPECS section, so one value fills both; missing ones stay [XX] placeholders.
 */
export function modelSpecSheet(m: Pick<Model, "slug" | "cc">): SpecGroup[] {
  const v = (key: string, fallback = "[XX]") => MODEL_SPECS[m.slug]?.[key] ?? fallback;
  return [
    {
      title: "Complete Vehicle",
      rows: [
        { label: "Length (mm)", value: v("length", "[XXXX]") },
        { label: "Width (mm)", value: v("width", "[XXX]") },
        { label: "Height (mm)", value: v("height", "[XXXX]") },
        { label: "Wheel base (mm)", value: v("wheelbase", "[XXXX]") },
        { label: "Loading capacity (kg)", value: v("loadingCapacity", "[XXX]") },
        { label: "Curb weight (kg)", value: v("kerbWeight", "[XXX]") },
        { label: "Minimum ground clearance (mm)", value: v("groundClearance", "[XXX]") },
        { label: "Fuel tank volume (L)", value: v("fuelTank") },
        { label: "Seat height (mm)", value: v("seatHeight", "[XXX]") },
      ],
    },
    {
      title: "Power System",
      rows: [
        { label: "Engine body", value: v("engineBody") },
        { label: "Total number of cylinders", value: v("cylinders") },
        { label: "Camshaft system", value: v("camshaft") },
        { label: "Bore x stroke (mm)", value: v("boreStroke", "[XX] x [XX]") },
        { label: "Cooling system", value: v("cooling") },
        { label: "Fuel", value: v("fuel") },
        { label: "Compression ratio", value: v("compression", "[XX]:1") },
        { label: "Displacement (cc)", value: v("displacementCc", String(m.cc)) },
        { label: "Fuel supply system", value: v("fuelSupply") },
        { label: "Fuel injection system", value: v("injection") },
        { label: "Ignition system", value: v("ignition") },
        { label: "Transmission system", value: v("finalDrive") },
        { label: "Idling speed (r/min)", value: v("idle", "[XXXX]") },
        { label: "Maximum power (kW/rpm)", value: v("maxPower", "[XX] / [XXXX]") },
        { label: "Maximum torque (N.m/rpm)", value: v("maxTorque", "[XX] / [XXXX]") },
        { label: "Transmission", value: v("transmission") },
        { label: "Gear", value: v("gears") },
        { label: "Clutch", value: v("clutch") },
        { label: "Fuel consumption (L/100 km)", value: v("consumption", "[X.X]") },
      ],
    },
    {
      title: "Suspension System",
      rows: [
        { label: "Form of frame", value: v("frame") },
        { label: "Tyre structure", value: v("tyreStructure") },
        { label: "Front rim size", value: v("frontRim") },
        { label: "Rear rim size", value: v("rearRim") },
        { label: "Front tyre size", value: v("frontTyre") },
        { label: "Rear tyre size", value: v("rearTyre") },
        { label: "Front brake size", value: v("frontBrake", "[XXX] mm") },
        { label: "Rear brake size", value: v("rearBrake", "[XXX] mm") },
        { label: "Headlight / taillight / turn signals", value: v("lighting") },
        { label: "Brake system", value: v("abs") },
      ],
    },
  ];
}

/** One spec value for a model (keys as in MODEL_SPECS), or `fallback` while it is missing. */
export function modelSpecValue(slug: string, key: string, fallback: string): string {
  return MODEL_SPECS[slug]?.[key] ?? fallback;
}

/**
 * Real spec values per model slug, as they arrive (keys as in modelSpecs / modelSpecSheet). Empty = placeholders.
 * The strip under the model page stage also reads `powerKw` ("29") and `weightKg` ("188"): plain numbers.
 */
const MODEL_SPECS: Record<string, Record<string, string>> = {};
