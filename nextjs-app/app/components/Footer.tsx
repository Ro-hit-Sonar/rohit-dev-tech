import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
            href="mailto:rohit@airocia.com?subject=Hello%20from%20rohitdev.tech"
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
                Rohitdev.tech
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

      {/* Oversized wordmark */}
      <div aria-hidden="true" className="relative overflow-hidden py-8">
        <div className="select-none text-center text-[20vw] font-light leading-none text-footer-foreground/5">
          ROHITDEV
        </div>
      </div>
    </footer>
  );
}
