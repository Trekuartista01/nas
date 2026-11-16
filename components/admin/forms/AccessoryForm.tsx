"use client";

import AdminForm from "@/components/admin/AdminForm";
import FileField from "@/components/admin/FileField";
import { CheckboxField, FieldRow, FormSection, SelectField, SlugField, SuggestField, TextField } from "@/components/admin/fields";
import RowsField from "@/components/admin/RowsField";
import { DeleteContentButton } from "@/components/admin/RowActions";
import { saveAccessory } from "@/lib/admin/actions";
import { ACCESSORY_CATEGORY_ADMIN_LABEL } from "@/lib/admin/format";
import type { AccessoryRow } from "@/lib/data/rows";

/** Search tags added automatically from the category / "new" flag (lib/data/rows.ts → toAccessory). */
const AUTO_TAGS = ["accessory", "helmet", "apparel", "parts", "new"];

export default function AccessoryForm({ row, brandNames }: { row?: AccessoryRow; brandNames: string[] }) {
  const ownTags = (row?.tags ?? []).filter((t) => !AUTO_TAGS.includes(t));
  return (
    <AdminForm
      action={saveAccessory.bind(null, row?.id)}
      submitLabel={row ? "Ruaj ndryshimet" : "Krijo aksesorin"}
      footer={row ? <DeleteContentButton table="accessories" id={row.id} what={`${row.brand} ${row.name}`} /> : undefined}
    >
      <FormSection title="Produkti">
        <FieldRow>
          <SuggestField name="brand" label="Marka" required suggestions={brandNames} defaultValue={row?.brand} maxLength={60} />
          <TextField name="name" label="Emri" required defaultValue={row?.name} maxLength={80} />
        </FieldRow>
        <SlugField name="slug" label="Adresa e faqes (slug)" required from={["brand", "name"]} prefix="/aksesoret/" defaultValue={row?.slug} />
        <FieldRow cols={3}>
          <SelectField
            name="category"
            label="Kategoria"
            required
            defaultValue={row?.category}
            placeholder="Zgjidh…"
            options={Object.entries(ACCESSORY_CATEGORY_ADMIN_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <TextField name="price" label="Çmimi (€)" type="number" required defaultValue={row?.price} />
          <TextField name="meta" label="Rreshti i shkurtër" defaultValue={row?.meta} maxLength={80} hint="Nën emrin në kartë, p.sh. “ECE 22.06 · Fibër karboni”." />
        </FieldRow>
        <TextField
          name="tags"
          label="Fjalë kyçe për kërkimin"
          defaultValue={ownTags.join(", ")}
          maxLength={600}
          hint="Të ndara me presje, p.sh. integral, karbon, sport. Kategoria shtohet vetë."
        />
      </FormSection>

      <FormSection title="Foto" description="JPG, PNG, WebP ose AVIF, deri në 5 MB.">
        <FileField name="image_path" label="Foto" folder="accessories" defaultValue={row?.image_path} />
        <CheckboxField name="cutout" label="Foto pa sfond (PNG e prerë)" hint="Shfaqet e plotë mbi sfondin e kartës, në vend që ta mbushë." defaultChecked={row?.cutout ?? false} />
      </FormSection>

      <FormSection title="Detajet">
        <RowsField
          name="specs"
          label="Specifikimet"
          hint="Deri në 12. P.sh. 1450 · g · PESHA."
          max={12}
          defaultValue={row?.specs ?? []}
          emptyRow={{ value: "", unit: "", label: "" }}
          addLabel="Shto specifikim"
          columns={[
            { key: "value", label: "Vlera", maxLength: 30, placeholder: "1450" },
            { key: "unit", label: "Njësia", maxLength: 15, placeholder: "g", width: "sm:max-w-28" },
            { key: "label", label: "Emërtimi", maxLength: 30, placeholder: "PESHA" },
          ]}
        />
        <RowsField
          name="colours"
          label="Ngjyrat"
          max={12}
          defaultValue={row?.colours ?? []}
          emptyRow={{ name: "", hex: "#0a0a0a" }}
          addLabel="Shto ngjyrë"
          columns={[
            { key: "name", label: "Emri", maxLength: 40, placeholder: "E zezë mat" },
            { key: "hex", label: "Ngjyra", type: "color" },
          ]}
        />
      </FormSection>

      <FormSection title="Shfaqja">
        <CheckboxField name="published" label="I publikuar" hint="Pa këtë, produkti ruhet si draft dhe nuk shfaqet në faqe." defaultChecked={row?.published ?? false} />
        <CheckboxField name="is_new" label="Etiketa “E RE”" defaultChecked={row?.is_new ?? false} />
        <div className="max-w-40">
          <TextField name="sort" label="Renditja" type="number" defaultValue={row?.sort ?? 0} hint="Brenda kategorisë; më i vogli del i pari." />
        </div>
      </FormSection>
    </AdminForm>
  );
}
