"use client";

import { createContext, useContext } from "react";

/**
 * Whether the lineup behind the /modelet shutter may show itself yet.
 * null = no shutter on this page (e.g. /aksesoret): the catalog animates in as soon as it mounts.
 * false / true = waiting behind the closed door / the door is half open: ease in now.
 */
export const LineupReveal = createContext<boolean | null>(null);

export function useLineupReveal() {
  return useContext(LineupReveal);
}

/** Shared entrance for the lineup pieces (filters, sort row, cards). */
export const LINEUP_EASE = [0.2, 0.8, 0.2, 1] as const;
