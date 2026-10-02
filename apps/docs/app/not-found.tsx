import Link from "next/link";
import { HOSTS } from "@evnx/config";
import { GUIDE_SECTIONS } from "@evnx/docs-content";

/**
 * ⚠️ This page matters more here than on most sites.
 *
 * Fifty-eight URLs were just redirected onto this host, and anything that
 * misses — an old bookmark with a typo, a slug that changed, a link someone
 * wrote by hand — lands here. A bare "404" would strand them one hop from the
 * thing they wanted. Every section is one click away instead.
 */
export default function NotFound() {
  return (
    <div className="container-base section-padding max-w-2xl">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
        404
      </p>
      <h1 className="font-serif text-4xl font-bold mb-4">
        That page is not here
      </h1>
      <p className="text-lg text-text-secondary leading-relaxed mb-10">
        The documentation moved to this address recently. If you followed a link
        from somewhere else, the page may have a new name — everything is one
        click below.
      </p>

      <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
        Browse by section
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {GUIDE_SECTIONS.map((s) => (
          <li key={s.key}>
            <Link
              href={`/cli/${s.key}`}
              className="block p-4 rounded-lg border border-border-muted hover:border-brand-500 transition-colors"
            >
              <span className="block text-sm font-medium mb-1">{s.label}</span>
              <span className="block text-xs text-text-secondary">{s.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/cli" className="text-brand-400 hover:underline underline-offset-4">
          All guides
        </Link>
        <a href={HOSTS.web} className="text-text-secondary hover:underline underline-offset-4">
          evnx.dev
        </a>
        <a
          href="https://github.com/urwithajit9/evnx/issues"
          className="text-text-secondary hover:underline underline-offset-4"
        >
          Report a broken link
        </a>
      </div>
    </div>
  );
}
