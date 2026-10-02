import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GUIDE_SECTIONS, type Guide, type GuideSection } from "@/lib/content";

/**
 * The index for one documentation section — `/guides/commands`, and friends.
 *
 * ⚠️ These URLs did not exist. Every `/guides/<section>` was a 404, which was
 * invisible because nothing linked to them: the landing page's "Every command
 * and flag" link was the first, and it 404'd on the day it shipped.
 *
 * They are also a prerequisite for the split, not a nicety. The docs home
 * (mockup 06) is three doors into exactly these pages, and a breadcrumb that
 * cannot name its own section is a dead end on 57 guides.
 */
export function SectionIndex({
  section,
  guides,
}: {
  section: GuideSection;
  guides: Guide[];
}) {
  const meta = GUIDE_SECTIONS.find((s) => s.key === section);
  const others = GUIDE_SECTIONS.filter((s) => s.key !== section);

  return (
    <div className="min-h-screen">
      <div className="border-b border-border-subtle">
        <div className="container-base py-3">
          <nav className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Link href="/guides" className="hover:text-text-primary">
              Guides
            </Link>
            <span aria-hidden>/</span>
            <span className="text-text-secondary">{meta?.label ?? section}</span>
          </nav>
        </div>
      </div>

      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
            {meta?.label ?? section}
          </h1>
          {meta?.description && (
            <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
              {meta.description}
            </p>
          )}
          <p className="mt-4 font-mono text-xs text-text-muted">
            {guides.length} {guides.length === 1 ? "guide" : "guides"}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-3xl">
          {guides.length === 0 ? (
            <p className="text-text-secondary">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group block p-5 rounded-xl border border-border-muted bg-bg-surface hover:border-brand-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium mb-1 group-hover:text-brand-400 transition-colors">
                          {g.title}
                        </h2>
                        {g.excerpt && (
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {g.excerpt}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-text-muted flex-shrink-0 mt-1"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 pt-8 border-t border-border-muted">
            <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              Other sections
            </h2>
            <div className="flex flex-wrap gap-2">
              {others.map((s) => (
                <Link
                  key={s.key}
                  href={`/guides/${s.key}`}
                  className="px-3 py-1.5 rounded-md border border-border-muted text-sm text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
            <Link
              href="/guides"
              className="inline-flex items-center gap-1 mt-6 text-sm text-brand-400 hover:underline underline-offset-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All guides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
