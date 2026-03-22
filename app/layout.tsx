import type { Metadata } from "next";
import { IBM_Plex_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/config";
import { SearchModal } from "@/components/ui/search-modal";

// IBM Plex Mono — UI / body font (fully monospace site)
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
      className={`${ibmPlexMono.variable} ${fraunces.variable} dark`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-mono antialiased">
        <Header />
        {/* <SearchModal /> */}
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Umami Analytics */}
        <Script
          src="/stats/script.js"
          data-website-id="b50850fb-0a46-4863-bfbb-75c67d04b312"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
