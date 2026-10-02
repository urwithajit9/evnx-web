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
  | "leak-anatomy"
  | "audit"
  | "ci"
  | "commands"
  | "cloud"
  | "trust"
  | "origin-story"
  | "talks"
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
  { id: "hero", enabled: true, surface: "base" },
  { id: "leak-anatomy", enabled: true, surface: "void" },
  { id: "audit", enabled: true, surface: "base" },
  { id: "ci", enabled: true, surface: "surface" },
  { id: "commands", enabled: true, surface: "base" },
  { id: "cloud", enabled: true, surface: "surface", anchor: "cloud" },
  { id: "trust", enabled: true, surface: "void", anchor: "trust" },
  { id: "origin-story", enabled: true, surface: "base" },
  { id: "talks", enabled: true, surface: "surface" },
  { id: "cta", enabled: true, surface: "void" },
];

/** The sections that will actually render, in order. */
export const activeSections = landingSections.filter((s) => s.enabled);
