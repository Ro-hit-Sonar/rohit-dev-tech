import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * "JAN 2025" — the date form used by every post listing on the site.
 *
 * Shared rather than duplicated: the featured ledger and the blogs index sit on
 * different pages but read as one system, so a divergence in month casing or
 * locale between them would be visible.
 */
export function monthYear(iso: string | null) {
  return iso
    ? new Date(iso)
        .toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        .toUpperCase()
    : null;
}

/**
 * "Aug 8, 2026" — the reading page's meta row.
 *
 * Separate from `monthYear` rather than parameterised: a listing wants the
 * month a post belongs to, an article wants the day it was published.
 */
export function longDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
}
