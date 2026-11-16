"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget. Put it inside a <form>: it adds a hidden
 * `cf-turnstile-response` field that the form's server action verifies.
 * Usually invisible; shows a small checkbox only when Cloudflare is unsure.
 *
 * `resetKey`: pass the form state. Tokens are single-use, so the widget fetches a fresh
 * one after every submission attempt.
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set (development without keys).
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function TurnstileWidget({ resetKey }: { resetKey?: unknown }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme: "dark",
          language: "auto", // Turnstile has no Albanian; uses the visitor's browser language
          appearance: "interaction-only",
          "refresh-expired": "auto",
        });
      })
      .catch(() => {
        // The server will refuse the submission and show the "call us" message.
      });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  // New token after each submission attempt.
  useEffect(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, [resetKey]);

  if (!siteKey) return null;
  return <div ref={box} className="min-h-0" />;
}
