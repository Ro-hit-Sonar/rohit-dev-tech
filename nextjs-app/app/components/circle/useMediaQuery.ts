"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. `serverSnapshot` is what the server renders and
 * what the client shows before hydration — pick the calmer of the two states so
 * the page never animates and then stops.
 */
export function useMediaQuery(query: string, serverSnapshot: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)", true);

export const useHasFinePointer = () => useMediaQuery("(pointer: fine)", false);
