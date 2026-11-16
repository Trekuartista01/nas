import { Badge } from "@/components/admin/ui";
import { LEAD_KIND_LABEL, LEAD_STATUS_LABEL } from "@/lib/admin/format";

export function LeadStatusBadge({ status }: { status: string }) {
  const tone = status === "new" ? "amber" : status === "contacted" ? "neutral" : "green";
  return <Badge tone={tone}>{LEAD_STATUS_LABEL[status] ?? status}</Badge>;
}

export function LeadKindBadge({ kind }: { kind: string }) {
  return <Badge tone={kind === "finance" || kind === "offer" ? "red" : "neutral"}>{LEAD_KIND_LABEL[kind] ?? kind}</Badge>;
}
