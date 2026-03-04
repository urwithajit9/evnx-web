/**
 * MDX Component Registry — SERVER COMPONENT
 *
 * ── CRITICAL: NO 'use client' HERE ──────────────────────────────────────────
 * MDXRemote from next-mdx-remote/rsc is a Server Component. It receives the
 * `components` map and renders on the server. If this file has 'use client',
 * Next.js throws:
 *   "Cannot access mdxComponents.wrapper on the server. You cannot dot into
 *    a client module from a server component."
 *
 * Solution: keep this file as a server module. Any component that needs
 * client hooks (useState, useEffect) must live in its own 'use client' file
 * and be imported here. CopyButton is the only case — it's in ./copy-button.
 *
 * ── HOW FENCED CODE BLOCKS WORK ─────────────────────────────────────────────
 * next-mdx-remote renders:
 *   ```bash          →   <pre><code className="language-bash">src\n</code></pre>
 *   evnx scan
 *   ```
 *
 * Override `pre` (not `code`) to intercept fenced blocks.
 * Override `code` only for inline `backtick` spans, which have no className.
 */

import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { CopyButton }                     from './copy-button'   // ← only client import
import { Callout }                        from './callout'
import { CodeTabs, Tab }                  from './code-tabs'
import { TerminalOutput }                 from './terminal-output'
import { DiffBlock }                      from './diff-block'
import { Step }                           from './step'
import { Prerequisites, Prerequisite }    from './prerequisites'
import { VersionBadge }                   from './version-badge'
import { Difficulty }                     from './difficulty'
import { CommandSignature }               from './command-signature'
import { OptionTable, Option }            from './option-table'
import { FileTree }                       from './file-tree'
import { AuthorNote }                     from './author-note'
import { CommandRef }                     from './command-ref'

// ─── Language label map ───────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  bash:       'Bash',       shell:      'Shell',     sh:    'Shell',
  zsh:        'Zsh',        powershell: 'PowerShell', ps1:  'PowerShell',
  yaml:       'YAML',       yml:        'YAML',
  json:       'JSON',       toml:       'TOML',
  typescript: 'TypeScript', ts:         'TypeScript', tsx:  'TSX',
  javascript: 'JavaScript', js:         'JavaScript', jsx:  'JSX',
  python:     'Python',     py:         'Python',
  rust:       'Rust',       rs:         'Rust',
  go:         'Go',
  dockerfile: 'Dockerfile',
  diff:       'Diff',       sql:        'SQL',
  ini:        '.env',       env:        '.env',
  plaintext:  'Text',       text:       'Text',
}

// ─── evnx terminal output line colouring ─────────────────────────────────────
// Applied purely via className — no JS at runtime, no hydration needed.

function getLineClass(line: string): string {
  if (/^\[ERROR\]|^\[CRITICAL\]/.test(line))                       return 'text-danger'
  if (/^\[WARNING\]/.test(line))                                    return 'text-warning'
  if (/^\[OK\]|^\[SUCCESS\]|^\[CONVERT\]/.test(line))              return 'text-success'
  if (/^\[INFO\]|^\[SCAN\]|^\[VALIDATE\]|^\[DOCTOR\]|^\[FIX\]/.test(line)) return 'text-info'
  if (/^\[TIP\]/.test(line))                                        return 'text-brand-300'
  if (/^#/.test(line))                                              return 'text-text-muted'
  if (/^(evnx |curl |cargo |git |cat |mkdir |chmod )/.test(line.trimStart()))
    return 'text-brand-400'
  return 'text-terminal-text'
}

// ─── Fenced code block ────────────────────────────────────────────────────────
// Intercepts <pre>. Reads language from the inner <code className="language-*">.

type PreProps = React.HTMLAttributes<HTMLPreElement> & {
  children?: React.ReactNode
}

function FencedCodeBlock({ children }: PreProps) {
  // MDX always wraps fenced code in <pre><code className="language-X">src</code></pre>
  const codeEl = React.Children.only(children) as React.ReactElement<{
    className?: string
    children?: string
  }>

  if (!codeEl || (codeEl as React.ReactElement).type !== 'code') {
    return (
      <pre className="my-6 rounded-xl bg-terminal-bg border border-border-muted p-5 overflow-x-auto font-mono text-sm text-terminal-text leading-relaxed">
        {children}
      </pre>
    )
  }

  const cls   = codeEl.props.className ?? ''
  const lang  = cls.startsWith('language-') ? cls.slice('language-'.length) : 'bash'
  const label = LANG_LABELS[lang] ?? lang

  // Strip the trailing newline MDX always appends
  const rawCode = (codeEl.props.children ?? '').replace(/\n$/, '')
  const lines   = rawCode.split('\n')

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header — CopyButton is the only client island here */}
      <div className="flex items-center justify-between bg-bg-overlay px-4 py-2.5 border-b border-border-subtle">
        <span className="font-mono text-xs text-text-muted">{label}</span>
        <CopyButton code={rawCode} />
      </div>

      {/* Body — rendered entirely on the server */}
      <div className="overflow-x-auto bg-terminal-bg">
        <pre className="p-5 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => (
            <span key={i} className={`block ${getLineClass(line)}`}>
              {line || '\u00A0'/* preserve empty lines */}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}

// ─── Inline code ──────────────────────────────────────────────────────────────
// Only fires for `backtick` spans in prose. Fenced blocks never reach here.

function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="font-mono text-sm px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-brand-300 break-words">
      {children}
    </code>
  )
}

// ─── Prose ────────────────────────────────────────────────────────────────────

function H2({ children }: { children?: React.ReactNode }) {
  return <h2 className="font-serif text-2xl font-bold mt-12 mb-4 text-text-primary scroll-mt-20 leading-snug">{children}</h2>
}
function H3({ children }: { children?: React.ReactNode }) {
  return <h3 className="font-serif text-xl font-bold mt-8 mb-3 text-text-primary scroll-mt-20">{children}</h3>
}
function H4({ children }: { children?: React.ReactNode }) {
  return <h4 className="font-mono text-base font-semibold mt-6 mb-2 text-text-primary">{children}</h4>
}
function P({ children }: { children?: React.ReactNode }) {
  return <p className="text-text-secondary leading-relaxed mb-4 max-w-prose">{children}</p>
}
function UL({ children }: { children?: React.ReactNode }) {
  return <ul className="mb-4 ml-1 space-y-2">{children}</ul>
}
function OL({ children }: { children?: React.ReactNode }) {
  return <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>
}
function LI({ children }: { children?: React.ReactNode }) {
  return (
    <li className="text-text-secondary leading-relaxed flex gap-2 items-start">
      <span className="text-brand-500 flex-shrink-0 mt-[3px] select-none">›</span>
      <span className="min-w-0">{children}</span>
    </li>
  )
}
function Blockquote({ children }: { children?: React.ReactNode }) {
  return <blockquote className="border-l-2 border-brand-500 pl-5 my-6 text-text-secondary italic">{children}</blockquote>
}
function HR() {
  return <hr className="border-border-subtle my-10" />
}
function A({ href, children }: { href?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  )
}
function Strong({ children }: { children?: React.ReactNode }) {
  return <strong className="font-semibold text-text-primary">{children}</strong>
}

// ─── Tables ───────────────────────────────────────────────────────────────────

function Table({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border-muted">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
}
function THead({ children }: { children?: React.ReactNode }) {
  return <thead className="bg-bg-overlay border-b border-border-muted">{children}</thead>
}
function TBody({ children }: { children?: React.ReactNode }) {
  return <tbody>{children}</tbody>
}
function TR({ children }: { children?: React.ReactNode }) {
  return <tr className="border-b border-border-subtle last:border-0 hover:bg-bg-surface transition-colors">{children}</tr>
}
function TH({ children }: { children?: React.ReactNode }) {
  return <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap">{children}</th>
}
function TD({ children }: { children?: React.ReactNode }) {
  return <td className="py-2.5 px-4 text-text-secondary font-mono text-xs align-top">{children}</td>
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const mdxComponents: MDXComponents = {
  // Fenced code blocks — intercept <pre>, NOT <code>
  pre:  FencedCodeBlock,
  // Inline backtick spans — has no className, safe to style here
  code: InlineCode,

  // Prose
  h2: H2, h3: H3, h4: H4,
  p: P, ul: UL, ol: OL, li: LI,
  blockquote: Blockquote, hr: HR, a: A, strong: Strong,

  // Tables
  table: Table, thead: THead, tbody: TBody,
  tr: TR, th: TH, td: TD,

  // Custom MDX components — available in every .mdx without importing
  Callout,
  CodeTabs, Tab,
  TerminalOutput, DiffBlock,
  Step,
  Prerequisites, Prerequisite,
  VersionBadge, Difficulty,
  CommandSignature,
  OptionTable, Option,
  FileTree,
  AuthorNote, CommandRef,
}