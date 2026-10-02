// ─── Registries and install commands ──────────────────────────────────────────
//
// evnx ships to nine channels. Every one of them has a URL and a command, and
// both appear on the landing page, the install page, the docs and the README.
// They are listed once, here.

import { HOSTS, INSTALL_SCRIPT_URL, INSTALL_SCRIPT_URL_LEGACY } from "./site";

export const GITHUB_ORG = "urwithajit9";
export const GITHUB_REPO = `${GITHUB_ORG}/evnx`;

export const REPOS = {
  cli: `https://github.com/${GITHUB_REPO}`,
  server: `https://github.com/${GITHUB_ORG}/evnx-server`,
  crypto: `https://github.com/${GITHUB_ORG}/evnx-crypto`,
  agentSkills: `https://github.com/${GITHUB_ORG}/agent-skills`,
  discussions: `https://github.com/${GITHUB_REPO}/discussions`,
  issues: `https://github.com/${GITHUB_REPO}/issues`,
  releases: `https://github.com/${GITHUB_REPO}/releases`,
} as const;

export const REGISTRIES = {
  // ⚠️ The published npm package is `@evnx/cli`. The bare `evnx` name also
  // exists on the registry with no versions and no maintainers — linking it
  // sent people to an empty page.
  npm: "https://www.npmjs.com/package/@evnx/cli",
  crates: "https://crates.io/crates/evnx",
  cratesCrypto: "https://crates.io/crates/evnx-crypto",
  pypi: "https://pypi.org/project/evnx/",
  marketplace: `https://github.com/marketplace/actions/evnx-env-audit`,
} as const;

/**
 * ⚠️ FLIPS AT SCHEDULE P5.
 *
 * `evnx.dev/install.sh` does not exist yet; `dotenv.space/install.sh` is the
 * live one (a Netlify 200-proxy to the script in the CLI repo). P5 serves both
 * from one source and makes the evnx.dev URL canonical. Until then this must
 * point at the URL that actually answers — a hero section advertising a 404 is
 * the worst possible first impression.
 */
export const INSTALL_HOST: "evnx.dev" | "dotenv.space" =
  (process.env.NEXT_PUBLIC_INSTALL_HOST as "evnx.dev" | "dotenv.space") ??
  "dotenv.space";

export const CANONICAL_INSTALL_SCRIPT =
  INSTALL_HOST === "evnx.dev" ? INSTALL_SCRIPT_URL : INSTALL_SCRIPT_URL_LEGACY;

export interface InstallChannel {
  id: string;
  /** Tab label on the hero. Short — these sit in a row on mobile. */
  label: string;
  command: string;
  /** Where the package is published, for the "view on registry" link. */
  registryUrl?: string;
  /** Shown in the hero's install tabs. The rest live on /install. */
  featured: boolean;
  note?: string;
}

export const INSTALL_CHANNELS: readonly InstallChannel[] = [
  {
    id: "curl",
    label: "curl",
    command: `curl -fsSL ${CANONICAL_INSTALL_SCRIPT} | bash`,
    featured: true,
    note: "macOS and Linux. Detects your platform and installs the prebuilt binary.",
  },
  {
    id: "cargo",
    label: "cargo",
    // ⚠️ `cargo install evnx` compiles from source with `default = []`, so the
    // cloud commands are absent unless the feature is named. Every other
    // channel ships a `--all-features` binary and already has them. Advertising
    // the bare command here is what made people think cloud sync was missing.
    command: "cargo install evnx --features cloud",
    registryUrl: REGISTRIES.crates,
    featured: true,
    note: "Builds from source. `--features cloud` is required here and only here.",
  },
  {
    id: "npm",
    label: "npm",
    command: "npm install -g @evnx/cli",
    registryUrl: REGISTRIES.npm,
    featured: true,
  },
  {
    id: "pip",
    label: "pip",
    command: "pip install evnx",
    registryUrl: REGISTRIES.pypi,
    featured: true,
  },
  {
    id: "homebrew",
    label: "Homebrew",
    command: `brew install ${GITHUB_ORG}/tap/evnx`,
    featured: false,
  },
  {
    id: "scoop",
    label: "Scoop",
    command: `scoop bucket add evnx https://github.com/${GITHUB_ORG}/scoop-evnx\nscoop install evnx`,
    featured: false,
  },
  {
    id: "winget",
    label: "winget",
    // The manifest declares no Moniker, so a bare `winget install evnx` falls
    // back to name matching and can prompt for disambiguation.
    command: `winget install ${GITHUB_ORG}.evnx`,
    featured: false,
  },
  {
    id: "github-release",
    label: "Binary",
    command: `# Download from ${REPOS.releases}`,
    registryUrl: REPOS.releases,
    featured: false,
  },
  {
    id: "action",
    label: "GitHub Action",
    command: `- uses: ${GITHUB_ORG}/evnx@v1`,
    registryUrl: REGISTRIES.marketplace,
    featured: false,
  },
] as const;

/** The four that appear as hero tabs. Order is the order they render. */
export const FEATURED_CHANNELS = INSTALL_CHANNELS.filter((c) => c.featured);

/** `9` — derived, so the landing page's "9 install channels" cannot go stale. */
export const INSTALL_CHANNEL_COUNT = INSTALL_CHANNELS.length;

export const DOTENV_SPACE_URL = HOSTS.dotenvSpace;
