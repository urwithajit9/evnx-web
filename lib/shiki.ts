import { createHighlighter, type Highlighter } from "shiki";

// ─── Singleton ────────────────────────────────────────────────────────────────
// One highlighter instance, created once and reused across all RSC renders.

let highlighterInstance: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance;

  if (!initPromise) {
    initPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "bash",
        "shell",
        "powershell",
        "yaml",
        "json",
        "toml",
        "typescript",
        "javascript",
        "python",
        "rust",
        "go",
        "dockerfile",
        "diff",
        "sql",
        "ini", // .env files are close to INI
        "plaintext",
      ],
    });
  }

  highlighterInstance = await initPromise;
  return highlighterInstance;
}

// ─── Highlight helper ─────────────────────────────────────────────────────────

export type HighlightOptions = {
  lang?: string;
  theme?: "github-dark" | "github-light";
  /** Line numbers like [3, 5, 6] to highlight */
  highlightLines?: number[];
};

export async function highlight(
  code: string,
  options: HighlightOptions = {},
): Promise<string> {
  const { lang = "bash", theme = "github-dark" } = options;
  const hl = await getHighlighter();

  const safeCode = code.trim();

  // Check if the language is loaded; fall back to plaintext
  const loadedLangs = hl.getLoadedLanguages();
  const resolvedLang = loadedLangs.includes(lang as never) ? lang : "plaintext";

  return hl.codeToHtml(safeCode, {
    lang: resolvedLang,
    theme,
  });
}

// ─── Language label map ───────────────────────────────────────────────────────

export const LANG_LABELS: Record<string, string> = {
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  yaml: "YAML",
  json: "JSON",
  toml: "TOML",
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  rust: "Rust",
  go: "Go",
  dockerfile: "Dockerfile",
  diff: "Diff",
  sql: "SQL",
  ini: ".env",
  plaintext: "Text",
};
