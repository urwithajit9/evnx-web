// ─── Versions and registry counts ─────────────────────────────────────────────
//
// ⚠️ NEVER type a version number into a component, a guide, or a meta tag.
//
// The old `lib/config.ts` hardcoded `EVNX_VERSION = "0.4.0"` and it was three
// releases stale within a month — the mockup review caught it on the live site.
// The number now comes from `versions.json`, which `scripts/sync-config.mjs`
// rewrites from crates.io / npm / PyPI. A human never edits it, so it cannot
// drift by being forgotten; it can only drift by nobody running the script,
// which CI reports.

import data from "./versions.json";

/** Current released CLI version, e.g. `"0.7.0"`. Never prefixed with `v`. */
export const EVNX_VERSION: string = data.cli;

/** Same, display-ready. Use this in copy so the `v` is never typed by hand. */
export const EVNX_VERSION_TAG = `v${data.cli}`;

/** evnx-crypto on crates.io. Referenced by the security pages. */
export const CRYPTO_VERSION: string = data.cryptoCrate;

/** `@evnx/crypto-wasm` on npm. Powers the browser client. */
export const WASM_VERSION: string = data.wasm;

/**
 * Oldest CLI release the current API still accepts.
 *
 * ⚠️ This is a server-side compatibility fact, not a marketing one. Raising it
 * breaks people. It is here so the docs can state it once.
 */
export const MIN_SUPPORTED_VERSION: string = data.minSupportedCli;

/**
 * Install counts across registries.
 *
 * ⚠️ `total` is `0` until the sync script has run against the live registries.
 * Render it through {@link hasDownloadCounts} — a proof strip that says
 * "0 downloads" is worse than one that omits the figure entirely, and an
 * invented number is the one claim a reader can falsify.
 */
export const DOWNLOADS = data.downloads;

/** True once real registry numbers exist. Gate the proof strip on this. */
export function hasDownloadCounts(): boolean {
  return DOWNLOADS.total > 0;
}

/** `"12,431"` — grouped for display. Returns `null` when there is nothing real to show. */
export function formatDownloads(locale = "en-US"): string | null {
  return hasDownloadCounts() ? DOWNLOADS.total.toLocaleString(locale) : null;
}

/** When the registry figures were last refreshed. `null` means never. */
export const VERSIONS_SYNCED_AT: string | null = data.syncedAt;
