/**
 * Human labels for code-fence languages. Display only.
 *
 * ⚠️ NO IMPORTS, DELIBERATELY. This module is pulled into client components
 * (`components/ui/code-block.tsx` is `'use client'`), so it must not reach
 * `shiki` — which is in `serverExternalPackages` and has no business in a
 * browser bundle. Grammar resolution lives in `lib/shiki.ts`, server-side.
 *
 * ⚠️ A LABEL IS NOT A CAPABILITY. Presence here says only "we have a nice name
 * for this", never "Shiki can highlight it". Conflating the two is the bug
 * that left every ```env block unhighlighted and throwing — see lib/shiki.ts.
 */
export const LANG_LABELS: Record<string, string> = {
  bash: 'Bash',       shell: 'Shell',     sh: 'Shell',
  console: 'Console', powershell: 'PowerShell',
  yaml: 'YAML',       yml: 'YAML',
  json: 'JSON',       toml: 'TOML',       ini: '.env',
  env: '.env',        dotenv: '.env',
  typescript: 'TypeScript', ts: 'TypeScript', tsx: 'TSX',
  javascript: 'JavaScript', js: 'JavaScript', jsx: 'JSX',
  python: 'Python',   py: 'Python',
  rust: 'Rust',       rs: 'Rust',
  go: 'Go',           java: 'Java',       ruby: 'Ruby',
  hcl: 'Terraform',   nix: 'Nix',         nginx: 'nginx',
  makefile: 'Makefile', dockerfile: 'Dockerfile',
  diff: 'Diff',       patch: 'Patch',     sql: 'SQL',
  markdown: 'Markdown', md: 'Markdown',
  mermaid: 'Mermaid', regex: 'Regex',     gitignore: '.gitignore',
  plaintext: 'Text',  text: 'Text',       txt: 'Text',
}
