// @evnx/docs-content — the CLI guides, and the one definition of how a guide
// becomes a URL.
//
// ⚠️ Owned by neither app. apps/web serves these at /guides/* until the
// redirects land; apps/docs serves them at /cli/*. Both parse them the same
// way because both call the same functions — which is the point, since the
// split promises that only the URL changes.

export * from "./guides";

/** The five sections, in the order a reader should meet them. */
export const GUIDE_SECTION_KEYS = [
  "getting-started",
  "commands",
  "integrations",
  "use-cases",
  "reference",
] as const;
