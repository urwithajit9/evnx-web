// ─── evnx Single Source of Truth ──────────────────────────────────────────────
// Never hardcode version numbers or URLs elsewhere. Pull from here.

export const EVNX_VERSION = "0.4.0";
export const EVNX_MIN_VERSION = "0.1.0";

export const GITHUB_REPO = "urwithajit9/evnx";
export const GITHUB_URL = "https://github.com/urwithajit9/evnx";
export const GITHUB_DISCUSSIONS_URL =
  "https://github.com/urwithajit9/evnx/discussions";
export const CRATES_IO_URL = "https://crates.io/crates/evnx";
// The published package is @evnx/cli. The bare `evnx` name also exists on the
// registry but has no versions and no maintainers, so the old link led nowhere.
export const NPM_URL = "https://www.npmjs.com/package/@evnx/cli";
export const PYPI_URL = "https://pypi.org/project/evnx/";
export const AGENT_SKILLS_URL = "https://github.com/urwithajit9/agent-skills";

// ─── Cloud sync (new in 0.4.0) ──────────────────────────────────────────────
export const API_URL = "https://api.evnx.dev";
export const EVNX_SERVER_URL = "https://github.com/urwithajit9/evnx-server";
export const EVNX_CRYPTO_URL = "https://github.com/urwithajit9/evnx-crypto";
export const EVNX_CRYPTO_CRATES_URL = "https://crates.io/crates/evnx-crypto";

export const INSTALL_SCRIPT_URL = "https://dotenv.space/install.sh";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://evnx.dev";
export const SITE_NAME = "evnx";
export const SITE_TAGLINE = "The .env tool for developers who've been there.";
export const SITE_DESCRIPTION =
  "Rust-powered CLI for validating, scanning, converting, and securing your environment files — before they become incidents.";

export const TWITTER_HANDLE = "@urwithajit9";

export const INSTALL_COMMANDS = {
  macos: `curl -fsSL ${INSTALL_SCRIPT_URL} | bash`,
  linux: `curl -fsSL ${INSTALL_SCRIPT_URL} | bash`,
  // Full package id: the winget manifest declares no Moniker, so a bare
  // `winget install evnx` falls back to name matching and can prompt for
  // disambiguation. `urwithajit9.evnx` always resolves.
  windows: `winget install urwithajit9.evnx`,
  npm: `npm install -g @evnx/cli`,
  cargo: `cargo install evnx`,
  cargoFull: `cargo install evnx --features full`,
  // `full` is ["migrate", "backup"] and deliberately does NOT include `cloud`,
  // so `cargoFull` yields a binary with no auth/vault/cloud commands. crates.io
  // is the only channel that needs this flag — the prebuilt binaries on
  // Homebrew, Scoop, npm, PyPI and the GitHub Release are built with
  // --all-features and already contain them.
  cargoCloud: `cargo install evnx --features cloud`,
} as const;

// `EVNX_COMMANDS` and `EVNX_CLOUD_COMMANDS` were removed in v0.5.0. They were
// exported, had no consumer anywhere in the app, and had already drifted — the
// list was missing `spec`, so wiring it up to render a command index would have
// shipped an incomplete one.
//
// If a command index is wanted, build it from the guides' own frontmatter, which
// is verified against the binary on every release. A hand-maintained array is a
// second source of truth that nothing forces anyone to update.
