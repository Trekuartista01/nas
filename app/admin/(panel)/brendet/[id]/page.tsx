import type { Metadata } from "next";
import { Suspense } from "react";
import BrandForm from "@/components/admin/forms/BrandForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getBrandRow } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Ndrysho brendin", description: "Ndrysho një brend." };

export default function Page({ params }: PageProps<"/admin/brendet/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditBrand params={params} />
    </Suspense>
  );
}

async function EditBrand({ params }: Pick<PageProps<"/admin/brendet/[id]">, "params">) {
  const row = await getBrandRow((await params).id);
  return (
    <>
      <PageHeader
        title={row.name}
        back={{ href: ADMIN_PATHS.brands, label: "Brendet" }}
        description="Ndryshimi i emrit këtu nuk ndryshon markën te modelet dhe aksesorët ekzistues."
      />
      <BrandForm row={row} />
    </>
  );
}
