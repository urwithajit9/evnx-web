// @evnx/content — every word on the marketing site, as data.
//
// Prose that must be GOOD. Facts that must be TRUE live in @evnx/config.
//
// Why copy lives in a package and not in the components that render it:
//   • Changing the tagline is a one-line edit to one file, with no JSX nearby.
//   • A section's order is `sections.ts`, not the order of tags in a 1,000-line
//     page component.
//   • A second locale is a sibling directory, not a rewrite.
//   • Copy can be reviewed by someone who does not read React.

export * from "./types";
export * from "./en";
