import type { Metadata } from "next";
import Link from "next/link";
import { HOSTS, SITE, appUrl } from "@evnx/config";
import { SearchModal, SearchTrigger } from "@/components/search-modal";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
// Tokens first: globals.css reads the variables they declare.
import "@evnx/tokens/tokens.css";
import "./globals.css";

// ⚠️ Until this revamp the docs loaded no fonts at all: globals.css named
// IBM Plex Mono and Fraunces, but nothing fetched them, so every reader without
// them installed got Courier New and Georgia. Same three families as evnx.dev.
// ⚠️ No `weight`. Plex Sans is a variable font on Google Fonts; asking for
// fixed weights makes Google answer with `/l/font?kit=…&skey=…` URLs, and
// Turbopack's font loader fails on the `&` ("next/font/google queries have
// exactly one entry"). The variable file covers 400–600 anyway.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

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
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${fraunces.variable}`}
      // next-themes adds class="light" | "dark" before hydration (D-V6).
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg-base text-text-primary font-sans antialiased flex flex-col">
        <ThemeProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>

        <header className="border-b border-border-subtle sticky top-0 z-20 bg-bg-base/90 backdrop-blur">
          <div className="container-base flex items-center justify-between h-14 gap-5">
            <Link href="/" className="flex items-center gap-2 font-mono font-medium">
              {/* The simple mark from evnx-logo-kit: no name inside the shield
                  below 48 px. Decorative; the link's name is the text beside it. */}
              <img src="/brand/evnx-mark-simple.svg" alt="" width={23} height={28} />
              {SITE.name}
              <span className="text-text-muted text-sm">docs</span>
            </Link>
            <nav aria-label="Main" className="flex gap-1 text-sm items-center">
              <Link href="/cli" className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary">
                CLI
              </Link>
              {/* ⚠️ Search is the first thing a docs reader reaches for, and
                  this app shipped without it. Pagefind indexes the build, so
                  it returns nothing in `next dev` — expected, not broken. */}
              <SearchTrigger className="mx-1" />
              <ThemeToggle />
              {/* ⚠️ Hidden below `sm`: with it the nav is 383 px wide and every
                  page scrolls sideways at 375 px. The footer links evnx.dev
                  too, so it stays reachable on a phone. */}
              <a href={HOSTS.web} className="hidden sm:block px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary">
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

        <SearchModal />

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
        </ThemeProvider>
      </body>
    </html>
  );
}
