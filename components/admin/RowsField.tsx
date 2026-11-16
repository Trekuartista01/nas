"use client";

import { useId, useRef, useState } from "react";
import { useAdminForm } from "@/components/admin/AdminForm";
import { inputClass } from "@/components/admin/fields";
import { buttonClass } from "@/components/admin/ui";

/**
 * Editable list of small rows (accessory specs, colours, hero video shots), stored as a JSON
 * array in one hidden input. The server validates the JSON again (lib/admin/schemas.ts).
 */

export interface RowColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "color";
  placeholder?: string;
  maxLength?: number;
  /** Tailwind width class for the cell on wider screens. */
  width?: string;
  step?: string;
}

type Row = Record<string, string | number>;

export default function RowsField({
  name,
  label,
  hint,
  columns,
  defaultValue,
  max,
  addLabel = "Shto rresht",
  emptyRow,
}: {
  name: string;
  label: string;
  hint?: string;
  columns: RowColumn[];
  /** Existing rows (objects with the columns' keys). */
  defaultValue: readonly object[];
  max: number;
  addLabel?: string;
  emptyRow: Row;
}) {
  const id = useId();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const { errors } = useAdminForm();
  // Stable keys for React while rows are added/removed/reordered.
  const [rows, setRows] = useState(() => defaultValue.map((r, i) => ({ key: i, value: r as Row })));
  const nextKey = useRef(defaultValue.length);

  function change(next: typeof rows) {
    setRows(next);
    queueMicrotask(() => hiddenRef.current?.form?.dispatchEvent(new Event("change", { bubbles: true })));
  }
  const setCell = (rowKey: number, col: RowColumn, raw: string) =>
    change(rows.map((r) => (r.key === rowKey ? { ...r, value: { ...r.value, [col.key]: col.type === "number" ? (raw === "" ? "" : Number(raw)) : raw } } : r)));
  const move = (index: number, by: -1 | 1) => {
    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    change(next);
  };

  const error = errors[name];
  const json = JSON.stringify(rows.map((r) => r.value));

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium text-muted-2">
        {label}
      </p>
      <input ref={hiddenRef} type="hidden" name={name} value={json} />
      <div role="group" aria-labelledby={`${id}-label`} className={`space-y-2 border bg-surface p-3 ${error ? "border-red" : "border-line-2"}`}>
        {rows.length === 0 && <p className="py-2 text-sm text-faint">Asnjë rresht ende.</p>}
        {rows.map((row, index) => (
          <div key={row.key} className="flex flex-wrap items-end gap-2 border-b border-line pb-2 last:border-b-0 last:pb-0 sm:flex-nowrap">
            {columns.map((col) => (
              <label key={col.key} className={`min-w-0 flex-1 ${col.width ?? ""}`}>
                <span className="mb-1 block text-[11px] text-faint">{col.label}</span>
                {col.type === "color" ? (
                  <span className="flex gap-2">
                    <input
                      type="color"
                      value={String(row.value[col.key] || "#000000")}
                      onChange={(e) => setCell(row.key, col, e.target.value)}
                      className="h-10 w-12 shrink-0 cursor-pointer border border-line-2 bg-surface p-1"
                      aria-label={`${col.label} (zgjidh)`}
                    />
                    <input
                      value={String(row.value[col.key] ?? "")}
                      onChange={(e) => setCell(row.key, col, e.target.value)}
                      maxLength={7}
                      spellCheck={false}
                      className={`${inputClass} font-mono`}
                    />
                  </span>
                ) : (
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    step={col.step}
                    value={String(row.value[col.key] ?? "")}
                    onChange={(e) => setCell(row.key, col, e.target.value)}
                    placeholder={col.placeholder}
                    maxLength={col.maxLength}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={buttonClass.small} aria-label="Lëviz lart">
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className={buttonClass.small} aria-label="Lëviz poshtë">
                ↓
              </button>
              <button type="button" onClick={() => change(rows.filter((r) => r.key !== row.key))} className={buttonClass.small} aria-label="Hiq rreshtin">
                ✕
              </button>
            </div>
          </div>
        ))}
        {rows.length < max && (
          <button type="button" onClick={() => change([...rows, { key: nextKey.current++, value: { ...emptyRow } }])} className={buttonClass.small}>
            + {addLabel}
          </button>
        )}
      </div>
      {error ? <p className="mt-1.5 text-xs text-[#ff5a52]">{error}</p> : hint ? <p className="mt-1.5 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
