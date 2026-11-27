import { docsUrl } from "@evnx/config";
import { leakAnatomy, problem } from "@evnx/content";
import type { TimelineEntry } from "@evnx/content";
import { Spot } from "@/components/art/spots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandPill } from "@/components/ui/command-pill";
import { SectionHeading } from "./section-shell";

/**
 * The two failure modes — leaks and drift — each with the commands that catch
 * it. The pills are real text linking to the guides (D-V9); the spots are art.
 *
 * D-V29 (2026-11-27): this is the homepage's one "why it matters" section. The
 * 22-minute leak, which had a section of its own with an illustration and a
 * toggle, is the compact two-row strip below; the audit section is gone (the
 * hero's terminal already shows a real scan).
 */

const DOT: Record<TimelineEntry["level"], string> = {
  neutral: "bg-border-default",
  warn: "bg-warning",
  bad: "bg-danger",
  good: "bg-success",
};

function LeakRow({ label, entries }: { label: string; entries: readonly TimelineEntry[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[8rem_minmax(0,1fr)] gap-x-6 gap-y-2 py-4 border-t border-border-muted first:border-t-0">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest md:pt-0.5">{label}</p>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
        {entries.map((e) => (
          <li key={`${e.time}-${e.text}`} className="flex gap-2.5 items-baseline">
            <span className={`w-2 h-2 rounded-full shrink-0 translate-y-[-1px] ${DOT[e.level]}`} aria-hidden />
            <span>
              <span className="font-mono text-xs text-text-muted mr-2">{e.time}</span>
              <span className="text-sm text-text-primary">{e.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
export function Problem() {
  return (
    <>
      <SectionHeading eyebrow={problem.eyebrow} heading={problem.heading} lede={problem.lede} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {problem.modes.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <CardTitle className="text-2xl">{m.title}</CardTitle>
              <Spot id={m.spot} size={48} className="shrink-0" />
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary leading-relaxed mb-5">{m.body}</p>
              <ul className="flex flex-wrap gap-2" aria-label={`Commands for: ${m.title.toLowerCase()}`}>
                {m.commands.map((c) => (
                  <li key={c.label}>
                    <CommandPill href={docsUrl(`commands/${c.guide}`)}>{c.label}</CommandPill>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border-muted bg-bg-surface px-5 md:px-6 py-2">
        <h3 className="font-serif text-xl font-bold pt-4 pb-1">{leakAnatomy.heading}</h3>
        <LeakRow label={leakAnatomy.toggle.without} entries={leakAnatomy.without} />
        <LeakRow label={leakAnatomy.toggle.with} entries={leakAnatomy.with} />
      </div>

      <p className="mt-8 text-lg font-medium text-text-primary">{problem.close}</p>
    </>
  );
}
