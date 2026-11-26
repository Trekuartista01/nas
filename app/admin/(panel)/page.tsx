import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LeadKindBadge, LeadStatusBadge } from "@/components/admin/LeadBadges";
import { AdminLoading, EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getDashboard } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Paneli", description: "Përmbledhje e kërkesave dhe katalogut." };

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const d = await getDashboard();
  const stats = [
    { label: "Kërkesa të reja", value: d.newLeads, href: `${ADMIN_PATHS.leads}?statusi=new`, highlight: d.newLeads > 0 },
    { label: "Modele", value: d.models, href: ADMIN_PATHS.models },
  ];
  return (
    <>
      <PageHeader title="Paneli" description="Kërkesat e fundit dhe gjendja e katalogut." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-line bg-panel p-4 transition-colors hover:border-line-2 hover:bg-surface">
            <p className={`text-3xl font-bold tabular-nums ${s.highlight ? "text-highlight" : ""}`}>{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <Panel title="Kërkesat e fundit" className="mt-6">
        {d.latest.length === 0 ? (
          <EmptyState title="Asnjë kërkesë ende">Kërkesat nga format e faqes (dealer) shfaqen këtu.</EmptyState>
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {d.latest.map((lead) => (
              <li key={lead.id}>
                <Link href={`${ADMIN_PATHS.leads}/${lead.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:text-white">
                  <span className="w-32 shrink-0 text-xs tabular-nums text-faint">{formatDateTime(lead.created_at)}</span>
                  <LeadKindBadge kind={lead.kind} />
                  <span className="min-w-0 flex-1 truncate font-medium">{lead.name || lead.email || "Pa emër"}</span>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href={ADMIN_PATHS.leads} className="mt-4 inline-block text-sm text-red hover:underline">
          Të gjitha kërkesat →
        </Link>
      </Panel>
    </>
  );
}
