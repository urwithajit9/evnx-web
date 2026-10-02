"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import {
  PLANS,
  annualPrice,
  annualSavingLabel,
  fillLimits,
  formatPrice,
  formatPriceWithSuffix,
  priceSuffix,
  type PlanId,
} from "@evnx/config";
import { pricing } from "@evnx/content";

/**
 * The three plan cards.
 *
 * ⚠️ Structure, prices, limits and CTA targets come from `@evnx/config`; the
 * words come from `@evnx/content`, joined on `id`. Nothing commercial is typed
 * into this file — a price here would be a fourth copy of a number that is
 * already in Paddle, the server and the config.
 */
export function PlanCards() {
  const [annual, setAnnual] = useState(false);

  // ⚠️ Joined, not zipped. Config order is the source of truth for display
  // order, and a plan with no copy is a visible gap rather than a silent drop.
  const cards = PLANS.map((plan) => ({
    plan,
    copy: pricing.plans.find((c) => c.id === plan.id),
  }));

  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-12">
        <ToggleButton on={!annual} onClick={() => setAnnual(false)}>
          {pricing.annualToggle.monthly}
        </ToggleButton>
        <ToggleButton on={annual} onClick={() => setAnnual(true)}>
          {pricing.annualToggle.annual}
          <span className="ml-2 font-mono text-xs text-success">
            {annualSavingLabel()}
          </span>
        </ToggleButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
        {cards.map(({ plan, copy }) => {
          if (!copy) return null;
          const free = plan.price.amount === 0;
          const price = annual && !free ? annualPrice(plan.id) : plan.price;

          return (
            <div
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative bg-bg-base border-2 border-brand-500 rounded-lg p-8"
                  : "relative bg-bg-surface border border-border-muted rounded-lg p-8"
              }
            >
              {plan.highlighted && copy.ribbon && (
                <div className="absolute -top-3 left-4">
                  <Badge variant="brand">{copy.ribbon}</Badge>
                </div>
              )}

              {/* ⚠️ h2, not h3. The page goes h1 → plan names → h2 for the
                  limits and FAQ sections, so h3 here skipped a level. Each
                  plan is a top-level section of this page. The size comes
                  from the class, so nothing moves visually. */}
              <h2 className="text-2xl font-serif font-bold mb-2">{copy.name}</h2>
              <p className="text-text-secondary mb-6 text-sm leading-relaxed min-h-[3rem]">
                {copy.tagline}
              </p>

              <div className="mb-1">
                <span className="text-4xl font-serif font-bold">
                  {formatPrice(price)}
                </span>
                {!free && (
                  <span className="text-base text-text-secondary font-mono font-normal">
                    {priceSuffix(price)}
                  </span>
                )}
              </div>

              {/* ⚠️ Derived from the monthly figure, never written twice — an
                  annual price that contradicts the monthly one beside it is
                  the fastest way to lose a buyer's trust on a pricing page. */}
              <p className="text-xs text-text-muted font-mono mb-6 h-4">
                {!free && annual && `${formatPriceWithSuffix(plan.price)} billed monthly`}
                {!free && !annual && `${formatPrice(annualPrice(plan.id))}/user/year if annual`}
              </p>

              <Button
                className="w-full mb-8"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <a
                  href={plan.cta.href}
                  {...(plan.cta.external
                    ? { rel: "noopener", target: "_self" }
                    : {})}
                >
                  {copy.ctaLabel}
                </a>
              </Button>

              <ul className="space-y-3 text-sm">
                {copy.features.map((raw) => (
                  <li key={raw} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 text-success flex-shrink-0 mt-0.5"
                      aria-hidden
                    />
                    {/* Numbers come from the server's own quotas. */}
                    <span>{fillLimits(raw, plan.id as PlanId)}</span>
                  </li>
                ))}
              </ul>

              {copy.footnote && (
                <p className="mt-6 pt-6 border-t border-border-muted text-xs text-text-muted leading-relaxed">
                  {copy.footnote}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ToggleButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        "px-4 py-2 rounded-md text-sm font-medium transition-colors border " +
        (on
          ? "bg-bg-surface border-brand-500 text-text-primary"
          : "border-border-muted text-text-secondary hover:text-text-primary")
      }
    >
      {children}
    </button>
  );
}
