"use client";

import { createContext, use, useActionState, useId, type ReactNode } from "react";
import TurnstileWidget from "@/components/forms/TurnstileWidget";
import { BlockActionButton, SlashActionButton } from "@/components/ui/Buttons";
import { initialFormState, type FormState } from "@/lib/forms/state";

/**
 * Building blocks for the site's lead forms (offer, test ride, service, finance, contact).
 * No form design exists yet: built from the catalog filters' look (thin borders, dark fields)
 * and the homepage's red slanted button.
 *
 * Validation, spam trap, rate limit and delivery all happen in the server action
 * (lib/forms/actions.ts); these components only show the result. `noValidate` on the form:
 * the server's Albanian messages are shown instead of the browser's own popups.
 * After an error the fields refill with what was typed (React resets a form after an action).
 */

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const FormStateContext = createContext<FormState>(initialFormState);

const fieldClass = "w-full border bg-transparent px-4 text-[15px] text-white placeholder:text-[#666] focus:outline-none aria-[invalid=true]:border-red";
const borderClass = "border-line-2 focus:border-[#555]";

export function LeadForm({
  action,
  label,
  submitLabel,
  look = "slash",
  className = "relative grid gap-5 sm:grid-cols-2",
  children,
}: {
  action: Action;
  /** Accessible name of the form, e.g. "Kërko ofertë". */
  label: string;
  submitLabel: string;
  /** Submit button: the red slanted one with /// (default) or the block CTA (NAS homepage). */
  look?: "slash" | "block";
  /** Classes for the <form> (layout). */
  className?: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const statusId = useId();
  return (
    <FormStateContext value={state}>
      <form action={formAction} noValidate aria-label={label} aria-describedby={statusId} className={className}>
        {children}

        {/* Spam trap: hidden from people and screen readers; bots tend to fill it. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Mos e plotëso këtë fushë
            <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div className="sm:col-span-2">
          <TurnstileWidget resetKey={state} />
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          {look === "block" ? (
            <BlockActionButton type="submit" disabled={pending}>
              {pending ? "DUKE DËRGUAR…" : submitLabel}
            </BlockActionButton>
          ) : (
            <SlashActionButton type="submit" disabled={pending}>
              {pending ? "DUKE DËRGUAR…" : submitLabel}
            </SlashActionButton>
          )}
          <p
            id={statusId}
            role={state.status === "error" ? "alert" : "status"}
            className={`min-h-5 flex-1 text-sm ${state.status === "error" ? "text-[#ff5a52]" : "text-white"}`}
          >
            {state.status === "success" && <span className="mr-2 inline-block size-2 rounded-full bg-highlight align-middle" aria-hidden />}
            {state.status === "idle" ? "" : state.message}
          </p>
        </div>
      </form>
    </FormStateContext>
  );
}

/** Error for one field, and what the visitor typed (after a failed attempt). */
function useField(name: string) {
  const state = use(FormStateContext);
  return {
    error: state.status === "error" ? state.errors?.[name] : undefined,
    value: state.status === "error" ? state.values?.[name] : undefined,
  };
}

function Shell({
  id,
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-2 block text-xs tracking-[0.14em] text-muted">
        {label.toUpperCase()}
        {required && <span className="text-red"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-[#ff5a52]">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

interface BaseProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  /** Span both columns. */
  wide?: boolean;
  defaultValue?: string;
}

export function TextField({
  type = "text",
  autoComplete,
  inputMode,
  maxLength = 200,
  placeholder,
  min,
  max,
  line = false,
  ...p
}: BaseProps & {
  /** Underline-only field (NAS homepage): bottom border, a red line grows in from the left on focus. */
  line?: boolean;
  type?: "text" | "email" | "tel" | "date";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  const id = useId();
  const { error, value } = useField(p.name);
  return (
    <Shell id={id} label={p.label} required={p.required} hint={p.hint} error={error} wide={p.wide}>
      <div className="relative">
        <input
          id={id}
          name={p.name}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          min={min}
          max={max}
          required={p.required}
          defaultValue={value ?? p.defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, p.hint)}
          className={
            line
              ? "peer h-12 w-full border-0 border-b border-line-3 bg-transparent px-0 text-[17px] text-white placeholder:text-[#777] focus:outline-none [color-scheme:dark]"
              : `${fieldClass} ${borderClass} h-12 [color-scheme:dark]`
          }
        />
        {line && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-red transition-transform duration-300 ease-nas peer-focus:scale-x-100 peer-aria-[invalid=true]:scale-x-100"
          />
        )}
      </div>
    </Shell>
  );
}

export function TextArea({ rows = 5, maxLength = 2000, placeholder, ...p }: BaseProps & { rows?: number; maxLength?: number; placeholder?: string }) {
  const id = useId();
  const { error, value } = useField(p.name);
  return (
    <Shell id={id} label={p.label} required={p.required} hint={p.hint} error={error} wide={p.wide ?? true}>
      <textarea
        id={id}
        name={p.name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        required={p.required}
        defaultValue={value ?? p.defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, p.hint)}
        className={`${fieldClass} ${borderClass} resize-y py-3 leading-relaxed`}
      />
    </Shell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({ options, placeholder = "Zgjidh…", ...p }: BaseProps & { options: SelectOption[]; placeholder?: string }) {
  const id = useId();
  const { error, value } = useField(p.name);
  return (
    <Shell id={id} label={p.label} required={p.required} hint={p.hint} error={error} wide={p.wide}>
      <select
        id={id}
        name={p.name}
        required={p.required}
        defaultValue={value ?? p.defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, p.hint)}
        className={`${fieldClass} ${borderClass} h-12 bg-ink [color-scheme:dark]`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

/** Privacy consent, required on every lead form. */
export function ConsentField() {
  const id = useId();
  const { error } = useField("consent");
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-2">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-red"
        />
        {/* [POLITIKA E PRIVATËSISË]: link the privacy page here once its text is ready. */}
        <span>Pranoj që NAS të ruajë dhe të përdorë të dhënat e mia vetëm për t’iu përgjigjur kësaj kërkese.</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-[#ff5a52]">
          {error}
        </p>
      )}
    </div>
  );
}

/** The fields every lead form starts with. `emailRequired`: finance and contact need an email. */
export function ContactFields({ emailRequired = false, phoneRequired = true }: { emailRequired?: boolean; phoneRequired?: boolean }) {
  return (
    <>
      <TextField name="name" label="Emri dhe mbiemri" required autoComplete="name" maxLength={80} wide />
      <TextField
        name="phone"
        label="Telefoni"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={phoneRequired}
        maxLength={25}
        placeholder="044 123 456"
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required={emailRequired}
        maxLength={254}
        placeholder="email@shembull.com"
      />
    </>
  );
}
