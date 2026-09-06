"use client";

import { useState } from "react";
import { ArrowDown, Search } from "lucide-react";

import BlogEntry from "@/app/blogs/BlogEntry";

export type BlogRow = {
  id: string;
  href: string;
  title: string;
  category: string | null;
  dateLabel: string | null;
  minutesLabel: string | null;
};

const PAGE_SIZE = 10;

/**
 * The filter row, the list, and the trailing rule.
 *
 * Filtering happens here rather than in the URL because the whole list is
 * already on the page — the server sent every row, so narrowing it is a
 * question about text the reader can already see, not a new request. That also
 * settles the no-JavaScript story: this renders on the server too, so a reader
 * without it still gets the rules and the first page of posts. Nothing is
 * hidden waiting for a script; only the narrowing is unavailable.
 *
 * Everything below the state is derived during render. There is no effect in
 * this file, and that is what keeps `shown` in step with the filters — the
 * callbacks that change a filter reset the count in the same tick, so the two
 * can never disagree.
 */
export default function BlogsIndex({
  rows,
  categories,
  yearRange,
}: {
  rows: BlogRow[];
  categories: string[];
  yearRange: string | null;
}) {
  // null rather than a sentinel string, so a category could be called "All"
  // without colliding with the unfiltered state.
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const needle = query.trim().toLowerCase();

  // Title and category only. Matching an excerpt the page never shows would
  // return rows whose reason for matching is invisible.
  const matches = rows.filter(
    (row) =>
      (active === null || row.category === active) &&
      (needle === "" ||
        row.title.toLowerCase().includes(needle) ||
        (row.category ?? "").toLowerCase().includes(needle)),
  );

  const visible = matches.slice(0, shown);
  const hasMore = matches.length > visible.length;

  const pill = (isActive: boolean) =>
    `rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
      isActive
        ? "bg-foreground text-background"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const choose = (category: string | null) => {
    setActive(category);
    setShown(PAGE_SIZE);
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        {/* Buttons with aria-pressed, not tabs: there is one list below and it
            is filtered rather than swapped, so tab semantics would promise a
            panel change that never happens. No negative margin — the active
            pill's fill is meant to start flush with the rules and the dates. */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap items-center gap-y-1"
        >
          <button
            type="button"
            aria-pressed={active === null}
            onClick={() => choose(null)}
            className={pill(active === null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={active === category}
              onClick={() => choose(category)}
              className={pill(active === category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 sm:w-60">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(PAGE_SIZE);
            }}
            aria-label="Search blogs"
            placeholder="Search"
            className="w-full rounded-full border border-border bg-transparent py-1.5 pl-10 pr-4 text-xs uppercase tracking-[0.2em] text-foreground transition-colors placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-muted-foreground focus-visible:border-foreground"
          />
        </div>
      </div>

      {/* Always in the DOM, so it is a live region the moment the page loads.
          Rendering the announcement only when the list empties would insert the
          region at the same instant it changes, which screen readers do not
          reliably announce. */}
      <p aria-live="polite" className="sr-only">
        {matches.length === 1 ? "1 blog" : `${matches.length} blogs`}
      </p>

      {visible.length > 0 ? (
        <ol>
          {visible.map((row) => (
            <li key={row.id} className="border-t border-border">
              <BlogEntry
                href={row.href}
                title={row.title}
                category={row.category}
                dateLabel={row.dateLabel}
                minutesLabel={row.minutesLabel}
              />
            </li>
          ))}
        </ol>
      ) : (
        <p className="border-t border-border py-16 text-sm font-light text-muted-foreground">
          {rows.length === 0
            ? "No blogs yet."
            : "No blogs match that. Try another category, or clear the search."}
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center border-t border-border py-5">
          <button
            type="button"
            onClick={() => setShown((count) => count + PAGE_SIZE)}
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View more
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-1" />
          </button>
        </div>
      )}

      <div className="flex items-baseline justify-between border-t border-border pb-20 pt-5">
        {/* The left slot carried an "ARCHIVE" label in the design and is
            deliberately empty. The span keeps the year range hard right. */}
        <span aria-hidden="true" />
        {yearRange && (
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {yearRange}
          </span>
        )}
      </div>
    </>
  );
}
