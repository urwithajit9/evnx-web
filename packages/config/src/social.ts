// ─── Social, authorship and talks ─────────────────────────────────────────────

export const SOCIAL = {
  twitter: "@urwithajit9",
  twitterUrl: "https://twitter.com/urwithajit9",
  github: "https://github.com/urwithajit9",
} as const;

/** Contact addresses. One place, so a change is one edit. */
export const CONTACT = {
  support: "support@evnx.dev",
  security: "security@evnx.dev",
  sales: "sales@evnx.dev",
  noreply: "noreply@evnx.dev",
} as const;

/**
 * Speaking history. Rendered on `/talks` with `VideoObject` structured data
 * and quoted in the landing page's proof strip.
 *
 * ⚠️ This is the one proof claim on the site that is verifiable by a third
 * party. Keep it exact — conference name, year and city as the organiser
 * published them.
 */
export interface Talk {
  title: string;
  event: string;
  year: number;
  city: string;
  country: string;
  url?: string;
  videoUrl?: string;
  slidesUrl?: string;
}

export const TALKS: readonly Talk[] = [
  {
    title: "Shipping a Rust CLI to nine channels",
    event: "Open Source Summit Korea",
    year: 2026,
    city: "Seoul",
    country: "KR",
  },
] as const;

/** The most recent talk, for the proof strip. `null` when there are none. */
export const LATEST_TALK: Talk | null = TALKS.length > 0 ? TALKS[0] : null;
