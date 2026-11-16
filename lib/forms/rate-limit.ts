import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient, serviceConfigured } from "@/lib/supabase/service";

/**
 * Per-visitor limits on form submissions (sliding window).
 *
 * Storage: the shared Supabase counter once the database is connected (same count on every
 * server instance). Before that, this server's memory: on Vercel the site runs on several
 * short-lived instances, so that count is per instance (slows an abuser down, not a hard limit).
 * At launch, enable Vercel's firewall rate limiting as well.
 *
 * Visitors are identified by a hash of their IP address; the raw IP is never stored or logged.
 */

export interface RateRule {
  /** Max requests in the window. */
  limit: number;
  windowMs: number;
}

const MINUTE = 60_000;

/** Per form (`form:<kind>`) and across all forms (`all`). Generous for people, tight for scripts. */
export const RULES = {
  form: { limit: 5, windowMs: 10 * MINUTE },
  newsletter: { limit: 3, windowMs: 60 * MINUTE },
  all: { limit: 20, windowMs: 60 * MINUTE },
} satisfies Record<string, RateRule>;

interface Store {
  /** Record one hit and return all hits still inside the window (oldest first). */
  hit(key: string, now: number, windowMs: number): Promise<number[]>;
}

const MAX_KEYS = 10_000; // memory guard: a flood of fake IPs can't grow the map forever

const memory = new Map<string, number[]>();
const memoryStore: Store = {
  async hit(key, now, windowMs) {
    const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
    hits.push(now);
    memory.delete(key); // re-insert so the Map stays ordered by last use
    memory.set(key, hits);
    if (memory.size > MAX_KEYS) memory.delete(memory.keys().next().value!);
    return hits;
  },
};

/**
 * Shared counter in Supabase (rate_limit_hit() in the migration): the same count on every server
 * instance. If the database can't be reached, fall back to this instance's memory rather than
 * blocking every visitor or letting everything through.
 */
const supabaseStore: Store = {
  async hit(key, now, windowMs) {
    try {
      const { data, error } = await createServiceClient().rpc("rate_limit_hit", { p_key: key, p_window_ms: windowMs });
      if (error) throw new Error(error.message);
      return (data as (number | string)[]).map(Number);
    } catch (error) {
      console.error("[forms] shared rate limit unavailable, using memory:", error instanceof Error ? error.message : error);
      return memoryStore.hit(key, now, windowMs);
    }
  },
};

let store: Store | null = null;
const activeStore = (): Store => (store ??= serviceConfigured() ? supabaseStore : memoryStore);

/** Tests only. */
export function _resetRateLimits() {
  memory.clear();
  store = memoryStore;
}

/** Hash of the visitor's IP. On Vercel these headers are set by the platform, not the browser. */
export async function visitorId(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Count this submission against every rule. Returns how many minutes until the visitor can try
 * again, or 0 if allowed. Called after validation: it protects the shop's inbox, so typos don't count.
 */
export async function checkRateLimit(visitor: string, kind: string, now = Date.now()): Promise<number> {
  const checks: [string, RateRule][] = [
    [`form:${kind}:${visitor}`, kind === "newsletter" ? RULES.newsletter : RULES.form],
    [`all:${visitor}`, RULES.all],
  ];
  let waitMs = 0;
  for (const [key, rule] of checks) {
    const hits = await activeStore().hit(key, now, rule.windowMs);
    if (hits.length > rule.limit) {
      // Free again when the oldest hit that keeps us over the limit leaves the window.
      const oldestBlocking = hits[hits.length - 1 - rule.limit];
      waitMs = Math.max(waitMs, oldestBlocking + rule.windowMs - now);
    }
  }
  return waitMs > 0 ? Math.max(1, Math.ceil(waitMs / MINUTE)) : 0;
}
