import { SYNONYMS } from "@/data/synonyms";

/**
 * Catalog search: synonyms + forgiving matching.
 *
 * - Accents, case, hyphens and punctuation are ignored ("Kaskë" = "kaske", "MAX-X" = "max x").
 * - Spacing is ignored ("topcase" = "top case", "maxx125" = "MAX-X 125").
 * - Matches start at the beginning of a word, so "jet" doesn't hit "veshjet" and "50cc" doesn't hit "250cc".
 * - Every query word must match (narrowing), via the item's own fields or any synonym of its tags.
 * - Typo tolerance ("skutr", "helmt", "xhakte") kicks in only for a word that matches nothing
 *   in the catalog, so real words like "parts" never drift to "pants".
 */

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ë → e, ç → c, š → s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface SearchIndex {
  words: string[];
  /** All words joined without spaces, plus the offset where each word starts. */
  compact: string;
  starts: number[];
}

/** Build an item's index from its own fields plus every synonym of its tag groups. */
export function buildIndex(fields: (string | number | undefined)[], tags: string[]): SearchIndex {
  const parts = fields.filter((f) => f !== undefined && f !== "").map(String);
  for (const tag of tags) parts.push(...(SYNONYMS[tag] ?? []));
  // Each part is kept as its own phrase so "kater rrota" can match as "katerrrota" across its words.
  const phrases = parts.map(normalize).filter(Boolean);
  const words = Array.from(new Set(phrases.flatMap((p) => p.split(" "))));
  let compact = "";
  const starts: number[] = [];
  for (const phrase of phrases) {
    const ws = phrase.split(" ");
    ws.forEach((w) => {
      starts.push(compact.length);
      compact += w;
    });
    compact += "|"; // phrase boundary: compact matches never run from one phrase into the next
  }
  return { words, compact, starts };
}

/** Exact match: the token starts a word, or (spacing ignored) starts a word and runs on through its phrase. */
function exactMatch(index: SearchIndex, token: string): boolean {
  // Very short tokens ("a", "e", "a1", "qj") must be a whole word, or "a" would match everything.
  if (token.length <= 2) return index.words.includes(token);
  if (index.words.some((w) => w.startsWith(token))) return true;
  return index.starts.some((s) => index.compact.startsWith(token, s));
}

function fuzzyMatch(index: SearchIndex, token: string): boolean {
  if (token.length < 4) return false;
  const maxEdits = token.length >= 7 ? 2 : 1;
  return index.words.some(
    (w) =>
      (Math.abs(w.length - token.length) <= maxEdits && editDistance(token, w, maxEdits) <= maxEdits) ||
      // still typing a longer word: compare with its start ("xhakte" → "xhaket…")
      (token.length >= 5 && w.length > token.length && editDistance(token, w.slice(0, token.length), maxEdits) <= maxEdits),
  );
}

/**
 * Search a whole catalog. Returns the keys of matching items, or null for an empty query (show all).
 * Built once per catalog; call the returned function with each query.
 */
export function createCatalogSearch<T>(items: T[], getKey: (item: T) => string, getIndex: (item: T) => SearchIndex) {
  const entries = items.map((item) => ({ key: getKey(item), index: getIndex(item) }));

  return function search(query: string): Set<string> | null {
    const q = normalize(query);
    if (!q) return null;
    const tokens = q.split(" ");
    const whole = tokens.join("");

    // Per token: exact matches if the catalog has any, otherwise fall back to typo-tolerant matches.
    const tokenHits = tokens.map((t) => {
      const exact = entries.filter((e) => exactMatch(e.index, t));
      return new Set((exact.length ? exact : entries.filter((e) => fuzzyMatch(e.index, t))).map((e) => e.key));
    });

    const hits = new Set<string>();
    for (const e of entries) {
      const allTokens = tokenHits.every((set) => set.has(e.key));
      // The whole query typed with odd spacing, e.g. "maxx125" or "kater rrota" as one word.
      const asOneWord = whole.length >= 3 && e.index.starts.some((s) => e.index.compact.startsWith(whole, s));
      if (allTokens || asOneWord) hits.add(e.key);
    }
    return hits;
  };
}

/** Damerau-Levenshtein (adjacent swaps count as one edit) with an early exit past `limit`. */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > limit) return limit + 1;
  }
  return d[a.length][b.length];
}
