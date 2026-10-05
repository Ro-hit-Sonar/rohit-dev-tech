"use client";

import Link from "next/link";

import { useHoverThumbnail } from "@/app/components/circle/useHoverThumbnail";

/**
 * One row of the featured ledger: a large numeral in its own cell, then the
 * category and meta on a shared baseline with the title beneath.
 *
 * The numeral is two stacked glyphs — a permanent outline and a fill whose
 * opacity is driven by this row's scroll position (see globals.css). It is
 * aria-hidden because the ordinal is already carried by the parent <ol>, so
 * exposing it would just have a screen reader announce the number twice.
 */
export default function FeaturedEntry({
  href,
  imageUrl,
  title,
  category,
  meta,
  index,
}: {
  href: string;
  imageUrl: string | null;
  title: string;
  category: string | null;
  meta: string;
  index: number;
}) {
  // Above by default: below would cover the next row, which is what the reader
  // is scanning towards.
  const { triggerRef, handlers, card } = useHoverThumbnail<HTMLAnchorElement>({
    imageUrl,
    alt: title,
    preferBelow: false,
  });

  const numeral = String(index + 1).padStart(2, "0");

  return (
    <>
      <Link
        ref={triggerRef}
        href={href}
        {...handlers}
        className="group grid grid-cols-1 gap-x-8 gap-y-3 py-8 sm:py-10 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-x-12"
      >
        <span
          aria-hidden="true"
          className="relative block font-light leading-none tracking-tight text-foreground"
        >
          <span className="numeral-outline block text-[clamp(2.5rem,7vw,5.5rem)] tabular-nums">
            {numeral}
          </span>
          <span className="numeral-fill absolute inset-0 block text-[clamp(2.5rem,7vw,5.5rem)] tabular-nums">
            {numeral}
          </span>
        </span>

        {/* The vertical rule is the cell's own left border, so it spans the row
            height without an extra element. */}
        <span className="block lg:border-l lg:border-border lg:pl-12">
          <span className="mb-4 flex items-baseline justify-between gap-6 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:mb-5">
            <span>{category}</span>
            <span className="whitespace-nowrap text-right">{meta}</span>
          </span>
          <span className="block text-pretty text-[clamp(1.25rem,2.2vw,1.875rem)] font-light leading-[1.2] tracking-tight text-muted-foreground transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
            {title}
          </span>
        </span>
      </Link>
      {card}
    </>
  );
}
