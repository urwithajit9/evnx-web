// ─── §3 · The audit ───────────────────────────────────────────────────────────

import type { SectionHeading, TerminalLine } from "../types";

export const audit: SectionHeading & {
  terminal: TerminalLine[];
  severities: { level: string; meaning: string; exitCode: number }[];
  note: string;
} = {
  heading: "It reads the file the way an attacker would",
  lede: "Entropy, known key shapes, and the variants people forget they have.",

  terminal: [
    { type: "prompt", content: "evnx scan --all" },
    { type: "dim", content: "scanning 4 files" },
    { type: "output", content: "" },
    { type: "error", content: "critical  .env.production:4   AWS_ACCESS_KEY_ID" },
    { type: "error", content: "critical  .env.production:7   STRIPE_SECRET_KEY" },
    { type: "warning", content: "warning   .env.local:2       DATABASE_URL contains a password" },
    { type: "warning", content: "warning   .env:11            JWT_SECRET is 8 characters" },
    { type: "output", content: "" },
    { type: "dim", content: "2 critical, 2 warnings across 4 files" },
  ],

  /**
   * ⚠️ Exit codes are a contract with every pipeline that branches on them.
   * Verified against the CLI before publishing. Do not guess one.
   */
  severities: [
    { level: "critical", meaning: "A live credential, or something shaped exactly like one.", exitCode: 2 },
    { level: "warning", meaning: "Risky but not proof — a weak value, a password inside a URL.", exitCode: 1 },
    { level: "clean", meaning: "Nothing found. Safe to let the pipeline continue.", exitCode: 0 },
  ],

  note: "It reads .env.production, .env.local and every other dotted variant — not just .env. The variant people forget is usually the one holding production.",
};
