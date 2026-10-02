/**
 * lib/shiki.ts
 *
 * Shiki is ESM-only (ships as .mjs). With `serverExternalPackages: ['shiki']`
 * a static import works in RSC, and this file only ever runs server-side.
 */
import { bundledLanguages, bundledLanguagesInfo } from 'shiki'

// Re-exported so server components have one import for both concerns.
export { LANG_LABELS } from './lang-labels'

/**
 * ⚠️ THE BUG THIS FILE USED TO HAVE, because it is an easy one to re-introduce:
 *
 * `SUPPORTED_LANGS` was `new Set(Object.keys(LANG_LABELS))` — a map of
 * **display labels** used as the list of **grammars Shiki can parse**. Those
 * are different things, and conflating them failed in both directions at once:
 *
 *   • ```env had a label but is not a Shiki grammar, so it reached Shiki and
 *     THREW. 17 blocks, on a site about .env files, every build.
 *   • ```hcl, ```nginx, ```ruby, ```mermaid and seven others ARE real Shiki
 *     grammars but had no label, so they were silently downgraded to
 *     plaintext. No error, no highlighting, nobody notices.
 *
 * The fix is to stop hand-maintaining the grammar list. `SHIKI_LANGS` below is
 * derived from Shiki's own bundle, so it cannot drift from what Shiki actually
 * supports, and a Shiki upgrade that adds a language picks it up for free.
 */
const SHIKI_LANGS = new Set<string>([
  ...Object.keys(bundledLanguages),
  ...bundledLanguagesInfo.flatMap((info) => info.aliases ?? []),
])

/** Shiki special-cases these; they never load a grammar. */
const PLAIN = new Set(['plaintext', 'text', 'txt', 'plain'])

/**
 * Fence tags that are NOT Shiki grammars, mapped to the closest one that is.
 *
 * ⚠️ Only tags that genuinely differ belong here. Anything Shiki already knows
 * passes straight through — adding it here would be a second source of truth.
 *
 * ⚠️ `env` → `dotenv` is the important one. It is the single most-used fence
 * tag that was broken, and `.env` syntax is the subject of this entire site.
 */
const GRAMMAR_ALIAS: Record<string, string> = {
  env: 'dotenv',        // `dotenv` is a real grammar; `env` is not
  md: 'markdown',
  patch: 'diff',        // a patch IS a diff, with headers
  gitignore: 'ini',     // no gitignore grammar; `ini` gets the # comments right
}

/**
 * Resolve a fence tag to a grammar Shiki will actually accept.
 *
 * Returns `plaintext` for anything unknown — which is the correct degradation,
 * and is now reached only by tags Shiki genuinely has no grammar for, rather
 * than by every tag someone forgot to add to a label map.
 */
export function resolveGrammar(lang: string): string {
  const tag = (lang || '').toLowerCase().trim()
  if (!tag || PLAIN.has(tag)) return 'plaintext'
  const candidate = GRAMMAR_ALIAS[tag] ?? tag
  return SHIKI_LANGS.has(candidate) ? candidate : 'plaintext'
}
