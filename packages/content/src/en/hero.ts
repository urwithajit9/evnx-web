// ─── Hero ─────────────────────────────────────────────────────────────────────
//
// 👉 THE TAGLINE LIVES HERE. Edit `headline` and `subhead` and nothing else
//    needs to change — the hero component reads this file and only this file.

import type { Link, TerminalLine } from "../types";

export const hero = {
  /**
   * The H1, as two lines. Rendered as `line1<br>line2` so the break is a
   * deliberate typographic choice rather than whatever the viewport decides.
   *
   * Alternatives considered — swap in by editing these two strings:
   *   • "Secrets leak in minutes." / "Catch them in milliseconds."   ← current
   *   • "Your .env is one commit" / "away from being public."
   *   • "Stop leaking secrets." / "Start shipping."
   *   • "The .env file is the" / "last unguarded door."
   */
  headline: {
    line1: "Secrets leak in minutes.",
    line2: "Catch them in milliseconds.",
  },

  /**
   * One paragraph. Says what it is, where it runs, and nothing else.
   * ⚠️ Resist adding a third clause — every one costs a reader.
   */
  subhead:
    "evnx is an open-source Rust CLI that scans, validates and syncs your .env files — on your machine, at commit time, and in CI.",

  /** Links under the install box. Keep to three; the middle one is the ask. */
  secondaryLinks: [
    { label: "Five-minute quick start", href: "", external: false },
  ] as Link[],

  /** Plain text beside the links. Short facts, no punctuation at the end. */
  reassurance: ["MIT licensed", "No account needed"],

  /**
   * The terminal transcript beside the hero.
   *
   * ⚠️ This must be a transcript evnx can actually produce. The earlier
   * mockups invented a "scanned in 4 ms" figure and invented rule IDs; both
   * are gone because they are the one kind of claim a reader can falsify by
   * running the tool.
   *
   * Lines below are from `evnx scan <staged files>` (the `evnx-scan` hook's
   * entry) on the 0.10.18 release binary, 2026-10-25, abridged. The previews
   * are of throw-away values generated for the run.
   */
  terminal: {
    tabs: ["pre-commit", "doctor", "convert"],
    lines: [
      { type: "prompt", content: 'git commit -m "fix: payment retry"' },
      { type: "dim", content: "evnx — Secret Scanner.....................Failed" },
      { type: "dim", content: "  evnx scan  scanning .env.production, src/config.ts, src/index.ts" },
      { type: "output", content: "" },
      { type: "error", content: "✗  AWS Access Key                  high" },
      { type: "dim", content: "   .env.production:4 (AWS_ACCESS_KEY_ID)  AKIA…CZ4K" },
      { type: "error", content: "✗  Stripe Secret Key (LIVE)        high" },
      { type: "dim", content: "   src/config.ts:12  sk_l…aQNj" },
      { type: "output", content: "" },
      { type: "error", content: "2 findings  ·  2 high" },
      { type: "dim", content: "1. Revoke or rotate the keys above — assume they are compromised" },
    ] as TerminalLine[],
  },

  /**
   * The proof strip under the hero.
   *
   * ⚠️ `downloads` renders only when the registry sync has produced a real
   * number — see `hasDownloadCounts()` in @evnx/config. An omitted figure is
   * fine; a fabricated one is not, and "0 downloads" is worse than both.
   */
  proof: {
    downloadsTemplate: "{count} downloads across crates.io, npm and PyPI",
    channelsTemplate: "{count} install channels",
    /** Rendered from `LATEST_TALK` in @evnx/config, which holds the facts. */
    showTalk: true,
  },
} as const;
