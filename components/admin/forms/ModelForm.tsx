"use client";

import AdminForm from "@/components/admin/AdminForm";
import FileField from "@/components/admin/FileField";
import { CheckboxField, FieldRow, FormSection, SelectField, SlugField, SuggestField, TextField } from "@/components/admin/fields";
import { DeleteContentButton } from "@/components/admin/RowActions";
import { saveModel } from "@/lib/admin/actions";
import { VEHICLE_TYPE_LABEL } from "@/lib/admin/format";
import { LICENCES } from "@/lib/admin/schemas";
import type { ModelRow } from "@/lib/data/rows";

const LICENCE_HINT: Record<string, string> = { AM: "AM (deri 50cc)", A1: "A1 (deri 125cc)", A2: "A2 (deri 35 kW)", A: "A (pa kufi)" };

/** Create (no row) or edit a model. Fields = the `models` table. */
export default function ModelForm({ row, brandNames }: { row?: ModelRow; brandNames: string[] }) {
  return (
    <AdminForm
      action={saveModel.bind(null, row?.id)}
      submitLabel={row ? "Ruaj ndryshimet" : "Krijo modelin"}
      footer={row ? <DeleteContentButton table="models" id={row.id} what={`${row.brand} ${row.name}`} /> : undefined}
    >
      <FormSection title="Modeli">
        <FieldRow>
          <SuggestField name="brand" label="Marka" required suggestions={brandNames} defaultValue={row?.brand} maxLength={60} hint="P.sh. NAS, ZONTES, DAZZLE." />
          <TextField name="name" label="Emri i modelit" required defaultValue={row?.name} maxLength={80} placeholder="MAX-X 125" />
        </FieldRow>
        <SlugField
          name="slug"
          label="Adresa e faqes (slug)"
          required
          from={["brand", "name"]}
          prefix="/modelet/"
          defaultValue={row?.slug}
          hint="Mos e ndrysho pasi modeli është publikuar: lidhjet e vjetra do të prishen."
        />
        <FieldRow cols={4}>
          <SelectField
            name="type"
            label="Lloji"
            required
            defaultValue={row?.type}
            placeholder="Zgjidh…"
            options={Object.entries(VEHICLE_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <TextField name="cc" label="Kubikazhi (cc)" type="number" required defaultValue={row?.cc} />
          <SelectField name="licence" label="Patenta" required defaultValue={row?.licence} placeholder="Zgjidh…" options={LICENCES.map((l) => ({ value: l, label: LICENCE_HINT[l] }))} />
          <TextField name="price" label="Çmimi (€)" type="number" required defaultValue={row?.price} hint="Numër i plotë, pa pikë: 3990." />
        </FieldRow>
      </FormSection>

      <FormSection title="Foto" description="JPG, PNG, WebP ose AVIF, deri në 5 MB. Më mirë horizontale, me sfond të pastër.">
        <FileField name="image_path" label="Foto kryesore" folder="models" defaultValue={row?.image_path} />
      </FormSection>

      <FormSection title="Shfaqja">
        <CheckboxField name="published" label="I publikuar" hint="Pa këtë, modeli ruhet si draft dhe nuk shfaqet në faqe." defaultChecked={row?.published ?? false} />
        <CheckboxField name="is_new" label="Etiketa “E RE”" defaultChecked={row?.is_new ?? false} />
        <div className="max-w-40">
          <TextField name="sort" label="Renditja" type="number" defaultValue={row?.sort ?? 0} hint="Më i vogli del i pari." />
        </div>
      </FormSection>
    </AdminForm>
  );
}
