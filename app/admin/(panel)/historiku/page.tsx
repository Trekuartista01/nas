import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading, Badge, EmptyState, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/admin/format";
import { listHistory } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Historiku", description: "Kush ndryshoi çfarë dhe kur." };

const ENTITY: Record<string, string> = {
  models: "Model",
  accessories: "Aksesor",
  brands: "Brend",
  posts: "Postim",
  hero_video: "Video e bannerit",
  banner_slides: "Pjesë e bannerit",
  leads: "Kërkesë",
  newsletter_subscribers: "Abonent",
};
const ACTION: Record<string, { label: string; tone: "green" | "neutral" | "red" }> = {
  INSERT: { label: "Krijoi", tone: "green" },
  UPDATE: { label: "Ndryshoi", tone: "neutral" },
  DELETE: { label: "Fshiu", tone: "red" },
};
const COLUMN: Record<string, string> = {
  published: "publikimin",
  price: "çmimin",
  name: "emrin",
  title: "titullin",
  image_path: "foton",
  status: "statusin",
  note: "shënimin",
  sort: "renditjen",
  is_new: "“E RE”",
  slug: "slug-un",
  body: "tekstin",
  unsubscribed_at: "abonimin",
};

export default function Page() {
  return (
    <>
      <PageHeader title="Historiku" description="200 ndryshimet e fundit në panel. Shkruhet automatikisht nga databaza dhe nuk mund të ndryshohet." />
      <Suspense fallback={<AdminLoading />}>
        <History />
      </Suspense>
    </>
  );
}

async function History() {
  const [admin, rows] = await Promise.all([requireAdmin(), listHistory()]);
  if (rows.length === 0) return <EmptyState title="Asnjë ndryshim ende" />;
  return (
    <Table>
      <thead>
        <tr>
          <Th>Kur</Th>
          <Th>Kush</Th>
          <Th>Veprimi</Th>
          <Th>Çfarë</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const action = ACTION[r.action] ?? { label: r.action, tone: "neutral" as const };
          const changed = (r.details.changed ?? []).map((c) => COLUMN[c] ?? c);
          return (
            <tr key={r.id}>
              <Td className="whitespace-nowrap text-xs tabular-nums text-muted">{formatDateTime(r.created_at)}</Td>
              <Td className="text-xs text-muted-2">{r.actor === admin.id ? "Ti" : r.actor ? `Admin ${r.actor.slice(0, 8)}` : "Sistemi"}</Td>
              <Td>
                <Badge tone={action.tone}>{action.label}</Badge>
              </Td>
              <Td>
                <span className="font-medium">{ENTITY[r.entity] ?? r.entity}</span>
                {r.details.label && <span className="text-muted-2"> · {r.details.label}</span>}
                {changed.length > 0 && <span className="block text-xs text-faint">Ndryshoi: {changed.join(", ")}</span>}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
