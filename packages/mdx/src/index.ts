// @evnx/mdx — the components MDX content renders through.
//
// ⚠️ Shared by apps/web (serving /guides/*) and, from P2, apps/docs (serving
// /cli/*). Both must render a guide identically — the split moves URLs, not
// appearance, and a reader who follows a 301 should not be able to tell.
export { mdxComponents } from "./components/mdx-components";
export { LANG_LABELS } from "./lib/lang-labels";
export { resolveGrammar } from "./lib/shiki";
