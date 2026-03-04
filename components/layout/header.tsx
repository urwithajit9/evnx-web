"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Github } from "lucide-react";
import { EVNX_VERSION, GITHUB_URL } from "@/lib/config";

const NAV_LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/changelog", label: "Changelog" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-base/90 backdrop-blur-sm border-b border-border-subtle">
      <div className="container-base">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 bg-brand-500 rounded flex items-center justify-center">
              <span className="font-mono font-bold text-black text-xs">ev</span>
            </div>
            <span className="font-mono font-bold text-text-primary">evnx</span>
            <span className="hidden sm:block font-mono text-xs text-text-muted border border-border-subtle rounded px-1.5 py-0.5">
              v{EVNX_VERSION}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-mono text-sm px-3 py-1.5 rounded transition-colors ${
                    isActive
                      ? "text-brand-400 bg-brand-500/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            <Link
              href="/install"
              className="hidden sm:block font-mono text-xs bg-brand-500 text-black px-3 py-1.5 rounded hover:bg-brand-400 transition-colors font-semibold"
            >
              Install
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors p-1"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border-subtle py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block font-mono text-sm px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-border-subtle px-3 flex gap-3">
              <Link
                href="/install"
                className="font-mono text-xs bg-brand-500 text-black px-4 py-2 rounded hover:bg-brand-400 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Install evnx
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs border border-border-muted text-text-secondary px-4 py-2 rounded hover:text-text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
