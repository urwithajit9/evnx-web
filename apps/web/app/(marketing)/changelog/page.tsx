import { Badge } from "@/components/ui/badge-status";
import { canonicalUrl } from "@evnx/config";
import generated from "@/content/changelog.json";

// ─── Where the releases come from ─────────────────────────────────────────────
//
// `content/changelog.json` is GENERATED from the CLI's CHANGELOG.md by
// `pnpm changelog:sync` (scripts/sync-changelog.mjs). Do not add releases here.
//
// ⚠️ This page used to be a hand-kept array, and it stopped at v0.4.0 while the
// CLI shipped 26 more releases. A list maintained by hand drifts; this one is
// derived. `pnpm changelog:check` fails CI when it is stale.
//
// `CURATED` below is the one hand-written layer that remains: rewritten
// highlights for releases from before the generator existed, where the
// CHANGELOG.md entries are either terse or written for contributors. A curated
// entry replaces that release's generated highlights and keeps its summary.
// Releases from 0.5.0 on are only ever generated — do not add them here.

type ReleaseType = "major" | "minor" | "patch";
type HighlightType =
  | "feature"
  | "fix"
  | "improvement"
  | "performance"
  | "docs"
  | "breaking"
  | "security"
  | "info";

interface Highlight {
  type: HighlightType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  type: ReleaseType;
  summary?: string | null;
  highlights: Highlight[];
  links?: {
    github?: string;
  };
}

/** How many highlights show before the rest fold under "N more". */
const VISIBLE_HIGHLIGHTS = 6;

const CURATED: Omit<Release, "summary">[] = [
  {
    version: "0.4.0",
    date: "2026-09-15",
    type: "minor",
    links: {
      github: "https://github.com/urwithajit9/evnx/compare/v0.3.8...v0.4.0",
    },
    highlights: [
      {
        type: "feature",
        // ⚠️ Corrected 2026-10-08: this said "mathematically unable to read
        // them". A server that can write its own database can choose the key
        // your next push is encrypted under, so the guarantee is about data
        // already stored. See SECURITY.md in the CLI repo.
        text: "evnx cloud — zero-knowledge encrypted sync for .env files. Push and pull secrets across machines and CI; the server stores ciphertext and holds no key that opens it",
      },
      {
        type: "feature",
        text: "evnx auth — register, log in, log out and check status against api.evnx.dev. SRP-6a means your password never leaves your machine, not even hashed",
      },
      {
        type: "feature",
        text: "evnx vault — create, list and delete encrypted vaults. Each gets its own key, wrapped under a key derived from your password with Argon2id",
      },
      {
        type: "feature",
        text: "API tokens for CI — evnx auth token create/list/revoke, scoped read-only or to a single vault",
      },
      {
        type: "feature",
        text: "Two-factor authentication — TOTP enrolment, recovery codes and session management from the CLI",
      },
      {
        type: "info",
        text: "Cloud commands ship enabled in every prebuilt binary (Homebrew, Scoop, npm, PyPI, winget, GitHub Release). From crates.io they need cargo install evnx --features cloud, because the source build defaults to no features",
      },
      {
        type: "breaking",
        text: "Minimum supported Rust version is now 1.85, declared via rust-version. Only affects building from source",
      },
    ],
  },
  {
    version: "0.3.8",
    date: "2026-03-30",
    type: "patch",
    links: {
      github: "https://github.com/urwithajit9/evnx/compare/v0.3.7...v0.3.8",
    },
    highlights: [
      {
        type: "improvement",
        text: "Release pipeline hardening across all publishing channels",
      },
      {
        type: "fix",
        text: "Windows binary cleared with Microsoft Defender after a false-positive heuristic detection blocked winget validation",
      },
    ],
  },
  {
    version: "0.3.7",
    date: "2026-03-20",
    type: "patch",
    links: {
      github: "https://github.com/urwithajit9/evnx/compare/v0.3.6...v0.3.7",
    },
    highlights: [
      {
        type: "fix",
        text: "GitHub Actions release trigger issue — Scoop and Winget jobs moved into unified release workflow",
      },
      {
        type: "fix",
        text: "Scoop manifest variable interpolation — corrected version substitution and autoupdate templating",
      },
      {
        type: "improvement",
        text: "Release pipeline simplified and consolidated into a single workflow",
      },
    ],
  },
  {
    version: "0.3.6",
    date: "2026-03-19",
    type: "patch",
    highlights: [
      {
        type: "feature",
        text: "Windows package manager support via Scoop and Winget with automatic updates",
      },
      {
        type: "feature",
        text: "Pre-commit integration via `evnx pre-commit` with validation and secret scanning",
      },
      {
        type: "feature",
        text: "CLI help and error messages now link directly to documentation",
      },
      {
        type: "docs",
        text: "Added Windows installation and pre-commit integration guides",
      },
      {
        type: "fix",
        text: "Resolved scan command panic on malformed or empty .env files (#142)",
      },
      {
        type: "fix",
        text: "Reduced false positives in secret detection for placeholder values",
      },
      {
        type: "fix",
        text: "Windows path resolution for .evnx.toml configuration",
      },
      {
        type: "fix",
        text: "Fixed SHA256 checksum validation for cross-platform downloads",
      },
      {
        type: "fix",
        text: "Corrected release artifacts for Scoop and Winget installers",
      },
      {
        type: "improvement",
        text: "Release workflow now includes .zip artifacts for Windows",
      },
      {
        type: "performance",
        text: "Reduced binary size by ~12% using optimized release builds",
      },
      {
        type: "improvement",
        text: "Improved error messages with actionable suggestions",
      },
      {
        type: "improvement",
        text: "Updated secret scanning patterns for modern cloud providers",
      },
      {
        type: "improvement",
        text: "Pre-commit hooks now run in isolated subprocesses",
      },
    ],
  },
  {
    version: "0.3.5",
    date: "2026-03-16",
    type: "patch",
    highlights: [
      {
        type: "fix",
        text: "Reduced PyPI Linux wheel builds to x86_64 due to ARM cross-compilation failures",
      },
      {
        type: "fix",
        text: "Removed aarch64 and armv7 builds due to ring crate assembly issues",
      },
      {
        type: "info",
        text: "ARM Linux users should install via curl script or cargo with full features",
      },
    ],
  },
  {
    version: "0.3.4",
    date: "2026-03-16",
    type: "patch",
    highlights: [
      {
        type: "fix",
        text: "Switched reqwest to native-tls, removing ring dependency",
      },
    ],
  },
  {
    version: "0.3.3",
    date: "2026-03-16",
    type: "patch",
    highlights: [
      {
        type: "fix",
        text: "Resolved PyPI aarch64 wheel build failure caused by ring crate",
      },
      {
        type: "fix",
        text: "Added RING_PREGENERATE_ASM=1 to stabilize Linux builds",
      },
      {
        type: "improvement",
        text: "Switched reqwest TLS backend to avoid cross-compilation issues",
      },
      {
        type: "improvement",
        text: "Increased npm smoke test timing for registry consistency",
      },
    ],
  },
  {
    version: "0.3.2",
    date: "2026-03-16",
    type: "patch",
    highlights: [
      {
        type: "fix",
        text: "PyPI wheels now include full feature set (migrate, backup, restore)",
      },
    ],
  },
  {
    version: "0.3.1",
    date: "2026-03-16",
    type: "patch",
    highlights: [
      {
        type: "fix",
        text: "PyPI wheels now ship with complete CLI feature set",
      },
      {
        type: "fix",
        text: "Corrected GitHub Actions workflow for Homebrew tap updates",
      },
      {
        type: "fix",
        text: "Improved Homebrew formula for platform-specific installs",
      },
      {
        type: "feature",
        text: "Added Homebrew tap support",
      },
      {
        type: "docs",
        text: "Reworked installation documentation with OS-specific guidance",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-03-17",
    type: "major",
    highlights: [
      {
        type: "breaking",
        text: "`evnx init` now uses an interactive TUI; removed legacy flags",
      },
      {
        type: "breaking",
        text: "Command arguments normalized across CLI — review help output",
      },
      {
        type: "improvement",
        text: "Refactored command architecture with improved error handling",
      },
      {
        type: "improvement",
        text: "Significantly expanded test coverage",
      },
      {
        type: "fix",
        text: "Resolved Windows binary extraction issue in npm workflow",
      },
      {
        type: "fix",
        text: "Corrected npm package naming to `@evnx/cli`",
      },
      {
        type: "docs",
        text: "Introduced CHANGELOG.md and rewrote README",
      },
      {
        type: "improvement",
        text: "Migrated docs and install scripts to evnx.dev",
      },
    ],
  },
  {
    version: "0.2.1",
    date: "2026-03-07",
    type: "patch",
    highlights: [
      {
        type: "improvement",
        text: "Refactored multiple commands for better internal structure",
      },
      {
        type: "fix",
        text: "Resolved various known issues",
      },
      {
        type: "improvement",
        text: "Improved test coverage for validation and scanning",
      },
      {
        type: "feature",
        text: "Added npm and PyPI publish workflows",
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-03-04",
    type: "major",
    highlights: [
      {
        type: "breaking",
        text: "Revised multiple core commands with updated behavior",
      },
      {
        type: "feature",
        text: "Introduced `evnx add` for interactive variable management",
      },
      {
        type: "feature",
        text: "Added support for 14+ configuration formats",
      },
      {
        type: "improvement",
        text: "Enhanced secret detection with entropy analysis",
      },
      {
        type: "performance",
        text: "3x faster validation on large .env files",
      },
      {
        type: "fix",
        text: "Improved Windows path handling and token detection",
      },
      {
        type: "docs",
        text: "Expanded CLI documentation",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-03-01",
    type: "minor",
    highlights: [
      {
        type: "info",
        text: "Initial public release of evnx",
      },
      {
        type: "feature",
        text: "Core CLI commands: init, validate, scan, diff, convert, sync",
      },
    ],
  },
];

const curatedByVersion = new Map(CURATED.map((r) => [r.version, r]));

const releases: Release[] = (generated.releases as unknown as Release[]).map((r) => {
  const curated = curatedByVersion.get(r.version);
  return curated
    ? { ...r, highlights: curated.highlights, links: curated.links ?? r.links }
    : r;
});

// CHANGELOG.md is newest-first already; sort anyway so the page never depends on it.
const sortedReleases = [...releases].sort(
  (a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime() ||
    b.version.localeCompare(a.version, undefined, { numeric: true }),
);

// -----------------------------
// UI Helpers
// -----------------------------

function getReleaseTypeBadge(type: ReleaseType) {
  switch (type) {
    case "major":
      return <Badge variant="danger">MAJOR</Badge>;
    case "minor":
      return <Badge variant="info">MINOR</Badge>;
    case "patch":
      return <Badge variant="success">PATCH</Badge>;
    default:
      return <Badge>RELEASE</Badge>;
  }
}

const highlightColorMap: Record<HighlightType, string> = {
  feature: "text-info",
  fix: "text-warning",
  improvement: "text-brand-400",
  performance: "text-brand-500",
  docs: "text-text-secondary",
  breaking: "text-danger",
  security: "text-danger",
  info: "text-text-secondary",
};

const highlightLabelMap: Record<HighlightType, string> = {
  feature: "FEATURE",
  fix: "FIX",
  improvement: "IMPROVEMENT",
  performance: "PERFORMANCE",
  docs: "DOCS",
  breaking: "BREAKING",
  security: "SECURITY",
  info: "INFO",
};

/** CHANGELOG.md text keeps its `code spans`; render them as code. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
          <code key={i} className="font-mono text-text-primary">
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function HighlightItem({ item }: { item: Highlight }) {
  return (
    <li className="flex gap-3 text-sm">
      <span
        className={`font-mono font-semibold ${highlightColorMap[item.type] ?? "text-text-secondary"} whitespace-nowrap`}
      >
        {highlightLabelMap[item.type] ?? "INFO"}
      </span>
      <span className="text-text-secondary">
        <InlineText text={item.text} />
      </span>
    </li>
  );
}

// -----------------------------
// Page
// -----------------------------

export const metadata = {
  title: "Changelog",
  description: "Release notes and changelog for evnx.",
  alternates: { canonical: canonicalUrl("/changelog") },
};

export default function ChangelogPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Changelog.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl">
            Every evnx release, generated from the CLI&apos;s own CHANGELOG.md.
            The full notes for each one are on GitHub.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-3xl">
          <div className="space-y-12">
            {sortedReleases.map((release) => {
              const githubLink =
                release.links?.github ??
                `https://github.com/urwithajit9/evnx/releases/tag/v${release.version}`;
              const shown = release.highlights.slice(0, VISIBLE_HIGHLIGHTS);
              const folded = release.highlights.slice(VISIBLE_HIGHLIGHTS);

              return (
                <div
                  key={release.version}
                  id={`v${release.version}`}
                  className="pb-12 border-b border-border-subtle last:border-0 scroll-mt-24"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="pt-1">
                      <h2 className="font-serif text-3xl font-bold mb-2">
                        <a href={`#v${release.version}`}>v{release.version}</a>
                      </h2>
                      <div className="flex items-center gap-3">
                        {getReleaseTypeBadge(release.type)}
                        <span className="text-text-secondary text-sm">
                          {release.date}
                        </span>
                      </div>
                    </div>
                    <a
                      href={githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-brand-500 hover:text-brand-400 transition-colors text-sm whitespace-nowrap"
                    >
                      View on GitHub →
                    </a>
                  </div>

                  {release.summary && (
                    <p className="text-text-secondary mb-4">
                      <InlineText text={release.summary} />
                    </p>
                  )}

                  {release.highlights.length > 0 && (
                    <div className="bg-bg-surface border border-border-muted rounded-lg p-6">
                      <ul className="space-y-3">
                        {shown.map((item, idx) => (
                          <HighlightItem key={idx} item={item} />
                        ))}
                      </ul>
                      {folded.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer font-mono text-sm text-brand-500 hover:text-brand-400">
                            {folded.length} more
                          </summary>
                          <ul className="space-y-3 mt-3">
                            {folded.map((item, idx) => (
                              <HighlightItem key={idx} item={item} />
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-bg-surface border border-border-muted rounded-lg p-8 text-center">
            <p className="text-text-secondary mb-4">
              Want to stay updated with the latest releases?
            </p>
            <a
              href="https://github.com/urwithajit9/evnx/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-400 font-mono text-sm"
            >
              Watch on GitHub →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
