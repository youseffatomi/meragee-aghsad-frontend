/**
 * The frame shared by every signed-out screen: the login page and the
 * "no access" page.
 *
 * The decoration is two soft washes behind the content, so the page has depth
 * without a background image and without anything that shifts on scroll.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-100/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 size-[28rem] rounded-full bg-brand-200/40 blur-3xl"
      />

      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
