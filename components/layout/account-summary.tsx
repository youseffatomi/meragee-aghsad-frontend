import { messages } from "@/config/messages";
import type { SessionUser } from "@/types/auth";

/**
 * Who is signed in. Presentational, so the layout can keep the session read to
 * a single place.
 *
 * The design sets the greeting above the name and the role as a pill beside it,
 * so the block reads top-down instead of running along one line. The role rides
 * on the name's line rather than under it.
 *
 * Both the avatar's initials and the role pill use the brand ramp's text and
 * soft steps: the fill step measures 2.4:1 on this surface and may not carry
 * type.
 *
 * The avatar is decorative — the name sits right beside it — so it is hidden
 * from assistive tech rather than echoing a name a screen reader would read
 * twice.
 *
 * The name clips rather than runs on: a long one would otherwise push into the
 * controls on the other side of the header.
 */

/** e.g. «یوسف یوسفی» → «ی.ی», the way the design initials the avatar. */
function initialsOf(name: string, lastName: string): string {
  return [name, lastName]
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .join(".");
}

export function AccountSummary({ user }: { user: SessionUser }) {
  const fullName = `${user.name} ${user.lastName}`.trim();

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-text sm:size-12 sm:text-base"
      >
        {initialsOf(user.name, user.lastName)}
      </div>

      <div className="hidden min-w-0 flex-col sm:flex">
        <span className="text-xs text-ink-muted">{messages.header.greeting}</span>

        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold text-ink">{fullName}</span>
          <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-text">
            {messages.roles[user.role]}
          </span>
        </span>
      </div>
    </div>
  );
}
