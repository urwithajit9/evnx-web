import type { Metadata } from "next";
import { privacy } from "@evnx/content";
import { canonicalUrl } from "@evnx/config";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.lede,
  alternates: { canonical: canonicalUrl("/privacy") },
  openGraph: { url: canonicalUrl("/privacy") },
};

export default function Page() {
  return <LegalPage doc={privacy} />;
}
