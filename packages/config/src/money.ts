// ─── Money ────────────────────────────────────────────────────────────────────
//
// ⚠️ Prices are stored in **minor units** (cents) and formatted on render.
//
// A price written as the string `"$9"` cannot be compared, discounted,
// converted, or localised — and it ends up duplicated in the pricing page, the
// landing page, the OG image, the FAQ and the docs, where four of the five go
// stale on the first change. One integer, one formatter.

export type Currency = "USD";

export interface Price {
  /** Minor units. `900` is $9.00. `0` is free. */
  amount: number;
  currency: Currency;
  /** What one unit of `amount` buys. Drives the "/user/month" suffix. */
  per: "seat-month" | "seat-year" | "month" | "year" | "once";
}

const SYMBOL: Record<Currency, string> = { USD: "$" };

/** `{ amount: 900 }` → `"$9"`. Whole amounts drop the `.00`; $9.50 keeps it. */
export function formatPrice(price: Price, locale = "en-US"): string {
  const major = price.amount / 100;
  const whole = Number.isInteger(major);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(major);
}

/** The suffix shown beside a price: `"/user/month"`, `"/month"`, `""`. */
export function priceSuffix(price: Price): string {
  switch (price.per) {
    case "seat-month":
      return "/user/month";
    case "seat-year":
      return "/user/year";
    case "month":
      return "/month";
    case "year":
      return "/year";
    case "once":
      return "";
  }
}

/** `"$9/user/month"`. The one function copy should call. */
export function formatPriceWithSuffix(price: Price, locale = "en-US"): string {
  return price.amount === 0
    ? formatPrice(price, locale)
    : `${formatPrice(price, locale)}${priceSuffix(price)}`;
}

/**
 * How many months of an annual plan are free.
 *
 * ⚠️ Change this and every annual price recomputes. Do not also hand-write the
 * annual numbers — `annualFrom()` derives them.
 */
export const ANNUAL_MONTHS_FREE = 2;

/** Monthly seat price → annual seat price, with the discount applied. */
export function annualFrom(monthly: Price): Price {
  return {
    amount: monthly.amount * (12 - ANNUAL_MONTHS_FREE),
    currency: monthly.currency,
    per: monthly.per === "seat-month" ? "seat-year" : "year",
  };
}

/** `"Save 17%"` — derived, so it can never contradict the prices beside it. */
export function annualSavingLabel(): string {
  const pct = Math.round((ANNUAL_MONTHS_FREE / 12) * 100);
  return `Save ${pct}%`;
}
