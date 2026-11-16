"use client";

import { useActionState } from "react";
import { inputClass } from "@/components/admin/fields";
import { buttonClass } from "@/components/admin/ui";
import { signIn, type LoginState } from "@/lib/admin/session-actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-4" aria-describedby={state.error ? "login-error" : undefined}>
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-muted-2">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          defaultValue={state.email}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-muted-2">
          Fjalëkalimi
        </label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} className={inputClass} />
      </div>
      {state.error && (
        <p id="login-error" role="alert" className="border border-red/50 bg-red/10 px-3 py-2 text-sm text-[#ff7a73]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full`}>
        {pending ? "Duke hyrë…" : "Hyr"}
      </button>
    </form>
  );
}
