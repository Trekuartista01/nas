"use client";

import { useId, useRef, type ReactNode } from "react";
import { useAdminForm } from "@/components/admin/AdminForm";
import { slugify } from "@/lib/admin/format";

/** Plain inputs for admin forms. Each reads its server error from the surrounding AdminForm. */

export const inputClass =
  "w-full min-h-10 border border-line-2 bg-surface px-3 py-2 text-[15px] text-white outline-none transition-colors placeholder:text-[#5a5a5a] focus:border-[#4a4a4a] aria-[invalid=true]:border-red";

interface BaseProps {
  name: string;
  label: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

export function FieldShell({ id, name, label, hint, required, className = "", error: localError, children }: BaseProps & { id: string; error?: string | null; children: ReactNode }) {
  const { errors } = useAdminForm();
  const error = localError ?? errors[name];
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted-2">
        {label}
        {required && <span className="text-red"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1.5 text-xs text-[#ff5a52]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1.5 text-xs text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function useFieldProps(name: string, hint?: ReactNode) {
  const id = useId();
  const { errors } = useAdminForm();
  const invalid = Boolean(errors[name]);
  return { id, invalid, describedBy: invalid || hint ? `${id}-msg` : undefined };
}

export function TextField({
  defaultValue,
  type = "text",
  maxLength,
  placeholder,
  ...base
}: BaseProps & { defaultValue?: string | number | null; type?: "text" | "email" | "number" | "date" | "url"; maxLength?: number; placeholder?: string }) {
  const { id, invalid, describedBy } = useFieldProps(base.name, base.hint);
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        name={base.name}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextArea({ defaultValue, rows = 4, maxLength, ...base }: BaseProps & { defaultValue?: string | null; rows?: number; maxLength?: number }) {
  const { id, invalid, describedBy } = useFieldProps(base.name, base.hint);
  return (
    <FieldShell id={id} {...base}>
      <textarea
        id={id}
        name={base.name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function SelectField({
  defaultValue,
  options,
  placeholder,
  ...base
}: BaseProps & { defaultValue?: string | null; options: { value: string; label: string }[]; placeholder?: string }) {
  const { id, invalid, describedBy } = useFieldProps(base.name, base.hint);
  return (
    <FieldShell id={id} {...base}>
      <select id={id} name={base.name} defaultValue={defaultValue ?? ""} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 size-5 shrink-0 accent-red" />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-faint">{hint}</span>}
      </label>
    </div>
  );
}

/** Text input datalist (free text with suggestions), e.g. brand names. */
export function SuggestField({ suggestions, defaultValue, maxLength, ...base }: BaseProps & { suggestions: string[]; defaultValue?: string | null; maxLength?: number }) {
  const { id, invalid, describedBy } = useFieldProps(base.name, base.hint);
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        name={base.name}
        list={`${id}-list`}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        autoComplete="off"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={inputClass}
      />
      <datalist id={`${id}-list`}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </FieldShell>
  );
}

/**
 * Slug (the address of the page, /modelet/<slug>). "Krijo nga emri" fills it from other fields
 * of the same form, e.g. brand + name → "nas-max-x-125".
 */
export function SlugField({ defaultValue, from, prefix, ...base }: BaseProps & { defaultValue?: string | null; from: string[]; prefix: string }) {
  const { id, invalid, describedBy } = useFieldProps(base.name, base.hint);
  const ref = useRef<HTMLInputElement>(null);

  function generate() {
    const form = ref.current?.form;
    if (!form || !ref.current) return;
    const source = from.map((n) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "").join(" ");
    ref.current.value = slugify(source);
    form.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <FieldShell id={id} {...base}>
      <div className="flex">
        <span className="hidden items-center border border-r-0 border-line-2 bg-[#0c0c0c] px-3 text-sm text-faint sm:flex">{prefix}</span>
        <input
          ref={ref}
          id={id}
          name={base.name}
          defaultValue={defaultValue ?? ""}
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${inputClass} min-w-0 flex-1`}
        />
        <button type="button" onClick={generate} className="shrink-0 border border-l-0 border-line-2 px-3 text-xs font-semibold text-muted-2 hover:bg-[#181818] hover:text-white">
          Krijo nga emri
        </button>
      </div>
    </FieldShell>
  );
}

/** Two or three fields side by side on wider screens. */
export function FieldRow({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={`grid gap-4 ${grid}`}>{children}</div>;
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border border-line bg-panel p-4 sm:p-5">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs text-faint">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
