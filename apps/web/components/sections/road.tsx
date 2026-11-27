import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { commands, road } from "@evnx/content";
import { Spot } from "@/components/art/spots";
import { SectionHeading } from "./section-shell";
import { CommandPill } from "@/components/ui/command-pill";

/**
 * The whole tool as four stages along one road.
 *
 * ⚠️ HTML, not a picture of the overview. Every command name is real text that
 * links to its guide, can be found by search, and is read by a screen reader;
 * only the four spot drawings are art.
 *
 * D-V8: one stage at a time is lit, local → Git → CI → deploy, so the order
 * reads at a glance. CSS only (`.road`, `.road-stage` in globals.css): it
 * pauses while the pointer or keyboard focus is inside the list, and does not
 * run at all under prefers-reduced-motion.
 *
 * D-V30 (2026-11-27): the road is the homepage's one picture of what evnx
 * does. The pillars section is gone from the page; every pillar's command is a
 * stop here already, and its "every command" link moved here.
 *
 * D-V33: on phones each stop is a compact card (number, name, one line, the
 * commands as pills) with no animation; the one-line captions per command
 * show from `sm` up. It was 3.1 phone screens.
 */
export function Road() {
  return (
    <>
      <SectionHeading eyebrow={road.eyebrow} heading={road.heading} lede={road.lede} />

      <ol className="road grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {road.stages.map((s, i) => (
          <li
            key={s.n}
            className="road-stage relative flex flex-col p-4 sm:p-6 rounded-xl border border-border-muted bg-bg-base"
            style={{ animationDelay: `${i * 2}s` }}
          >
            {i < road.stages.length - 1 && (
              // The road: an arrow to the next stop, only where the stops sit in one row.
              <span
                aria-hidden
                className="hidden xl:block absolute -right-[18px] top-14 z-10 text-brand-500 font-mono"
              >
                →
              </span>
            )}

            <div className="flex items-start justify-between gap-3 mb-2 sm:mb-4">
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-brand-fg font-mono font-bold text-sm mb-2 sm:mb-3">
                  {s.n}
                </span>
                <h3 className="font-serif text-2xl font-bold leading-tight">{s.name}</h3>
              </div>
              <Spot id={s.spot} size={56} className="shrink-0 hidden sm:block" />
            </div>

            <p className="text-sm text-text-secondary mb-3 sm:mb-5">{s.subtitle}</p>

            <ul className="flex flex-wrap gap-2 sm:block sm:space-y-3">
              {s.commands.map((c) => (
                <li key={c.label}>
                  <CommandPill href={docsUrl(`commands/${c.guide}`)}>{c.label}</CommandPill>
                  <div className="hidden sm:block text-sm text-text-secondary mt-1">{c.line}</div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mt-6 rounded-lg bg-brand-500 text-brand-fg font-medium px-5 py-3">
        {road.banner}
      </p>

      <Link
        href={docsUrl(commands.allCommandsLink.docsSlug)}
        className="inline-flex items-center gap-1 mt-6 text-brand-400 hover:underline underline-offset-4"
      >
        {commands.allCommandsLink.label}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </>
  );
}
