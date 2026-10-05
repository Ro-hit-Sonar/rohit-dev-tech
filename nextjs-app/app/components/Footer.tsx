import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import FooterMarkVideo from "@/app/components/FooterMarkVideo";

const linkColumns = [
  {
    title: "Site",
    links: [
      { label: "About", href: "/about" },
      { label: "Blogs", href: "/blogs" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/Ro-hit-Sonar" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/rohitsonar" },
      { label: "X", href: "https://x.com/rohitsonar08" },
    ],
  },
];

const isExternal = (href: string) => href.startsWith("http");

export default function Footer() {
  return (
    <footer id="contact" className="bg-footer text-footer-foreground">
      {/* CTA */}
      <div className="border-b border-footer-foreground/10 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-3xl font-light md:text-5xl">
            Ready to complete the circle?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-footer-foreground/60">
            Got a system worth pulling apart, or something I got wrong? I&apos;d
            genuinely like to hear about it.
          </p>
          <a
            href="mailto:rohit@airocia.com?subject=Hello%20from%20rohittech.in"
            className="inline-flex items-center gap-2 rounded-full bg-footer-foreground px-8 py-4 font-medium text-footer transition-colors hover:bg-footer-foreground/90"
          >
            Say hello
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Links */}
      <div className="px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-16 grid gap-12 md:grid-cols-3">
            <div>
              <div className="mb-6 text-sm font-medium uppercase tracking-[0.2em]">
                Rohittech.in
              </div>
              <p className="text-sm leading-relaxed text-footer-foreground/60">
                Simplifying the complex — system design, DevOps and AI, broken
                down until they actually make sense.
              </p>
            </div>

            {linkColumns.map((column) => (
              <div key={column.title}>
                <div className="mb-6 text-xs uppercase tracking-[0.2em] text-footer-foreground/40">
                  {column.title}
                </div>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...(isExternal(link.href)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-footer-foreground/60 transition-colors hover:text-footer-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between border-t border-footer-foreground/10 pt-8 text-sm text-footer-foreground/40 md:flex-row">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Rohit Sonar. All rights
              reserved.
            </div>
            <div>Built with Next.js &amp; Sanity.</div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, with the footage showing through the letters */}
      <div className="border-t border-footer-foreground/10 px-6 pb-10 pt-12 sm:pb-14 sm:pt-16">
        {/* Decorative: the site's name is already readable as text in the
            column above, so announcing these glyphs again would only repeat
            it. */}
        <div
          aria-hidden="true"
          className="footer-mark mx-auto w-full max-w-6xl"
        >
          <FooterMarkVideo />

          {/* `text-footer` — the plate is the GROUND colour, not the type
              colour. It is the sheet the wordmark is cut out of, and the only
              thing behind the cut is the video. */}
          <svg
            className="footer-mark__plate text-footer"
            viewBox="0 0 493.64 72.2"
            focusable="false"
          >
            <defs>
              <mask id="footer-wordmark-knockout">
                {/* White keeps the plate, black removes it. So the wordmark is
                    the hole. */}
                <rect x="-100" y="-100" width="700" height="300" fill="#fff" />
                {/* font-size 100 is not arbitrary: the viewBox is in the units
                    this string was measured in, where 100px of Geist 300 gives
                    72.2 of ink, and 71 of that sits above the baseline.
                    textLength pins the advance so the band does not resize when
                    the webfont swaps in over the fallback. */}
                <text
                  x="0"
                  y="71"
                  fontSize="100"
                  fontWeight="300"
                  textLength="493.64"
                  lengthAdjust="spacingAndGlyphs"
                  fill="#000"
                >
                  rohittech.in
                </text>
              </mask>
            </defs>
            <rect
              x="-100"
              y="-100"
              width="700"
              height="300"
              fill="currentColor"
              mask="url(#footer-wordmark-knockout)"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}
