import { Suspense } from "react";
import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";
import { LoginFormSkeleton } from "@/features/auth/components/login-form-skeleton";
import { site } from "@/config/site";

export const metadata = {
  title: "ورود",
};

/**
 * A single centred column. The logo sits above the card rather than inside it,
 * so it stays the first thing on the page on every breakpoint.
 *
 * `?next=` is a request-time value, so the form is streamed in behind a
 * `<Suspense>` boundary. Everything else — the logo and the card — is part of
 * the static shell and renders immediately.
 */
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <section className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <Image
          src={site.logo.src}
          alt={site.logo.alt}
          width={site.logo.width}
          height={site.logo.height}
          priority
          className="h-12 w-auto sm:h-14"
        />
      </div>

      <div className="rounded-card border border-line bg-surface p-6 shadow-panel sm:p-8">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginFormSection searchParams={searchParams} />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-[11px] leading-6 text-ink-muted">{site.name}</p>
    </section>
  );
}

async function LoginFormSection({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return <LoginForm next={next} />;
}
