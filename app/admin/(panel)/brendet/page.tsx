import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PublishToggle } from "@/components/admin/RowActions";
import { AdminLoading, ButtonLink, EmptyState, PageHeader, Table, Td, Th, Thumb } from "@/components/admin/ui";
import { ADMIN_PATHS, NEW_SEGMENT } from "@/lib/admin/paths";
import { listBrands } from "@/lib/admin/queries";
import { mediaUrl } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Brendet", description: "Brendet në rreshtin e faqes kryesore." };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Brendet"
        description="Rreshti i brendeve në faqen kryesore. Emrat dalin edhe si sugjerime te modelet dhe aksesorët."
        actions={<ButtonLink href={`${ADMIN_PATHS.brands}/${NEW_SEGMENT}`}>+ Brend i ri</ButtonLink>}
      />
      <Suspense fallback={<AdminLoading />}>
        <Brands />
      </Suspense>
    </>
  );
}

async function Brands() {
  const rows = await listBrands();
  if (rows.length === 0) return <EmptyState title="Asnjë brend ende" />;
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-14" />
          <Th>Emri</Th>
          <Th>Renditja</Th>
          <Th>Statusi</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <Td>
              <Thumb src={mediaUrl(b.logo_path)} alt="" />
            </Td>
            <Td>
              <Link href={`${ADMIN_PATHS.brands}/${b.id}`} className="font-medium hover:text-red">
                {b.name}
              </Link>
            </Td>
            <Td className="tabular-nums text-muted-2">{b.sort}</Td>
            <Td>
              <PublishToggle table="brands" id={b.id} published={b.published} label={b.name} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
