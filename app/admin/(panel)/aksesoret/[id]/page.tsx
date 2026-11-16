import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AccessoryForm from "@/components/admin/forms/AccessoryForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getAccessoryRow, listBrands } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Ndrysho aksesorin", description: "Ndrysho një aksesor të katalogut." };

export default function Page({ params }: PageProps<"/admin/aksesoret/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditAccessory params={params} />
    </Suspense>
  );
}

async function EditAccessory({ params }: Pick<PageProps<"/admin/aksesoret/[id]">, "params">) {
  const { id } = await params;
  const [row, brands] = await Promise.all([getAccessoryRow(id), listBrands()]);
  return (
    <>
      <PageHeader
        title={`${row.brand} ${row.name}`}
        back={{ href: ADMIN_PATHS.accessories, label: "Aksesorët" }}
        description={
          row.published ? (
            <Link href={`/aksesoret/${row.slug}`} target="_blank" rel="noopener" className="hover:text-white">
              I publikuar · shiko në faqe ↗
            </Link>
          ) : (
            "Draft: nuk shfaqet në faqe."
          )
        }
      />
      <AccessoryForm row={row} brandNames={brands.map((b) => b.name)} />
    </>
  );
}
