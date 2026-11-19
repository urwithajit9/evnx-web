import type { ReactNode } from "react";
import type { GuideSection } from "@evnx/docs-content";
import { DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";

/**
 * The docs page frame: sidebar (lg+), content, and "On this page" (xl+).
 * Below lg the sidebar becomes a native <details> disclosure above the
 * content — keyboard and screen-reader support for free, and it works
 * without JavaScript.
 */
export function DocsShell({
  children,
  currentSlug,
  currentSection,
  toc = false,
}: {
  children: ReactNode;
  currentSlug?: string;
  currentSection?: GuideSection;
  /** Show "On this page". Guides only; section indexes have no headings. */
  toc?: boolean;
}) {
  return (
    <div className="container-base section-padding">
      <details className="lg:hidden mb-8 rounded-lg border border-border-muted bg-bg-surface">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Browse the docs</summary>
        <nav aria-label="Docs" className="px-4 pb-4 pt-1">
          <DocsSidebar currentSlug={currentSlug} currentSection={currentSection} idPrefix="docs-nav-mobile" />
        </nav>
      </details>

      <div
        className={`grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-10 ${
          toc ? "xl:grid-cols-[15rem_minmax(0,1fr)_13rem]" : ""
        }`}
      >
        <aside className="hidden lg:block">
          <nav
            aria-label="Docs"
            className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8"
          >
            <DocsSidebar currentSlug={currentSlug} currentSection={currentSection} idPrefix="docs-nav" />
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>

        {toc && (
          <aside className="hidden xl:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
              <DocsToc containerId="guide-content" />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
