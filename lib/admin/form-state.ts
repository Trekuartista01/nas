/** What an admin form action returns (used with useActionState in components/admin/AdminForm). */
export interface AdminFormState {
  status: "idle" | "success" | "error";
  message?: string;
  /** First error per field name. */
  errors?: Record<string, string>;
}

export const initialAdminFormState: AdminFormState = { status: "idle" };
