// ─── Pricing copy ─────────────────────────────────────────────────────────────
//
// The WORDS. The numbers, limits and checkout targets are in
// `@evnx/config/plans` and join on `id`. Editing a feature bullet must never
// risk touching a price.
//
// ⚠️ `evnx.dev/pricing` is public and anonymous — ADR-1. Every "Upgrade"
// button leaves for `app.evnx.dev`. No sign-in form and no payment script on
// this origin, ever.

import type { Faq, SectionHeading } from "../types";

export interface PlanCopy {
  /** Must match a `PlanId` in @evnx/config. */
  id: "free" | "team" | "enterprise";
  name: string;
  /** One line under the name. */
  tagline: string;
  ctaLabel: string;
  /** Bullets. Start each with a verb or a noun, never "You get". */
  features: string[];
  /** Small print under the button. */
  footnote?: string;
  /** Ribbon text when the plan is highlighted in @evnx/config. */
  ribbon?: string;
}

export const pricing: SectionHeading & {
  plans: PlanCopy[];
  annualToggle: { monthly: string; annual: string };
  /** Shown beside the limits table, generated from real server numbers. */
  limitsNote: string;
  faq: Faq[];
} = {
  heading: "Priced like a tool, not a platform",
  lede: "The CLI is free and always will be. Cloud sync has a free tier with real, enforced limits — and a paid tier when you outgrow them.",

  annualToggle: { monthly: "Monthly", annual: "Annual" },

  plans: [
    {
      id: "free",
      name: "Free",
      tagline: "The whole CLI, and enough cloud for one person.",
      ctaLabel: "Create a free account",
      features: [
        "Every CLI command — scan, validate, convert, doctor",
        "Open source, MIT licensed",
        "Zero-knowledge encrypted cloud sync",
        "{vaults} vaults, {versions} versions each",
        "{tokens} API tokens for CI",
        "{auditDays} days of audit history",
        "Community support",
      ],
      footnote: "No card required.",
    },
    {
      id: "team",
      name: "Team",
      tagline: "Shared vaults, unlimited history, per seat.",
      ctaLabel: "Upgrade to Team",
      ribbon: "Most popular",
      features: [
        "Everything in Free",
        "Unlimited vaults and version history",
        "Share a vault with your team, post-quantum wrapped",
        "Role-based access — owner, admin, member",
        "Automatic re-key when someone leaves",
        "{auditDays} days of audit history",
        "Unlimited API tokens",
        "Priority support",
      ],
      footnote: "Billed per user. Cancel any time.",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "For organisations that have to prove it, not just do it.",
      ctaLabel: "Talk to us",
      features: [
        "Everything in Team",
        "SAML single sign-on",
        "Unlimited audit retention",
        "Invoiced annually",
        "Self-hosting support",
      ],
      // ⚠️ SSO and unlimited retention are NOT built yet (see CLAUDE.md P4 /
      // P6). This footnote is what keeps the tier from being a false promise.
      // Remove it only when both ship.
      footnote: "SSO and extended retention are on the roadmap — talk to us about timing before you buy.",
    },
  ],

  limitsNote:
    "These limits are what the API enforces today, read from the server rather than written here.",

  faq: [
    {
      q: "Is the CLI really free?",
      a: "Yes, and it stays free. It is MIT licensed and it works entirely offline — scanning, validating and converting never contact a server. Only cloud sync has an account attached.",
    },
    {
      q: "What happens when I hit a free-tier limit?",
      a: "The command tells you which limit you reached and what to do about it. Nothing is deleted and nothing silently stops working.",
    },
    {
      q: "Can you read my secrets if I pay you nothing, or if I pay you a lot?",
      a: "Neither. The server stores ciphertext and has no key that opens it. That is a property of the design, not of your plan.",
    },
    {
      q: "What if I stop paying?",
      a: "Your data stays yours. evnx cloud export writes every version of every vault to disk in plain .env form, and it works regardless of plan state.",
    },
    {
      q: "Do you offer a discount for open-source projects?",
      a: "Yes. Get in touch and tell us what you are building.",
    },
  ],
};
