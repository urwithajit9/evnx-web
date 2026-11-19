/**
 * CodeFrame — the one frame every code, terminal and diff block draws.
 *
 * ⚠️ `theme-dark` on the OUTER element, not just the body. Before this, four
 * components drew the header three ways, and three put it outside the dark
 * body — so in the light theme they showed a light header over a dark
 * terminal. Code reads as a screenshot in both themes (DESIGN-BRIEF §3.1);
 * the header is part of the screenshot.
 *
 * No 'use client': it renders inside Server Components (FencedCodeBlock) and
 * client ones (InstallPageClient) alike. Only CopyButton is client code.
 */
import type { ReactNode } from 'react'
import { CopyButton } from './copy-button'

type Props = {
  /** Header text: the language label, or a terminal's title. */
  label?: string
  filename?: string
  /** Window dots, for terminals. */
  dots?: boolean
  /** Static tab names; the first is shown as selected. */
  tabs?: readonly string[]
  /** When set, a copy button copies exactly this. */
  copyText?: string
  copyLabel?: string
  /** Extra header content, right-aligned before the copy button. */
  actions?: ReactNode
  /** Accessible name of the scrollable body. */
  ariaLabel: string
  /** Outer spacing, e.g. `my-6` in prose. */
  className?: string
  children: ReactNode
}

export function CodeFrame({
  label,
  filename,
  dots = false,
  tabs,
  copyText,
  copyLabel,
  actions,
  ariaLabel,
  className = '',
  children,
}: Props) {
  return (
    <div
      className={`theme-dark rounded-xl overflow-hidden border border-border-muted bg-terminal-bg ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <div className="flex items-center gap-3 min-w-0">
          {dots && (
            <div className="flex gap-1.5 flex-shrink-0" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
              <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
            </div>
          )}
          {tabs && (
            <div className="flex gap-3 font-mono text-xs">
              {tabs.map((t, i) => (
                <span key={t} className={i === 0 ? 'text-text-secondary' : 'text-text-muted'}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {label && <span className="font-mono text-xs text-text-muted truncate">{label}</span>}
          {filename && (
            <>
              <span className="text-border-default select-none" aria-hidden>
                ·
              </span>
              <span className="font-mono text-xs text-text-muted truncate">{filename}</span>
            </>
          )}
        </div>
        {(actions || copyText !== undefined) && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
            {copyText !== undefined && <CopyButton text={copyText} label={copyLabel ?? (label ? `${label} code` : 'code')} />}
          </div>
        )}
      </div>

      {/* ⚠️ tabIndex on the scroll container: a long line overflows
          horizontally, and a keyboard user must be able to reach the rest. */}
      <div tabIndex={0} role="group" aria-label={ariaLabel} className="overflow-x-auto">
        {children}
      </div>
    </div>
  )
}
