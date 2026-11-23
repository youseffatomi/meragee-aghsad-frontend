"use client";

import { useState } from "react";
import { FileImage } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Lightbox } from "@/components/ui/lightbox";
import { fileSrc } from "@/lib/files/url";
import type { User } from "@/types/domain";
import { DocumentThumbnail } from "./document-thumbnail";

type DocumentItem = {
  key: string;
  src: string;
  label: string;
};

/**
 * The document gallery beside the profile.
 *
 * The national card gets its own larger tile; every other document follows as
 * a thumbnail. Clicking any of them opens the shared lightbox.
 */
export function UserDocuments({ documents }: { documents: User["identityDocuments"] }) {
  const [selected, setSelected] = useState<DocumentItem | null>(null);

  const items: DocumentItem[] = [];

  const nationalCard = fileSrc(documents?.nationalCardImage);
  if (nationalCard) {
    items.push({ key: "national-card", src: nationalCard, label: "کارت ملی" });
  }

  for (const [index, filename] of (documents?.otherDocuments ?? []).entries()) {
    const src = fileSrc(filename);
    if (src) {
      items.push({
        key: `document-${index}`,
        src,
        label: `مدرک ${index + 1}`,
      });
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <header className="border-b border-line pb-4">
        <h2 className="text-sm font-bold text-ink">مدارک هویتی</h2>
        <p className="mt-1 text-xs text-ink-muted">
          برای دیدن اندازه کامل، روی تصویر بزنید.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<FileImage className="size-5" aria-hidden="true" />}
          title="مدرکی ثبت نشده"
          description="برای این کاربر هیچ تصویری از مدارک هویتی ذخیره نشده است."
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <DocumentThumbnail
              key={item.key}
              src={item.src}
              alt={item.label}
              label={item.label}
              onOpen={() => setSelected(item)}
              className={index === 0 ? "col-span-2" : undefined}
            />
          ))}
        </div>
      )}

      <Lightbox
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        src={selected?.src ?? null}
        alt={selected?.label ?? ""}
      />
    </section>
  );
}
