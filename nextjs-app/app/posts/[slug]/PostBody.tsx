import { PortableText, type PortableTextComponents } from "@portabletext/react";

import ResolvedLink from "@/app/components/ResolvedLink";
import type { BodyBlock } from "@/app/posts/[slug]/outline";

/**
 * The article body.
 *
 * Hand-rolled rather than `prose`: the plugin sizes headings by tag, and this
 * page sizes them by rank within the post (see outline.ts). No amount of
 * `prose-h3:` configuration can express "large when it is the shallowest
 * heading here, small when it is not". `PortableText.tsx` keeps using `prose`
 * for the page builder — this is a fork, not a replacement.
 *
 * Body copy is weight 400 on `text-foreground`, not the site's
 * `font-light text-muted-foreground`. That recipe is for supporting copy set
 * beside something louder; here the body is the entire point of the page, and
 * a couple of thousand words of Geist Light is tiring to read.
 */

/**
 * Three ranks, chosen by the post's own shallowest heading level. Literal tags
 * rather than a computed `<Tag>` so nothing here is a component assembled
 * during render, which `react-hooks/static-components` forbids.
 *
 * `scroll-mt-28` is 112px: the 80px fixed header plus air, so a heading arrived
 * at by anchor is not tucked under the bar.
 */
function BodyHeading({
  tier,
  id,
  children,
}: {
  tier: number;
  id?: string;
  children: React.ReactNode;
}) {
  if (tier <= 0) {
    return (
      <h2
        id={id}
        className="mt-14 scroll-mt-28 text-balance text-[1.625rem] font-light leading-snug tracking-tight text-foreground first:mt-0 sm:text-[1.75rem]"
      >
        {children}
      </h2>
    );
  }
  if (tier === 1) {
    return (
      <h3
        id={id}
        className="mt-10 scroll-mt-28 text-balance text-xl font-normal leading-snug tracking-tight text-foreground first:mt-0"
      >
        {children}
      </h3>
    );
  }
  return (
    <h4
      id={id}
      className="mt-8 scroll-mt-28 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground first:mt-0"
    >
      {children}
    </h4>
  );
}

const heading = ({
  children,
  value,
}: {
  children?: React.ReactNode;
  value: unknown;
}) => {
  const block = value as BodyBlock;
  return (
    <BodyHeading tier={block.headingTier ?? 0} id={block.headingId}>
      {children}
    </BodyHeading>
  );
};

/**
 * Module scope, matching FiguringOut.tsx and Maintenant.tsx.
 *
 * Covers every style, list, decorator and annotation the `blockContent` schema
 * permits — and nothing else, so if the schema later grows an image or a code
 * block, @portabletext/react warns about the missing component rather than
 * dropping it silently.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-6 text-pretty first:mt-0">{children}</p>
    ),
    h1: heading,
    h2: heading,
    h3: heading,
    h4: heading,
    h5: heading,
    h6: heading,
    blockquote: ({ children }) => (
      <blockquote className="mt-8 border-l border-border pl-6 font-light text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-6 list-disc pl-6 marker:text-border">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-6 list-decimal pl-6 marker:text-muted-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="mt-2 text-pretty pl-1 first:mt-0">{children}</li>
    ),
    number: ({ children }) => (
      <li className="mt-2 text-pretty pl-1 first:mt-0">{children}</li>
    ),
  },
  marks: {
    // 500, not bold. Geist Bold beside this body weight reads as a different
    // typeface rather than as emphasis.
    strong: ({ children }) => (
      <strong className="font-medium text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => (
      <span className="underline decoration-border underline-offset-4">
        {children}
      </span>
    ),
    // Quoted because "strike-through" is the literal decorator value Sanity's
    // default block config emits, and it is not a valid identifier.
    "strike-through": ({ children }) => (
      <s className="text-muted-foreground">{children}</s>
    ),
    code: ({ children }) => (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] font-normal text-foreground">
        {children}
      </code>
    ),
    // The site's inline-link idiom, from RevealLink: full-contrast text under a
    // quiet underline that solidifies on hover. Not the brand red the shared
    // `prose-a:text-brand` uses — the circle language keeps red out of prose.
    link: ({ children, value }) => (
      <ResolvedLink
        link={value}
        className="text-foreground underline decoration-muted-foreground underline-offset-4 transition-colors hover:decoration-foreground focus-visible:decoration-foreground"
      >
        {children}
      </ResolvedLink>
    ),
  },
};

export default function PostBody({ blocks }: { blocks: BodyBlock[] }) {
  return (
    // 17px on a 28px pitch — the line pitch measured off the design, at a size
    // that holds up across a 45rem measure. `leading-7` is exactly 1.75rem.
    <div className="mt-12 text-[1.0625rem] leading-7 text-foreground">
      <PortableText components={components} value={blocks} />
    </div>
  );
}
