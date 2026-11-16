import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LeadKindBadge } from "@/components/admin/LeadBadges";
import { LeadStatusSelect } from "@/components/admin/RowActions";
import { AdminLoading, EmptyState, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { formatDateTime, LEAD_KIND_LABEL, LEAD_STATUS_LABEL } from "@/lib/admin/format";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { LEADS_PAGE_SIZE, listLeads, parseLeadFilters, type LeadFilters } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Kërkesat", description: "Kërkesat nga format e faqes." };

export default function Page({ searchParams }: PageProps<"/admin/kerkesat">) {
  return (
    <>
      <PageHeader title="Kërkesat" description="Oferta, test ride, servis, financim dhe mesazhe nga faqja. Më të rejat lart." />
      <Suspense fallback={<AdminLoading />}>
        <Leads searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function filterHref(current: LeadFilters, change: Partial<LeadFilters>): string {
  const next = { ...current, ...change, page: change.page ?? 1 };
  const q = new URLSearchParams();
  if (next.kind) q.set("lloji", next.kind);
  if (next.status) q.set("statusi", next.status);
  if (next.page > 1) q.set("faqja", String(next.page));
  const s = q.toString();
  return s ? `${ADMIN_PATHS.leads}?${s}` : ADMIN_PATHS.leads;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "border-red bg-red/10 text-white" : "border-line-2 text-muted-2 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}

async function Leads({ searchParams }: Pick<PageProps<"/admin/kerkesat">, "searchParams">) {
  const filters = parseLeadFilters(await searchParams);
  const { rows, total } = await listLeads(filters);
  const pages = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));

  return (
    <>
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-2" aria-label="Filtro sipas llojit">
          <Chip href={filterHref(filters, { kind: undefined })} active={!filters.kind}>
            Të gjitha
          </Chip>
          {Object.entries(LEAD_KIND_LABEL).map(([kind, label]) => (
            <Chip key={kind} href={filterHref(filters, { kind: kind as LeadFilters["kind"] })} active={filters.kind === kind}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filtro sipas statusit">
          <Chip href={filterHref(filters, { status: undefined })} active={!filters.status}>
            Çdo status
          </Chip>
          {Object.entries(LEAD_STATUS_LABEL).map(([status, label]) => (
            <Chip key={status} href={filterHref(filters, { status: status as LeadFilters["status"] })} active={filters.status === status}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Asnjë kërkesë">{filters.kind || filters.status ? "Provo një filtër tjetër." : "Kërkesat nga format e faqes shfaqen këtu."}</EmptyState>
      ) : (
        <>
          <p className="mb-2 text-xs text-faint">
            {total} {total === 1 ? "kërkesë" : "kërkesa"}
          </p>
          <Table>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Lloji</Th>
                <Th>Klienti</Th>
                <Th>Modeli</Th>
                <Th>Statusi</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className={lead.status === "new" ? "bg-highlight/[0.03]" : ""}>
                  <Td className="whitespace-nowrap text-xs tabular-nums text-muted">{formatDateTime(lead.created_at)}</Td>
                  <Td>
                    <LeadKindBadge kind={lead.kind} />
                  </Td>
                  <Td>
                    <Link href={`${ADMIN_PATHS.leads}/${lead.id}`} className="font-medium hover:text-red">
                      {lead.name || lead.email || "Pa emër"}
                    </Link>
                    {lead.phone && <span className="block text-xs text-faint">{lead.phone}</span>}
                  </Td>
                  <Td className="text-muted-2">{typeof lead.data.model_name === "string" ? lead.data.model_name : (lead.model_slug ?? "—")}</Td>
                  <Td>
                    <LeadStatusSelect id={lead.id} status={lead.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {pages > 1 && (
            <nav aria-label="Faqet" className="mt-4 flex items-center gap-3 text-sm">
              {filters.page > 1 && <Link href={filterHref(filters, { page: filters.page - 1 })}>← Më të rejat</Link>}
              <span className="text-faint">
                Faqja {filters.page} nga {pages}
              </span>
              {filters.page < pages && <Link href={filterHref(filters, { page: filters.page + 1 })}>Më të vjetrat →</Link>}
            </nav>
          )}
        </>
      )}
    </>
  );
}
