"use client"; // Error boundaries must be Client Components

import { buttonClass } from "@/components/admin/ui";

export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="border border-red/40 bg-red/5 p-6">
      <h1 className="text-xl font-bold">Diçka shkoi keq</h1>
      <p className="mt-2 text-sm text-muted-2">Të dhënat nuk u ngarkuan. Kontrollo lidhjen me internetin dhe provo përsëri.</p>
      <button type="button" onClick={retry} className={`${buttonClass.primary} mt-4`}>
        Provo përsëri
      </button>
    </div>
  );
}
