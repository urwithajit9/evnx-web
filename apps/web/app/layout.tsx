import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
// Tokens first: globals.css reads the variables they declare.
import "@evnx/tokens/tokens.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/layout/header";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { Footer } from "@/components/layout/footer";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/config";
import { SearchModal } from "@/components/ui/search-modal";

// D-V5 — IBM Plex Sans for body and UI copy.
// ⚠️ No `weight`. Plex Sans is a variable font on Google Fonts; asking for
// fixed weights makes Google answer with `/l/font?kit=…&skey=…` URLs, and
// Turbopack's font loader fails on the `&` ("next/font/google queries have
// exactly one entry"). The variable file covers 400–600 anyway.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// IBM Plex Mono — code, commands, labels and pills (`font-mono`)
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

// Fraunces — display / heading font (editorial contrast)
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — .env management CLI`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
      url: SITE_URL,          
  title: `${SITE_NAME} — .env management CLI`,  
  description: SITE_DESCRIPTION,               
    images: [{ url: "/og.png", width: 1200, height: 630 , alt: "evnx CLI" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
     images: [{ url: "/og.png", alt: "evnx — .env management CLI" }],
  },
  keywords: [
    "env management",
    "secret scanning",
    "dotenv",
    "cli tool",
    "rust",
    "devops",
    "kubernetes secrets",
    "env validation",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${fraunces.variable}`}
      // next-themes adds class="light" | "dark" before hydration (D-V6).
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased">
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only">
    Skip to content
  </a>
        <AnnouncementBanner />
        <Header />
        <SearchModal />
        {/* ⚠️ `id` and `tabIndex` are both required. The skip link above has
            always pointed at #main-content and no element carried that id, so
            the first thing a keyboard user reaches did nothing. tabIndex={-1}
            makes the target focusable so focus actually lands here rather than
            just scrolling the page. */}
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />

        {/* Umami Analytics */}
        <Script
          src="/stats/script.js"
          data-website-id="b50850fb-0a46-4863-bfbb-75c67d04b312"
          strategy="afterInteractive"
        />
        </ThemeProvider>
      </body>
    </html>
  );
}
