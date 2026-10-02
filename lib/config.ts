// ─── COMPATIBILITY SHIM — do not add anything here ───────────────────────────
//
// This file used to be the single source of truth. It is now a thin re-export
// of `@evnx/config`, kept so the six existing consumers keep compiling while
// they are migrated one at a time.
//
// ⚠️ Why it was replaced: it hardcoded `EVNX_VERSION = "0.4.0"` and the CLI
// reached 0.7.0 without anything noticing. The version now comes from
// `packages/config/src/versions.json`, which a script rewrites from the
// registries — so it cannot go stale by being forgotten.
//
// 👉 NEW CODE IMPORTS FROM `@evnx/config`. Delete a line below whenever its
//    last consumer moves over; the file goes away when they all have.

import {
  EVNX_VERSION as VERSION,
  MIN_SUPPORTED_VERSION,
  REPOS,
  REGISTRIES,
  GITHUB_REPO as REPO_SLUG,
  HOSTS,
  SITE,
  SOCIAL,
  INSTALL_CHANNELS,
  CANONICAL_INSTALL_SCRIPT,
} from "@evnx/config";

/** @deprecated Import `EVNX_VERSION` from `@evnx/config`. */
export const EVNX_VERSION = VERSION;
/** @deprecated Import `MIN_SUPPORTED_VERSION` from `@evnx/config`. */
export const EVNX_MIN_VERSION = MIN_SUPPORTED_VERSION;

/** @deprecated Import `GITHUB_REPO` from `@evnx/config`. */
export const GITHUB_REPO = REPO_SLUG;
/** @deprecated Use `REPOS.cli`. */
export const GITHUB_URL = REPOS.cli;
/** @deprecated Use `REPOS.discussions`. */
export const GITHUB_DISCUSSIONS_URL = REPOS.discussions;
/** @deprecated Use `REGISTRIES.crates`. */
export const CRATES_IO_URL = REGISTRIES.crates;
/** @deprecated Use `REGISTRIES.npm`. */
export const NPM_URL = REGISTRIES.npm;
/** @deprecated Use `REGISTRIES.pypi`. */
export const PYPI_URL = REGISTRIES.pypi;
/** @deprecated Use `REPOS.agentSkills`. */
export const AGENT_SKILLS_URL = REPOS.agentSkills;

/** @deprecated Use `HOSTS.api`. */
export const API_URL = HOSTS.api;
/** @deprecated Use `REPOS.server`. */
export const EVNX_SERVER_URL = REPOS.server;
/** @deprecated Use `REPOS.crypto`. */
export const EVNX_CRYPTO_URL = REPOS.crypto;
/** @deprecated Use `REGISTRIES.cratesCrypto`. */
export const EVNX_CRYPTO_CRATES_URL = REGISTRIES.cratesCrypto;
/** @deprecated Use `CANONICAL_INSTALL_SCRIPT`. */
export const INSTALL_SCRIPT_URL = CANONICAL_INSTALL_SCRIPT;

/** @deprecated Use `SITE.url`. */
export const SITE_URL = SITE.url;
/** @deprecated Use `SITE.name`. */
export const SITE_NAME = SITE.name;
/** @deprecated Use `SITE.tagline`. */
export const SITE_TAGLINE = SITE.tagline;
/** @deprecated Use `SITE.description`. */
export const SITE_DESCRIPTION = SITE.description;
/** @deprecated Use `SOCIAL.twitter`. */
export const TWITTER_HANDLE = SOCIAL.twitter;

const channel = (id: string) =>
  INSTALL_CHANNELS.find((c) => c.id === id)?.command ?? "";

/**
 * @deprecated Use `INSTALL_CHANNELS` / `FEATURED_CHANNELS` from `@evnx/config`,
 * which carry the registry URL and the per-channel caveat alongside the command.
 */
export const INSTALL_COMMANDS = {
  macos: channel("curl"),
  linux: channel("curl"),
  windows: channel("winget"),
  npm: channel("npm"),
  // ⚠️ `cargo install evnx` builds from source with `default = []`, so it has
  // no cloud commands. `INSTALL_CHANNELS` ships the `--features cloud` form,
  // which is why these three now resolve to the same correct string.
  cargo: channel("cargo"),
  cargoFull: "cargo install evnx --features full",
  cargoCloud: channel("cargo"),
} as const;
