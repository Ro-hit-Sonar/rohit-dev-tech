import { ChevronDown } from "lucide-react";

import TocLinks from "@/app/posts/[slug]/TocLinks";
import type { OutlineItem } from "@/app/posts/[slug]/outline";

/**
 * The contents panel.
 *
 * A native `<details open>`, which is the whole accessibility and
 * no-JavaScript story in one element: keyboard-operable, disclosure state
 * exposed to assistive tech, and open on the server. Nothing here is hidden
 * waiting for a script — the client island inside is only the highlight.
 *
 * The `<details>` lives in this server component rather than in the island. If
 * the whole panel were "use client", every scroll-spy state change would
 * re-render an element whose `open` attribute the reader may have just changed
 * by hand, and we would be relying on React's attribute diff not to write it
 * back.
 */
export default function TableOfContents({ items }: { items: OutlineItem[] }) {
  // A one-entry contents list is a label pretending to be navigation.
  if (items.length < 2) return null;

  return (
    <nav
      aria-labelledby="post-toc-label"
      // The hook globals.css uses to scope smooth scrolling to pages that
      // actually have a contents panel.
      className="post-toc mt-10"
    >
      {/* bg-muted/40: --muted is oklch(0.92) over a 0.97 ground, so 40% lands
          around 242/255 against 245 — the five-step step measured off the
          design. bg-card would go the wrong way in light mode, where --card is
          pure white and would sit *above* the page. */}
      <details open className="group rounded-2xl bg-muted/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-sm font-light text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          <span id="post-toc-label">Table of Contents</span>
          {/* Decorative, not a button: <summary> is already the control, and a
              nested <button> would be an interactive element inside one.

              group-open, not open — the `open` variant targets the element
              carrying the class, and this chevron sits inside <summary> rather
              than on <details>. */}
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 duration-300 group-open:rotate-180 motion-safe:transition-transform"
          />
        </summary>

        <TocLinks items={items} />
      </details>
    </nav>
  );
}
