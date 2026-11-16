"use client";

import { useActionState } from "react";
import TurnstileWidget from "@/components/forms/TurnstileWidget";
import { submitNewsletter } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";

/**
 * Footer newsletter sign-up (design: homepage footer). Validation, spam trap, rate limit and
 * delivery all happen in the server action; this only shows the result.
 * `noValidate`: the server's Albanian messages are shown instead of the browser's own popups.
 */
export default function NewsletterForm() {
  const [state, action, pending] = useActionState(submitNewsletter, initialFormState);
  const error = state.status === "error" ? (state.errors?.email ?? state.message) : undefined;

  return (
    <form action={action} noValidate className="col-span-2 flex min-w-0 flex-col gap-3" aria-label="Regjistrohu për ofertat">
      <label htmlFor="newsletter" className="mb-1.5 text-xs tracking-[0.14em] text-faint">
        MERR OFERTAT E PARA
      </label>
      <div className={`flex border-b transition-colors ${error ? "border-red" : "border-[#444]"}`}>
        <input
          id="newsletter"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="email@shembull.com"
          // After an error the form refills with what was typed; after success it clears.
          defaultValue={state.status === "error" ? state.values?.email : ""}
          aria-invalid={error ? true : undefined}
          aria-describedby="newsletter-status"
          className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-white outline-none placeholder:text-[#666]"
        />
        <button type="submit" disabled={pending} className="min-h-11 text-xs font-extrabold tracking-[0.1em] text-red disabled:opacity-60">
          {pending ? "DUKE DËRGUAR…" : "REGJISTROHU →"}
        </button>
      </div>

      {/* Spam trap: hidden from people and screen readers; bots tend to fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Mos e plotëso këtë fushë</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <TurnstileWidget resetKey={state} />

      <p id="newsletter-status" aria-live="polite" className={`min-h-5 text-xs ${error ? "text-red" : "text-muted"}`}>
        {error ?? (state.status === "success" ? state.message : "")}
      </p>
    </form>
  );
}
