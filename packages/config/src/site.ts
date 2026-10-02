// ─── Hosts and cross-property links ───────────────────────────────────────────
//
// Every link that leaves the current page goes through this file. That is what
// makes the docs split a configuration change instead of a find-and-replace
// across 80 MDX files.
//
// ⚠️ Nothing below may be inlined at a call site. A hostname typed into a
// component is a hostname that will still be there after the split.

/** Where each evnx property lives. One entry per origin, no exceptions. */
export const HOSTS = {
  /** Marketing + pricing. Anonymous-only — ADR-1. */
  web: "https://evnx.dev",
  /** Documentation. Does not exist yet; see DOCS_MODE below. */
  docs: "https://docs.evnx.dev",
  /** The product. Sessions, vaults, billing. ADR-1. */
  app: "https://app.evnx.dev",
  /** The API. Also the Paddle webhook target. */
  api: "https://api.evnx.dev",
  /** Sister site: vendor-neutral `.env` reference. Not an evnx property. */
  dotenvSpace: "https://dotenv.space",
} as const;

export type HostKey = keyof typeof HOSTS;

/**
 * ⚠️ THE SPLIT SWITCH.
 *
 * `"inline"`  — docs are served from evnx.dev/guides/* (today).
 * `"split"`   — docs are served from docs.evnx.dev/cli/* (after P2/P3).
 *
 * Flipping this repoints every documentation link in both apps. Flip it only
 * once `docs.evnx.dev` answers for every URL in `docs/migration/url-inventory.csv`
 * — P3.3 in the schedule — because a link that 404s is worse than one that
 * redirects.
 *
 * Settable per-deploy so a Netlify preview can run `split` while production
 * still runs `inline`.
 */
export const DOCS_MODE: "inline" | "split" =
  (process.env.NEXT_PUBLIC_DOCS_MODE as "inline" | "split") ?? "inline";

/** Path prefix docs live under, per mode. `/guides` today, `/cli` after. */
const DOCS_PREFIX = { inline: "/guides", split: "/cli" } as const;

/** Origin docs are served from, per mode. */
const DOCS_ORIGIN = { inline: HOSTS.web, split: HOSTS.docs } as const;

/**
 * Link to a documentation page by its **stable slug** — the part after the
 * prefix, e.g. `"getting-started/quick-start"`.
 *
 *   docsUrl("commands/scan")  →  /guides/commands/scan            (inline)
 *                             →  https://docs.evnx.dev/cli/commands/scan  (split)
 *
 * Returns a relative path while docs are inline, so Next renders a client-side
 * navigation rather than a full page load. Absolute once they move hosts.
 */
export function docsUrl(slug: string): string {
  const clean = slug.replace(/^\/+/, "").replace(/\/+$/, "");
  const path = clean ? `${DOCS_PREFIX[DOCS_MODE]}/${clean}` : DOCS_PREFIX[DOCS_MODE];
  return DOCS_MODE === "inline" ? path : `${DOCS_ORIGIN[DOCS_MODE]}${path}`;
}

/** Link into the product. Always absolute — a different origin by design. */
export function appUrl(path = "/"): string {
  return `${HOSTS.app}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Link to an API route. Used for docs examples, never for client fetches. */
export function apiUrl(path = "/"): string {
  return `${HOSTS.api}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── Identity ─────────────────────────────────────────────────────────────────

export const SITE = {
  name: "evnx",
  /**
   * ⚠️ Shown in <title>, OG cards, and the footer. Edit here and nowhere else.
   * Wording is content, not configuration — but it is *structural* content, so
   * it lives with the thing it describes. Section copy is in @evnx/content.
   */
  tagline: "Catch secrets before they ship.",
  description:
    "Open-source Rust CLI that scans, validates and syncs your .env files — on your machine, at commit time, and in CI. Zero-knowledge encrypted cloud sync.",
  locale: "en",
  /** Canonical origin. Overridable so previews self-canonicalise correctly. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? HOSTS.web,
} as const;

/**
 * The canonical install URL.
 *
 * ⚠️ `dotenv.space/install.sh` must keep returning **200**, not a redirect —
 * copied `curl` commands frequently omit `-L`. Both URLs are proxied to the
 * same source file; see schedule P5.
 */
export const INSTALL_SCRIPT_URL = `${HOSTS.web}/install.sh`;
export const INSTALL_SCRIPT_URL_LEGACY = `${HOSTS.dotenvSpace}/install.sh`;
