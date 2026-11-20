"use client";

import AdminForm from "@/components/admin/AdminForm";
import FileField from "@/components/admin/FileField";
import { CheckboxField, FieldRow, FormSection, SelectField, SlugField, TextArea, TextField } from "@/components/admin/fields";
import { DeleteContentButton } from "@/components/admin/RowActions";
import { savePost } from "@/lib/admin/actions";
import { POST_KIND_LABEL } from "@/lib/admin/format";
import type { PostRow } from "@/lib/data/rows";

/** NAS World: events, news, new models, tips. */
export default function PostForm({ row }: { row?: PostRow }) {
  return (
    <AdminForm
      action={savePost.bind(null, row?.id)}
      submitLabel={row ? "Ruaj ndryshimet" : "Krijo postimin"}
      footer={row ? <DeleteContentButton table="posts" id={row.id} what={row.title} /> : undefined}
    >
      <FormSection title="Postimi">
        <TextField name="title" label="Titulli" required defaultValue={row?.title} maxLength={140} />
        <SlugField name="slug" label="Adresa e faqes (slug)" required from={["title"]} prefix="/nas-world/" defaultValue={row?.slug} />
        <FieldRow cols={3}>
          <SelectField
            name="kind"
            label="Lloji"
            required
            defaultValue={row?.kind}
            placeholder="Zgjidh…"
            options={Object.entries(POST_KIND_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <TextField name="tag" label="Etiketa në kartë" defaultValue={row?.tag} maxLength={40} hint="P.sh. EVENT · 12 MAJ" />
          <TextField name="event_date" label="Data e eventit" type="date" defaultValue={row?.event_date} hint="Vetëm për evente." />
        </FieldRow>
        <TextArea name="excerpt" label="Përmbledhja" defaultValue={row?.excerpt} rows={2} maxLength={300} hint="1–2 fjali. Shfaqet në kartë në faqen kryesore." />
        <TextArea name="body" label="Teksti" defaultValue={row?.body} rows={12} maxLength={20000} hint="Paragrafët ndahen me një rresht bosh." />
      </FormSection>

      <FormSection title="Foto" description="JPG, PNG, WebP ose AVIF, deri në 5 MB.">
        <FileField name="image_path" label="Foto" folder="posts" defaultValue={row?.image_path} />
      </FormSection>

      <FormSection title="Shfaqja">
        <CheckboxField name="published" label="I publikuar" hint="Data e publikimit ruhet herën e parë që publikohet." defaultChecked={row?.published ?? false} />
        <CheckboxField name="featured" label="Kryesor" hint="Del si karta e madhe në “NAS World” në faqen kryesore." defaultChecked={row?.featured ?? false} />
      </FormSection>
    </AdminForm>
  );
}
