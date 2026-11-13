// ─── Security notices ─────────────────────────────────────────────────────────
//
// ⚠️ THIS REPO IS PUBLIC and `main` deploys to evnx.dev. An entry here, or an
// MDX body under apps/web/content/security/, is public the moment it is pushed
// to any branch. Do NOT commit a notice before the fix is released and
// deployed. See docs/ANNOUNCEMENTS.md.
//
// Only `published: true` entries render, appear in the sitemap or get a page.
// Newest first is the display order; it is sorted by `date`, not by position.

export type SecurityNoticeSeverity = "info" | "action-required";

export interface SecurityNotice {
  /** The URL segment and the MDX filename: apps/web/content/security/<slug>.mdx */
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  title: string;
  /** One or two sentences, shown in the list and in page metadata. */
  summary: string;
  severity: SecurityNoticeSeverity;
  /** false = invisible everywhere: no list entry, no page, no sitemap entry. */
  published: boolean;
}

export const securityNotices: SecurityNotice[] = [
  {
    slug: "2026-11-security-update",
    date: "2026-11-13",
    title: "Security update: November 2026",
    summary:
      "We fixed twelve issues in the evnx cloud server and CLI. Secrets were never readable by the server. Teams using evnx cloud in CI need evnx 0.14.0 and an EVNX_KEY_BUNDLE secret.",
    severity: "action-required",
    published: true,
  },
];

/** Published notices only, newest first. */
export function getPublishedSecurityNotices(): SecurityNotice[] {
  return securityNotices
    .filter((n) => n.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** A published notice by slug, or undefined (unpublished counts as absent). */
export function getPublishedSecurityNotice(slug: string): SecurityNotice | undefined {
  return getPublishedSecurityNotices().find((n) => n.slug === slug);
}
