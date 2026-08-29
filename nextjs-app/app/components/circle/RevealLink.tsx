"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Image } from "next-sanity/image";

import {
  useHasFinePointer,
  usePrefersReducedMotion,
} from "@/app/components/circle/useMediaQuery";

const CARD_WIDTH = 208;
const CARD_HEIGHT = 117; // 16:9
const GAP = 12; // between the text and the card
const EDGE = 8; // minimum distance from the viewport edge

type Anchor = { top: number; left: number };

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
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const hasFinePointer = useHasFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();

  const canPreview = Boolean(imageUrl) && hasFinePointer;

  const linkRef = useRef<HTMLAnchorElement>(null);

  const place = useCallback(() => {
    if (!canPreview) return;

    // getClientRects()[0] is the FIRST line box. A multi-word answer may wrap
    // across lines; anchoring to the whole bounding box would float the card
    // somewhere between them.
    const rect = linkRef.current?.getClientRects()[0];
    if (!rect) return;

    // Below by default. Placing it above looks tidier in isolation but lands
    // on the row's heading — the line that sets up the answer you're hovering.
    // Below it covers the next line of the same paragraph, which the reader has
    // not reached yet.
    const below = rect.bottom + GAP;
    const fitsBelow = below + CARD_HEIGHT <= window.innerHeight - EDGE;

    setAnchor({
      top: fitsBelow ? below : rect.top - CARD_HEIGHT - GAP,
      left: Math.min(
        Math.max(rect.left + rect.width / 2 - CARD_WIDTH / 2, EDGE),
        window.innerWidth - CARD_WIDTH - EDGE,
      ),
    });
  }, [canPreview]);

  const hide = useCallback(() => setAnchor(null), []);

  // Wheel-scrolling without moving the mouse keeps the link hovered, which would
  // otherwise leave the card pinned to stale viewport coordinates.
  //
  // Keyboard focus is the case that makes this subtle: tabbing to a link below
  // the fold scrolls it into view, and blindly closing here would dismiss the
  // card that focus had just opened. So while the link still holds focus we
  // re-place the card instead of hiding it.
  useEffect(() => {
    if (!anchor) return;

    const onScroll = () => {
      if (document.activeElement === linkRef.current) place();
      else hide();
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      window.removeEventListener("scroll", onScroll, { capture: true });
  }, [anchor, hide, place]);

  // A dangling reference resolves to no href. Degrade to plain text rather than
  // rendering a dead link — the same way ResolvedLink behaves.
  if (!href) return <>{children}</>;

  return (
    <>
      <Link
        ref={linkRef}
        href={href}
        onMouseEnter={place}
        onMouseLeave={hide}
        onFocus={place}
        onBlur={hide}
        className="font-normal text-foreground underline decoration-muted-foreground decoration-dotted underline-offset-4 transition-colors hover:decoration-foreground hover:decoration-solid focus-visible:decoration-foreground focus-visible:decoration-solid"
      >
        {children}
      </Link>

      {anchor &&
        imageUrl &&
        createPortal(
          <div
            aria-hidden="true"
            style={{
              top: anchor.top,
              left: anchor.left,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
            className={`pointer-events-none fixed z-50 overflow-hidden rounded-lg border border-border bg-muted shadow-layer ${
              prefersReducedMotion ? "" : "animate-in fade-in zoom-in-95"
            }`}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={CARD_WIDTH * 2}
              height={CARD_HEIGHT * 2}
              sizes={`${CARD_WIDTH}px`}
              className="h-full w-full object-cover"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
