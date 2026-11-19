// ─── Integrations: two tiers, labelled for what they are ─────────────────────
//
// D-V10 (DESIGN-BRIEF.md). ⚠️ THE OVERCLAIM RISK ON THIS PAGE.
//
// "Syncs with" means evnx talks to the platform itself. "Exports to" means
// evnx writes the file or commands that tool reads, and you apply them.
// Do not move a name up a tier without a command that does the talking, and
// do not add a name with no command at all — the concepts showed Render,
// Fly.io and Docker as deploy targets, and evnx has no integration with any
// of them (Docker is the docker-compose export only).
//
// Sources: commands/platform (Vercel, both directions, 0.14.0+),
// commands/migrate (GitHub Actions upload), commands/convert (14 formats;
// railway still experimental), integrations/github-actions.

import type { SectionHeading } from "../types";

export interface SyncTarget {
  name: string;
  body: string;
  /** Guide under the docs, e.g. "commands/platform". */
  docsSlug: string;
  /** The command that does the talking. */
  command: { label: string; guide: string };
}

export const integrations: SectionHeading & {
  syncs: { title: string; lede: string; targets: SyncTarget[] };
  exports: {
    title: string;
    lede: string;
    targets: { name: string; experimental?: boolean }[];
    command: { label: string; guide: string };
  };
  workflow: { summary: string; title: string; language: string; code: string; exitCodes: string };
} = {
  eyebrow: "Integrations",
  heading: "Works with the stack you already deploy to",
  lede: "Labelled for what they are: some platforms evnx talks to directly, others it writes the files for.",

  syncs: {
    title: "Syncs with",
    lede: "evnx reads and writes these itself.",
    targets: [
      {
        name: "Vercel",
        body: "Compare, pull and push a project's environment variables. Values are never printed, in any format.",
        docsSlug: "commands/platform",
        command: { label: "evnx platform", guide: "platform" },
      },
      {
        name: "GitHub Actions",
        body: "Gate pull requests with the Marketplace action, report findings in the Security tab, and upload repository secrets straight from a .env.",
        docsSlug: "integrations/github-actions",
        command: { label: "evnx migrate", guide: "migrate" },
      },
    ],
  },

  exports: {
    title: "Exports to",
    lede: "evnx convert writes the file or commands each tool expects; you apply them.",
    targets: [
      { name: "Kubernetes Secret" },
      { name: "Terraform .tfvars" },
      { name: "Docker Compose" },
      { name: "Doppler" },
      { name: "Heroku" },
      { name: "AWS Secrets Manager" },
      { name: "GCP Secret Manager" },
      { name: "Azure Key Vault" },
      { name: "Railway", experimental: true },
    ],
    command: { label: "evnx convert", guide: "convert" },
  },

  // Moved from the former CI section, unchanged.
  workflow: {
    summary: "See the GitHub Actions workflow",
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
    sarif_file: evnx-results.sarif`,
    exitCodes:
      "Exit codes a pipeline can branch on: 0 clean, 1 findings, 2 could not run — never reported as clean.",
  },
};
