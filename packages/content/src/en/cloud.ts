// ─── §6 · Cloud ───────────────────────────────────────────────────────────────
//
// ⚠️ THIS SECTION DESCRIBES A SHIPPED PRODUCT.
//
// The previous copy said "coming soon" and offered a waitlist form across
// sixteen places on the site, for a feature that went live in v0.4.0 and has
// been through four releases since. The CTA is an account, not an email box.

import type { Card, SectionHeading } from "../types";

export const cloud: SectionHeading & {
  pills: string[];
  capabilities: Card[];
  cta: { primary: string; secondary: string; secondaryDocsSlug: string };
  freeTierNote: string;
} = {
  eyebrow: "Included on the free tier",
  heading: "Your .env, on every machine. Encrypted before it leaves this one.",
  lede: "Zero-knowledge sync. The server stores ciphertext and holds no key that opens it.",

  pills: ["live", "free tier included"],

  capabilities: [
    {
      id: "push-pull",
      title: "Push and pull, byte for byte",
      body: "What you pull is what you pushed — the version number is authenticated into the ciphertext, so a server cannot replay an old one as current.",
    },
    {
      id: "share",
      title: "Share with a teammate",
      body: "The vault key is wrapped for each member with a hybrid X25519 + ML-KEM-768 scheme, so a share stays sealed even against a future quantum attacker.",
    },
    {
      id: "ci",
      title: "No file in CI",
      body: "evnx cloud run injects secrets straight into a subprocess. Nothing is written to disk and nothing appears in the process arguments.",
    },
  ],

  cta: {
    primary: "Create a free account",
    secondary: "How the encryption works",
    secondaryDocsSlug: "reference/cloud-architecture",
  },

  /** Rendered with real numbers from `@evnx/config` plan limits — never typed. */
  freeTierNote:
    "Free includes {vaults} vaults, {versions} versions each and {tokens} API tokens. No card required.",
};
