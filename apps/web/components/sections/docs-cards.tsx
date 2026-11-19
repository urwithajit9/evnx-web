import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { docs } from "@evnx/content";
import { SectionHeading } from "./section-shell";

/**
 * Six doors into the docs (DESIGN-BRIEF §4.10). Each card is one link: it
 * holds no other interactive element, so the whole card can be the target.
 */
export function DocsCards() {
  return (
    <>
      <SectionHeading eyebrow={docs.eyebrow} heading={docs.heading} lede={docs.lede} />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.cards.map((c) => (
          <li key={c.docsSlug}>
            <Link
              href={docsUrl(c.docsSlug)}
              className="group flex h-full flex-col rounded-xl border border-border-muted bg-bg-surface p-6 transition-colors hover:border-brand-500"
            >
              <span className="font-serif text-lg font-bold mb-2 inline-flex items-center gap-2">
                {c.title}
                <ArrowRight
                  className="w-4 h-4 text-brand-400 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <span className="text-sm text-text-secondary leading-relaxed">{c.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
