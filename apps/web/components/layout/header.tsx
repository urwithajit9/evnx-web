"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Github } from "lucide-react";
import { EVNX_VERSION, GITHUB_URL } from "@/lib/config";
import { SearchTrigger, SearchModal } from "@/components/ui/search-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TESTIMONIALS_ENABLED, docsUrl } from "@evnx/config";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// ⚠️ Testimonials is appended only when the flag is on — see
// TESTIMONIALS_ENABLED. A "Testimonials" tab leading to an empty page reads as
// a product nobody is saying anything about.
//
// DESIGN-BRIEF §6 order: what it is (Features, Integrations), then how to
// use it (Guides), then trust and money (Security, Pricing), then news.
const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/integrations", label: "Integrations" },
  // ⚠️ docsUrl(), not "/guides". The header renders on every page, so a
  // hardcoded path here is a 301 on every page of the site once the split is
  // on. A redirect is a safety net for links you do not control — not a
  // substitute for fixing the ones you do.
  { href: docsUrl(), label: "Guides" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/changelog", label: "Changelog" },
  ...(TESTIMONIALS_ENABLED
    ? [{ href: "/testimonials", label: "Testimonials" }]
    : []),
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigation, so the next page is not hidden under it.
  useEffect(() => setMobileOpen(false), [pathname]);

  // ⚠️ A disclosure, not a modal: the page stays reachable, so there is no
  // focus trap. Esc closes it and returns focus to the button that opened it,
  // or keyboard focus would be stranded inside a menu that no longer exists.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-bg-base/90 backdrop-blur-sm border-b border-border-subtle">
      <div className="container-base">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandMark />
            <span className="font-mono font-bold text-text-primary">evnx</span>
            <span className="hidden sm:block font-mono text-xs text-text-muted border border-border-subtle rounded px-1.5 py-0.5">
              v{EVNX_VERSION}
            </span>
          </Link>

          {/* Desktop nav */}
          {/* lg, not md: eight links plus the actions overflow a 768px header. */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "text-sm px-3 py-1.5 rounded transition-colors",
                  isActive(href)
                    ? "text-brand-400 bg-brand-500/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchTrigger />
            <ThemeToggle />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
              aria-label="evnx on GitHub (opens in a new tab)"
            >
              <Github className="w-4 h-4" aria-hidden />
            </a>

            <Link href="/install" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
              Install
            </Link>

            {/* Mobile menu toggle — 44px tap target */}
            <button
              ref={toggleRef}
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-border-subtle py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "block text-base px-3 py-3 rounded transition-colors",
                  isActive(href)
                    ? "text-brand-400 bg-brand-500/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                )}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-border-subtle px-3 flex gap-3">
              <Link href="/install" className={buttonVariants()}>
                Install evnx
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </nav>
        )}
      </div>
      <SearchModal />
    </header>
  );
}
