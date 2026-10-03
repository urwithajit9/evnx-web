import type { Metadata } from "next";
import { canonicalUrl } from "@evnx/config";
import { activeSections } from "@evnx/content";
import { SECTIONS, SECTION_VISIBLE, SectionShell } from "@/components/sections";

/**
 * The landing page.
 *
 * ⚠️ There is no page layout here, deliberately. The order, the backgrounds
 * and which sections exist at all come from `landingSections` in
 * @evnx/content; this file just walks the array.
 *
 * What it replaced was 1,067 lines of JSX with every section inlined, beside
 * six component files — hero, feature-grid, origin-story, ci-cd-section,
 * command-showcase, social-proof — that were **zero bytes each**. Moving a
 * section meant cutting two hundred lines of markup and hoping the wrapper
 * divs came too. Now reordering is editing an array and removing one is
 * `enabled: false`.
 *
 * The canonical lives here because a client component cannot export metadata,
 * and the homepage is the page that most needs one.
 */
export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
  openGraph: { url: canonicalUrl("/") },
};

export default async function HomePage() {
  // ⚠️ Asked BEFORE the shell is drawn. A section that renders nothing still
  // gets a band, a border and a screen of padding otherwise.
  const visible = await Promise.all(
    activeSections.map(async (spec) => (await SECTION_VISIBLE[spec.id]?.()) ?? true),
  );

  return (
    <>
      {activeSections.map((spec, i) => {
        if (!visible[i]) return null;
        const Section = SECTIONS[spec.id];
        return (
          <SectionShell key={spec.id} spec={spec}>
            <Section />
          </SectionShell>
        );
      })}
    </>
  );
}
