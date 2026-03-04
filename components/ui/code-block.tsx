'use client'
/**
 * CodeBlock — used directly on landing page and other client pages.
 * NOT used inside MDX (that's handled by FencedCodeBlock in mdx-components.tsx).
 *
 * Location: components/ui/code-block.tsx
 * 'use client' is fine here because this is imported by client pages directly,
 * not by MDXRemote on the server.
 */

import { useState } from 'react'

const LANG_LABELS: Record<string, string> = {
  bash: 'Bash', shell: 'Shell', sh: 'Shell',
  powershell: 'PowerShell',
  yaml: 'YAML', yml: 'YAML',
  json: 'JSON', toml: 'TOML',
  typescript: 'TypeScript', ts: 'TypeScript',
  javascript: 'JavaScript', js: 'JavaScript',
  python: 'Python', py: 'Python',
  rust: 'Rust', rs: 'Rust',
  go: 'Go', dockerfile: 'Dockerfile',
  diff: 'Diff', sql: 'SQL',
  ini: '.env', env: '.env',
  plaintext: 'Text',
}

function getLineClass(line: string): string {
  if (/^\[ERROR\]|^\[CRITICAL\]/.test(line))                       return 'text-danger'
  if (/^\[WARNING\]/.test(line))                                    return 'text-warning'
  if (/^\[OK\]|^\[SUCCESS\]|^\[CONVERT\]/.test(line))              return 'text-success'
  if (/^\[INFO\]|^\[SCAN\]|^\[VALIDATE\]|^\[DOCTOR\]/.test(line)) return 'text-info'
  if (/^\[TIP\]/.test(line))                                        return 'text-brand-300'
  if (/^#/.test(line))                                              return 'text-text-muted'
  if (/^(evnx |curl |cargo |git )/.test(line.trimStart()))         return 'text-brand-400'
  return 'text-terminal-text'
}

type Props = {
  children: string
  language?: string
  filename?: string
  showLineNumbers?: boolean  // accepted for API compat, not yet implemented
  className?: string
}

export function CodeBlock({ children, language = 'bash', filename, className }: Props) {
  const [copied, setCopied] = useState(false)

  const lang    = language.startsWith('language-') ? language.slice('language-'.length) : language
  const label   = LANG_LABELS[lang] ?? lang
  const rawCode = (children ?? '').toString().replace(/\n$/, '')
  const lines   = rawCode.split('\n')

  function handleCopy() {
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border-muted ${className ?? ''}`}>
      <div className="flex items-center justify-between bg-bg-overlay px-4 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted">{label}</span>
          {filename && (
            <>
              <span className="text-border-default select-none">·</span>
              <span className="font-mono text-xs text-text-muted">{filename}</span>
            </>
          )}
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className={`font-mono text-xs px-2 py-0.5 rounded border transition-all ${
            copied
              ? 'border-success/50 text-success bg-success/10'
              : 'border-border-subtle text-text-muted hover:text-text-primary hover:border-border-muted'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="overflow-x-auto bg-terminal-bg">
        <pre className="p-4 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => (
            <span key={i} className={`block ${getLineClass(line)}`}>
              {line || '\u00A0'}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock