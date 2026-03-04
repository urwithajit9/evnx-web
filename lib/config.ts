// ─── evnx Single Source of Truth ──────────────────────────────────────────────
// Never hardcode version numbers or URLs elsewhere. Pull from here.

export const EVNX_VERSION = "0.2.0";
export const EVNX_MIN_VERSION = "0.1.0";

export const GITHUB_REPO = "urwithajit9/evnx";
export const GITHUB_URL = "https://github.com/urwithajit9/evnx";
export const GITHUB_DISCUSSIONS_URL =
  "https://github.com/urwithajit9/evnx/discussions";
export const CRATES_IO_URL = "https://crates.io/crates/evnx";

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
  windows: `winget install evnx`,
  cargo: `cargo install evnx`,
  cargoFull: `cargo install evnx --features full`,
} as const;

export const EVNX_COMMANDS = [
  "init",
  "validate",
  "scan",
  "diff",
  "convert",
  "sync",
  "add",
  "migrate",
  "doctor",
  "template",
  "backup",
  "restore",
] as const;
