/**
 * Three concentric arcs whose gaps close as the reader scrolls through the
 * section — the hero's ring stack broken open, then completed. It is the
 * section's payoff: the circle finishes exactly as you finish reading the part
 * about not having answers yet.
 *
 * Deliberately has no "use client". The drift is CSS keyframes and the closing
 * is a CSS scroll-driven animation, so this ships zero JavaScript. `--arc-close`
 * has an initial value of 1 (closed), which means a browser without
 * `animation-timeline`, or a reader who prefers reduced motion, simply gets the
 * finished ring rather than a broken one.
 */

type Arc = {
  radius: number;
  /** Fraction of the circumference left open while the section is unread, 0-1. */
  gap: number;
  className: string;
  opacity: number;
  /** Only the outer arc carries the marker; three would read as clutter. */
  dot?: boolean;
};

const arcs: Arc[] = [
  {
    radius: 92,
    gap: 0.18,
    className: "motion-safe:animate-drift",
    opacity: 1,
    dot: true,
  },
  {
    radius: 66,
    gap: 0.28,
    className: "motion-safe:animate-drift-reverse",
    opacity: 0.7,
  },
  {
    radius: 40,
    gap: 0.42,
    className: "motion-safe:animate-drift-slow",
    opacity: 0.45,
  },
];

export default function OpenArc({
  className,
  marker = true,
}: {
  className?: string;
  /** At large sizes the outer ring runs off-screen and its marker reads as a
   *  stray dot rather than a point on a circle, so callers can drop it. */
  marker?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={["scroll-arc text-border", className].filter(Boolean).join(" ")}
    >
      {arcs.map(({ radius, gap, className: animation, opacity, dot }) => {
        const circumference = 2 * Math.PI * radius;

        // The gap shrinks to nothing as --arc-close runs 0 -> 1. Baking the
        // constants into the calc keeps --arc-close as the only animated value.
        const open = `(${gap} * (1 - var(--arc-close)))`;
        const dashArray = `calc(${circumference} * (1 - ${open})) calc(${circumference} * ${open})`;

        return (
          <g
            key={radius}
            className={`spin-in-place ${animation}`}
            opacity={opacity}
          >
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="butt"
              style={{ strokeDasharray: dashArray }}
              /* Start the gap at the top so the three openings fan out. */
              transform="rotate(-90 100 100)"
            />
            {/* A marker sits where the arc resumes after its gap. It's a circle
                rather than the square used elsewhere because a square riding a
                rotating group reads as a diamond half the time. */}
            {dot && marker && (
              <circle
                cx="100"
                cy={100 - radius}
                r="2.5"
                fill="currentColor"
                className="text-foreground"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
