import type { Metadata } from "next";
import { refunds } from "@evnx/content";
import { canonicalUrl } from "@evnx/config";
import { LegalPage } from "@/components/legal/legal-page";

// ⚠️ This page exists because Paddle's website verification asks for a refund
// policy as its own link. The content is derived from the Terms rather than
// copied — see the note on `refunds` in @evnx/content.
export const metadata: Metadata = {
  title: refunds.title,
  description: refunds.lede,
  alternates: { canonical: canonicalUrl("/refunds") },
  openGraph: { url: canonicalUrl("/refunds") },
};

export default function Page() {
  return <LegalPage doc={refunds} />;
}
