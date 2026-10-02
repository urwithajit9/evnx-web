import type { Metadata } from "next";
import Link from "next/link";
import { HOSTS, SITE, appUrl } from "@evnx/config";
import "./globals.css";

/**
 * ⚠️ Canonicals point at docs.evnx.dev from day one, even before the DNS
 * record exists. A docs page that canonicalises to evnx.dev would tell Google
 * the old URL is authoritative at exactly the moment the 301s are trying to
 * say the opposite.
 */
export const metadata: Metadata = {
  metadataBase: new URL(HOSTS.docs),
  title: {
    default: "evnx documentation",
    template: `%s | evnx docs`,
  },
  description:
    "Every evnx command, flag and exit code. Install, scan, validate, and sync your .env files.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-base text-text-primary antialiased flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>

        <header className="border-b border-border-subtle sticky top-0 z-20 bg-bg-base/90 backdrop-blur">
          <div className="container-base flex items-center justify-between h-14 gap-5">
            <Link href="/" className="flex items-center gap-2 font-mono font-medium">
              <span className="w-2 h-4 bg-brand-500 rounded-sm" aria-hidden />
              {SITE.name}
              <span className="text-text-muted text-sm">docs</span>
            </Link>
            <nav aria-label="Main" className="flex gap-1 text-sm">
              <Link href="/cli" className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary">
                CLI
              </Link>
              <a href={HOSTS.web} className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary">
                evnx.dev ↗
              </a>
              <a
                href={appUrl("/login")}
                className="px-3 py-1.5 rounded-md border border-border-muted text-text-primary"
              >
                Log in
              </a>
            </nav>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <footer className="border-t border-border-subtle py-8 mt-16">
          <div className="container-base text-xs text-text-muted flex flex-wrap gap-4 justify-between">
            <span>
              {SITE.name} documentation · MIT licensed
            </span>
            <a href={HOSTS.web} className="hover:text-text-primary">
              evnx.dev
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
