import Link from "next/link";
import type { Metadata } from "next";
import { EVNX_VERSION_TAG, HOSTS, INSTALL_CHANNEL_COUNT } from "@evnx/config";
import { GUIDE_SECTIONS, getAllGuides, getGuidesBySection } from "@evnx/docs-content";

export const metadata: Metadata = {
  title: "evnx documentation",
  alternates: { canonical: `${HOSTS.docs}/` },
};

/**
 * The docs home, from mockup 06.
 *
 * ⚠️ Three doors, not a sidebar tree — they match the three reasons people
 * arrive. The version line is deliberate too: guides carry per-page
 * `evnxVersion` badges and most are behind the current release, so stating the
 * current version at the root makes a stale badge read as "not re-checked
 * since" rather than "wrong".
 */
export default function DocsHome() {
  const bySection = getGuidesBySection();
  const total = getAllGuides().length;

  const doors = [
    {
      n: "01",
      title: "Install and scan",
      body: "Get the CLI, run your first audit, block a leak before it is committed.",
      cmd: "evnx scan",
      href: "/cli/getting-started",
    },
    {
      n: "02",
      title: "Sync across machines",
      body: "Encrypted vaults, team sharing, CI without a file on disk.",
      cmd: "evnx cloud push",
      href: "/cli/commands",
    },
    {
      n: "03",
      title: "Command reference",
      body: "Every command, flag and exit code. The page to land on from --help.",
      cmd: "evnx --help",
      href: "/cli",
    },
  ];

  return (
    <div className="container-base section-padding max-w-4xl">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">evnx documentation</h1>
      <p className="font-mono text-xs text-text-muted mb-12">
        current release <span className="text-success">{EVNX_VERSION_TAG}</span> ·{" "}
        {total} guides · {INSTALL_CHANNEL_COUNT} install channels · each page shows the
        version it was last checked against
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {doors.map((d) => (
          <Link
            key={d.n}
            href={d.href}
            className="block p-6 rounded-xl border border-border-muted bg-bg-surface hover:border-brand-500 transition-colors"
          >
            <div className="font-mono text-xs text-brand-500 mb-2">{d.n}</div>
            <h2 className="font-serif text-lg font-bold mb-2">{d.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{d.body}</p>
            <code className="block font-mono text-xs bg-terminal-bg border border-border-subtle rounded px-3 py-2 text-terminal-text">
              <span className="text-terminal-prompt">$ </span>
              {d.cmd}
            </code>
          </Link>
        ))}
      </div>

      <h2 className="font-serif text-2xl font-bold mb-5">Browse by section</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
        {GUIDE_SECTIONS.map((s) => (
          <li key={s.key}>
            <Link
              href={`/cli/${s.key}`}
              className="flex items-center justify-between gap-3 p-4 rounded-lg border border-border-muted hover:border-border-default transition-colors"
            >
              <span className="text-sm">{s.label}</span>
              <span className="font-mono text-xs text-text-muted">
                {(bySection[s.key] ?? []).length}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="pt-10 border-t border-border-muted">
        <h2 className="font-serif text-xl font-bold mb-3">
          Working on <code className="font-mono text-brand-400">.env</code> itself?
        </h2>
        <p className="text-text-secondary leading-relaxed max-w-2xl mb-2">
          <strong className="text-text-primary">dotenv.space</strong> is a
          vendor-neutral reference for how <code className="font-mono text-sm">.env</code>{" "}
          files behave — per framework, per runtime. It does not document evnx, and these
          docs do not duplicate it.
        </p>
        {/* ⚠️ Disclosure, not decoration. Same maintainer, stated plainly. */}
        <p className="text-xs text-text-muted">
          Same maintainer, disclosed. Kept separate on purpose.{" "}
          <a href={HOSTS.dotenvSpace} className="text-brand-400 hover:underline underline-offset-4">
            dotenv.space ↗
          </a>
        </p>
      </section>
    </div>
  );
}
