"use client";

import { useEffect, useState } from "react";

import { useHasFinePointer, usePrefersReducedMotion } from "./useMediaQuery";

type Topic = {
  label: string;
  description: string;
};

const topics: Topic[] = [
  {
    label: "SOFTWARE",
    description:
      "Building full-stack products and the systems that make them work.",
  },
  {
    label: "ARTIFICIAL INTELLIGENCE",
    description:
      "Exploring how intelligent systems can become part of the things we build.",
  },
  {
    label: "IDEAS",
    description:
      "Following interesting questions, trying things out, and seeing where they lead.",
  },
];

export default function CircleHero() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // The blend-mode cursor dot is a pointer affordance, so it only belongs on
  // devices that actually have a hovering cursor.
  const hasFinePointer = useHasFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) =>
      setPointer({ x: event.clientX, y: event.clientY });

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasFinePointer, prefersReducedMotion]);

  // `active` drives every transform in the ring stack. Freezing it under
  // reduced motion is what keeps the whole composition still.
  const active = isHovering && !prefersReducedMotion;

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden py-20">
      <div className="relative mx-auto w-full max-w-6xl px-6">
        {/* Ring stack */}
        <div
          className="relative mx-auto aspect-square w-[min(78vw,520px)]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Outer hatched ring */}
          <div
            className="absolute inset-0 rounded-full transition-transform duration-700"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, transparent 0deg 2deg, var(--ring-hatch) 2deg 4deg)",
              transform: active ? "rotate(10deg) scale(1.02)" : "rotate(0deg)",
            }}
          />

          {/* Second hatched ring */}
          <div
            className="absolute inset-[9%] rounded-full transition-transform duration-500"
            style={{
              background:
                "repeating-conic-gradient(from 45deg, transparent 0deg 3deg, var(--ring-hatch-soft) 3deg 6deg)",
              transform: active ? "rotate(-8deg)" : "rotate(0deg)",
            }}
          />

          {/* Third ring */}
          <div
            className="absolute inset-[18%] rounded-full bg-secondary transition-transform duration-300"
            style={{ transform: active ? "scale(0.98)" : "scale(1)" }}
          />

          {/* Inner circle */}
          <div
            className="absolute inset-[27%] rounded-full bg-accent transition-transform duration-500"
            style={{ transform: active ? "scale(1.05)" : "scale(1)" }}
          />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <h1 className="mb-4 text-balance text-xl font-light tracking-wide text-foreground md:text-2xl">
              What’s worth building?
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Scroll to explore
            </p>
          </div>

          {/* Connector labels — anchored to the max-w-6xl wrapper, not the
              circle, so they can never push the page into horizontal scroll. */}
          <ConnectorLine
            topic={topics[0]}
            position="right"
            offset="top-[14%]"
            active={active}
          />
          <ConnectorLine
            topic={topics[1]}
            position="left"
            offset="top-[42%]"
            active={active}
          />
          <ConnectorLine
            topic={topics[2]}
            position="right"
            offset="bottom-[12%]"
            active={active}
          />
        </div>

        {/* Below xl the connectors are hidden; the same content reads as a
            plain list instead of overflowing the viewport. */}
        <ul className="mt-16 grid gap-8 sm:grid-cols-3 xl:hidden">
          {topics.map((topic) => (
            <li key={topic.label}>
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {topic.label}
                <span aria-hidden="true" className="text-foreground">
                  &rarr;
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {topic.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating cursor indicator */}
      {hasFinePointer && !prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 h-2 w-2 rounded-full bg-foreground mix-blend-difference transition-opacity duration-300"
          style={{
            left: pointer.x - 4,
            top: pointer.y - 4,
            opacity: isHovering ? 1 : 0,
          }}
        />
      )}
    </section>
  );
}

function ConnectorLine({
  topic,
  position,
  offset,
  active,
}: {
  topic: Topic;
  position: "left" | "right";
  offset: string;
  active: boolean;
}) {
  const isLeft = position === "left";

  return (
    <div
      className={[
        "absolute hidden w-[248px] items-start transition-opacity duration-500 xl:flex",
        offset,
        isLeft
          ? "right-[calc(100%+2rem)] flex-row-reverse text-right"
          : "left-[calc(100%+2rem)]",
      ].join(" ")}
      style={{ opacity: active ? 1 : 0.7 }}
    >
      <div className="relative shrink-0">
        <div
          className={`mt-3 h-px w-16 bg-border ${isLeft ? "ml-4" : "mr-4"}`}
        />
        <div
          className={`absolute top-2 h-2 w-2 bg-foreground ${isLeft ? "-right-1" : "-left-1"}`}
        />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {topic.label}
          <span aria-hidden="true" className="text-foreground">
            &rarr;
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {topic.description}
        </p>
      </div>
    </div>
  );
}
