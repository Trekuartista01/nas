import type { Metadata } from "next";
import { Suspense } from "react";
import AccessoryForm from "@/components/admin/forms/AccessoryForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { listBrands } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Aksesor i ri", description: "Shto një aksesor në katalog." };

export default function Page() {
  return (
    <>
      <PageHeader title="Aksesor i ri" back={{ href: ADMIN_PATHS.accessories, label: "Aksesorët" }} />
      <Suspense fallback={<AdminLoading />}>
        <NewAccessory />
      </Suspense>
    </>
  );
}

async function NewAccessory() {
  const brands = await listBrands();
  return <AccessoryForm brandNames={brands.map((b) => b.name)} />;
}
