import type { ReactNode } from "react";
import type { GuideSection } from "@evnx/docs-content";
import { DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";

/**
 * The docs page frame: sidebar (lg+), content, and a right rail (xl+).
 * Below lg the sidebar becomes a native <details> disclosure above the
 * content — keyboard and screen-reader support for free, and it works
 * without JavaScript.
 *
 * Widths (D-V24, owner 2026-11-20): the docs-site pattern measured on Next.js
 * and MDN at 1837px: a 1440px frame, 18rem nav, 17rem rail, and the text
 * column takes the rest, about 736px (~95 characters at 16px). The frame was
 * 1280px with a 13rem rail, which left ~280px empty on each side of a wide
 * screen and too little room for the rail's lists.
 *
 * Top padding is small on purpose: the header is already above, and every
 * pixel before the first step is a pixel the reader scrolls past.
 */
export function DocsShell({
  children,
  currentSlug,
  currentSection,
  toc = false,
  rail,
}: {
  children: ReactNode;
  currentSlug?: string;
  currentSection?: GuideSection;
  /** Show "On this page". Guides only; section indexes have no headings. */
  toc?: boolean;
  /**
   * Shown above "On this page" in the right rail (xl+), and scrolls away with
   * the page; only the contents list sticks (D-V25). Below xl the page renders
   * the same blocks inside the article instead.
   */
  rail?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pt-10 md:pb-24">
      <details className="lg:hidden mb-6 rounded-lg border border-border-muted bg-bg-surface">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Browse the docs</summary>
        <nav aria-label="Docs" className="px-4 pb-4 pt-1">
          <DocsSidebar currentSlug={currentSlug} currentSection={currentSection} idPrefix="docs-nav-mobile" />
        </nav>
      </details>

      <div
        className={`grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-10 ${
          toc ? "xl:grid-cols-[18rem_minmax(0,1fr)_17rem]" : ""
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
          <aside className="hidden xl:block" aria-label="About this page">
            {rail && <div className="space-y-6 pb-6 mb-6 border-b border-border-muted">{rail}</div>}
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
              <DocsToc containerId="guide-content" />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
