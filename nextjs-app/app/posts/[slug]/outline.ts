import { stegaClean } from "@sanity/client/stega";
import { toPlainText, type PortableTextBlock } from "@portabletext/react";

export type OutlineItem = {
  id: string;
  text: string;
  /** 0 = this post's own shallowest heading level, 1 = one step in, 2 = deeper. */
  tier: number;
};

/** A body block, plus the two facts the server worked out about it. */
export type BodyBlock = PortableTextBlock & {
  headingId?: string;
  headingTier?: number;
};

const HEADING_LEVEL: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

/**
 * An id for a heading, derived from its own text.
 *
 * Deliberately not `github-slugger`: this is a dozen lines against a
 * dependency, and the de-duplication that package exists for has to live in
 * `buildOutline` anyway, because it depends on every heading that came before.
 */
export function slugifyHeading(text: string) {
  return (
    text
      // Decompose accents and drop the combining marks, so "Café" becomes
      // "cafe" rather than "caf".
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      // Apostrophes vanish rather than becoming a separator: "the Internet's
      // envelopes" is "internets", not "internet-s". Curly and straight both,
      // since editors paste either.
      .replace(/['\u2018\u2019\u02bc]/g, "")
      // A literal HTML entity is a word gap, not a word. Without this,
      // "Routers &amp; Switches" slugs to "routers-amp-switches" while the same
      // heading typed with a real "&" slugs to "routers-switches" — so two
      // identical headings written a month apart would get different anchors.
      .replace(/&(?:[a-z][a-z0-9]{1,10}|#\d{1,6}|#x[0-9a-f]{1,6});/gi, " ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "")
  );
}

/**
 * One pass over a post's body, producing both things the page needs: the blocks
 * to render (headings augmented with the id and rank they should use) and the
 * list the table of contents shows.
 *
 * They come from the same walk on purpose. If the outline were derived
 * separately from the ids the serializer emits, the two could drift and the
 * contents would start linking to anchors that are not there — which is exactly
 * the bug the old page shipped, where every heading anchor pointed at a
 * fragment nothing on the page carried.
 *
 * `tier` rather than the author's tag, because the posts disagree: some use h2
 * for their sections and some use h3 with no h2 at all. Ranking against the
 * shallowest level present in *this* post means a section reads as a section
 * either way, and the contents can never describe a shape the body does not
 * have.
 */
export function buildOutline(content: PortableTextBlock[] | null | undefined) {
  const blocks = (content ?? []) as BodyBlock[];

  const levels = blocks
    .map((block) => HEADING_LEVEL[block.style ?? ""] ?? 0)
    .filter((level) => level > 0);

  const baseLevel = levels.length > 0 ? Math.min(...levels) : 0;

  const headings: OutlineItem[] = [];
  const taken = new Set<string>();
  const out: BodyBlock[] = [];

  blocks.forEach((block, index) => {
    const level = HEADING_LEVEL[block.style ?? ""] ?? 0;
    if (level === 0) {
      out.push(block);
      return;
    }

    // Cleaned before slugifying: in draft mode Sanity encodes stega metadata
    // into span text as invisible characters, and an id must not change
    // between the preview and the published page.
    const text = stegaClean(toPlainText(block)).trim();

    // A heading of only punctuation or emoji slugs to "". An empty id is a real
    // bug — every such heading collides and its link goes nowhere.
    const base = slugifyHeading(text) || `section-${index + 1}`;

    // Checked in a loop rather than by counting occurrences, so a second
    // "Setup" and a literal "Setup 2" cannot both land on "setup-2".
    let id = base;
    let n = 2;
    while (taken.has(id)) id = `${base}-${n++}`;
    taken.add(id);

    // Clamped: a post using h2 through h5 would otherwise produce four indent
    // steps inside a 45rem panel, and the deepest would have no room to read.
    const tier = Math.min(level - baseLevel, 2);

    headings.push({ id, text, tier });
    out.push({ ...block, headingId: id, headingTier: tier });
  });

  return { blocks: out, headings };
}
