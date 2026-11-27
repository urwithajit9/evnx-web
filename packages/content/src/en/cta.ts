// ─── Closing CTA ──────────────────────────────────────────────────────────────

export const cta = {
  heading: "Run your first audit in under a minute.",
  lede: "No account, no signup, no telemetry. Point it at a project you already have.",
  /** Primary is the install command itself — the lowest-commitment action. */
  primaryLabel: "Copy the install command",
  /**
   * D-V34 (2026-11-27): the docs cards section folded into the ending, as
   * three doors. The first is the quick start, which was the old secondary link.
   */
  docLinks: [
    { label: "Quick start", docsSlug: "getting-started/quick-start" },
    { label: "Every command", docsSlug: "commands" },
    { label: "Cloud sync", docsSlug: "getting-started/cloud-sync-quickstart" },
  ],
  terminal: ["evnx scan", "evnx doctor"],
} as const;
