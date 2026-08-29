"use client";

import { useState } from "react";

const features = [
  {
    id: 1,
    title: "First Principles",
    description:
      "Start from the fundamentals, not from whichever framework happens to be trending this quarter.",
    icon: "◯",
  },
  {
    id: 2,
    title: "In Practice",
    description:
      "Every concept lands with a worked example — something you can run, break, and reason about.",
    icon: "◎",
  },
  {
    id: 3,
    title: "Full Circle",
    description:
      "From the whiteboard sketch through to the thing actually running in production.",
    icon: "⊙",
  },
];

export default function CircleFeatures() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section id="approach" className="bg-card px-6 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-16 sm:mb-20">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            The approach
          </p>
          <h2 className="text-balance text-3xl font-light leading-tight text-foreground md:text-4xl">
            Every concept connects.
            <br />
            Every system completes.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative rounded-2xl border border-border p-8 transition-colors duration-300 hover:border-foreground"
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              {/* Animated circle background */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{
                  background:
                    activeFeature === feature.id
                      ? "radial-gradient(circle at center, var(--secondary) 0%, transparent 70%)"
                      : "transparent",
                  transition: "background 0.5s ease",
                }}
              />

              <div className="relative z-10">
                <div className="mb-6 text-4xl text-foreground transition-transform duration-300 motion-safe:group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-lg font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              {/* Number indicator */}
              <div className="absolute right-4 top-4 text-xs text-muted-foreground">
                0{feature.id}
              </div>
            </div>
          ))}
        </div>

        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="relative mt-24 flex items-center justify-center overflow-hidden sm:mt-32"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 rounded-full border border-border transition-colors duration-300 hover:border-foreground"
                style={{ width: 12 + i * 10, height: 12 + i * 10 }}
              />
            ))}
            <span className="px-4 text-sm text-muted-foreground sm:px-8">
              &#8734;
            </span>
            {[...Array(5)].map((_, i) => (
              <div
                key={i + 5}
                className="shrink-0 rounded-full border border-border transition-colors duration-300 hover:border-foreground"
                style={{ width: 52 - i * 10, height: 52 - i * 10 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
