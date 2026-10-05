"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Image } from "next-sanity/image";

import {
  useHasFinePointer,
  usePrefersReducedMotion,
} from "@/app/components/circle/useMediaQuery";

const CARD_WIDTH = 208;
const CARD_HEIGHT = 117; // 16:9
const GAP = 12; // between the trigger and the card
const EDGE = 8; // minimum distance from the viewport edge

type Anchor = { top: number; left: number };

/**
 * The floating cover-image thumbnail, shared by every hover-preview on the page.
 *
 * Extracted rather than copied: the positioning here has a lot of edge cases
 * that are each easy to get subtly wrong — anchoring to the first line box of a
 * wrapped trigger, flipping when there is no room below, clamping at the
 * viewport edges, staying out of the pointer's way, and the focus-vs-scroll
 * interaction below. Two copies of that would drift.
 *
 * Returns a ref for the trigger, the handlers to spread onto it, and the card
 * itself (already portalled, or null).
 */
export function useHoverThumbnail<T extends HTMLElement>({
  imageUrl,
  alt,
  /** Prefer placing the card below the trigger. Inline triggers inside a
   *  paragraph want `true` so the card does not cover the line above; a whole
   *  row wants `false` so it does not cover the next entry. */
  preferBelow = true,
}: {
  imageUrl: string | null;
  alt: string;
  preferBelow?: boolean;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<T>(null);
  const hasFinePointer = useHasFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();

  const canPreview = Boolean(imageUrl) && hasFinePointer;

  const place = useCallback(() => {
    if (!canPreview) return;

    // getClientRects()[0] is the FIRST line box. A trigger that wraps across
    // lines would otherwise anchor the card somewhere between them.
    const rect = triggerRef.current?.getClientRects()[0];
    if (!rect) return;

    const below = rect.bottom + GAP;
    const above = rect.top - CARD_HEIGHT - GAP;
    const fitsBelow = below + CARD_HEIGHT <= window.innerHeight - EDGE;
    const fitsAbove = above >= EDGE;

    const top = preferBelow
      ? fitsBelow || !fitsAbove
        ? below
        : above
      : fitsAbove || !fitsBelow
        ? above
        : below;

    setAnchor({
      top,
      left: Math.min(
        Math.max(rect.left + rect.width / 2 - CARD_WIDTH / 2, EDGE),
        window.innerWidth - CARD_WIDTH - EDGE,
      ),
    });
  }, [canPreview, preferBelow]);

  const hide = useCallback(() => setAnchor(null), []);

  // Wheel-scrolling without moving the pointer keeps the trigger hovered, which
  // would otherwise leave the card pinned to stale viewport coordinates.
  //
  // Keyboard focus is the case that makes this subtle: tabbing to a trigger
  // below the fold scrolls it into view, and blindly closing here would dismiss
  // the card that focus had just opened. So while the trigger still holds focus
  // we re-place the card instead of hiding it.
  useEffect(() => {
    if (!anchor) return;

    const onScroll = () => {
      if (document.activeElement === triggerRef.current) place();
      else hide();
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      window.removeEventListener("scroll", onScroll, { capture: true });
  }, [anchor, hide, place]);

  const handlers = {
    onMouseEnter: place,
    onMouseLeave: hide,
    onFocus: place,
    onBlur: hide,
  };

  const card =
    anchor && imageUrl
      ? createPortal(
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
        )
      : null;

  return { triggerRef, handlers, card };
}
