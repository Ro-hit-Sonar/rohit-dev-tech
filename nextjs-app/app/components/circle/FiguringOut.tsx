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

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="scroll-rise text-pretty text-base font-light leading-relaxed text-muted-foreground">
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

  const lines = section.leadLines ?? [];

  return (
    <section
      id="figuring-out"
      /* overflow-x-clip, not overflow-hidden: `hidden` would make this section a
          scroll container, and `animation-timeline: view()` resolves against the
          nearest one — which would freeze the arc's progress. `clip` clips the
          bleeding arc without establishing one. */
      className="scroll-arc-scope relative overflow-x-clip bg-card px-6 py-28 sm:py-36"
    >
      <div className="relative mx-auto w-full max-w-6xl">
        {/* The arc sits in the section's vertical dead space rather than in a
            column of its own, so it reads as a mass rather than an icon.
            Offset from the CONTAINER, not the section: anchoring it to the
            full-bleed section pinned it to the viewport edge, so on a wide
            monitor the centred text drifted away from it and the arc ended up
            stranded on its own. -right-60 reproduces the 1440px composition and
            then holds that relationship at every width. */}
        <OpenArc
          marker={false}
          className="pointer-events-none absolute -right-60 top-1/2 hidden w-[min(46rem,60vw)] -translate-y-1/2 opacity-60 lg:block"
        />

        <p
          data-sanity={attr("figuringOut.heading")}
          className="mb-10 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:mb-14"
        >
          {section.heading}
        </p>

        {/* The statement. Each line lands brighter than the one before, so the
            Less -> More turn in the copy is carried by the typography itself. */}
        {lines.length > 0 && (
          <div data-sanity={attr("figuringOut.leadLines")} className="max-w-4xl">
            {lines.map((line, index) => (
              <p
                key={line}
                style={
                  {
                    // Last line at full strength, earlier ones progressively
                    // quieter, so the statement brightens as it resolves.
                    "--line-opacity": 0.45 + (0.55 * (index + 1)) / lines.length,
                    paddingLeft: `${index * 2.5}rem`,
                  } as React.CSSProperties
                }
                className="scroll-line text-balance text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1.05] tracking-tight text-foreground"
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {section.body && section.body.length > 0 && (
          <div
            data-sanity={attr("figuringOut.body")}
            className="mt-16 max-w-md space-y-6 sm:mt-20 lg:ml-auto lg:mr-[38%]"
          >
            <PortableText
              components={components}
              value={section.body as unknown as PortableTextBlock[]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
