// ─── Analytics ────────────────────────────────────────────────────────────────
//
// ⚠️ Marketing analytics run on `evnx.dev` ONLY.
//
// SPEC §13 and ADR-1: no third-party scripts on `app.evnx.dev`, because that is
// the origin where master keys live in a Web Worker and access tokens live in
// memory. Any script added here must be checked against that boundary first.

export const ANALYTICS = {
  provider: "umami" as const,
  /** Self-hosted. Proxied through /stats to survive ad blockers. */
  host: "https://analytics.dotenv.space",
  /** The rewrite path in next.config — must match it. */
  proxyPath: "/stats",
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? "",
  /** Disabled unless a website id is configured, so previews stay clean. */
  get enabled(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);
  },
} as const;

/**
 * UTM tags for links out to the sister site, so the funnel is measurable.
 * `dotenv.space` → `evnx.dev` traffic is invisible without these.
 */
export function withUtm(
  url: string,
  { source, medium = "referral", campaign }: { source: string; medium?: string; campaign: string },
): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}
