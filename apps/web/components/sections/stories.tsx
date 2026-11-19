"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { stories } from "@evnx/content";
import { Spot } from "@/components/art/spots";
import { SectionHeading } from "./section-shell";

/**
 * Use cases as strips: what goes wrong today, then the commands that fix it,
 * numbered in the order you run them.
 *
 * ⚠️ The steps are HTML with a spot drawing each, not one illustration, so a
 * step reads on a phone (they stack) and every command stays real text.
 */
export function Stories() {
  const [active, setActive] = useState(stories.items[0].id);
  const story = stories.items.find((s) => s.id === active) ?? stories.items[0];
  const base = useId();
  // Tailwind needs whole class names; a strip has four or five steps.
  const cols = story.steps.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";

  return (
    <>
      <SectionHeading eyebrow={stories.eyebrow} heading={stories.heading} lede={stories.lede} />

      <div className="flex gap-1 mb-8 flex-wrap" role="tablist" aria-label="Story">
        {stories.items.map((s) => (
          <button
            key={s.id}
            id={`${base}-tab-${s.id}`}
            type="button"
            role="tab"
            aria-selected={s.id === active}
            aria-controls={`${base}-panel`}
            onClick={() => setActive(s.id)}
            className={
              "px-4 py-2 rounded-md text-sm font-medium border transition-colors " +
              (s.id === active
                ? "bg-bg-base border-brand-500 text-text-primary"
                : "border-border-muted text-text-secondary hover:text-text-primary")
            }
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${story.id}`}>
        <h3 className="font-serif text-2xl md:text-3xl font-bold mb-1">{story.title}</h3>
        <p className="text-text-secondary mb-8">{story.situation}</p>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-danger mb-3">
            {stories.withoutLabel}
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {story.without.map((w) => (
              <li key={w} className="flex gap-2 text-sm text-text-secondary">
                <X className="w-4 h-4 mt-0.5 shrink-0 text-danger" aria-hidden />
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest text-brand-500 mb-3">
          {stories.withLabel}
        </div>
        <ol className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-4`}>
          {story.steps.map((step, i) => (
            <li
              key={`${step.label}-${i}`}
              className="flex flex-col items-start p-5 rounded-xl border border-border-muted bg-bg-base"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-brand-fg font-mono font-bold text-xs">
                  {i + 1}
                </span>
                <Spot id={step.spot} size={48} />
              </div>
              <Link
                href={docsUrl(`commands/${step.guide}`)}
                className="font-mono text-xs text-brand-400 bg-terminal-bg border border-border-muted rounded px-2 py-1 mb-2 hover:border-brand-500 transition-colors"
              >
                {step.label}
              </Link>
              <p className="text-sm text-text-secondary">{step.caption}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg bg-brand-500 text-brand-fg px-5 py-3">
          <p className="font-medium">{story.outcome}</p>
          <Link
            href={docsUrl(story.guide)}
            className="inline-flex items-center gap-1 text-sm underline underline-offset-4"
          >
            {stories.guideLabel}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}
