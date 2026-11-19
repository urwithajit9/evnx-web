"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * "On this page", built from the rendered headings (DESIGN-BRIEF §5).
 *
 * ⚠️ Read from the DOM, not from the MDX source. rehype-slug assigns the ids,
 * and re-implementing its slugger here would drift the first time a heading
 * holds a backtick or an emoji — every link would then miss. The DOM has the
 * real ids by construction.
 *
 * Progressive: before hydration (or without JS) the slot is empty and the
 * guide reads exactly as before. Hidden below `xl` by the page layout.
 */
export function DocsToc({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"));
    setHeadings(
      els.map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? el.id,
        level: el.tagName === "H2" ? 2 : 3,
      })),
    );

    // Mark the heading nearest the top of the viewport as current.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [containerId]);

  // One heading is not a table of contents.
  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">On this page</p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : undefined}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`block leading-snug transition-colors ${
                active === h.id ? "text-brand-400" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
