"use client";

import { useState } from "react";
import { leakAnatomy } from "@evnx/content";
import type { TimelineEntry } from "@evnx/content";
import { SectionHeading } from "./section-shell";

const DOT: Record<TimelineEntry["level"], string> = {
  neutral: "bg-border-default",
  warn: "bg-warning",
  bad: "bg-danger",
  good: "bg-success",
};

export function LeakAnatomy() {
  const [withEvnx, setWithEvnx] = useState(false);
  const entries = withEvnx ? leakAnatomy.with : leakAnatomy.without;

  return (
    <>
      <SectionHeading heading={leakAnatomy.heading} lede={leakAnatomy.lede} />

      <div className="flex gap-1 mb-10" role="tablist" aria-label="Scenario">
        {[
          { on: !withEvnx, label: leakAnatomy.toggle.without, set: false },
          { on: withEvnx, label: leakAnatomy.toggle.with, set: true },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={t.on}
            onClick={() => setWithEvnx(t.set)}
            className={
              "px-4 py-2 rounded-md text-sm font-medium border transition-colors " +
              (t.on
                ? "bg-bg-surface border-brand-500 text-text-primary"
                : "border-border-muted text-text-secondary hover:text-text-primary")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <ol className="max-w-3xl border-l border-border-muted">
        {entries.map((e) => (
          <li key={`${e.time}-${e.text}`} className="relative pl-8 pb-8 last:pb-0">
            <span
              className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${DOT[e.level]}`}
              aria-hidden
            />
            <div className="font-mono text-xs text-text-muted mb-1">{e.time}</div>
            <div className="text-text-primary font-medium">{e.text}</div>
            {e.detail && (
              <div className="text-sm text-text-secondary mt-1 leading-relaxed">{e.detail}</div>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-2xl text-text-secondary leading-relaxed border-l-2 border-brand-500 pl-4">
        {leakAnatomy.conclusion}
      </p>
    </>
  );
}
