import type { FieldErrors } from "@/lib/forms/schemas";

/**
 * What a form action returns to the page (used with React's useActionState).
 * Kept small on purpose: only what the form UI shows, never internal data.
 */
export interface FormState {
  status: "idle" | "success" | "error";
  /** Message for the whole form (success text, or a general error). */
  message?: string;
  /** First error per field, shown next to each input. */
  errors?: FieldErrors;
  /** What the visitor typed, so the form can refill itself after an error (React resets forms after an action). */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle" };
