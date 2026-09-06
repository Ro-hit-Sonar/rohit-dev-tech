import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

import ThemeToggle from "@/app/components/ThemeToggle";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blogs" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="shrink-0 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:text-brand sm:text-sm"
        >
          Rohitdev
          {/* The suffix is the first thing to go when the bar gets tight. */}
          <span className="hidden text-muted-foreground sm:inline">.tech</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8">
          <ul className="flex items-center gap-4 text-sm sm:gap-8">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 border-l border-border pl-4 sm:gap-3 sm:pl-8">
            <Link
              href="https://github.com/Ro-hit-Sonar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/rohitsonar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hidden h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:grid"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
