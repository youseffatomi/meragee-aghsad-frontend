import type { ReactNode } from "react";

import { PageTitle } from "./page-title";

/**
 * The body of every route that exists but has no screen yet.
 *
 * It is deliberately one component: when a real page arrives, only that page's
 * file changes, and the placeholder disappears from the codebase with it.
 *
 * The panel is white, so the block is filled with the sunken warm neutral
 * instead of white — otherwise the dashed edge would be the only thing saying
 * where it starts and ends.
 */

type PagePlaceholderProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function PagePlaceholder({ title, description, icon }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={title} description={description} />

      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface-sunken px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand-tint text-brand-700">
          {icon}
        </span>
        <p className="mt-4 text-sm font-bold text-ink">این بخش در حال آماده‌سازی است</p>
        <p className="mt-1 max-w-sm text-xs leading-6 text-ink-muted">
          به‌زودی می‌توانید از این صفحه استفاده کنید.
        </p>
      </div>
    </div>
  );
}
