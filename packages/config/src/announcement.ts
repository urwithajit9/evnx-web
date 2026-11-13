// ─── Site-wide announcement banner ────────────────────────────────────────────
//
// ONE entry drives the dismissible banner at the top of every evnx.dev page.
//
//   enabled   false = renders nothing at all. This is the default.
//   id        dismissal is remembered per id in localStorage. Change the id for
//             a new announcement and everyone who dismissed the old one sees it.
//   message   plain text. One sentence.
//   href      optional; an internal path ("/security/<slug>") or a full URL.
//   linkText  optional; the link label. Ignored without `href`.
//   severity  "info" (blue) or "action" (amber, for something users must do).
//
// ⚠️ THIS REPO IS PUBLIC and `main` deploys to evnx.dev. The message must not
// describe a vulnerability before the fix is deployed. See docs/ANNOUNCEMENTS.md.

export interface Announcement {
  id: string;
  enabled: boolean;
  message: string;
  href?: string;
  linkText?: string;
  severity: "info" | "action";
}

export const ANNOUNCEMENT: Announcement = {
  id: "security-2026-11",
  enabled: true,
  message:
    "Security update: evnx 0.14.0 fixes twelve issues in evnx cloud. CI that uses evnx cloud needs a new secret.",
  href: "/security/2026-11-security-update",
  linkText: "Read the notice",
  severity: "action",
};
