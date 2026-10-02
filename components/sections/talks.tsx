import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TALKS } from "@evnx/config";
import { SectionHeading } from "./section-shell";

/**
 * ⚠️ Renders nothing when there are no talks, rather than an empty heading.
 * A "Talks" section with no talks under it reads as something that was
 * abandoned, which is worse than not having the section.
 */
export function Talks() {
  if (TALKS.length === 0) return null;

  return (
    <>
      <SectionHeading
        heading="Out in the world"
        lede="The parts worth saying out loud, said out loud."
      />

      <ul className="space-y-3 max-w-3xl">
        {TALKS.map((t) => (
          <li
            key={`${t.event}-${t.year}`}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-5 rounded-xl border border-border-muted bg-bg-base"
          >
            <span className="font-serif text-lg font-bold">{t.title}</span>
            <span className="text-sm text-text-secondary">
              {t.event} {t.year} · {t.city}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/talks"
        // Underlined by default: colour alone is not a distinction (WCAG 1.4.1).
        className="inline-flex items-center gap-1 mt-6 text-brand-400 underline underline-offset-4"
      >
        All talks and slides
        <ArrowRight className="w-4 h-4" />
      </Link>
    </>
  );
}
