import { getAdmin } from "@/lib/admin/auth";
import { listSubscribers } from "@/lib/admin/queries";

/** CSV of active newsletter subscribers (for importing into a mailing tool). Admins only. */
export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = (await listSubscribers()).filter((r) => !r.unsubscribed_at);
  // Quote every value; a leading = + - @ is neutralised so spreadsheets don't run it as a formula.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = ["email,regjistruar_me", ...rows.map((r) => `${cell(r.email)},${cell(r.created_at)}`)].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abonentet-nas-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
