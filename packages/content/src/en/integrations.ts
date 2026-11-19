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
  /** Exact invocations, copied from the guide named by docsSlug. */
  commands: string[];
}

export interface ExportTarget {
  name: string;
  /** The `--to` value, from the Formats table in commands/convert. */
  format: string;
  /** What the output is, paraphrased from that table. */
  writes: string;
  /** A flag the format requires, if any. */
  needs?: string;
  experimental?: boolean;
}

export const integrations: SectionHeading & {
  syncs: { title: string; lede: string; targets: SyncTarget[] };
  exports: {
    title: string;
    lede: string;
    targets: ExportTarget[];
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
        commands: [
          "evnx platform diff --to vercel",
          "evnx platform pull --to vercel",
          "evnx platform push --to vercel",
        ],
      },
      {
        name: "GitHub Actions",
        body: "Gate pull requests with the Marketplace action, report findings in the Security tab, and upload repository secrets straight from a .env.",
        docsSlug: "integrations/github-actions",
        command: { label: "evnx migrate", guide: "migrate" },
        commands: [
          "evnx scan --format sarif --exit-zero > results.sarif",
          "evnx migrate --to github-actions --repo owner/repo --yes --skip-existing",
        ],
      },
    ],
  },

  exports: {
    title: "Exports to",
    lede: "evnx convert writes the file or commands each tool expects; you apply them.",
    targets: [
      { name: "Kubernetes Secret", format: "kubernetes", writes: "a v1 Secret, stringData (or data with --base64)", needs: "--name" },
      { name: "Terraform .tfvars", format: "terraform", writes: "NAME = \"value\" lines, or variable blocks with --terraform-declarations" },
      { name: "Docker Compose", format: "docker-compose", writes: "an environment: list, with $ written $$" },
      { name: "Doppler", format: "doppler", writes: "the flat JSON that doppler secrets upload reads" },
      { name: "Heroku", format: "heroku", writes: "one heroku config:set call, so the app restarts once", needs: "--heroku-app" },
      { name: "AWS Secrets Manager", format: "aws-secrets", writes: "the flat JSON create-secret --secret-string takes" },
      { name: "GCP Secret Manager", format: "gcp-secrets", writes: "a script that creates each secret or adds a version", needs: "--project" },
      { name: "Azure Key Vault", format: "azure-keyvault", writes: "an az keyvault secret set script", needs: "--vault-name" },
      { name: "Railway", format: "railway", writes: "the flat JSON object json prints", experimental: true },
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
