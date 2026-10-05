import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

import OpenArc from "@/app/components/circle/OpenArc";
import ResolvedLink from "@/app/components/ResolvedLink";
import { sanityFetch } from "@/sanity/lib/live";
import { homePageQuery } from "@/sanity/lib/queries";
import { dataAttr } from "@/sanity/lib/utils";

/**
 * "What I'm figuring out" — the statement, and the arc behind it.
 *
 * The statement is rich text rather than plain strings so that one word can be
 * drawn hollow from the Studio: "answers", in a sentence about not having them.
 * Which word carries it, and whether any does, is an editorial choice rather
 * than something baked into this file.
 */

const statement: PortableTextComponents = {
  block: {
    normal: ({ children }) => <span className="block">{children}</span>,
  },
  marks: {
    // Drawn as an outline rather than filled — the word the sentence is about
    // not having. See `.hollow-word` in globals.css for why the stroke colour
    // has to be explicit.
    hollow: ({ children }) => (
      <span className="hollow-word">{children}</span>
    ),
  },
};

const body: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="scroll-rise text-pretty text-[1.0625rem] leading-[1.72] text-muted-foreground">
        {children}
      </p>
    ),
  },
  marks: {
    link: ({ children, value: link }) => (
      <ResolvedLink link={link}>{children}</ResolvedLink>
    ),
  },
};

export default async function FiguringOut() {
  const { data } = await sanityFetch({ query: homePageQuery });
  const section = data?.figuringOut;

  if (!data || !section?.heading) return null;

  const attr = (path: string) =>
    dataAttr({ id: data._id, type: data._type, path }).toString();

  const lines = (section.leadLines ?? []) as unknown as PortableTextBlock[];

  return (
    <section
      id="figuring-out"
      /* overflow-x-clip, not overflow-hidden: `hidden` would make this section a
         scroll container, and the arc's timeline resolves against the nearest
         one — which would freeze its progress. `clip` clips the bleeding arc
         without establishing one. */
      className="scroll-arc-scope relative overflow-x-clip bg-card px-6 py-28 sm:py-36"
    >
      <div className="relative mx-auto w-full max-w-6xl">
        {/* The arc sits in the section's vertical dead space rather than in a
            column of its own, so it reads as a mass rather than an icon.

            Offset from the CONTAINER, not the section: anchoring it to the
            full-bleed section pinned it to the viewport edge, so on a wide
            monitor the centred text drifted away from it and the arc ended up
            stranded on its own. -right-48 holds that relationship at every
            width.

            Its size is coupled to the section's padding. `overflow-x-clip`
            clips sideways but NOT vertically, so an arc taller than the section
            spills into the neighbouring sections — at 46rem it was 736px tall
            in a 631px section and bled 52px into both. Shrinking a section's
            padding, or this width, means re-checking that the arc still fits. */}
        <OpenArc
          marker={false}
          className="pointer-events-none absolute -right-48 top-1/2 hidden w-[min(32rem,42vw)] -translate-y-1/2 opacity-60 lg:block"
        />

        <p
          data-sanity={attr("figuringOut.heading")}
          className="relative z-10 mb-12 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:mb-16"
        >
          {section.heading}
        </p>

        {lines.length > 0 && (
          <h2
            data-sanity={attr("figuringOut.leadLines")}
            /* The first line is set quieter than the rest. That is a rule, not
               a field: the copy should not have to carry its own styling, and
               it holds however many lines are added. */
            className="relative z-10 max-w-4xl text-balance text-[clamp(2.05rem,4.4vw,3.8rem)] font-normal leading-[1.05] tracking-[-0.036em] text-foreground [&>span:first-child]:text-muted-foreground"
          >
            <PortableText components={statement} value={lines} />
          </h2>
        )}

        {section.body && section.body.length > 0 && (
          <div
            data-sanity={attr("figuringOut.body")}
            className="relative z-10 mt-10 max-w-[52ch] space-y-6 sm:mt-12"
          >
            <PortableText
              components={body}
              value={section.body as unknown as PortableTextBlock[]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
