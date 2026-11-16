import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PublishToggle } from "@/components/admin/RowActions";
import { AdminLoading, Badge, ButtonLink, EmptyState, PageHeader, Table, Td, Th, Thumb } from "@/components/admin/ui";
import { VEHICLE_TYPE_LABEL } from "@/lib/admin/format";
import { ADMIN_PATHS, NEW_SEGMENT } from "@/lib/admin/paths";
import { listModels } from "@/lib/admin/queries";
import { eur } from "@/lib/format";
import { mediaUrl } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Modelet", description: "Motorët, skuterët dhe ATV-të në katalog." };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Modelet"
        description="Motorët, skuterët dhe ATV-të. Vetëm të publikuarit shfaqen në faqe."
        actions={<ButtonLink href={`${ADMIN_PATHS.models}/${NEW_SEGMENT}`}>+ Model i ri</ButtonLink>}
      />
      <Suspense fallback={<AdminLoading />}>
        <Models />
      </Suspense>
    </>
  );
}

async function Models() {
  const rows = await listModels();
  if (rows.length === 0) return <EmptyState title="Asnjë model ende">Shto modelin e parë me butonin “Model i ri”.</EmptyState>;
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-14" />
          <Th>Modeli</Th>
          <Th>Lloji</Th>
          <Th>cc</Th>
          <Th>Patenta</Th>
          <Th>Çmimi</Th>
          <Th>Statusi</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((m) => (
          <tr key={m.id}>
            <Td>
              <Thumb src={mediaUrl(m.image_path)} alt="" />
            </Td>
            <Td>
              <Link href={`${ADMIN_PATHS.models}/${m.id}`} className="font-medium hover:text-red">
                {m.brand} {m.name}
              </Link>
              {m.is_new && (
                <span className="ml-2">
                  <Badge tone="amber">E RE</Badge>
                </span>
              )}
              <span className="block text-xs text-faint">/modelet/{m.slug}</span>
            </Td>
            <Td className="text-muted-2">{VEHICLE_TYPE_LABEL[m.type]}</Td>
            <Td className="tabular-nums text-muted-2">{m.cc}</Td>
            <Td className="text-muted-2">{m.licence}</Td>
            <Td className="tabular-nums">{eur(m.price)}</Td>
            <Td>
              <PublishToggle table="models" id={m.id} published={m.published} label={`${m.brand} ${m.name}`} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
