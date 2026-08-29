"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/app/components/circle/useMediaQuery";

/**
 * The interactive half of the Maintenant section: a held stem whose final word
 * swaps as each body scrolls through the reading zone.
 *
 * The server renders every word and body at full contrast, and `enhanced` only
 * flips to true after hydration. That ordering is deliberate — if this component
 * never ran, or the reader prefers reduced motion, the section stays a plain
 * legible list of all three. Nothing is ever hidden waiting for JavaScript.
 */
export default function MaintenantStack({
  stem,
  words,
  bodies,
}: {
  stem: string | null;
  words: string[];
  bodies: React.ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const setItemRef = useCallback(
    (index: number) => (node: HTMLLIElement | null) => {
      itemRefs.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const nodes = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0) return;

    // A narrow band across the middle of the viewport is the "reading zone".
    // Choosing whichever entry is most visible inside that band — rather than
    // simply the last one to intersect — is what stops the word flickering when
    // two blocks touch the boundary at once.
    const observer = new IntersectionObserver(
      (entries) => {
        setEnhanced(true);

        let best = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLLIElement);
          if (index !== -1 && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = index;
          }
        }
        if (best !== -1) setActive(best);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Before hydration and under reduced motion, every word is shown stacked and
  // every body is at full contrast.
  const stacked = !enhanced || prefersReducedMotion;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          <p className="text-balance text-[clamp(1.75rem,4vw,3rem)] font-light leading-[1.1] tracking-tight text-muted-foreground">
            {stem}
          </p>

          {stacked ? (
            <ul className="mt-1">
              {words.map((word) => (
                <li
                  key={word}
                  className="text-[clamp(1.75rem,4vw,3rem)] font-light leading-[1.1] tracking-tight text-foreground"
                >
                  {word}.
                </li>
              ))}
            </ul>
          ) : (
            <>
              {/* One line tall, clipped, with the stack translated so only the
                  active word shows. Height is in em so it tracks the clamp. */}
              <div className="mt-1 h-[1.1em] overflow-hidden text-[clamp(1.75rem,4vw,3rem)]">
                <div
                  className="transition-transform duration-500 ease-out"
                  style={{ transform: `translateY(-${active * 1.1}em)` }}
                >
                  {words.map((word, index) => (
                    <div
                      key={word}
                      aria-hidden={index !== active}
                      className="h-[1.1em] font-light leading-[1.1] tracking-tight text-foreground"
                    >
                      {word}.
                    </div>
                  ))}
                </div>
              </div>

              <div
                aria-hidden="true"
                className="mt-10 flex items-center gap-2.5"
              >
                {words.map((word, index) => (
                  <span
                    key={word}
                    className={`h-1.5 w-1.5 transition-colors duration-300 ${
                      index === active ? "bg-foreground" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ol className="lg:col-span-7">
        {bodies.map((body, index) => (
          <li
            key={index}
            ref={setItemRef(index)}
            className={`flex min-h-[34vh] max-w-xl flex-col justify-start py-10 transition-opacity duration-500 lg:min-h-[46vh] lg:pt-2 ${
              stacked || index === active ? "opacity-100" : "opacity-30"
            }`}
          >
            {/* Repeated for the stacked fallback, where no held stem is visible
                next to the body it belongs to. */}
            {stacked && (
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {words[index]}
              </p>
            )}
            {body}
          </li>
        ))}
      </ol>
    </div>
  );
}
