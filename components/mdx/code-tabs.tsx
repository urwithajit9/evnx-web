"use client";
/**
 * CodeTabs + Tab
 *
 * Purpose: Shows the same instruction or code snippet across multiple
 * platforms, package managers, or languages — without making the reader
 * scroll through every variant. The reader picks their platform once and
 * only sees that tab.
 *
 * Most common uses in evnx-web:
 *   - Install commands: macOS vs Linux vs Windows vs Cargo
 *   - CI config: GitHub Actions vs GitLab CI vs CircleCI
 *   - Output formats: JSON vs YAML vs TOML
 *   - Framework config: Next.js vs Django vs FastAPI
 *
 * Usage in MDX:
 *   <CodeTabs>
 *     <Tab label="macOS / Linux">
 *     ```bash
 *     curl -fsSL https://dotenv.space/install.sh | bash
 *     ```
 *     </Tab>
 *     <Tab label="Windows">
 *     ```powershell
 *     winget install evnx
 *     ```
 *     </Tab>
 *     <Tab label="Cargo">
 *     ```bash
 *     cargo install evnx
 *     ```
 *     </Tab>
 *   </CodeTabs>
 */

import { useState } from "react";

// ─── Tab (child component) ────────────────────────────────────────────────────

type TabProps = {
  label: string;
  children: React.ReactNode;
};

export function Tab({ children }: TabProps) {
  // Tab just holds content — CodeTabs renders it.
  // The label is read from props by the parent.
  return <>{children}</>;
}

// ─── CodeTabs (parent) ────────────────────────────────────────────────────────

type CodeTabsProps = {
  children: React.ReactNode;
  /** Pre-select a tab by label. Defaults to first tab. */
  defaultTab?: string;
};

export function CodeTabs({ children, defaultTab }: CodeTabsProps) {
  // Collect all <Tab> children
  const tabs = Array.isArray(children)
    ? (children as React.ReactElement<TabProps>[]).filter(
        (c) =>
          c && typeof c === "object" && (c as React.ReactElement).type === Tab,
      )
    : [children as React.ReactElement<TabProps>];

  const labels = tabs.map((t) => t.props.label);
  const initial =
    defaultTab && labels.includes(defaultTab) ? defaultTab : labels[0];

  const [active, setActive] = useState(initial);

  const activeContent = tabs.find((t) => t.props.label === active)?.props
    .children;

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Tab bar */}
      <div className="flex border-b border-border-muted overflow-x-auto">
        {labels.map((label) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`px-4 py-2.5 font-mono text-xs whitespace-nowrap flex-shrink-0 transition-colors border-b-2 -mb-px ${
              active === label
                ? "border-brand-500 text-brand-400 bg-brand-500/5"
                : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg-overlay"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active tab content — remove default margins from nested code blocks */}
      <div className="[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0">
        {activeContent}
      </div>
    </div>
  );
}
