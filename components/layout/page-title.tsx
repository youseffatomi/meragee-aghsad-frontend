import { cn } from "@/lib/utils/cn";

/**
 * The heading of a panel page.
 *
 * It exists on its own because every page opens with one: keeping the step of
 * the type scale and the black weight in a single place means a real page and a
 * placeholder cannot drift apart, and no page has to restate the measure of the
 * description.
 *
 * The title is set in the heaviest weight the face ships (900). That is a
 * deliberate choice over bold: at this size bold reads as slightly emphasised
 * body copy, and the shell needs one element that clearly outranks the rest.
 * No negative tracking — the face is a connected Persian script, and pulling
 * the letters together breaks the joins.
 */

type PageTitleProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <header className={cn("space-y-1", className)}>
      <h1 className="text-xl font-black text-ink">{title}</h1>
      {description ? (
        <p className="text-xs leading-6 text-ink-muted">{description}</p>
      ) : null}
    </header>
  );
}
