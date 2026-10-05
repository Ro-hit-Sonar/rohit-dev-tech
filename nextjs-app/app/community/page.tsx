import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import EventRow from "@/app/community/EventRow";
import JourneyRoad from "@/app/community/JourneyRoad";
import { monthYear } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/live";
import { communityEventsQuery } from "@/sanity/lib/queries";

const EYEBROW = "In Community";
const HEADING = "The road so far";
const INTRO =
  "It runs backwards: the most recent first, then further back with every scroll. Some of it I helped build, some of it I just showed up for.";

export const metadata: Metadata = {
  // The root layout supplies the `%s | <site title>` template, so this is bare.
  title: "Community",
  description: INTRO,
} satisfies Metadata;

export default async function CommunityPage() {
  const { data } = await sanityFetch({ query: communityEventsQuery });
  const events = data ?? [];

  // Rendered on the server so the labels are identical in the sticky gauge and
  // beside each stop — two formatters would eventually disagree.
  const dates = events.map((event) => monthYear(event.date) ?? "");

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-6 pb-14 pt-16 text-center sm:pt-24">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {EYEBROW}
        </p>

        <h1 className="mt-8 text-balance text-[clamp(2.4rem,5.4vw,4.2rem)] font-light leading-[1.04] tracking-tight text-foreground">
          {HEADING}
        </h1>

        <p className="mx-auto mt-7 max-w-[52ch] text-pretty text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
          {INTRO}
        </p>
      </section>

      {events.length > 0 && (
        <JourneyRoad dates={dates}>
          <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-20 sm:pt-24">
            {/* An ordered list because the order carries meaning — this is a
                sequence in time, not a set of cards. */}
            <ol>
              {events.map((event, index) => (
                <EventRow
                  key={event._id}
                  event={event}
                  index={index}
                  dateLabel={dates[index]}
                />
              ))}
            </ol>
          </div>

          <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 text-center sm:pb-32 sm:pt-24">
            {/* Where the line ends. Also the last point the road is measured
                to, so the drawing finishes exactly here rather than at the
                bottom of the container. */}
            <div
              aria-hidden="true"
              className="journey-cap mx-auto h-3 w-3 rounded-full bg-foreground ring-[6px] ring-background"
            />

            <h2 className="mt-8 text-balance text-[clamp(1.5rem,2.4vw,2rem)] font-light tracking-tight text-foreground">
              Where it began
            </h2>

            <p className="mx-auto mt-4 max-w-[44ch] text-pretty text-base font-light leading-relaxed text-muted-foreground">
              Everything above came after this one. The line keeps going in the
              other direction.
            </p>

            <Link
              href="#contact"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:bg-foreground/90"
            >
              Say hello
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </section>
        </JourneyRoad>
      )}

      {events.length === 0 && (
        <div className="mx-auto w-full max-w-6xl px-6 pb-32">
          <p className="border-t border-border py-16 text-sm font-light text-muted-foreground">
            No events yet.
          </p>
        </div>
      )}
    </>
  );
}
