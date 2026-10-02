// ─── Plans: the commercial contract ───────────────────────────────────────────
//
// Structure, prices and limits live here. The *words* that describe a plan
// (display name, feature bullets, footnotes) live in `@evnx/content` and join
// on `id`. Editing marketing copy must never touch the file that encodes a
// billing contract.

import { appUrl } from "./site";
import { CONTACT } from "./social";
import { annualFrom, type Price } from "./money";
import limitsData from "./plan-limits.json";

/**
 * ⚠️ THESE THREE STRINGS ARE A HARD CONTRACT, not a label.
 *
 * They are:
 *   • the `Plan` enum in evnx-server `src/services/quota.rs`
 *   • the `CHECK (plan IN ('free','team','enterprise'))` constraint added by
 *     migration `008_accounts_have_a_plan.sql`
 *   • the value a Paddle webhook must resolve to
 *
 * Adding a tier means a server migration first. A fourth id invented here
 * would be rejected by `Plan::parse`, and then again by Postgres.
 */
export type PlanId = "free" | "team" | "enterprise";

/** What a plan allows. `null` means unlimited. Mirrors `PlanLimits` in Rust. */
export interface PlanLimits {
  vaults: number | null;
  versionsPerVault: number | null;
  apiTokens: number | null;
  auditRetentionDays: number | null;
}

export interface Plan {
  id: PlanId;
  /** Monthly price. `annual` is derived — never hand-write it. */
  price: Price;
  /** What the server will actually enforce. Generated; see plan-limits.json. */
  limits: PlanLimits;
  /** Where the primary button goes. */
  cta: { href: string; external: boolean };
  /** At most one plan is highlighted. */
  highlighted: boolean;
  /** Sharing, SSO and the rest — capability flags the page can branch on. */
  capabilities: {
    teamSharing: boolean;
    sso: boolean;
    prioritySupport: boolean;
    /** Invoiced annually rather than self-serve card checkout. */
    invoiceBilling: boolean;
  };
}

const limits = limitsData.plans as Record<PlanId, PlanLimits>;

/**
 * Checkout always leaves for `app.evnx.dev` — ADR-1.
 *
 * ⚠️ `evnx.dev` is anonymous-only. No session, no Paddle script, no payment
 * form on the marketing origin. This function is the only way a plan reaches
 * checkout, which is what keeps that rule enforced rather than remembered.
 */
export function checkoutUrl(plan: PlanId): string {
  return appUrl(`/billing?plan=${plan}`);
}

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    price: { amount: 0, currency: "USD", per: "month" },
    limits: limits.free,
    cta: { href: appUrl("/register"), external: true },
    highlighted: false,
    capabilities: {
      teamSharing: false,
      sso: false,
      prioritySupport: false,
      invoiceBilling: false,
    },
  },
  {
    id: "team",
    // $9.00 per seat per month. Decided 2026-10-02.
    price: { amount: 900, currency: "USD", per: "seat-month" },
    limits: limits.team,
    cta: { href: checkoutUrl("team"), external: true },
    highlighted: true,
    capabilities: {
      teamSharing: true,
      sso: false,
      prioritySupport: true,
      invoiceBilling: false,
    },
  },
  {
    id: "enterprise",
    // ⚠️ $29.00 per seat per month — PROVISIONAL. A public price was chosen
    // over "contact us" on 2026-10-02, but the figure was not. 29 is ~3.2× Team,
    // the usual enterprise multiple; 39 would be 4.3×, which reads as arbitrary
    // beside a $9 Team tier. Change this one integer to settle it.
    price: { amount: 2900, currency: "USD", per: "seat-month" },
    limits: limits.enterprise,
    // ⚠️ NOT `checkoutUrl()`. Enterprise is `invoiceBilling: true`, so a
    // self-serve card checkout is the wrong flow — and a button labelled
    // "Talk to us" that opens a payment page is a bait-and-switch even when
    // it is only an oversight. Sales, until an invoiced flow exists.
    cta: { href: `mailto:${CONTACT.sales}?subject=evnx%20Enterprise`, external: true },
    highlighted: false,
    capabilities: {
      teamSharing: true,
      sso: true,
      prioritySupport: true,
      invoiceBilling: true,
    },
  },
] as const;

export const PLANS_BY_ID: Record<PlanId, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
) as Record<PlanId, Plan>;

export function getPlan(id: PlanId): Plan {
  return PLANS_BY_ID[id];
}

/** The annual equivalent of a plan's monthly price, discount applied. */
export function annualPrice(id: PlanId): Price {
  return annualFrom(getPlan(id).price);
}

/** `3` → `"3"`, `null` → `"Unlimited"`. One place, so the word never varies. */
export function formatLimit(value: number | null, unlimited = "Unlimited"): string {
  return value === null ? unlimited : String(value);
}

/** Whether the generated limits came from the live API or are stale defaults. */
export const PLAN_LIMITS_SYNCED_AT: string | null = limitsData.syncedAt;

/**
 * Fill `{vaults}` / `{versions}` / `{tokens}` / `{auditDays}` in a copy string
 * with the plan's real limits.
 *
 * Content supplies the sentence, configuration supplies the numbers. That seam
 * is why a feature bullet can be reworded without anyone checking whether the
 * free tier still allows three vaults — and why changing the quota cannot
 * leave a stale number in prose.
 *
 * ⚠️ An unknown placeholder is left verbatim rather than blanked, so a typo
 * shows up as `{vauls}` on the page instead of a sentence with a hole in it.
 */
export function fillLimits(template: string, id: PlanId): string {
  const l = getPlan(id).limits;
  const values: Record<string, string> = {
    vaults: formatLimit(l.vaults, "Unlimited"),
    versions: formatLimit(l.versionsPerVault, "unlimited"),
    tokens: formatLimit(l.apiTokens, "unlimited"),
    auditDays: formatLimit(l.auditRetentionDays, "Unlimited"),
  };
  return template.replace(/\{(\w+)\}/g, (whole, key) => values[key] ?? whole);
}
