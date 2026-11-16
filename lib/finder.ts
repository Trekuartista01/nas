import { LICENCE_RANK, type Licence, type Model } from "@/data/models";

export type Use = "city" | "trip" | "terrain" | "daily";

export interface FinderAnswers {
  licence: Licence;
  use: Use;
  budget: number; // euros
  noLimit: boolean;
}

export interface ScoredModel extends Model {
  score: number; // 62–98 % match
}

function fitsUse(m: Model, use: Use): boolean {
  if (use === "terrain") return m.type === "atv" || m.type === "dirt";
  if (m.type === "atv") return false;
  if (use === "city") return m.cc <= 400;
  if (use === "trip") return m.cc >= 125;
  return true;
}

function fitsLicence(m: Model, licence: Licence): boolean {
  // ATVs follow a separate rule — placeholder until the client confirms it.
  return m.type === "atv" || LICENCE_RANK[m.licence] <= LICENCE_RANK[licence];
}

/** Ported from the design's renderVals(): filter, then score by budget fit and licence headroom. */
export function matchModels(all: Model[], a: FinderAnswers): ScoredModel[] {
  const budget = a.noLimit ? Infinity : a.budget;
  const ref = a.noLimit ? 8000 : a.budget;
  return all
    .filter((m) => fitsLicence(m, a.licence) && fitsUse(m, a.use) && m.price <= budget)
    .map((m) => {
      const fit = 1 - Math.min(1, Math.abs(ref - m.price) / ref);
      const headroom =
        a.licence === "A" || m.type === "atv"
          ? 0
          : Math.max(0, LICENCE_RANK[a.licence] - LICENCE_RANK[m.licence]);
      const score = Math.max(62, Math.min(98, Math.round(72 + fit * 26 - headroom * 6)));
      return { ...m, score };
    })
    .sort((x, y) => y.score - x.score);
}
