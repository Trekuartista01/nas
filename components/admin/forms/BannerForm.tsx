"use client";

import { useId, useState } from "react";
import AdminForm, { useAdminForm } from "@/components/admin/AdminForm";
import FileField from "@/components/admin/FileField";
import { FieldShell, FormSection, inputClass } from "@/components/admin/fields";
import RowsField from "@/components/admin/RowsField";
import { saveBanner } from "@/lib/admin/actions";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

export interface BannerInitial {
  video_path: string;
  poster_path: string;
  duration: number;
  slides: { start_seconds: number; label: string }[];
}

/**
 * Homepage hero: one video + the seconds where each shot starts. Each shot gets a progress bar
 * under the headline (components/home/Banner.tsx); clicking a bar jumps to that second.
 */
export default function BannerForm({ initial, usingLocal }: { initial: BannerInitial; usingLocal: boolean }) {
  return (
    <AdminForm action={saveBanner} submitLabel="Ruaj bannerin">
      {usingLocal && (
        <p className="border border-highlight/40 bg-highlight/10 px-4 py-3 text-sm text-highlight">
          Faqja tani përdor videon fillestare. Vlerat më poshtë janë të sajat; ngarko një video të re ose ruaji kështu siç janë.
        </p>
      )}
      <FormSection title="Video" description="MP4 ose WebM, deri në 50 MB, pa zë, 1080p. Shfaqet bardh e zi në faqe.">
        <VideoFields initial={initial} />
        <FileField
          name="poster_path"
          label="Foto e posterit"
          required
          folder="hero"
          bucket={STORAGE_BUCKETS.media}
          defaultValue={initial.poster_path}
          hint="Shfaqet derisa të ngarkohet videoja. Më mirë kuadri i parë i videos."
        />
      </FormSection>

      <FormSection title="Pjesët e videos" description="Ku fillon çdo pamje (në sekonda). E para fillon në 0. Emërtimi del mbi shiritin e progresit.">
        <RowsField
          name="slides"
          label="Pjesët"
          max={12}
          defaultValue={initial.slides}
          emptyRow={{ start_seconds: "", label: "" }}
          addLabel="Shto pjesë"
          columns={[
            { key: "start_seconds", label: "Fillon në (sek.)", type: "number", step: "0.001", width: "sm:max-w-40" },
            { key: "label", label: "Emërtimi", maxLength: 60, placeholder: "SKUTER NË QYTET" },
          ]}
        />
      </FormSection>
    </AdminForm>
  );
}

/** Video upload + its length. The length is read from the file when a new video is uploaded. */
function VideoFields({ initial }: { initial: BannerInitial }) {
  const id = useId();
  const { errors } = useAdminForm();
  const [duration, setDuration] = useState(String(initial.duration));

  function readDuration(file: File) {
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration)) setDuration(probe.duration.toFixed(3));
      URL.revokeObjectURL(url);
    };
    probe.onerror = () => URL.revokeObjectURL(url);
    probe.src = url;
  }

  return (
    <>
      <FileField name="video_path" label="Videoja" required folder="hero" bucket={STORAGE_BUCKETS.videos} defaultValue={initial.video_path} onUploaded={readDuration} />
      <div className="max-w-56">
        <FieldShell id={id} name="duration" label="Kohëzgjatja (sekonda)" required hint="Plotësohet vetë kur ngarkon videon.">
          <input
            id={id}
            name="duration"
            inputMode="decimal"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-invalid={Boolean(errors.duration)}
            className={inputClass}
          />
        </FieldShell>
      </div>
    </>
  );
}
