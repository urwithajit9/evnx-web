import type { ComponentType } from "react";
import type { SectionId } from "@evnx/content";

import { Hero, HeroProof } from "./hero";
import { LeakAnatomy } from "./leak-anatomy";
import { Audit } from "./audit";
import { Ci } from "./ci";
import { Commands } from "./commands";
import { Cloud } from "./cloud";
import { Trust } from "./trust";
import { OriginStory } from "./origin-story";
import { Talks } from "./talks";
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
  cta: Cta,
};

export { SectionShell, SectionHeading } from "./section-shell";
export { TerminalBlock } from "./terminal-block";
