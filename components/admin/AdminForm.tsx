"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, use, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { initialAdminFormState, type AdminFormState } from "@/lib/admin/form-state";
import { buttonClass } from "@/components/admin/ui";

type Action = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

interface FormCtx {
  errors: Record<string, string>;
  pending: boolean;
}
const Ctx = createContext<FormCtx>({ errors: {}, pending: false });
export const useAdminForm = () => use(Ctx);

/**
 * Wrapper for every admin edit form.
 * - Submits through the Server Action without React's automatic form reset, so the fields keep
 *   what the admin typed (after an error AND after a successful save).
 * - Gives fields their server error (useAdminForm) and shows the overall result at the bottom.
 * - Warns before leaving the page with unsaved changes.
 */
export default function AdminForm({
  action,
  children,
  submitLabel = "Ruaj",
  footer,
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  /** Extra controls next to the save button (e.g. delete). */
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialAdminFormState);
  // Unsaved changes = edited since the latest result, unless that result was a successful save.
  const [editedAt, setEditedAt] = useState<AdminFormState | null>(null);
  const dirty = editedAt !== null && (editedAt === state || state.status !== "success");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      // Re-render the server parts of the page (titles, badges) with the saved data.
      router.refresh();
    }
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state, router]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <Ctx value={{ errors: state.errors ?? {}, pending }}>
      <form onSubmit={onSubmit} onChange={() => setEditedAt(state)} noValidate className="space-y-6">
        {children}
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? "Duke ruajtur…" : submitLabel}
          </button>
          <p
            ref={statusRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className={`min-w-0 flex-1 text-sm outline-none ${state.status === "error" ? "text-[#ff5a52]" : "text-emerald-400"}`}
          >
            {state.status !== "idle" && !pending ? state.message : dirty ? <span className="text-muted">Ndryshime të paruajtura</span> : null}
          </p>
          {footer}
        </div>
      </form>
    </Ctx>
  );
}
