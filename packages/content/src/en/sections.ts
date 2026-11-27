// ─── Landing page composition ─────────────────────────────────────────────────
//
// 👉 THIS ARRAY IS THE PAGE. Reorder it to reorder the page. Set `enabled:
//    false` to pull a section without deleting it or touching a component.
//
// The old homepage was 1,067 lines of JSX with every section inlined, and the
// six "component" files beside it were zero bytes. Moving a section meant
// cutting and pasting two hundred lines of markup and hoping the wrapper divs
// came with it. Now each section is a component that takes its content from
// this package, and the order is data.

export type SectionId =
  | "hero"
  | "problem"
  | "road"
  | "leak-anatomy"
  | "stories"
  | "audit"
  | "integrations"
  | "commands"
  | "cloud"
  | "trust"
  | "origin-story"
  | "talks"
  | "testimonials"
  | "docs"
  | "cta";

export interface SectionSpec {
  id: SectionId;
  enabled: boolean;
  /** Background band. Alternating these is what gives the page its rhythm. */
  surface: "base" | "surface" | "void";
  /** Anchor id for in-page links, when the section needs one. */
  anchor?: string;
}

export const landingSections: SectionSpec[] = [
  // ── Phase B order (DESIGN-BRIEF §4) ─────────────────────────────────────────
  // Hero → the road (D-V8: directly beneath the hero) → why it matters
  // (problem, then the leak as proof) → what it does (pillars, stories) →
  // where it fits (integrations) → the cloud and its honest limits → proof →
  // docs → install.
  //
  // ⚠️ Surfaces must never repeat between two VISIBLE neighbours. Testimonials
  // and talks can hide themselves (SECTION_VISIBLE), so check the order with
  // each of them both shown and hidden before changing a surface.
  { id: "hero", enabled: true, surface: "base" },
  { id: "road", enabled: true, surface: "surface", anchor: "commands" },
  { id: "problem", enabled: true, surface: "base", anchor: "problem" },
  { id: "leak-anatomy", enabled: true, surface: "void" },
  { id: "audit", enabled: true, surface: "base" },
  // D-V30 (2026-11-27): the pillars repeat the road; /features covers each in depth.
  { id: "commands", enabled: false, surface: "surface", anchor: "features" },
  // D-V30: the stories moved to /features.
  { id: "stories", enabled: false, surface: "base", anchor: "stories" },
  { id: "integrations", enabled: true, surface: "surface", anchor: "integrations" },
  { id: "cloud", enabled: true, surface: "base", anchor: "cloud" },
  { id: "trust", enabled: true, surface: "void", anchor: "trust" },
  { id: "origin-story", enabled: true, surface: "base" },
  { id: "talks", enabled: true, surface: "surface" },
  // ⚠️ `enabled` here is the PAGE ORDER decision, not the editorial one. The
  // component itself refuses to render unless TESTIMONIALS_ENABLED is on AND
  // approved rows exist — see components/sections/testimonials.tsx. Leaving
  // this true means the section slots into the right place the moment there is
  // something to put in it, rather than needing two edits later.
  { id: "testimonials", enabled: true, surface: "void" },
  { id: "docs", enabled: true, surface: "base", anchor: "docs" },
  { id: "cta", enabled: true, surface: "void" },
];

/** The sections that will actually render, in order. */
export const activeSections = landingSections.filter((s) => s.enabled);
