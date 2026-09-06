import type { Metadata } from "next";

import BlogsIndex, { type BlogRow } from "@/app/blogs/BlogsIndex";
import { monthYear } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { blogsIndexQuery } from "@/sanity/lib/queries";

const EYEBROW = "Writing";
const HEADING = "Blogs";
const INTRO =
  "Notes on software engineering, AI, and the ideas that connect them — written while figuring things out, not after.";

export const metadata: Metadata = {
  // The root layout supplies the `%s | <site title>` template, so this is bare.
  title: HEADING,
  description: INTRO,
} satisfies Metadata;

/**
 * Mirrors the order of the `category` list in the Studio schema, so the filter
 * row reads the way an editor sees the field rather than by whichever post
 * happens to be newest. Anything not listed here still appears — appended at
 * the end — so a category added in the Studio shows up rather than vanishing.
 */
const CATEGORY_ORDER = [
  "Fundamentals",
  "System Design",
  "AI",
  "Infrastructure",
  "Practice",
  "Reliability",
];

const rank = (category: string) => {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
};

export default async function BlogsPage() {
  const { data } = await sanityFetch({ query: blogsIndexQuery });
  const posts = data ?? [];

  const rows: BlogRow[] = posts.map((post) => ({
    id: post._id,
    href: `/posts/${post.slug}`,
    title: post.title,
    category: post.category,
    dateLabel: monthYear(post.date),
    // 0 for a post with no body yet. "0 MIN" is worse than no label at all.
    minutesLabel: post.readingMinutes ? `${post.readingMinutes} MIN` : null,
  }));

  // Only the categories that actually have a post. A pill that returns an empty
  // list is a dead control, and the schema carries values nothing is filed
  // under yet.
  const categories = [
    ...new Set(rows.flatMap((row) => (row.category ? [row.category] : []))),
  ].sort((a, b) => rank(a) - rank(b));

  // The query is already ordered newest first, so the span is the two ends.
  const years = posts.map((post) => new Date(post.date).getFullYear());
  const newest = years.at(0);
  const oldest = years.at(-1);
  const yearRange =
    newest === undefined || oldest === undefined
      ? null
      : newest === oldest
        ? `${newest}`
        : `${oldest} — ${newest}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="pb-10 pt-16 sm:pt-20">
        {/* Eyebrow only. The post count that sat opposite it in the design was
            deliberately dropped — the slot stays empty. */}
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {EYEBROW}
        </p>

        <h1 className="mt-8 text-balance text-[clamp(2.5rem,4vw,4.5rem)] font-light leading-[1.05] tracking-tight text-foreground">
          {HEADING}
        </h1>

        <p className="mt-8 max-w-lg text-pretty text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
          {INTRO}
        </p>
      </div>

      <BlogsIndex rows={rows} categories={categories} yearRange={yearRange} />
    </div>
  );
}
