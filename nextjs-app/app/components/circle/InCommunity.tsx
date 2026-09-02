import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { sanityFetch } from "@/sanity/lib/live";
import { homePageQuery } from "@/sanity/lib/queries";
import { dataAttr, urlForImage } from "@/sanity/lib/utils";

/**
 * The artwork's native width. `cover` on the strip is width-driven, so asking
 * for exactly this means no viewport up to 2560 ever upscales it — and there is
 * no sharper variant to ask for, which is why there is no image-set() here.
 */
const SOURCE_WIDTH = 2560;

/**
 * "In Community" — a copy band on a plain ground, a hairline, then a full-bleed
 * strip of photographs.
 *
 * Copy and artwork do not overlap, and that is what lets the strip run edge to
 * edge with no scrim and no fade. The crop follows from the strip's aspect
 * ratio alone: the whole collage on a phone, its middle band on a desktop.
 */
export default async function InCommunity() {
  const { data } = await sanityFetch({ query: homePageQuery });
  const section = data?.community;

  if (!data || !section?.heading) return null;

  const attr = (path: string) =>
    dataAttr({ id: data._id, type: data._type, path }).toString();

  const collage = (image: typeof section.imageLight) => {
    const url = urlForImage(image)
      ?.width(SOURCE_WIDTH)
      .quality(80)
      .auto("format")
      .url();
    return url ? `url("${url}")` : null;
  };

  const light = collage(section.imageLight);
  const dark = collage(section.imageDark);

  // The strip is a background, so it can carry no alt. Announce it as an image
  // when the editor described it, and hide it from the tree when they did not.
  const alt = section.imageLight?.alt ?? section.imageDark?.alt ?? null;

  return (
    <section id="in-community" className="border-y border-border bg-background">
      <div className="px-6 pb-13 pt-8">
        <div className="mx-auto w-full max-w-6xl">
          {section.label && (
            <p
              data-sanity={attr("community.label")}
              className="mb-10 text-xs uppercase tracking-[0.3em] text-muted-foreground"
            >
              {section.label}
            </p>
          )}

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <h2
              data-sanity={attr("community.heading")}
              className="text-balance text-[clamp(2.5rem,4vw,4.5rem)] font-light leading-[1.05] tracking-tight text-foreground"
            >
              {section.heading}
            </h2>

            <div className="lg:max-w-lg">
              {section.body && (
                <p
                  data-sanity={attr("community.body")}
                  /* 1.72 rather than the house `leading-relaxed`: the mockup
                     sets this body on a 31px pitch at 18px, and `relaxed`
                     lands at 29.25, which compounds to 5px over three lines. */
                  className="text-pretty text-base font-light leading-[1.72] text-muted-foreground sm:text-lg"
                >
                  {section.body}
                </p>
              )}

              {section.ctaLabel && section.ctaHref && (
                <Link
                  href={section.ctaHref}
                  data-sanity={attr("community.ctaLabel")}
                  className="group mt-9 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:bg-foreground/90"
                >
                  {section.ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {(light || dark) && (
        <div
          {...(alt
            ? { role: "img", "aria-label": alt }
            : { "aria-hidden": true })}
          style={
            {
              "--collage-light": light ?? dark,
              "--collage-dark": dark ?? light,
            } as React.CSSProperties
          }
          /* Aspect ratio picks the band: 16/9 shows the whole collage, 5/2
             about 71% of its height, and the desktop 4.73:1 its middle 38%. */
          className="collage-strip aspect-[16/9] w-full border-t border-border sm:aspect-[5/2] lg:aspect-[1600/338]"
        />
      )}
    </section>
  );
}
