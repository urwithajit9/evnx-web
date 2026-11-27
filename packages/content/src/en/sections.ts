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
  /** A short band (a strip or a quote): half the usual vertical padding. */
  compact?: boolean;
}

export const landingSections: SectionSpec[] = [
  // ── 2026-11-27 order (DESIGN-BRIEF D-V27–D-V34) ─────────────────────────────
  // Hero → what it does (the road) → why it matters (problem + the leak strip)
  // → where it fits (integrations strip) → the cloud and what it can't see →
  // why it exists (origin band) → proof → one ending. It was 14 sections and
  // 13.7 laptop screens; each idea now appears once.
  //
  // ⚠️ Surfaces must never repeat between two VISIBLE neighbours. Testimonials
  // can hide itself (SECTION_VISIBLE), so check the order with it shown and
  // hidden before changing a surface: cloud base → origin void →
  // (testimonials surface) → cta base.
  { id: "hero", enabled: true, surface: "base" },
  { id: "road", enabled: true, surface: "surface", anchor: "commands" },
  { id: "problem", enabled: true, surface: "base", anchor: "problem" },
  { id: "integrations", enabled: true, surface: "surface", anchor: "integrations", compact: true },
  { id: "cloud", enabled: true, surface: "base", anchor: "cloud" },
  { id: "origin-story", enabled: true, surface: "void", compact: true },
  // ⚠️ `enabled` here is the PAGE ORDER decision, not the editorial one. The
  // component itself refuses to render unless TESTIMONIALS_ENABLED is on AND
  // approved rows exist — see components/sections/testimonials.tsx. Leaving
  // this true means the section slots into the right place the moment there is
  // something to put in it, rather than needing two edits later.
  { id: "testimonials", enabled: true, surface: "surface" },
  { id: "cta", enabled: true, surface: "base" },

  // ── Switched off 2026-11-27; the components stay, so each can come back ────
  // D-V29: the leak is a two-row strip inside "problem"; the hero terminal
  // already shows a real scan.
  { id: "leak-anatomy", enabled: false, surface: "void" },
  { id: "audit", enabled: false, surface: "base" },
  // D-V30: the pillars repeat the road (every pillar's command is a stop);
  // /features covers each in depth, and the stories moved there.
  { id: "commands", enabled: false, surface: "surface", anchor: "features" },
  { id: "stories", enabled: false, surface: "base", anchor: "stories" },
  // D-V31: merged into "cloud", every held row and limit kept.
  { id: "trust", enabled: false, surface: "void", anchor: "trust" },
  // D-V34: talks are a slim row in the ending (and the hero proof); the docs
  // cards are three buttons there.
  { id: "talks", enabled: false, surface: "surface" },
  { id: "docs", enabled: false, surface: "base", anchor: "docs" },
];

/** The sections that will actually render, in order. */
export const activeSections = landingSections.filter((s) => s.enabled);
