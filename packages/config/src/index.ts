// @evnx/config — structural facts about evnx.
//
// Facts that must be TRUE. Words that must be GOOD live in @evnx/content.
//
// ⚠️ The rule this package exists to enforce: any value that appears in more
// than one place, or that will change, is imported from here. Never typed at a
// call site. `lib/config.ts` held `EVNX_VERSION = "0.4.0"` while the CLI was on
// 0.7.0, and the stale number was live on the site for a month.

export * from "./site";
export * from "./versions";
export * from "./packages";
export * from "./money";
export * from "./plans";
export * from "./social";
export * from "./analytics";
