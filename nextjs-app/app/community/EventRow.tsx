import { Image } from "next-sanity/image";
import { stegaClean } from "@sanity/client/stega";

import { urlForImage } from "@/sanity/lib/utils";
import type { CommunityEventsQueryResult } from "@/sanity.types";

/**
 * `kind` is widened from the generated literal union to a plain string, because
 * `sanityFetch` returns `StegaString<"core">` rather than `"core"` — in draft
 * mode Sanity encodes edit metadata into strings as invisible characters. It is
 * compared through `stegaClean` below for the same reason: a raw `=== "core"`
 * is false in the Presentation tool, which would quietly render every entry at
 * the lighter weight while looking correct on the published site.
 */
type CommunityEvent = Omit<CommunityEventsQueryResult[number], "kind"> & {
  kind: string;
};

/**
 * One stop on the road.
 *
 * Nothing here names the two kinds of entry. A moment Rohit helped build and
 * one he simply attended are separated by weight alone — node size, title size,
 * column width, and the gap that follows — so the smaller ones read as
 * connective tissue between the bigger ones rather than as a second category
 * the reader has to keep track of.
 *
 * Deliberately a server component: it renders Sanity images, and the client
 * island that owns the line finds these rows by class rather than by owning
 * them.
 */
export default function EventRow({
  event,
  index,
  dateLabel,
}: {
  event: CommunityEvent;
  index: number;
  dateLabel: string;
}) {
  const isCore = stegaClean(event.kind) === "core";

  // Alternating sides, with a small deterministic wobble so the line reads
  // hand-drawn rather than machined. Deterministic and not random: a random
  // offset would differ between the server and client renders and would be a
  // hydration mismatch.
  const cardOnLeft = index % 2 === 0;
  const nodeX = cardOnLeft ? 58 + (index % 3) : 42 - (index % 3);

  const photos = (event.photos ?? []).filter((photo) => photo.asset?._ref);

  return (
    <li
      style={{ "--nx": `${nodeX}%` } as React.CSSProperties}
      className={`relative grid grid-cols-1 gap-y-3 pl-11 md:grid-cols-2 md:gap-x-10 md:pl-0 lg:gap-x-24 ${
        isCore ? "mb-20 sm:mb-28" : "mb-16 sm:mb-24"
      } last:mb-0`}
    >
      {/* The stop the line is drawn through. `journey-node` is the hook the road
          measures — do not rename it without updating JourneyRoad. The ring is
          the page ground, punching a hole in the line so the dot sits ON the
          road rather than being crossed by it. */}
      <span
        aria-hidden="true"
        /* A fixed-width box that centres whichever mark it holds. Without it the
           12px core dot and the 8px attended ring are both anchored at their
           left edge, so their centres sit 2px apart — which on a narrow screen,
           where every stop shares one x, puts a visible zigzag in a line that
           should be straight. */
        className="journey-node absolute left-2 top-1/2 z-10 grid w-3 -translate-y-1/2 place-items-center md:left-[var(--nx)] md:-translate-x-1/2"
      >
        <span
          data-kind={isCore ? "core" : "attended"}
          className={`journey-mark block rounded-full ring-[6px] ring-background ${
            isCore ? "h-3 w-3" : "h-2 w-2 border"
          }`}
        />
      </span>

      {/* The date, opposite the card across the line — part of the journey
          itself, not only the gauge at the top. On a narrow screen it sits
          above the card instead, where there is no "opposite". */}
      <p
        className={`scroll-rise text-xs uppercase tracking-[0.2em] text-muted-foreground md:absolute md:top-1/2 md:-translate-y-1/2 md:whitespace-nowrap ${
          cardOnLeft
            ? "md:left-[calc(var(--nx)+2rem)]"
            : "md:right-[calc(100%-var(--nx)+2rem)] md:text-right"
        }`}
      >
        {dateLabel}
      </p>

      <div
        className={`scroll-rise ${
          cardOnLeft ? "md:col-start-1 md:ml-auto" : "md:col-start-2"
        } ${isCore ? "md:max-w-[29rem]" : "md:max-w-[21rem]"}`}
      >
        <h2
          className={
            isCore
              ? "text-balance text-[clamp(1.3rem,1.8vw,1.625rem)] font-light leading-tight tracking-tight text-foreground"
              : "text-balance text-[1.0625rem] font-light leading-snug text-muted-foreground"
          }
        >
          {event.title}
        </h2>

        {event.venue && (
          // muted-foreground, not a third lighter tier: at 12px anything
          // quieter measured 3.01:1 on the light ground, under AA.
          <p className="mt-2 text-xs text-muted-foreground">{event.venue}</p>
        )}

        {event.note && (
          <p
            className={`text-pretty text-muted-foreground ${
              isCore
                ? "mt-4 text-base leading-relaxed"
                : "mt-2 text-sm leading-relaxed"
            }`}
          >
            {event.note}
          </p>
        )}

        {photos.length > 0 && (
          <div
            className={`mt-5 grid gap-1.5 ${
              photos.length === 1
                ? "grid-cols-1"
                : photos.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
            } ${isCore ? "" : "max-w-[15.5rem]"}`}
          >
            {photos.map((photo) => {
              const url = urlForImage(photo)
                ?.width(720)
                .height(photos.length === 1 ? 450 : 540)
                .fit("crop")
                .url();
              if (!url) return null;
              return (
                <Image
                  key={photo._key}
                  src={url}
                  alt={photo.alt ?? ""}
                  width={720}
                  height={photos.length === 1 ? 450 : 540}
                  sizes="(min-width: 768px) 232px, 45vw"
                  className={`w-full border border-border object-cover ${
                    photos.length === 1
                      ? "aspect-[16/10]"
                      : photos.length === 2
                        ? "aspect-[4/3]"
                        : "aspect-square"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}
