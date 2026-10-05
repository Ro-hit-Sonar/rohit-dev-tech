"use client";

import { useEffect, useState } from "react";

import type { OutlineItem } from "@/app/posts/[slug]/outline";

/**
 * The reading line: the y at which a heading counts as "arrived". 112px, the
 * same offset as the `scroll-mt-28` on the headings themselves, so a heading
 * jumped to by anchor is lit the moment it lands.
 */
const BAND_TOP = 112;

/**
 * The scroll-spy highlight, and nothing else.
 *
 * The links are server-rendered and fully working before this file runs — all
 * it adds is which one is lit. The `<details>` that opens and closes stays in
 * the server component above, so React never touches the element whose `open`
 * the reader is toggling by hand.
 */
export default function TocLinks({ items }: { items: OutlineItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // The headings live in a sibling server-rendered tree, so there are no refs
    // to hold — look them up by the id the server already wrote. That is only
    // safe because outline.ts is the single source of both the ids and this
    // list.
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      // Every heading is re-measured from scratch. That is what makes a
      // coalesced or dropped frame during a fast scroll harmless: the next one
      // recomputes the answer rather than adjusting a running guess.
      let current: string | null = null;
      for (const node of nodes) {
        // Headings are in document order, so their tops increase: the first one
        // still below the reading line ends the search.
        if (node.getBoundingClientRect().top - BAND_TOP > 1) break;
        current = node.id;
      }
      // Above the first heading, light the first entry rather than nothing. A
      // panel highlighting nothing reads as broken, not as neutral.
      setActiveId(current ?? nodes[0].id);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    // A plain scroll listener rather than an IntersectionObserver.
    //
    // An observer only fires as a heading *crosses* the band, and it delivers
    // nothing once the page comes to rest — so following a contents link left
    // the highlight one entry short, because the last callback fired while the
    // smooth scroll was still moving and none arrived at the destination. The
    // rAF guard means this costs one pass over a handful of rects per frame,
    // which is cheaper than the boundary bookkeeping it replaces.
    window.addEventListener("scroll", schedule, { passive: true });

    // A resize moves every rect without scrolling.
    window.addEventListener("resize", schedule);

    // Settles the initial state, and covers a deep link or a scroll position
    // restored on back-navigation. Scheduled through rAF rather than called
    // here: a synchronous setState in an effect body is what
    // `react-hooks/set-state-in-effect` is an error for in this repo (see
    // MaintenantStack.tsx:101).
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <ol className="px-5 pb-4">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              /* 7px + 22px + 7px = the 36px row pitch measured off the design.
                 A long heading wraps rather than truncating: the row is a link,
                 and a truncated link is a target you cannot read before you
                 press it. */
              className={`grid grid-cols-[0.375rem_1fr] items-baseline gap-x-3 py-[0.4375rem] text-sm leading-[1.375rem] transition-colors duration-300 ${
                item.tier > 0 ? "pl-5" : ""
              } ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Two channels, not one. Colour alone cannot separate "active"
                  from "hovered", because both resolve to text-foreground. The
                  marker is MaintenantStack's dot, reused so "you are here"
                  reads the same everywhere on the site. */}
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 -translate-y-[0.15em] ${
                  isActive ? "bg-foreground" : "bg-transparent"
                }`}
              />
              <span className="text-pretty">{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
