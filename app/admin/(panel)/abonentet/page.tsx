import type { Metadata } from "next";
import { Suspense } from "react";
import { SubscriberActions } from "@/components/admin/RowActions";
import { AdminLoading, Badge, EmptyState, PageHeader, Table, Td, Th, buttonClass } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { listSubscribers } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Abonentët", description: "Regjistrimet në newsletter." };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Abonentët"
        description="Email-et e regjistruara te “Merr ofertat e para” në fund të faqes."
        actions={
          // Plain link (not <Link>): it downloads a file.
          <a href={`${ADMIN_PATHS.subscribers}/eksporto`} className={buttonClass.secondary} download>
            Shkarko CSV (aktivët)
          </a>
        }
      />
      <Suspense fallback={<AdminLoading />}>
        <Subscribers />
      </Suspense>
    </>
  );
}

async function Subscribers() {
  const rows = await listSubscribers();
  if (rows.length === 0) return <EmptyState title="Asnjë abonent ende" />;
  const active = rows.filter((r) => !r.unsubscribed_at).length;
  return (
    <>
      <p className="mb-2 text-xs text-faint">
        {active} aktivë nga {rows.length}
      </p>
      <Table>
        <thead>
          <tr>
            <Th>Email</Th>
            <Th>Regjistruar më</Th>
            <Th>Statusi</Th>
            <Th className="text-right">Veprime</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <Td className="break-all font-medium">{s.email}</Td>
              <Td className="whitespace-nowrap text-xs tabular-nums text-muted">{formatDateTime(s.created_at)}</Td>
              <Td>{s.unsubscribed_at ? <Badge>Çregjistruar</Badge> : <Badge tone="green">Aktiv</Badge>}</Td>
              <Td className="text-right">
                <SubscriberActions id={s.id} subscribed={!s.unsubscribed_at} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
