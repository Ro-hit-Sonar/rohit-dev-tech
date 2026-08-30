import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

import MaintenantStack from "@/app/components/circle/MaintenantStack";
import RevealLink from "@/app/components/circle/RevealLink";
import ResolvedLink from "@/app/components/ResolvedLink";
import { sanityFetch } from "@/sanity/lib/live";
import { homePageQuery } from "@/sanity/lib/queries";
import { dataAttr, urlForImage } from "@/sanity/lib/utils";

/**
 * The `reveal` annotation, as the GROQ projection returns it. Typegen types
 * `slug`/`title` as non-optional because the schema requires them, but a
 * reference to a deleted post dereferences to null at runtime — hence the
 * defensive optionals here.
 */
type Reveal = {
  slug?: string | null;
  title?: string | null;
  coverImage?: { asset?: { _ref?: string }; alt?: string } | null;
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-pretty text-lg font-light leading-relaxed text-foreground sm:text-xl">
        {children}
      </p>
    ),
  },
  marks: {
    // Runs on the server, so the Sanity image URL is resolved here and
    // RevealLink only ever receives plain strings.
    reveal: ({ children, value }) => {
      const reveal = value as Reveal;
      const imageUrl =
        urlForImage(reveal?.coverImage)?.width(416).height(234).fit("crop").url() ??
        null;

      return (
        <RevealLink
          href={reveal?.slug ? `/posts/${reveal.slug}` : null}
          imageUrl={imageUrl}
          alt={reveal?.title ?? ""}
        >
          {children}
        </RevealLink>
      );
    },
    link: ({ children, value: link }) => (
      <ResolvedLink link={link}>{children}</ResolvedLink>
    ),
  },
};

export default async function Maintenant() {
  const { data } = await sanityFetch({ query: homePageQuery });
  const section = data?.maintenant;

  if (!data || !section?.heading) return null;

  const attr = (path: string) =>
    dataAttr({ id: data._id, type: data._type, path }).toString();

  const items = (section.items ?? []).filter((item) => item.word);

  return (
    <section
      id="maintenant"
      className="bg-background px-6 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        {items.length > 0 && (
          <MaintenantStack
            label={
              <p
                data-sanity={attr("maintenant.heading")}
                className="mb-8 text-xs uppercase tracking-[0.3em] text-muted-foreground"
              >
                {section.heading}
              </p>
            }
            stem={section.stem ?? null}
            words={items.map((item) => item.word as string)}
            bodies={items.map((item) =>
              item.body && item.body.length > 0 ? (
                <PortableText
                  key={item._key}
                  components={components}
                  value={item.body as unknown as PortableTextBlock[]}
                />
              ) : null,
            )}
          />
        )}
      </div>
    </section>
  );
}
