import Link from "next/link";
import { ArrowRight } from "lucide-react";

import FeaturedEntry from "@/app/components/circle/FeaturedEntry";
import { sanityFetch } from "@/sanity/lib/live";
import { homePageQuery } from "@/sanity/lib/queries";
import { dataAttr, urlForImage } from "@/sanity/lib/utils";

/**
 * The featured index, as a ledger.
 *
 * Deliberately NOT a card grid: `Posts.tsx` further down this page already
 * renders rounded, bordered, shadowed cards with an image and an excerpt, so a
 * second one here would read as a duplicate of the list beneath it. Rules and
 * numerals carry the structure instead, and the cover images appear only on
 * hover — so the section stays typographic at rest.
 */

const monthYear = (iso: string | null) =>
  iso
    ? new Date(iso)
        .toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        .toUpperCase()
    : null;

export default async function Featured() {
  const { data } = await sanityFetch({ query: homePageQuery });
  const section = data?.featured;
  const posts = (section?.posts ?? []).filter((post) => post?.slug);

  if (!data || !section?.heading || posts.length === 0) return null;

  const attr = (path: string) =>
    dataAttr({ id: data._id, type: data._type, path }).toString();

  return (
    <section
      id="featured"
      /* bg-card matches "The approach". Because that section sits directly
         below on the same ground, it carries the hairline that separates them —
         no border is needed here, since the step down from Maintenant's
         bg-background already does this edge. */
      className="bg-card px-6 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p
          data-sanity={attr("featured.heading")}
          className="mb-10 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:mb-14"
        >
          {section.heading}
        </p>

        <ol data-sanity={attr("featured.posts")}>
          {posts.map((post, index) => (
            <li
              key={post._id}
              /* numeral-scope names the view-timeline this row's numeral fill
                 animates against. */
              className="numeral-scope border-t border-border"
            >
              <FeaturedEntry
                href={`/posts/${post.slug}`}
                imageUrl={
                  urlForImage(post.coverImage)
                    ?.width(416)
                    .height(234)
                    .fit("crop")
                    .url() ?? null
                }
                title={post.title}
                category={post.category ?? null}
                meta={[
                  post.readingMinutes ? `${post.readingMinutes} MIN` : null,
                  monthYear(post.date),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                index={index}
              />
            </li>
          ))}
        </ol>

        <div className="flex justify-end border-t border-border pt-6">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            All posts
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
