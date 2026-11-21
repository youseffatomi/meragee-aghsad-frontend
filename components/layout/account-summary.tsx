import Image from "next/image";

import { messages } from "@/config/messages";
import { site } from "@/config/site";
import type { SessionUser } from "@/types/auth";

/**
 * Who is signed in. Presentational, so the layout can keep the session read to
 * a single place.
 *
 * The role rides on the name's line rather than under it, the way the design
 * sets it, and uses the text step of the brand ramp: the fill step measures
 * 2.4:1 on this surface and may not carry type.
 *
 * The avatar is decorative — the name is right next to it — so its `alt` is
 * empty rather than a repeated name that a screen reader would read twice.
 *
 * The name clips rather than runs on: a long one would otherwise push into the
 * logout control on the other side of the header.
 */
export function AccountSummary({ user }: { user: SessionUser }) {
  const fullName = `${user.name} ${user.lastName}`.trim();

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Image
        src={site.defaultAvatar}
        alt=""
        width={48}
        height={48}
        className="size-9 shrink-0 rounded-full object-cover sm:size-12"
      />

      <p className="hidden min-w-0 truncate text-sm font-bold text-ink sm:block">
        {fullName}
        <span className="text-brand-text"> ({messages.roles[user.role]})</span>
      </p>
    </div>
  );
}
