// ─── §4 · CI ──────────────────────────────────────────────────────────────────

import type { SectionHeading } from "../types";

export const ci: SectionHeading & {
  workflow: { title: string; code: string; language: string };
  exitCodes: { title: string; body: string };
  note: string;
} = {
  heading: "And again, where it counts",
  lede: "The same binary, in the pipeline, before a merge rather than after an incident.",

  workflow: {
    title: "GitHub Actions",
    language: "yaml",
    // ⚠️ Pinned to a major tag so the snippet stays valid across releases.
    code: `- uses: urwithajit9/evnx@v1
  with:
    command: scan
    fail-on: critical
    sarif: true`,
  },

  exitCodes: {
    title: "Exit codes a pipeline can branch on",
    body: "0 clean, 1 warnings, 2 critical. SARIF output puts every finding on the pull request itself, next to the line that caused it.",
  },

  note: "evnx diff exits non-zero on a healthy project by design — it reports a difference, not a failure. Branch on the summary fields, not the exit code.",
};
