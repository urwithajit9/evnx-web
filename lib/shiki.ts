/**
 * lib/shiki.ts
 *
 * Shiki is ESM-only (ships as .mjs). In a Next.js project with
 * `serverExternalPackages: ['shiki']`, dynamic import() works correctly.
 * Static `import { codeToHtml } from 'shiki'` also works in RSC because
 * Next.js transpiles the server bundle as ESM. Both approaches are fine.
 * We use a static import here since this file only ever runs server-side.
 */
import { codeToHtml } from "shiki";

export const LANG_LABELS: Record<string, string> = {
  bash: "Bash",
  shell: "Shell",
  sh: "Shell",
  powershell: "PowerShell",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  toml: "TOML",
  typescript: "TypeScript",
  ts: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  js: "JavaScript",
  jsx: "JSX",
  python: "Python",
  py: "Python",
  rust: "Rust",
  rs: "Rust",
  go: "Go",
  dockerfile: "Dockerfile",
  diff: "Diff",
  sql: "SQL",
  ini: ".env",
  env: ".env",
  plaintext: "Text",
  text: "Text",
};

const SUPPORTED_LANGS = new Set(Object.keys(LANG_LABELS));

export async function highlight(code: string, lang: string): Promise<string> {
  const safeLang = SUPPORTED_LANGS.has(lang) ? lang : "plaintext";

  try {
    const html = await codeToHtml(code, {
      lang: safeLang,
      theme: "github-dark",
    });

    // Shiki emits style="background-color:#0d1117;color:#e6edf3" on <pre>.
    // Inline styles beat every CSS rule. Strip so our bg-terminal-bg shows.
    return html.replace(/(<pre\b[^>]*?)\s+style="[^"]*"/, "$1");
  } catch (err) {
    console.error(`[shiki] codeToHtml failed lang="${safeLang}":`, err);
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
}
