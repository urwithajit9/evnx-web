// ─── Closing CTA ──────────────────────────────────────────────────────────────

export const cta = {
  heading: "Run your first audit in under a minute.",
  lede: "No account, no signup, no telemetry. Point it at a project you already have.",
  /** Primary is the install command itself — the lowest-commitment action. */
  primaryLabel: "Copy the install command",
  secondaryLabel: "Read the quick start",
  secondaryDocsSlug: "getting-started/quick-start",
  terminal: ["evnx scan", "evnx doctor"],
} as const;
