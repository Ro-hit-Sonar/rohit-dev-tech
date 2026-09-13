"use client";

import { useEffect, useRef, useState } from "react";

/** Where a stop counts as "arrived": below the 80px header, above centre. */
const READING_LINE = 0.58;

/**
 * A Catmull–Rom spline through the given points, emitted as one cubic bezier.
 *
 * Built from the measured node centres rather than hand-drawn, which is what
 * guarantees the line passes through every stop no matter how the content
 * wrapped or how tall a card turned out to be.
 */
function spline(points: Array<[number, number]>, tension = 0.9) {
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * The road: the meandering line, and the sticky gauge that names where you are.
 *
 * The rows are passed in as `children` and stay server components — this island
 * finds their nodes by class, the same way the post page's contents panel finds
 * headings by id. That keeps every Sanity image on the server.
 *
 * Only the path GEOMETRY is computed here. The drawing is a CSS scroll-driven
 * animation (see `.road-past` in globals.css) working in unit space off
 * `pathLength="1"`, so there is no per-frame JavaScript and no
 * `getTotalLength()`. The line is decoration: with no JavaScript there is no
 * path, and every card, date and node still renders and reads.
 */
export default function JourneyRoad({
  dates,
  children,
}: {
  dates: string[];
  children: React.ReactNode;
}) {
  const roadRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string | null>(null);
  const [size, setSize] = useState<[number, number] | null>(null);
  const [here, setHere] = useState(-1);

  // Geometry. Rebuilt whenever the layout can have moved.
  useEffect(() => {
    const road = roadRef.current;
    if (!road) return;

    let frame = 0;

    const build = () => {
      frame = 0;
      const box = road.getBoundingClientRect();
      const nodes = [...road.querySelectorAll(".journey-node")];
      if (nodes.length === 0) return;

      const centre = (el: Element): [number, number] => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
      };

      const stops: Array<[number, number]> = nodes.map(centre);
      // Enter from the top edge above the first stop, and finish on the closing
      // dot, so the line has somewhere to come from and somewhere to arrive.
      stops.unshift([stops[0][0], 0]);
      const cap = road.querySelector(".journey-cap");
      if (cap) stops.push(centre(cap));

      // A control point pushed sideways between each pair. Without it a spline
      // through alternating points draws near-straight diagonals — this is what
      // makes the line meander.
      const bowed: Array<[number, number]> = [stops[0]];
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        const dx = b[0] - a[0];
        const bow =
          dx === 0 ? 0 : Math.sign(dx) * Math.min(78, Math.abs(dx) * 0.55 + 30);
        bowed.push([(a[0] + b[0]) / 2 + bow, (a[1] + b[1]) / 2]);
        bowed.push(b);
      }

      setSize([box.width, road.offsetHeight]);
      setPath(spline(bowed));
    };

    // Scheduled rather than called: a synchronous setState in an effect body is
    // what `react-hooks/set-state-in-effect` is an error for in this repo.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(build);
    };

    schedule();

    // Text metrics move the nodes, so a late-loading font changes the geometry.
    document.fonts?.ready.then(schedule).catch(() => {});

    // ResizeObserver rather than a window resize listener: the road also grows
    // when an image finally decodes, which never fires `resize`.
    const observer = new ResizeObserver(schedule);
    observer.observe(road);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [dates.length]);

  // Which stop the reader is at. Same shape as the post page's contents
  // highlight: one rAF-throttled passive listener that re-measures everything,
  // rather than an observer, which reports transitions and not resting state.
  useEffect(() => {
    const road = roadRef.current;
    if (!road) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const nodes = [...road.querySelectorAll(".journey-node")];
      const line = window.innerHeight * READING_LINE;
      let current = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getBoundingClientRect().top < line) current = i;
      }
      setHere(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [dates.length]);

  // Before the first stop, name the first date rather than nothing — a blank
  // gauge reads as broken, not as neutral.
  const label = dates[here < 0 ? 0 : here] ?? dates[0] ?? "";

  return (
    <>
      {/* aria-hidden: this changes on every scroll, and a live region would
          announce a new date continuously. Each row carries its own date as
          real text, which is the accessible version of the same information. */}
      <div
        aria-hidden="true"
        className="sticky top-20 z-30 border-y border-border bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="flex h-16 items-center text-[clamp(1.25rem,2vw,1.75rem)] font-light tabular-nums leading-none tracking-tight text-foreground">
            {label}
          </p>
        </div>
      </div>

      <div ref={roadRef} className="road-scope relative">
        {path && size && (
          <svg
            aria-hidden="true"
            width={size[0]}
            height={size[1]}
            viewBox={`0 0 ${size[0]} ${size[1]}`}
            className="pointer-events-none absolute inset-0 z-0 overflow-visible"
          >
            {/* Same geometry twice. The road ahead is a hairline in the border
                tone; the road travelled is drawn over it, darker AND heavier —
                progress you can read at a glance without comparing colours. */}
            <path
              d={path}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="road-past"
              d={path}
              pathLength={1}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}
