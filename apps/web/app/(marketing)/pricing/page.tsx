import type { Metadata } from "next";
import { PlanCards } from "@/components/pricing/plan-cards";
import { pricing } from "@evnx/content";
import {
  PLAN_LIMITS_SYNCED_AT,
  SITE,
  docsUrl,
  getPlan,
  formatLimit,
} from "@evnx/config";

export const metadata: Metadata = {
  title: "Pricing",
  description: pricing.lede,
  alternates: { canonical: `${SITE.url}/pricing` },
};

/**
 * ⚠️ ADR-1: this page is PUBLIC AND ANONYMOUS.
 *
 * No session, no sign-in form, no payment script. Every upgrade button leaves
 * for `app.evnx.dev` via `checkoutUrl()` in `@evnx/config`, which is the only
 * way a plan reaches checkout — that is what keeps the rule enforced rather
 * than remembered.
 *
 * What this page replaced said "Cloud features coming soon", offered a
 * waitlist for a feature that shipped in v0.4.0, advertised a "Pro" tier the
 * server has no concept of, and had both paid buttons `disabled`.
 */
export default function PricingPage() {
  const free = getPlan("free").limits;

  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            {pricing.heading}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
            {pricing.lede}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base">
          <PlanCards />

          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-bg-surface border border-border-muted rounded-lg p-6">
              <h2 className="font-serif text-lg font-bold mb-2">
                What the free tier actually enforces
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {pricing.limitsNote}
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-sm">
                <Limit label="Vaults" value={formatLimit(free.vaults)} />
                <Limit label="Versions / vault" value={formatLimit(free.versionsPerVault)} />
                <Limit label="API tokens" value={formatLimit(free.apiTokens)} />
                <Limit
                  label="Audit history"
                  value={
                    free.auditRetentionDays === null
                      ? "Unlimited"
                      : `${free.auditRetentionDays} days`
                  }
                />
              </dl>
              {/* ⚠️ Says so out loud when the numbers are a committed fallback
                  rather than the live API's answer. A pricing page quietly
                  guessing at enforced limits is the exact failure this whole
                  config layer exists to prevent. */}
              {PLAN_LIMITS_SYNCED_AT === null && (
                <p className="mt-4 text-xs text-warning font-mono">
                  ⚠ Showing committed defaults — run{" "}
                  <code>npm run config:sync</code> against a deployed{" "}
                  <code>GET /api/v1/plans</code>.
                </p>
              )}
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-8">
              Questions people actually ask
            </h2>
            <dl className="space-y-6">
              {pricing.faq.map((item) => (
                <div
                  key={item.q}
                  className="border-b border-border-muted pb-6 last:border-0"
                >
                  <dt className="font-medium mb-2">{item.q}</dt>
                  <dd className="text-sm text-text-secondary leading-relaxed">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-16 text-center text-sm text-text-secondary">
            Not sure what the cloud tier gives you?{" "}
            <a
              className="text-brand-400 underline underline-offset-4"
              href={docsUrl("reference/cloud-architecture")}
            >
              Read how the encryption works
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-muted text-xs mb-1">{label}</dt>
      <dd className="text-text-primary text-lg">{value}</dd>
    </div>
  );
}
