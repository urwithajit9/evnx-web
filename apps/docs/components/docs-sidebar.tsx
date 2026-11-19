import Link from "next/link";
import { GUIDE_SECTIONS, getGuidesBySection, type GuideSection } from "@evnx/docs-content";

/**
 * Every section and guide, with the current page marked (DESIGN-BRIEF §5,
 * "Docs navigation"). A Server Component: the list is built from the guides on
 * disk at build time, so a new guide appears here with no edit.
 *
 * Rendered twice by the guide page — as the sticky sidebar from `lg`, and
 * inside the mobile disclosure below it — so it takes an id prefix to keep
 * the heading ids unique on the page.
 */
export function DocsSidebar({
  currentSlug,
  currentSection,
  idPrefix,
}: {
  currentSlug?: string;
  currentSection?: GuideSection;
  idPrefix: string;
}) {
  const bySection = getGuidesBySection();
  return (
    <div className="space-y-6 text-sm">
      {GUIDE_SECTIONS.map((s) => {
        const guides = bySection[s.key] ?? [];
        if (guides.length === 0) return null;
        const headingId = `${idPrefix}-${s.key}`;
        const sectionActive = currentSection === s.key && !currentSlug;
        return (
          <div key={s.key}>
            <Link
              id={headingId}
              href={`/cli/${s.key}`}
              aria-current={sectionActive ? "page" : undefined}
              className={`block font-mono text-xs uppercase tracking-widest mb-2 ${
                sectionActive ? "text-brand-400" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {s.label}
            </Link>
            <ul aria-labelledby={headingId} className="space-y-0.5 border-l border-border-subtle">
              {guides.map((g) => {
                const active = g.slug === currentSlug;
                return (
                  <li key={g.slug}>
                    <Link
                      href={`/cli/${g.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`block -ml-px border-l-2 pl-3 py-1 leading-snug transition-colors ${
                        active
                          ? "border-brand-500 text-text-primary font-medium"
                          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"
                      }`}
                    >
                      {g.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
