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
    { type: "prompt", content: "evnx scan" },
    { type: "dim", content: "scanning ./.env, ./.env.local, ./.env.production and 1 other file" },
    { type: "output", content: "" },
    { type: "error", content: "✗  Credentials in a connection string   high" },
    { type: "dim", content: "   ./.env.local:1 (DATABASE_URL)  post…5432" },
    { type: "error", content: "✗  AWS Access Key                       high" },
    { type: "dim", content: "   ./.env.production:2 (AWS_ACCESS_KEY_ID)  AKIA…2EPF" },
    { type: "error", content: "✗  Stripe Secret Key (LIVE)             high" },
    { type: "dim", content: "   ./.env.production:3 (STRIPE_SECRET_KEY)  sk_l…cUyk" },
    { type: "output", content: "" },
    { type: "dim", content: "3 findings  ·  3 high" },
  ],

  /**
   * ⚠️ Exit codes are a contract with every pipeline that branches on them.
   * Checked against `evnx scan --help` and a run of the 0.10.18 release binary
   * (2026-10-25): 0 nothing at or above --severity, 1 findings, 2 could not run.
   * An earlier version of this table said critical → 2 and warning → 1, which
   * scan has never done. Do not guess one.
   */
  severities: [
    { level: "high", meaning: "A live key format, or a password inside a connection string.", exitCode: 1 },
    { level: "medium · low", meaning: "Risky but not proof. --severity high leaves these out of the report and the exit code.", exitCode: 1 },
    { level: "clean", meaning: "Nothing at or above --severity. Safe to let the pipeline continue.", exitCode: 0 },
    { level: "no verdict", meaning: "The scan could not run — a bad path, flag or config. Never reported as clean.", exitCode: 2 },
  ],

  note: "It reads .env.production, .env.local and every other dotted variant — not just .env. The variant people forget is usually the one holding production. Values are shown only as a short preview, never whole.",
};
