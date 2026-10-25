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
    // The action is urwithajit9/evnx-action (the evnx repo has no action.yml);
    // its inputs are in that repo's action.yml.
    code: `- uses: urwithajit9/evnx-action@v1
  with:
    command: scan
    format: sarif
- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: evnx-results.sarif`,  },

  exitCodes: {
    title: "Exit codes a pipeline can branch on",
    body: "0 clean, 1 findings, 2 could not run — never reported as clean. SARIF output puts every finding in the Security tab and on the pull request, next to the line that caused it.",
  },

  note: "evnx diff exits 1 only when .env and its template disagree on which keys exist. A healthy project exits 0, so the exit code is a gate you can use.",
};
