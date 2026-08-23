import Link from "next/link";
import { BookOpen, Github, Linkedin } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link className="flex items-center gap-3 group" href="/">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="hidden lg:block text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              Rohitdev.tech
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <ul className="flex items-center gap-6">
              <li>
                <Link
                  href="/about"
                  className="relative text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 group"
                >
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>

              <li>
                <Link
                  href="/posts"
                  className="relative text-gray-700 hover:text-red-600 font-medium transition-colors duration-200 group"
                >
                  Posts
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-3 ml-6 pl-6 border-l border-gray-200">
              <Link
                href="https://github.com/Ro-hit-Sonar"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>

              <Link
                href="https://www.linkedin.com/in/rohitsonar"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
