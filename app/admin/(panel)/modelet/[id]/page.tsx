import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ModelForm from "@/components/admin/forms/ModelForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getModelRow, listBrands } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Ndrysho modelin", description: "Ndrysho një model të katalogut." };

export default function Page({ params }: PageProps<"/admin/modelet/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditModel params={params} />
    </Suspense>
  );
}

async function EditModel({ params }: Pick<PageProps<"/admin/modelet/[id]">, "params">) {
  const { id } = await params;
  const [row, brands] = await Promise.all([getModelRow(id), listBrands()]);
  return (
    <>
      <PageHeader
        title={`${row.brand} ${row.name}`}
        back={{ href: ADMIN_PATHS.models, label: "Modelet" }}
        description={
          row.published ? (
            <Link href="/modelet" target="_blank" rel="noopener" className="hover:text-white">
              I publikuar · shiko modelet në faqe ↗
            </Link>
          ) : (
            "Draft: nuk shfaqet në faqe."
          )
        }
      />
      <ModelForm row={row} brandNames={brands.map((b) => b.name)} />
    </>
  );
}
