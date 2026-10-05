"use client";

import { useEffect, useRef } from "react";

const SRC = "/footer-wordmark.mp4";

/**
 * The footage behind the footer wordmark, loaded only once the footer is close.
 *
 * This is a client component for one reason: `preload="none"` does not survive
 * `autoplay`. Measured on /blogs at a 1600x700 viewport, the browser fetched all
 * 1.65MB at 388ms with the band still 1631px below the fold — on every route,
 * since the footer is rendered from the root layout. Withholding `src` until an
 * IntersectionObserver says the band is near is the only thing that actually
 * defers it.
 *
 * Nothing is hidden waiting for this. The poster still is painted by CSS as the
 * band's background, so the wordmark is complete and correct on first paint and
 * stays that way if JavaScript never arrives — only the movement is deferred,
 * and movement is the part that is allowed to be an enhancement.
 *
 * Under `prefers-reduced-motion: reduce` the element is `display: none`, so it
 * never intersects and the video is never requested at all. Readers who asked
 * for less motion also stop paying for it.
 */
export default function FooterMarkVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    // `src` is empty until we set it; a non-empty value means this already ran.
    if (!video || video.src) return;

    const load = () => {
      video.src = SRC;
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }

    // Enough margin that the loop is already running by the time the band is
    // actually looked at, rather than starting under the reader's eyes.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "400px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="footer-mark__video"
      poster="/footer-wordmark-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
