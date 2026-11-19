"use client";

import * as Tabs from "@radix-ui/react-tabs";
import type { TerminalTab } from "@evnx/content";
import { CodeFrame } from "@evnx/mdx/code-frame";
import { TranscriptLines } from "./terminal-block";

/**
 * The hero's terminal: one real transcript per tab (D-V20, DESIGN-BRIEF.md).
 *
 * Radix Tabs gives the ARIA tabs pattern: arrow keys move between tabs, and
 * each tab names its panel. The first tab is selected on the server, so the
 * first paint is the same transcript the static hero showed.
 *
 * ⚠️ Every panel is always mounted and they share one grid cell, so the frame
 * is as tall as the tallest transcript and nothing below the hero moves when
 * the tab changes (owner, 2026-11-20). Inactive panels are `invisible`
 * (visibility: hidden), which also takes them out of the accessibility tree.
 */
export function HeroTerminal({ tabs }: { tabs: readonly TerminalTab[] }) {
  return (
    <Tabs.Root defaultValue={tabs[0].label} className="min-w-0">
      <CodeFrame
        dots
        ariaLabel="Terminal transcripts"
        tabList={
          <Tabs.List aria-label="Example commands" className="flex gap-1 font-mono text-xs">
            {tabs.map((t) => (
              <Tabs.Trigger
                key={t.label}
                value={t.label}
                className="rounded px-1.5 py-0.5 text-text-muted hover:text-text-secondary data-[state=active]:text-text-primary data-[state=active]:bg-terminal-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        }
      >
        <div className="grid">
          {tabs.map((t) => (
            <Tabs.Content
              key={t.label}
              value={t.label}
              forceMount
              // The scroll container around the panels is the tab stop, so a
              // panel is not a second one.
              tabIndex={-1}
              className="[grid-area:1/1] data-[state=inactive]:invisible"
            >
              <TranscriptLines lines={t.lines} />
            </Tabs.Content>
          ))}
        </div>
      </CodeFrame>
    </Tabs.Root>
  );
}
