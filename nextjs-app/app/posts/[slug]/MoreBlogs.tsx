import Link from "next/link";
import { ArrowRight } from "lucide-react";

import BlogEntry from "@/app/blogs/BlogEntry";
import { monthYear } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { moreBlogsQuery } from "@/sanity/lib/queries";

/**
 * The hand-off at the end of an article.
 *
 * Reuses the /blogs row verbatim, so this reads as an excerpt of the index
 * rather than a second, differently-styled rendering of the same posts. It sits
 * at full container width rather than inside the article's measure: it is not
 * part of the article, and BlogEntry's grid was drawn for the wider column.
 */
export default async function MoreBlogs({ slug }: { slug: string }) {
  const { data } = await sanityFetch({
    query: moreBlogsQuery,
    params: { slug, limit: 3 },
  });

  if (!data || data.length === 0) return null;

  return (
    <aside aria-labelledby="more-blogs">
      <p
        id="more-blogs"
        className="mb-8 text-xs uppercase tracking-[0.3em] text-muted-foreground"
      >
        More blogs
      </p>

      <ol>
        {data.map((post) => (
          <li key={post._id} className="border-t border-border">
            <BlogEntry
              href={`/posts/${post.slug}`}
              title={post.title}
              category={post.category}
              dateLabel={monthYear(post.date)}
              minutesLabel={
                post.readingMinutes ? `${post.readingMinutes} MIN` : null
              }
            />
          </li>
        ))}
      </ol>

      <div className="flex justify-end border-t border-border pt-6">
        <Link
          href="/blogs"
          className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
        >
          All blogs
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </aside>
  );
}
