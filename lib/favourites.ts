"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favourites (♥) without accounts: kept in this browser's localStorage, per device.
 * An item's id is its page path ("/modelet/nas-max-x-125", "/aksesoret/zontes-helmeta"),
 * so models and accessories share one list without clashing.
 *
 * Storage can be missing or blocked (private mode, disabled site data): then hearts still
 * toggle for the current visit and simply aren't remembered.
 */
const KEY = "motoshpati:favourites";
const MAX_ITEMS = 200;
const EMPTY: readonly string[] = [];

let current: readonly string[] | null = null;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    // Only trust what we expect: an array of short path strings.
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string" && x.startsWith("/") && x.length < 200).slice(0, MAX_ITEMS) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): readonly string[] {
  if (current === null) current = read();
  return current;
}

function emit() {
  for (const l of listeners) l();
}

/** Another tab changed the list. */
function onStorage(e: StorageEvent) {
  if (e.key === KEY || e.key === null) {
    current = read();
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function toggle(id: string) {
  const list = getSnapshot();
  current = list.includes(id) ? list.filter((x) => x !== id) : [id, ...list].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Not remembered, but the heart still works for this visit.
  }
  emit();
}

/** All saved ids (newest first). Empty on the server and during the first render. */
export function useFavourites(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Saved state + toggle for one item. */
export function useFavourite(id: string): [saved: boolean, toggle: () => void] {
  const saved = useFavourites().includes(id);
  return [saved, useCallback(() => toggle(id), [id])];
}
