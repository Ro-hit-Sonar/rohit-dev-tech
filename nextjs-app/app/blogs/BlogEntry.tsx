import Link from "next/link";

/**
 * One row of the blogs index: the date over its category in the left cell, the
 * title in the middle, the reading time hard right.
 *
 * `items-baseline` on the grid is what sets the title's first baseline on the
 * date's, with the category hanging beneath it — the alternative, aligning the
 * cell boxes, drops the title to the middle of a two-line left cell.
 *
 * The row rests quiet and the title alone lifts to full contrast on hover, so
 * the only thing that moves under the cursor is the thing you would click.
 */
export default function BlogEntry({
  href,
  title,
  category,
  dateLabel,
  minutesLabel,
}: {
  href: string;
  title: string;
  category: string | null;
  dateLabel: string | null;
  minutesLabel: string | null;
}) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-1 items-baseline gap-x-6 gap-y-2 py-7 sm:grid-cols-[minmax(0,12rem)_1fr_auto] sm:gap-x-12"
    >
      {/* Date and category share one token. The design set the category a step
          lighter, but with the title now resting at `muted-foreground` too,
          anything darker here would make the date the loudest thing in the row
          — and the step cannot be recovered with an alpha: measured,
          `text-muted-foreground/70` is 3.01:1 on the light ground, under AA for
          12px, and the alpha needed to clear 4.5 left no visible step at all. */}
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {dateLabel && <span className="block">{dateLabel}</span>}
        {category && <span className="mt-1.5 block">{category}</span>}
      </span>

      <span className="text-pretty text-lg font-light leading-snug text-muted-foreground transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground sm:text-xl">
        {title}
      </span>

      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-right">
        {minutesLabel}
      </span>
    </Link>
  );
}
