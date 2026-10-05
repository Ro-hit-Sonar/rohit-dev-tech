import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Image } from "next-sanity/image";
import { stegaClean } from "@sanity/client/stega";
import { type PortableTextBlock } from "@portabletext/react";

import MoreBlogs from "@/app/posts/[slug]/MoreBlogs";
import PostBody from "@/app/posts/[slug]/PostBody";
import TableOfContents from "@/app/posts/[slug]/TableOfContents";
import { buildOutline } from "@/app/posts/[slug]/outline";
import { longDate } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import {
  postMetaQuery,
  postPagesSlugs,
  postQuery,
} from "@/sanity/lib/queries";
import { resolveOpenGraphImage, urlForImage } from "@/sanity/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: postPagesSlugs,
    // Use the published perspective in generateStaticParams
    perspective: "published",
    stega: false,
  });
  return data;
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const { data: post } = await sanityFetch({
    // Not postQuery: this needs a title and an image, and was fetching and
    // serialising the entire article body to get them. The two requests were
    // never deduped anyway, because they differ on stega.
    query: postMetaQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  });
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = resolveOpenGraphImage(post?.coverImage);

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{ name: `${post.author.firstName} ${post.author.lastName}` }]
        : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata;
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const { data: post } = await sanityFetch({ query: postQuery, params });

  if (!post?._id) {
    return notFound();
  }

  // One pass produces both the ids the body carries and the list the contents
  // panel shows, so the two cannot drift apart.
  const { blocks, headings } = buildOutline(
    post.content as PortableTextBlock[] | null,
  );

  // Joined rather than gated on having both names: the old page required
  // firstName AND lastName, and because it rendered the date inside <Avatar>,
  // a post with no author silently lost its date too.
  const authorName = [post.author?.firstName, post.author?.lastName]
    .filter(Boolean)
    .join(" ");
  const avatarUrl =
    urlForImage(post.author?.picture)?.width(48).height(48).fit("crop").url() ??
    null;
  const coverUrl =
    urlForImage(post.coverImage)?.width(1440).height(810).fit("crop").url() ??
    null;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-6 pt-12 sm:pt-16">
        {/* Below xl the breadcrumb sits in flow above the meta row. From xl the
            three-track grid puts it in the left gutter on the meta's own
            baseline — xl rather than lg because only above 1280 has max-w-6xl
            capped, making the side track a deterministic 160px. At lg it would
            be 88px, and "Blog / System Design" would wrap inside the gutter. */}
        <div className="grid gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,45rem)_minmax(0,1fr)] xl:items-baseline xl:gap-x-8">
          <nav
            aria-label="Breadcrumb"
            className="min-w-0 text-sm font-light xl:col-start-1"
          >
            <Link
              href="/blogs"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            {post.category && (
              <>
                <span className="px-1.5 text-muted-foreground" aria-hidden="true">
                  /
                </span>
                {/* Text, not a link. /blogs filters in memory with no URL state,
                    so there is no address for a category to point at. */}
                <span className="text-foreground">{post.category}</span>
              </>
            )}
          </nav>

          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-light text-muted-foreground xl:col-start-2">
            <time dateTime={post.date}>{longDate(post.date)}</time>
            {authorName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-2">
                  {avatarUrl && (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-foreground">{authorName}</span>
                </span>
              </>
            )}
            {post.readingMinutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min read</span>
              </>
            ) : null}
          </p>
        </div>

        {/* The reading measure. Fixed at 45rem with the gutters absorbing every
            extra pixel, so the line length never changes and the air on both
            sides grows with the window. */}
        <article className="mx-auto max-w-[45rem] pb-20 sm:pb-28">
          <h1 className="mt-6 text-balance text-[clamp(2rem,4.2vw,2.75rem)] font-light leading-[1.12] tracking-tight text-foreground">
            {post.title}
          </h1>

          {coverUrl && (
            <Image
              src={coverUrl}
              alt={stegaClean(post.coverImage?.alt) || ""}
              width={1440}
              height={810}
              priority
              // Not CoverImage: its no-image fallback puts a square grey box in
              // a 16:9 slot, it carries a shadow that exists nowhere else on
              // this site, and its sizes="100vw" would fetch a full-viewport
              // image for a 720px column.
              sizes="(min-width: 768px) 720px, 100vw"
              className="mt-10 aspect-video w-full rounded-2xl object-cover"
            />
          )}

          <TableOfContents items={headings} />

          {blocks.length > 0 && <PostBody blocks={blocks} />}
        </article>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <Suspense fallback={null}>
            <MoreBlogs slug={post.slug} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
