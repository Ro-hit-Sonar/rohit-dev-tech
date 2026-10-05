"use client";

import Link from "next/link";

import { useHoverThumbnail } from "@/app/components/circle/useHoverThumbnail";

/**
 * A span of body text that is "the answer" — dotted-underlined at rest, solid on
 * hover, linking to the post it refers to, with that post's cover image shown as
 * a floating thumbnail while hovered.
 *
 * `imageUrl` is built on the server by the Portable Text serializer, so this
 * component never touches Sanity's helpers and its props stay serializable.
 */
export default function RevealLink({
  href,
  imageUrl,
  alt,
  children,
}: {
  href: string | null;
  imageUrl: string | null;
  alt: string;
  children: React.ReactNode;
}) {
  // Below by default: placing it above would land on the line that sets up the
  // answer being hovered, whereas below covers the next line of the same
  // paragraph, which the reader has not reached yet.
  const { triggerRef, handlers, card } = useHoverThumbnail<HTMLAnchorElement>({
    imageUrl,
    alt,
    preferBelow: true,
  });

  // A dangling reference resolves to no href. Degrade to plain text rather than
  // rendering a dead link — the same way ResolvedLink behaves.
  if (!href) return <>{children}</>;

  return (
    <>
      <Link
        ref={triggerRef}
        href={href}
        {...handlers}
        className="font-normal text-foreground underline decoration-muted-foreground decoration-dotted underline-offset-4 transition-colors hover:decoration-foreground hover:decoration-solid focus-visible:decoration-foreground focus-visible:decoration-solid"
      >
        {children}
      </Link>
      {card}
    </>
  );
}
