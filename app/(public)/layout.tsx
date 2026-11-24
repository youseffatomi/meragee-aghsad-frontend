import Image from "next/image";

import { site } from "@/config/site";
import Link from "next/link";

/**
 * The frame for pages a customer opens from a shared link.
 *
 * It is deliberately outside the admin shell: no sidebar, no session lookup and
 * no navigation into the panel. The logo is not a link, because a customer has
 * nowhere useful to go.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            priority
            className="mx-auto h-9 w-auto"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-line bg-surface">
        <p className="mx-auto w-full max-w-4xl px-4 pt-4 pb-1 text-center text-[11px] text-ink-muted sm:px-6">
          {site.name}
        </p>
        <p className="mx-auto w-full max-w-4xl px-4 pt-4 pb-1 text-center text-[11px] text-ink-muted sm:px-6">
          تمام حقوق برای این سایت محفوظ است
        </p>
        <p className="mx-auto w-full max-w-4xl px-4 py-1 text-center text-[11px] text-ink-muted sm:px-6">
          طراحی و توسعه :
          <Link className="text-brand-500" href="https://www.yousoffatomi.ir">
            یوسف فاطومی
          </Link>
        </p>
      </footer>
    </div>
  );
}
