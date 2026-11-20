/**
 * Local accessories catalog for Milestone 1. Shaped like the future Supabase `accessories` table.
 *
 * EVERYTHING here is placeholder until the client sends the real product list:
 * brands, product names, specs and colours are bracketed or "--", prices are DEMO,
 * and every product reuses its category photo from the homepage "Gear up" cards.
 */
import { isPlaceholder } from "@/data/business";
import { buildIndex, type SearchIndex } from "@/lib/search";

export type AccessoryCategory = "kaska" | "veshje" | "doreza-cizme" | "pjese";

export interface AccessorySpec {
  value: string;
  unit?: string;
  label: string;
}

export interface AccessoryColour {
  name: string;
  hex: string;
}

export interface Accessory {
  slug: string;
  brand: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  isNew: boolean;
  image?: string;
  /** Transparent cut-out photo: shown whole (contain), no fade mask. */
  cutout?: boolean;
  /** Search synonym groups (data/synonyms.ts). Category and "new" groups are added automatically. */
  tags: string[];
  /** Short line under the name on the card (sizes, fit, …). */
  meta: string;
  specs: AccessorySpec[];
  colours: AccessoryColour[];
}

export const ACCESSORY_CATEGORY_LABEL: Record<AccessoryCategory, string> = {
  kaska: "Kaska",
  veshje: "Veshje",
  "doreza-cizme": "Dorëza & çizme",
  pjese: "Pjesë & aksesorë",
};

/** Big outlined word behind the product on the detail page (English, like the brand headlines). */
export const ACCESSORY_CATEGORY_WORD: Record<AccessoryCategory, string> = {
  kaska: "HELMET",
  veshje: "APPAREL",
  "doreza-cizme": "GEAR",
  pjese: "PARTS",
};

const photo: Record<AccessoryCategory, string> = {
  kaska: "/images/nas-acc-helmets.jpg",
  veshje: "/images/nas-acc-apparel.jpg",
  "doreza-cizme": "/images/nas-acc-gloves-boots.jpg",
  pjese: "/images/nas-acc-parts.jpg",
};

const specsFor: Record<AccessoryCategory, AccessorySpec[]> = {
  kaska: [
    { value: "--", unit: "g", label: "PESHA" },
    { value: "[ECE]", label: "CERTIFIKIMI" },
    { value: "[XS–XXL]", label: "MADHËSITË" },
    { value: "--", label: "MATERIALI" },
  ],
  veshje: [
    { value: "--", label: "MATERIALI" },
    { value: "[CE]", label: "MBROJTËSET" },
    { value: "[S–3XL]", label: "MADHËSITË" },
    { value: "--", label: "SEZONI" },
  ],
  "doreza-cizme": [
    { value: "--", label: "MATERIALI" },
    { value: "[CE]", label: "CERTIFIKIMI" },
    { value: "[XX–XX]", label: "MADHËSITË" },
    { value: "--", label: "SEZONI" },
  ],
  pjese: [
    { value: "--", unit: "L", label: "VËLLIMI" },
    { value: "--", unit: "kg", label: "PESHA" },
    { value: "[MODELET]", label: "PËRSHTATET" },
    { value: "--", label: "MATERIALI" },
  ],
};

// Demo colour options so the picker can be reviewed. Replace with real variants.
const DEMO_COLOURS: AccessoryColour[] = [
  { name: "E zezë mat", hex: "#0a0a0a" },
  { name: "Jeshile", hex: "#0a9a12" },
  { name: "E kuqe", hex: "#e10600" },
];

const CATEGORY_TAGS: Record<AccessoryCategory, string[]> = {
  kaska: ["accessory", "helmet"],
  veshje: ["accessory", "apparel"],
  "doreza-cizme": ["accessory", "apparel"],
  pjese: ["accessory", "parts"],
};

function item(
  slug: string,
  category: AccessoryCategory,
  name: string,
  meta: string,
  price: number,
  tags: string[],
  { isNew = false, colours = DEMO_COLOURS, brand = "[MARKA]", image = photo[category], cutout = false }: Partial<
    Pick<Accessory, "isNew" | "colours" | "brand" | "image" | "cutout">
  > = {},
): Accessory {
  return {
    slug,
    brand,
    name,
    category,
    price,
    isNew,
    meta,
    image,
    cutout,
    specs: specsFor[category],
    colours,
    tags: [...CATEGORY_TAGS[category], ...tags, ...(isNew ? ["new"] : [])],
  };
}

export const accessories: Accessory[] = [
  // From the approved detail-page design (ZONTES · HELMETA). Price is DEMO.
  item("zontes-helmeta", "kaska", "HELMETA", "[XS–XXL]", 86, ["helmet-full-face", "brand-zontes"], {
    isNew: true,
    brand: "ZONTES",
    image: "/images/nas-acc-zontes-helmeta.png",
    cutout: true,
  }),
  item("kaske-full-face", "kaska", "KASKË FULL-FACE", "[XS–XXL]", 189, ["helmet-full-face"], { isNew: true }),
  item("kaske-modulare", "kaska", "KASKË MODULARE", "[XS–XXL]", 229, ["helmet-modular", "touring"]),
  item("kaske-open-face", "kaska", "KASKË OPEN-FACE", "[XS–XXL]", 119, ["helmet-open-face", "summer"]),
  item("xhakete-tekstili", "veshje", "XHAKETË TEKSTILI", "[S–3XL]", 159, ["jacket", "textile", "touring"], { isNew: true }),
  item("xhakete-lekure", "veshje", "XHAKETË LËKURE", "[S–3XL]", 289, ["jacket", "leather"]),
  item("pantallona-moto", "veshje", "PANTALLONA MOTO", "[S–3XL]", 139, ["trousers"]),
  item("doreza-vere", "doreza-cizme", "DORËZA VERE", "[S–XXL]", 39, ["gloves", "summer"]),
  item("doreza-dimri", "doreza-cizme", "DORËZA DIMRI", "[S–XXL]", 59, ["gloves", "winter"]),
  item("cizme-touring", "doreza-cizme", "ÇIZME TOURING", "[39–47]", 149, ["boots", "touring"]),
  item("top-case", "pjese", "TOP-CASE", "[XX] L", 129, ["luggage", "top-case"], { isNew: true, colours: [] }),
  item("cante-tanku", "pjese", "ÇANTË TANKU", "[XX] L", 69, ["luggage", "bag"], { colours: [] }),
  item("mbulese-motori", "pjese", "MBULESË MOTORI", "[MADHËSIA]", 35, ["cover"], { colours: [] }),
];

export function getAccessory(slug: string): Accessory | undefined {
  return accessories.find((a) => a.slug === slug);
}

/** One-line description used for search results, link previews and structured data. */
export function accessoryDescription(a: Accessory): string {
  const label = ACCESSORY_CATEGORY_LABEL[a.category];
  const name = isPlaceholder(a.brand) ? a.name : `${a.brand} ${a.name}`;
  return `${name} në NAS, Pejë. ${label} për motoristë: shiko ngjyrat, specifikat dhe çmimin.`;
}

export function relatedAccessories(a: Accessory, all: Accessory[], count = 3): Accessory[] {
  const same = all.filter((x) => x.slug !== a.slug && x.category === a.category);
  const others = all.filter((x) => x.slug !== a.slug && x.category !== a.category);
  return [...same, ...others].slice(0, count);
}

/**
 * Search index: name/brand plus every synonym of the product's tags.
 * (Category label left out on purpose: "Dorëza & çizme" would make "dorëza" find boots.)
 */
export function accessorySearchIndex(a: Accessory): SearchIndex {
  return buildIndex([a.brand, a.name, a.meta], a.tags);
}
