"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteContent, deleteLead, setLeadStatus, togglePublished } from "@/lib/admin/actions";
import type { ContentTable } from "@/lib/admin/crud";
import type { AdminFormState } from "@/lib/admin/form-state";
import { LEAD_STATUS_LABEL } from "@/lib/admin/format";
import { buttonClass } from "@/components/admin/ui";

/** Run an action, show its error inline, refresh the server data on success. */
function useRowAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<AdminFormState>) =>
    start(async () => {
      setError(null);
      const result = await fn();
      if (result.status === "error") setError(result.message ?? "Veprimi dështoi.");
      else router.refresh();
    });
  return { pending, error, run };
}

function InlineError({ error }: { error: string | null }) {
  return error ? (
    <span role="alert" className="text-xs text-[#ff5a52]">
      {error}
    </span>
  ) : null;
}

/** Published / draft switch for a list row. */
export function PublishToggle({ table, id, published, label }: { table: ContentTable; id: string; published: boolean; label: string }) {
  const { pending, error, run } = useRowAction();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={published}
        aria-label={`${label}: ${published ? "i publikuar" : "draft"}`}
        disabled={pending}
        onClick={() => run(() => togglePublished(table, id, !published))}
        className="group inline-flex items-center gap-2 text-xs font-semibold disabled:opacity-60"
      >
        <span className={`relative h-5 w-9 border transition-colors ${published ? "border-emerald-500/60 bg-emerald-500/20" : "border-line-2 bg-surface"}`}>
          <span className={`absolute top-0.5 size-3.5 transition-all ${published ? "left-[18px] bg-emerald-400" : "left-0.5 bg-[#555]"}`} />
        </span>
        <span className={published ? "text-emerald-400" : "text-faint"}>{published ? "Publikuar" : "Draft"}</span>
      </button>
      <InlineError error={error} />
    </span>
  );
}

/** Two-step delete (no browser confirm popup): "Fshi" → "Po, fshije" / "Anulo". */
function ConfirmDelete({ onConfirm, pending, error, label = "Fshi", what }: { onConfirm: () => void; pending: boolean; error: string | null; label?: string; what: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <span className="inline-flex flex-col gap-1">
        <button type="button" onClick={() => setAsking(true)} className={buttonClass.danger}>
          {label}
        </button>
        <InlineError error={error} />
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label={`Konfirmo fshirjen e ${what}`}>
      <span className="text-sm text-muted-2">Fshihet përgjithmonë.</span>
      <button type="button" disabled={pending} onClick={onConfirm} className={`${buttonClass.primary}`} autoFocus>
        {pending ? "Duke fshirë…" : "Po, fshije"}
      </button>
      <button type="button" disabled={pending} onClick={() => setAsking(false)} className={buttonClass.secondary}>
        Anulo
      </button>
      <InlineError error={error} />
    </span>
  );
}

export function DeleteContentButton({ table, id, what }: { table: ContentTable; id: string; what: string }) {
  const { pending, error, run } = useRowAction();
  return <ConfirmDelete what={what} pending={pending} error={error} onConfirm={() => run(() => deleteContent(table, id))} />;
}

export function DeleteLeadButton({ id }: { id: string }) {
  const { pending, error, run } = useRowAction();
  return <ConfirmDelete what="kërkesës" label="Fshi kërkesën" pending={pending} error={error} onConfirm={() => run(() => deleteLead(id))} />;
}

/** Quick status change from the leads list. */
export function LeadStatusSelect({ id, status }: { id: string; status: string }) {
  const { pending, error, run } = useRowAction();
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label="Statusi"
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          run(() => setLeadStatus(id, next));
        }}
        className="min-h-8 border border-line-2 bg-surface px-2 text-xs text-white disabled:opacity-60"
      >
        {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <InlineError error={error} />
    </span>
  );
}

