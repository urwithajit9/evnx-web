import type { Metadata } from "next";
import { security } from "@evnx/content";
import { canonicalUrl } from "@evnx/config";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: security.title,
  description: security.lede,
  alternates: { canonical: canonicalUrl("/security") },
  openGraph: { url: canonicalUrl("/security") },
};

export default function Page() {
  return <LegalPage doc={security} />;
}
