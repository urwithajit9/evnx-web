import type { ComponentType } from "react";
import type { SectionId } from "@evnx/content";
import { TALKS } from "@evnx/config";
import { hasApprovedTestimonials } from "./testimonials";

import { Hero, HeroProof } from "./hero";
import { LeakAnatomy } from "./leak-anatomy";
import { Audit } from "./audit";
import { Ci } from "./ci";
import { Commands } from "./commands";
import { Cloud } from "./cloud";
import { Trust } from "./trust";
import { OriginStory } from "./origin-story";
import { Talks } from "./talks";
import { Testimonials } from "./testimonials";
import { Cta } from "./cta";

/**
 * Section id → component.
 *
 * ⚠️ Typed as `Record<SectionId, …>`, which is the point: adding an id to
 * `SectionId` in @evnx/content without adding a component here is a compile
 * error, not a blank band on the homepage that nobody notices until someone
 * scrolls past it in production.
 */
export const SECTIONS: Record<SectionId, ComponentType> = {
  hero: function HeroSection() {
    return (
      <>
        <Hero />
        <HeroProof />
      </>
    );
  },
  "leak-anatomy": LeakAnatomy,
  audit: Audit,
  ci: Ci,
  commands: Commands,
  cloud: Cloud,
  trust: Trust,
  "origin-story": OriginStory,
  talks: Talks,
  testimonials: Testimonials,
  cta: Cta,
};

/**
 * Whether a section has anything to render.
 *
 * ⚠️ This exists because returning `null` from the component is NOT enough.
 * The page wraps every section in `SectionShell`, which supplies the band,
 * the padding and the border — so a component that renders nothing still
 * leaves a visible empty stripe on the page. Verified: with testimonials
 * flagged off, the built homepage had an 11th band containing zero characters.
 *
 * Async because the answer can depend on data, not just a flag. Testimonials
 * is off either when the flag is off OR when no row is approved, and the
 * second only becomes knowable by asking the database.
 */
export const SECTION_VISIBLE: Partial<Record<SectionId, () => boolean | Promise<boolean>>> = {
  talks: () => TALKS.length > 0,
  testimonials: hasApprovedTestimonials,
};

export { SectionShell, SectionHeading } from "./section-shell";
export { TerminalBlock } from "./terminal-block";
