// ─── Timelines ────────────────────────────────────────────────────────────────
//
// 👉 BOTH STORIES LIVE HERE. Reorder, rewrite or cut entries by editing the
//    arrays below — the renderers take whatever length they are given.
//
// There are two, and they do different jobs:
//
//   `leakAnatomy`  — a generic leak, with a side-by-side "what evnx changes".
//                    This is the landing page's §2. It argues the problem.
//   `originStory`  — the maintainer's own incident, the night evnx started.
//                    This is the About / origin section. It argues the motive.
//
// Do not merge them. The first must be true of the reader; the second must be
// true of the author.

import type { TimelineEntry } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// §2 — Anatomy of a leak
// ─────────────────────────────────────────────────────────────────────────────

export const leakAnatomy = {
  heading: "Anatomy of a 22-minute leak",
  lede: "A real key, in a real repository, with the clock running.",

  toggle: { without: "Without evnx", with: "With evnx" },

  /**
   * ⚠️ VERIFY BEFORE LAUNCH.
   *
   * "22 minutes" and the charge that follows are presented as an observed
   * sequence. Either cite the source (GitGuardian and Truffle Security both
   * publish time-to-exploit figures for leaked keys) or soften to "minutes".
   * An invented timing is the single easiest claim on this page to falsify,
   * and falsifying it costs the credibility of everything above it.
   */
  without: [
    {
      time: "00:00",
      level: "neutral",
      text: "A Stripe live key is pasted into .env.production",
      detail: "The file is gitignored. The copy in src/config.ts is not.",
    },
    {
      time: "00:04",
      level: "bad",
      text: "Committed and pushed",
      detail: "Nothing objects. The pull request looks ordinary.",
    },
    {
      time: "00:09",
      level: "bad",
      text: "Scraped",
      detail: "Automated crawlers index new public commits within minutes.",
    },
    {
      time: "00:22",
      level: "bad",
      text: "First unauthorised charge",
      detail: "Rotating the key now does not undo it.",
    },
  ] as TimelineEntry[],

  /** The same clock, with the hook installed. Ends at 00:04 on purpose. */
  with: [
    {
      time: "00:00",
      level: "neutral",
      text: "A Stripe live key is pasted into .env.production",
      detail: "Same mistake. Nothing about evnx prevents the paste.",
    },
    {
      time: "00:04",
      level: "good",
      text: "Commit blocked by the pre-commit hook",
      detail: "src/config.ts:12 — STRIPE_SECRET_KEY, sk_live_••••EF2k",
    },
    {
      time: "00:04",
      level: "good",
      text: "Nothing left the machine",
      detail: "No push, no scrape, no rotation, no incident review.",
    },
  ] as TimelineEntry[],

  /** The line under the comparison. One sentence, no exclamation mark. */
  conclusion:
    "The difference is four seconds of tooling against a key you now have to assume is public.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Origin story — the maintainer's own incident
// ─────────────────────────────────────────────────────────────────────────────

export const originStory = {
  eyebrow: "Why this exists",
  heading: "It started at 23:47 on a Tuesday.",

  /**
   * ⚠️ THESE FIGURES ARE THE AUTHOR'S OWN AND MUST STAY EXACT.
   *
   * $847, 3h 34m 57s, the three regions. If any of them is approximate, say
   * "roughly" rather than quoting a precise number — a precise number invites
   * a reader to treat the whole section as a record.
   *
   * `AKIAIOSFODNN7EXAMPLE` is AWS's own published example key id. It is used
   * deliberately so no real credential, even a dead one, appears on the site.
   */
  entries: [
    {
      time: "23:47:03",
      level: "neutral",
      text: "git push origin main",
      detail: "3 files changed, 47 insertions",
    },
    {
      time: "23:47:41",
      level: "warn",
      text: 'GitHub email: "Possible secret detected"',
      detail: "AWS credentials found in .env",
    },
    {
      time: "23:48:12",
      level: "bad",
      text: "AWS key auto-revoked",
      detail: "IAM credential AKIAIOSFODNN7EXAMPLE invalidated by AWS",
    },
    {
      time: "00:03:19",
      level: "bad",
      text: "PagerDuty: 3 services unreachable",
      detail: "api-gateway · worker-queue · cron-service",
    },
    {
      time: "00:04:02",
      level: "bad",
      text: "Incoming call: development lead",
      detail: "Duration: 00:08:44 — the most uncomfortable of my career",
    },
    {
      time: "00:09:37",
      level: "warn",
      text: "EC2 instances spun up in three regions",
      detail: "Cryptocurrency mining — estimated cost: $847",
    },
    {
      time: "03:22:00",
      level: "good",
      text: "Services restored, credentials rotated",
      detail: "Incident duration: 3h 34m 57s",
    },
    {
      time: "03:23:00",
      level: "good",
      text: "Started writing evnx",
      detail: "So this never happens again",
    },
  ] as TimelineEntry[],

  /** The callout that closes the section. */
  resolution: {
    heading: "Every check in evnx exists because something went wrong first.",
    body: "No feature here was designed in the abstract. The scanner looks for what actually leaked; the validator catches what actually broke production.",
  },
} as const;
