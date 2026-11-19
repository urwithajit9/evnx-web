// ─── Docs cards: where to go next ────────────────────────────────────────────
//
// DESIGN-BRIEF §4.10. Each slug is a real guide under packages/docs-content/
// guides (checked when this was written); the copy summarises that guide's own
// excerpt rather than promising more than it covers.

import type { SectionHeading } from "../types";

export interface DocsCard {
  title: string;
  body: string;
  /** Under the docs root, e.g. "getting-started/quick-start". */
  docsSlug: string;
}

export const docs: SectionHeading & { cards: DocsCard[] } = {
  eyebrow: "Documentation",
  heading: "Start in the docs",
  lede: "Every command, flag and exit code, with output from a real run.",
  cards: [
    {
      title: "Getting started",
      body: "Five minutes from install to your first check, scan and validate on a real .env.",
      docsSlug: "getting-started/quick-start",
    },
    {
      title: "Secret scanning",
      body: "A layered defence: a baseline for existing findings, a pre-commit hook and a CI gate.",
      docsSlug: "use-cases/prevent-secret-leaks",
    },
    {
      title: "CI integration",
      body: "Block pull requests on findings and put them in the Security tab with SARIF.",
      docsSlug: "integrations/github-actions",
    },
    {
      title: "Cloud vaults",
      body: "From no account to a .env pulled byte for byte on a second machine.",
      docsSlug: "getting-started/cloud-sync-quickstart",
    },
    {
      title: "Deployment",
      body: "A scoped API token in the pipeline, and exactly what a runner can and cannot do with it.",
      docsSlug: "integrations/ci-cd-cloud-tokens",
    },
    {
      title: "CLI reference",
      body: "One page per command: every flag, every exit code.",
      docsSlug: "commands",
    },
  ],
};
