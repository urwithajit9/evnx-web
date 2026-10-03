import type { Metadata } from "next";
import { terms } from "@evnx/content";
import { canonicalUrl } from "@evnx/config";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: terms.title,
  description: terms.lede,
  alternates: { canonical: canonicalUrl("/terms") },
  openGraph: { url: canonicalUrl("/terms") },
};

export default function Page() {
  return <LegalPage doc={terms} />;
}
