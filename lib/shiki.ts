/**
 * lib/shiki.ts
 *
 * Uses the `codeToHtml` shorthand — the simplest Shiki API.
 * Works with Shiki v1, v2, v3, v4 without changes.
 * Shiki manages its own internal caching when using shorthands.
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

// Languages we support — anything outside this list falls back to plaintext
const SUPPORTED_LANGS = new Set(Object.keys(LANG_LABELS));

export async function highlight(code: string, lang: string): Promise<string> {
  const safeLang = SUPPORTED_LANGS.has(lang) ? lang : "plaintext";

  try {
    const html = await codeToHtml(code, {
      lang: safeLang,
      theme: "github-dark",
    });

    // Shiki v1+ emits:
    //   <pre class="shiki github-dark" style="background-color:#0d1117;color:#e6edf3" tabindex="0">
    // The inline style wins over every CSS rule including !important.
    // Strip it so our container's background-color shows through.
    return html.replace(/(<pre\b[^>]*?)\s+style="[^"]*"/, "$1");
  } catch (err) {
    console.error(`[shiki] highlight failed for lang="${safeLang}":`, err);
    // Fallback: escaped plain text wrapped in a <pre>
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
}
