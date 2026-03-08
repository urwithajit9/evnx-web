'use client'
/**
 * CodeTabs + Tab
 *
 * Purpose: Shows the same instruction or code snippet across multiple
 * platforms, package managers, or languages. The reader picks their platform
 * once and only sees that tab.
 *
 * Usage in MDX (no blank lines between Tab elements — keeps children clean):
 *
 *   <CodeTabs>
 *   <Tab label="macOS / Linux">
 *   ```bash
 *   curl -fsSL https://dotenv.space/install.sh | bash
 *   ```
 *   </Tab>
 *   <Tab label="Windows">
 *   ```powershell
 *   cargo install evnx --features full
 *   ```
 *   </Tab>
 *   <Tab label="Cargo">
 *   ```bash
 *   cargo install evnx
 *   ```
 *   </Tab>
 *   </CodeTabs>
 *
 * WHY NO BLANK LINES:
 * Blank lines inside MDX JSX children create extra text/paragraph nodes.
 * These are filtered out but keeping the markup tight is cleaner.
 *
 * IMPORTANT — RSC serialization:
 * CodeTabs runs client-side but MDX compiles server-side (next-mdx-remote/rsc).
 * React serializes JSX elements crossing the server→client boundary, which
 * means element.type becomes a React client reference object, NOT the original
 * Tab function. Checking `child.type === Tab` is therefore ALWAYS false.
 *
 * The fix: detect Tab children by checking for the `label` prop, which is
 * unique to Tab and survives serialization intact.
 */

import React, { useState } from 'react'

// ─── Tab ─────────────────────────────────────────────────────────────────────

export type TabProps = {
  label: string
  children?: React.ReactNode
}

// Tab just carries its children — CodeTabs reads props.label and props.children.
export function Tab({ children }: TabProps) {
  return <>{children}</>
}

// ─── CodeTabs ─────────────────────────────────────────────────────────────────

type CodeTabsProps = {
  children?: React.ReactNode
  /** Pre-select a tab by label. Defaults to first tab. */
  defaultTab?: string
}

export function CodeTabs({ children, defaultTab }: CodeTabsProps) {
  // React.Children.toArray:
  //  - Handles single child, multiple children, and fragments uniformly
  //  - Filters out null/undefined/boolean children
  //  - Assigns stable keys
  const allChildren = React.Children.toArray(children)

  // Detect Tab children by `label` prop — not by type reference.
  // This works across the RSC server→client boundary where type identity fails.
  const tabs = allChildren.filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) &&
      typeof (child.props as TabProps).label === 'string'
  )

  const labels = tabs.map(t => (t.props as TabProps).label)

  const [active, setActive] = useState<string>(
    defaultTab && labels.includes(defaultTab) ? defaultTab : labels[0] ?? ''
  )

  // Nothing to render if no valid Tab children found
  if (tabs.length === 0) {
    return (
      <div className="my-6 rounded-xl border border-border-muted p-4 font-mono text-xs text-text-muted">
        {/* No Tab children found — check MDX markup */}
        {children}
      </div>
    )
  }

  const activeTab = tabs.find(t => (t.props as TabProps).label === active)
  const activeContent = activeTab ? (activeTab.props as TabProps).children : null

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Tab bar */}
      <div className="flex border-b border-border-muted overflow-x-auto">
        {labels.map(label => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`px-4 py-2.5 font-mono text-xs whitespace-nowrap flex-shrink-0 transition-colors border-b-2 -mb-px ${
              active === label
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-overlay'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active tab content — strip margins/borders from nested code blocks */}
      <div className="[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0">
        {activeContent}
      </div>
    </div>
  )
}