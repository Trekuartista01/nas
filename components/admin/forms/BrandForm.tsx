"use client";

import AdminForm from "@/components/admin/AdminForm";
import FileField from "@/components/admin/FileField";
import { CheckboxField, FormSection, TextField } from "@/components/admin/fields";
import { DeleteContentButton } from "@/components/admin/RowActions";
import { saveBrand } from "@/lib/admin/actions";
import type { BrandRow } from "@/lib/data/rows";

/** Brands strip on the homepage. Models/accessories store the brand as text, so renaming here doesn't rename them. */
export default function BrandForm({ row }: { row?: BrandRow }) {
  return (
    <AdminForm
      action={saveBrand.bind(null, row?.id)}
      submitLabel={row ? "Ruaj ndryshimet" : "Krijo brendin"}
      footer={row ? <DeleteContentButton table="brands" id={row.id} what={row.name} /> : undefined}
    >
      <FormSection title="Brendi">
        <TextField name="name" label="Emri" required defaultValue={row?.name} maxLength={60} placeholder="QJMOTOR" />
        <FileField name="logo_path" label="Logo" folder="brands" defaultValue={row?.logo_path} hint="Më mirë PNG e bardhë me sfond transparent. Pa logo shfaqet emri." />
      </FormSection>
      <FormSection title="Shfaqja">
        <CheckboxField name="published" label="I publikuar" hint="Shfaqet në rreshtin e brendeve në faqen kryesore." defaultChecked={row?.published ?? true} />
        <div className="max-w-40">
          <TextField name="sort" label="Renditja" type="number" defaultValue={row?.sort ?? 0} />
        </div>
      </FormSection>
    </AdminForm>
  );
}
