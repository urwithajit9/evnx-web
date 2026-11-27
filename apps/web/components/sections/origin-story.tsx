import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { originStory } from "@evnx/content";

/**
 * The origin story as a two-line band (D-V32, 2026-11-27): the opening line
 * and the lesson, linking to the post that tells the whole night. It was a
 * full incident log beside a resolution card, about one laptop screen.
 *
 * The incident log's figures stay in @evnx/content (`originStory.entries`),
 * with their warning that they are the author's own and must stay exact.
 */
export function OriginStory() {
  return (
    <figure className="max-w-3xl border-l-2 border-brand-500 pl-6">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
        {originStory.eyebrow}
      </p>
      <blockquote>
        <p className="font-serif text-2xl md:text-3xl font-bold leading-snug mb-3">
          {originStory.heading}
        </p>
        <p className="text-lg text-text-secondary leading-relaxed">{originStory.resolution.heading}</p>
      </blockquote>
      <figcaption className="mt-5">
        <Link
          href="/blog/why-i-built-evnx"
          className="inline-flex items-center gap-1 text-brand-400 hover:underline underline-offset-4"
        >
          Read the story: an AWS key, three regions and a call from the lead
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </figcaption>
    </figure>
  );
}
