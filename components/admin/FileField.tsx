"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { useAdminForm } from "@/components/admin/AdminForm";
import { FieldShell } from "@/components/admin/fields";
import { buttonClass } from "@/components/admin/ui";
import { getBrowserClient } from "@/lib/supabase/browser";
import { mediaUrl, STORAGE_BUCKETS, type StorageBucket } from "@/lib/supabase/config";

/**
 * Upload a photo or video straight from the browser to Supabase Storage (large files never pass
 * through our server). The form only carries the stored path in a hidden input.
 * Storage itself enforces admin-only uploads, the size limit and the file types (see the migration);
 * the checks here just give a clear message before uploading.
 */

const RULES: Record<StorageBucket, { types: string[]; maxBytes: number; accept: string; kind: string }> = {
  media: { types: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxBytes: 5 * 1024 * 1024, accept: "image/jpeg,image/png,image/webp,image/avif", kind: "foto" },
  videos: { types: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024, accept: "video/mp4,video/webm", kind: "video" },
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export default function FileField({
  name,
  label,
  hint,
  required,
  defaultValue,
  folder,
  bucket = STORAGE_BUCKETS.media,
  onUploaded,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string | null;
  /** Folder inside the bucket, e.g. "models". */
  folder: string;
  bucket?: StorageBucket;
  /** Called with the chosen file (e.g. to read a video's duration). */
  onUploaded?: (file: File) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const { errors } = useAdminForm();
  const [path, setPath] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const rules = RULES[bucket];
  const isVideo = rules.kind === "video";
  const preview = path ? mediaUrl(path, bucket) : undefined;

  function update(next: string) {
    setPath(next);
    // Hidden inputs don't fire change events; tell the form it has unsaved changes.
    queueMicrotask(() => hiddenRef.current?.form?.dispatchEvent(new Event("change", { bubbles: true })));
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProblem(null);
    if (!rules.types.includes(file.type)) {
      setProblem(`Lloj skedari i palejuar. Lejohen: ${rules.types.map((t) => EXT[t]).join(", ")}.`);
      return;
    }
    if (file.size > rules.maxBytes) {
      setProblem(`Skedari është shumë i madh (maksimumi ${Math.round(rules.maxBytes / 1024 / 1024)} MB).`);
      return;
    }
    const client = getBrowserClient();
    if (!client) {
      setProblem("Paneli nuk është lidhur me databazën.");
      return;
    }
    setBusy(true);
    const objectPath = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`;
    const { error } = await client.storage.from(bucket).upload(objectPath, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    setBusy(false);
    if (error) {
      setProblem("Ngarkimi dështoi. Kontrollo lidhjen dhe provo përsëri.");
      return;
    }
    update(objectPath);
    onUploaded?.(file);
  }

  return (
    <FieldShell id={id} name={name} label={label} hint={hint} error={problem} required={required}>
      <input ref={hiddenRef} type="hidden" name={name} value={path} />
      <div className={`flex flex-wrap items-center gap-4 border bg-surface p-3 ${errors[name] || problem ? "border-red" : "border-line-2"}`}>
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden border border-line bg-[#0c0c0c]">
          {preview ? (
            isVideo ? (
              <video src={preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
              <img src={preview} alt="" className="h-full w-full object-contain" />
            )
          ) : (
            <span className="text-xs text-faint">Pa {rules.kind}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input id={id} ref={inputRef} type="file" accept={rules.accept} onChange={upload} className="sr-only" />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={buttonClass.secondary}>
            {busy ? "Duke ngarkuar…" : path ? `Ndrysho ${rules.kind}n` : `Ngarko ${rules.kind}`}
          </button>
          {path && !required && (
            <button type="button" disabled={busy} onClick={() => update("")} className={buttonClass.small}>
              Hiq
            </button>
          )}
        </div>
      </div>
    </FieldShell>
  );
}
