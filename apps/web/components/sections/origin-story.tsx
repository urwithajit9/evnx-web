import { originStory } from "@evnx/content";
import type { TimelineEntry } from "@evnx/content";
import { SectionHeading } from "./section-shell";

const DOT: Record<TimelineEntry["level"], string> = {
  neutral: "bg-border-default",
  warn: "bg-warning",
  bad: "bg-danger",
  good: "bg-success",
};

export function OriginStory() {
  return (
    <>
      <SectionHeading eyebrow={originStory.eyebrow} heading={originStory.heading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="rounded-xl border border-border-muted bg-terminal-bg overflow-hidden">
          <div className="px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
            <span className="font-mono text-xs text-text-muted">incident log</span>
          </div>
          <ol className="p-5 font-mono text-xs space-y-3">
            {originStory.entries.map((e) => (
              <li key={e.time} className="flex gap-3">
                <span className="text-text-muted flex-shrink-0 tabular-nums">{e.time}</span>
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[e.level]}`}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className="block text-terminal-text">{e.text}</span>
                  {e.detail && <span className="block text-text-muted mt-0.5">{e.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-6 rounded-xl border-l-2 border-brand-500 bg-bg-surface">
          <h3 className="font-serif text-xl font-bold mb-3 leading-snug">
            {originStory.resolution.heading}
          </h3>
          <p className="text-text-secondary leading-relaxed">{originStory.resolution.body}</p>
        </div>
      </div>
    </>
  );
}
