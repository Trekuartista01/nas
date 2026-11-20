/**
 * Extra media for the model page hero (ModelShowcase). Kept apart from the `models` table on
 * purpose: none of this is in Supabase yet. When the client approves the hero, move these fields
 * into Admin → Modelet (cutout, colours, 360 frames, hotspots) and read them from the row.
 *
 * Every field is optional. A model with no entry gets the plain photo with a soft fade,
 * no callouts, no swatches and no 360 control, so nothing on the page ever leads nowhere.
 */

export interface ShowcaseHotspot {
  /** Position on the cut-out image, in % of its width/height. */
  x: number;
  y: number;
  label: string;
  /** Which side the label sits on. */
  side: "left" | "right";
}

export interface ShowcaseColour {
  name: string;
  hex: string;
  /** Cut-out (or photo) in this colour. Missing = placeholder until the photo arrives. */
  image?: string;
}

export interface ModelShowcase {
  /** Transparent PNG/WebP of the bike. Enables the stage, glow, floor shadow and callouts. */
  cutout?: string;
  /** Width / height of the cut-out, so the callout % positions line up with the image. */
  aspect?: number;
  /** Headlight position (% of the cut-out) for the entrance flash. */
  headlight?: { x: number; y: number };
  hotspots?: ShowcaseHotspot[];
  colours?: ShowcaseColour[];
  /** 24–36 frames shot around the bike, in order. 8+ frames switches on drag-to-rotate. */
  frames?: string[];
}

const showcase: Record<string, ModelShowcase> = {
  "nas-max-x-125": {
    // TEMP cut-out made from the showroom photo (a second scooter behind it is still in the shot).
    // Replace with a studio cut-out from the client, then re-check the hotspot positions.
    cutout: "/images/nas-model-nas-max-x-125-cutout.webp",
    aspect: 1345 / 1117,
    headlight: { x: 21, y: 44 },
    // Only features visible in the photo. Confirm wording with the client.
    hotspots: [
      { x: 30, y: 12, label: "Xham i lartë", side: "left" },
      { x: 21, y: 44, label: "Drita LED", side: "left" },
      { x: 14, y: 83, label: "Frena me disk", side: "left" },
      { x: 86, y: 74, label: "Motor 125 cc", side: "right" },
    ],
    colours: [
      { name: "E zezë mat", hex: "#1b1c1e", image: "/images/nas-model-nas-max-x-125-cutout.webp" },
      // Placeholders until the client confirms which colours are in stock (and sends the photos).
      { name: "[NGJYRA 2]", hex: "#5d6166" },
      { name: "[NGJYRA 3]", hex: "#d9d9d6" },
    ],
  },
  // Cut-out only (homepage lineup + model page stage). TEMP, made from the showroom photos.
  "nas-max-x-200": { cutout: "/images/nas-model-nas-max-x-200-cutout.webp", aspect: 1200 / 904 },
  "nas-sky-5-125": { cutout: "/images/nas-model-nas-sky-5-125-cutout.webp", aspect: 723 / 820 },
};

export function getShowcase(slug: string): ModelShowcase | undefined {
  return showcase[slug];
}
