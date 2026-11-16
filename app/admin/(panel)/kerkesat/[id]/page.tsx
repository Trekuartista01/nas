import type { Metadata } from "next";
import { Suspense } from "react";
import LeadForm from "@/components/admin/forms/LeadForm";
import { LeadKindBadge, LeadStatusBadge } from "@/components/admin/LeadBadges";
import { DeleteLeadButton } from "@/components/admin/RowActions";
import { AdminLoading, PageHeader, Panel } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getLeadRow } from "@/lib/admin/queries";
import type { LeadRow } from "@/lib/data/rows";
import { eur } from "@/lib/format";
import { FIELD_LABELS, formatFieldValue } from "@/lib/forms/labels";

export const metadata: Metadata = { title: "Kërkesa", description: "Detajet e një kërkese nga faqja." };

export default function Page({ params }: PageProps<"/admin/kerkesat/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Lead params={params} />
    </Suspense>
  );
}

/** [label, value] rows in the same order and wording as the shop email. */
function leadRows(lead: LeadRow): [string, string][] {
  const data = lead.data;
  const rows: [string, string][] = [];
  for (const key of Object.keys(FIELD_LABELS)) {
    let value: string | undefined;
    if (key === "name" || key === "email" || key === "phone") value = lead[key] ?? undefined;
    else if (key === "model") {
      const name = typeof data.model_name === "string" ? data.model_name : lead.model_slug;
      value = name ? `${name}${typeof data.model_price === "number" ? ` (${eur(data.model_price)})` : ""}` : undefined;
    } else if (key === "monthly") value = typeof data.monthly === "number" ? `${eur(data.monthly)}/muaj (shembull, 0% interes)` : undefined;
    else value = formatFieldValue(key, data[key]);
    if (value) rows.push([FIELD_LABELS[key], value]);
  }
  return rows;
}

async function Lead({ params }: Pick<PageProps<"/admin/kerkesat/[id]">, "params">) {
  const lead = await getLeadRow((await params).id);
  const rows = leadRows(lead);
  return (
    <>
      <PageHeader
        back={{ href: ADMIN_PATHS.leads, label: "Kërkesat" }}
        title={lead.name || lead.email || "Kërkesë"}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <LeadKindBadge kind={lead.kind} />
            <LeadStatusBadge status={lead.status} />
            <span>Marrë më {formatDateTime(lead.created_at)}</span>
          </span>
        }
        actions={
          <>
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-10 items-center bg-red px-4 text-sm font-semibold text-white hover:bg-[#c00500]">
                Telefono
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="inline-flex min-h-10 items-center border border-line-2 px-4 text-sm font-semibold hover:bg-surface">
                Shkruaj email
              </a>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel title="Çfarë dërgoi klienti">
          <dl className="divide-y divide-line">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="whitespace-pre-line break-words text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <div className="space-y-6">
          <Panel title="Ndjekja">
            <LeadForm id={lead.id} status={lead.status} note={lead.note} />
          </Panel>
          <div className="flex justify-end">
            <DeleteLeadButton id={lead.id} />
          </div>
        </div>
      </div>
    </>
  );
}
