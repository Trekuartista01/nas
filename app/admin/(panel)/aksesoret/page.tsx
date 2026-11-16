import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PublishToggle } from "@/components/admin/RowActions";
import { AdminLoading, Badge, ButtonLink, EmptyState, PageHeader, Table, Td, Th, Thumb } from "@/components/admin/ui";
import { ACCESSORY_CATEGORY_ADMIN_LABEL } from "@/lib/admin/format";
import { ADMIN_PATHS, NEW_SEGMENT } from "@/lib/admin/paths";
import { listAccessories } from "@/lib/admin/queries";
import { eur } from "@/lib/format";
import { mediaUrl } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Aksesorët", description: "Kaska, veshje, doreza, çizme dhe pjesë." };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Aksesorët"
        description="Kaska, veshje, doreza & çizme dhe pjesë. Vetëm të publikuarit shfaqen në faqe."
        actions={<ButtonLink href={`${ADMIN_PATHS.accessories}/${NEW_SEGMENT}`}>+ Aksesor i ri</ButtonLink>}
      />
      <Suspense fallback={<AdminLoading />}>
        <Accessories />
      </Suspense>
    </>
  );
}

async function Accessories() {
  const rows = await listAccessories();
  if (rows.length === 0) return <EmptyState title="Asnjë aksesor ende">Shto të parin me butonin “Aksesor i ri”.</EmptyState>;
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-14" />
          <Th>Produkti</Th>
          <Th>Kategoria</Th>
          <Th>Çmimi</Th>
          <Th>Statusi</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a.id}>
            <Td>
              <Thumb src={mediaUrl(a.image_path)} alt="" />
            </Td>
            <Td>
              <Link href={`${ADMIN_PATHS.accessories}/${a.id}`} className="font-medium hover:text-red">
                {a.brand} {a.name}
              </Link>
              {a.is_new && (
                <span className="ml-2">
                  <Badge tone="amber">E RE</Badge>
                </span>
              )}
              <span className="block text-xs text-faint">/aksesoret/{a.slug}</span>
            </Td>
            <Td className="text-muted-2">{ACCESSORY_CATEGORY_ADMIN_LABEL[a.category]}</Td>
            <Td className="tabular-nums">{eur(a.price)}</Td>
            <Td>
              <PublishToggle table="accessories" id={a.id} published={a.published} label={`${a.brand} ${a.name}`} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
