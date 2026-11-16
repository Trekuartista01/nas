import type { Metadata } from "next";
import { Suspense } from "react";
import ModelForm from "@/components/admin/forms/ModelForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { listBrands } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Model i ri", description: "Shto një model në katalog." };

export default function Page() {
  return (
    <>
      <PageHeader title="Model i ri" back={{ href: ADMIN_PATHS.models, label: "Modelet" }} />
      <Suspense fallback={<AdminLoading />}>
        <NewModel />
      </Suspense>
    </>
  );
}

async function NewModel() {
  const brands = await listBrands();
  return <ModelForm brandNames={brands.map((b) => b.name)} />;
}
