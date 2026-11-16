"use client";

import AdminForm from "@/components/admin/AdminForm";
import { SelectField, TextArea } from "@/components/admin/fields";
import { updateLead } from "@/lib/admin/actions";
import { LEAD_STATUS_LABEL } from "@/lib/admin/format";

/** Status + internal note. What the customer sent can't be edited (database rule). */
export default function LeadForm({ id, status, note }: { id: string; status: string; note: string }) {
  return (
    <AdminForm action={updateLead.bind(null, id)}>
      <SelectField name="status" label="Statusi" defaultValue={status} options={Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => ({ value, label }))} />
      <TextArea name="note" label="Shënim i brendshëm" hint="E sheh vetëm stafi, p.sh. “E telefonova, vjen të shtunën.”" defaultValue={note} rows={5} maxLength={2000} />
    </AdminForm>
  );
}
