/**
 * FileTree
 *
 * Renders a directory tree in the same format as `tree` CLI output.
 * Lines ending with `/` are directories (brand orange).
 * Lines starting with `#` are annotations (muted).
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  IMPORTANT — USE TEMPLATE LITERAL SYNTAX IN MDX                 ║
 * ║                                                                  ║
 * ║  MDX strips leading whitespace from plain text children.        ║
 * ║  This destroys indentation. Always pass content as {`...`}      ║
 * ║  so MDX treats it as a JS expression and preserves spaces.      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * CORRECT usage in MDX:
 *   <FileTree>{`
 *   my-project/
 *   ├── .env
 *   ├── .env.example
 *   └── src/
 *       └── index.ts
 *   `}</FileTree>
 *
 *   <FileTree title="After evnx migrate">{`
 *   my-project/
 *   ├── .env              # values replaced with secret references
 *   └── .evnx-backups/
 *       └── .env.2024-03-15.enc
 *   `}</FileTree>
 *
 * WRONG — plain text loses indentation:
 *   <FileTree>
 *   my-project/
 *       └── index.ts   ← spaces will be stripped by MDX
 *   </FileTree>
 */

import React from 'react'
import { Folder, FileText } from 'lucide-react'

type Props = {
  title?: string
  children: React.ReactNode
}

// Extract text preserving newlines from block elements.
// When children is a template literal string, this returns it directly.
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    const tag = typeof el.type === 'string' ? el.type : ''
    const blockTags = new Set(['p', 'div', 'li', 'br', 'pre', 'blockquote'])
    const inner = extractText(el.props.children)
    return blockTags.has(tag) ? inner + '\n' : inner
  }
  return ''
}

export function FileTree({ title, children }: Props) {
  const raw = extractText(children).trim()
  const lines = raw.split('\n')

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <Folder className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-mono text-xs text-text-muted">
          {title ?? 'project structure'}
        </span>
      </div>

      {/* Tree
          Each line is a <span className="block"> — NOT flex.
          flex collapses leading whitespace, breaking indentation.
          inline-block icons sit on the text baseline via align-middle. */}
      <div className="bg-terminal-bg overflow-x-auto">
        <pre className="p-5 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => {
            const isComment   = line.trimStart().startsWith('#')
            const isDirectory = line.trimEnd().endsWith('/')
            const isRoot      = i === 0 && isDirectory

            if (isComment) {
              return (
                <span key={i} className="block text-text-muted">
                  {line || '\u00A0'}
                </span>
              )
            }

            // Split into: indentation+tree-chars | name | inline annotation
            const match      = line.match(/^([\s│├└─]*)(.*?)(\s+#.*)?$/)
            const treeChars  = match?.[1] ?? ''
            const name       = match?.[2]?.trim() ?? line
            const annotation = match?.[3]?.trim() ?? ''

            return (
              <span key={i} className="block">
                {/* Tree chars rendered as plain text — whitespace-pre keeps indent */}
                <span className="text-border-default">{treeChars}</span>

                {/* Icon inline so it doesn't break whitespace-pre layout */}
                {isDirectory ? (
                  <Folder className="inline-block w-3.5 h-3.5 text-brand-400 align-middle mr-1" />
                ) : !isRoot ? (
                  <FileText className="inline-block w-3.5 h-3.5 text-text-muted align-middle mr-1" />
                ) : null}

                {/* Name */}
                <span className={
                  isRoot      ? 'text-brand-400 font-semibold' :
                  isDirectory ? 'text-brand-400' :
                                'text-terminal-text'
                }>
                  {name || '\u00A0'}
                </span>

                {/* Inline annotation */}
                {annotation && (
                  <span className="text-text-muted text-xs ml-2">{annotation}</span>
                )}
              </span>
            )
          })}
        </pre>
      </div>
    </div>
  )
}