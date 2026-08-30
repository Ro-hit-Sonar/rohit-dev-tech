"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/app/components/circle/useMediaQuery";

/**
 * The interactive half of the Maintenant section: a held stem whose final word
 * swaps as each body draws level with it.
 *
 * Which body is active is decided by measuring distance, not by
 * IntersectionObserver. The observer version watched the 270px runway block
 * rather than its 98px of text, judged it against a band that sat below the
 * pinned heading, and — because a callback only reports entries that *changed*
 * — chose a winner from a subset of the items. It fired 7 times across the whole
 * section. Comparing text centre to heading centre says exactly what the design
 * means ("lit while beside its heading") and is monotonic in scroll, so there is
 * no state to fall out of sync.
 *
 * The server renders every word and body at full contrast, and `enhanced` only
 * flips to true after hydration. That ordering is deliberate — if this component
 * never ran, or the reader prefers reduced motion, the section stays a plain
 * legible list of all three. Nothing is ever hidden waiting for JavaScript.
 */
export default function MaintenantStack({
  label,
  stem,
  words,
  bodies,
}: {
  /** The section label. Lives inside the sticky column so it pins with the
   *  stem instead of scrolling away, and is passed as a node so the
   *  `data-sanity` attribute stays where it is built. */
  label: React.ReactNode;
  stem: string | null;
  words: string[];
  bodies: React.ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const stemRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setTextRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      textRefs.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const stem = stemRef.current;
      if (!stem) return;

      // The anchor is the heading itself, read live so it stays correct while
      // the stem is entering or leaving its pinned state.
      const stemBox = stem.getBoundingClientRect();
      const anchor = stemBox.top + stemBox.height / 2;

      let best = -1;
      let bestDistance = Infinity;
      textRefs.current.forEach((node, index) => {
        if (!node) return;
        const box = node.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - anchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      if (best === -1) return;

      setEnhanced(true);
      setActive((current) => {
        if (best === current) return current;
        // Distance is monotonic in scroll, so adjacent items cross over exactly
        // once. The margin only guards against sub-pixel jitter sitting right on
        // that crossover and flipping back and forth.
        const currentNode = textRefs.current[current];
        if (currentNode) {
          const box = currentNode.getBoundingClientRect();
          const currentDistance = Math.abs(box.top + box.height / 2 - anchor);
          if (currentDistance - bestDistance < 8) return current;
        }
        return best;
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    // Scheduled rather than called directly: setState synchronously inside an
    // effect body trips react-hooks/set-state-in-effect, which is an error here.
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [prefersReducedMotion]);

  // Before hydration and under reduced motion, every word is shown stacked and
  // every body is at full contrast.
  const stacked = !enhanced || prefersReducedMotion;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <div ref={stemRef} className="lg:sticky lg:top-32">
          {label}
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
            className={`flex min-h-[26vh] max-w-xl flex-col justify-start py-8 transition-opacity duration-500 lg:min-h-[30vh] lg:pt-2 ${
              stacked || index === active ? "opacity-100" : "opacity-30"
            }`}
          >
            {/* The ref sits on the copy, not on the <li>. The <li> is mostly
                runway — measuring it would decide "which body is beside the
                heading" from empty space. */}
            <div ref={setTextRef(index)}>
              {/* Repeated for the stacked fallback, where no held stem is
                  visible next to the body it belongs to. */}
              {stacked && (
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {words[index]}
                </p>
              )}
              {body}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
