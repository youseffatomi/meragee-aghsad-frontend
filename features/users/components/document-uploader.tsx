"use client";

import { useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { validation } from "@/config/validation";
import { fileSrc } from "@/lib/files/url";
import { cn } from "@/lib/utils/cn";
import { usersApi } from "../client-api";
import { DocumentThumbnail } from "./document-thumbnail";

type DocumentUploaderProps = {
  label: string;
  description?: string;
  multiple?: boolean;
  /** Smaller tiles and a tighter drop zone, for a side-by-side layout. */
  compact?: boolean;
  value: string[];
  onChange: (next: string[]) => void;
};

/**
 * Drag-and-drop upload backed by the temp folder.
 *
 * Removing a thumbnail is not just visual: the temp file is deleted on the
 * backend so abandoned uploads do not linger until the nightly cleanup. The
 * removal is optimistic — the tile disappears immediately and a failed delete
 * only surfaces a toast.
 */
export function DocumentUploader({
  label,
  description,
  multiple = false,
  compact = false,
  value,
  onChange,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestDelete(filename: string) {
    const result = await usersApi.removeFile(filename);
    if (!result.ok) toast.error(result.message);
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setError(null);

    const valid = files.filter(
      (file) =>
        (validation.upload.mimeTypes as readonly string[]).includes(file.type) &&
        file.size <= validation.upload.maxBytes,
    );

    if (valid.length !== files.length) {
      setError("فقط تصاویر JPG، PNG و WEBP تا حجم ۵ مگابایت پذیرفته می‌شود.");
    }

    const selected = multiple ? valid : valid.slice(0, 1);
    if (selected.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of selected) {
      const result = await usersApi.upload(file);

      if (!result.ok) {
        setError(result.message);
        break;
      }

      uploaded.push(result.data.filePath);
    }

    setUploading(false);

    if (uploaded.length > 0) {
      // Replace only after the new file is safely on the server, so a failed
      // upload never leaves the form pointing at a deleted file.
      if (!multiple && value.length > 0) {
        await requestDelete(value[0]);
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded);
    }
  }

  function remove(filename: string) {
    onChange(value.filter((item) => item !== filename));
    void requestDelete(filename);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={validation.upload.mimeTypes.join(",")}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {multiple || value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
          disabled={uploading}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-field border-2 border-dashed text-center transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none disabled:cursor-wait",
            compact ? "px-3 py-5" : "px-4 py-7",
            dragging
              ? "border-brand-500 bg-brand-tint"
              : "border-line bg-surface-sunken hover:border-brand-300 hover:bg-brand-tint/60",
          )}
        >
          {uploading ? (
            <Spinner className="size-6 text-brand-700" />
          ) : (
            <UploadCloud className="size-6 text-brand-600" aria-hidden="true" />
          )}
          <span className="text-xs font-bold text-ink">
            {uploading
              ? "در حال آپلود…"
              : "تصویر را اینجا رها کنید یا برای انتخاب کلیک کنید"}
          </span>
          <span className="text-[11px] text-ink-muted">
            JPG، PNG یا WEBP — حداکثر ۵ مگابایت
          </span>
        </button>
      ) : null}

      {!multiple && value.length > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-field border border-line bg-surface px-3 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none disabled:cursor-wait"
        >
          {uploading ? <Spinner /> : <ImagePlus className="size-4" aria-hidden="true" />}
          تغییر تصویر
        </button>
      ) : null}

      {error ? (
        <p className="text-xs leading-5 text-danger-text" role="alert">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <div
          className={cn(
            "grid",
            compact ? "gap-2" : "gap-3",
            multiple
              ? compact
                ? "grid-cols-3"
                : "grid-cols-2"
              : compact
                ? "mx-auto max-w-90"
                : "grid-cols-1",
          )}
        >
          {value.map((filename, index) => {
            const src = fileSrc(`temp/${filename}`);

            return src ? (
              <DocumentThumbnail
                key={filename}
                src={src}
                alt={`${label} ${index + 1}`}
                aspect={compact && multiple ? "square" : "video"}
                onOpen={() => window.open(src, "_blank", "noopener,noreferrer")}
                onRemove={() => remove(filename)}
              />
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}
