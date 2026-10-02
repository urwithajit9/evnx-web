import type { Metadata } from "next";
import { canonicalUrl } from "@evnx/config";
import { HomeClient } from "@/components/marketing/home-client";

/**
 * ⚠️ This wrapper exists so the homepage can have a canonical URL at all.
 *
 * The page body is a client component — it animates a terminal and manages
 * install tabs — and a client component cannot export `metadata`. So the most
 * important page on the site was the one page with no canonical, on a domain
 * served from two hostnames.
 *
 * Note there is deliberately NO default canonical in the root layout. A
 * layout-level default would make every page that forgot to override declare
 * itself a duplicate of the homepage, which is considerably worse than having
 * no canonical at all.
 */
export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
  openGraph: { url: canonicalUrl("/") },
};

export default function HomePage() {
  return <HomeClient />;
}
