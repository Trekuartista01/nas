/**
 * Per-model content for the model detail page (design: Frame 27764). Like data/model-showcase.ts,
 * none of this is in Supabase yet: move it into Admin → Modelet once the client approves the page.
 *
 * Every field is optional. Anything missing shows a visible [PLACEHOLDER] in its place, so the
 * page keeps the design's shape until the client sends the real copy, photos and videos.
 */

/** The stage tabs, in the design's order. */
export const MODEL_VIEWS = ["ANASH", "PËRPARA", "PRAPA", "DETAJ", "KOKPITI"] as const;
export type ModelView = (typeof MODEL_VIEWS)[number];

export interface ModelFeature {
  /** Caption at the bottom left of the strip, e.g. "TFT FULL COLOR LCD SCREEN PANEL". */
  title: string;
  image?: string;
  /** Short muted loop instead of the photo (no audio). */
  video?: string;
}

export interface ModelDetails {
  /** One line under the specs strip, e.g. "SPORT CAFÉ HERITAGE, STREET SCRAMBLER SPIRIT." */
  tagline?: string;
  /** A photo per stage tab. "ANASH" falls back to the model's catalog photo / cut-out. */
  views?: Partial<Record<ModelView, string>>;
  /** The large full-width block under the tagline: a muted loop (preferred) or a photo. */
  media?: { video?: string; poster?: string; image?: string };
  /** The full-width strips after SPECS (the design has three). */
  features?: ModelFeature[];
}

const details: Record<string, ModelDetails> = {};

const DETAIL = "/detail-images/web";

/**
 * TEMP strips shown on every model until it has its own features (Nov 2026: the only detail photos we
 * have; they show another brand's bike, so replace them per model when the client sends NAS ones).
 * Captions as in the design; the switchgear one has no caption in the design yet.
 */
export const DEFAULT_FEATURES: ModelFeature[] = [
  { title: "GEN 2.5 KEYLESS CONTROL SYSTEM", image: `${DETAIL}/keyless.webp` },
  { title: "[VEÇORIA · KOMANDAT NË TIMON]", image: `${DETAIL}/controls.webp` },
  { title: "TFT FULL COLOR LCD SCREEN PANEL", image: `${DETAIL}/tft.webp` },
  { title: "ECO AND SPORT", image: `${DETAIL}/eco-sport.webp` },
];

/** TEMP media block (above SPECS) on every model until it has its own photo or video. Same Zontes caveat. */
export const DEFAULT_MEDIA: NonNullable<ModelDetails["media"]> = { image: `${DETAIL}/showcase.webp` };

export function getModelDetails(slug: string): ModelDetails {
  return details[slug] ?? {};
}
