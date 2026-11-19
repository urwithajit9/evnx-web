'use client'

/**
 * CopyButton — the one copy control for both apps.
 *
 * ⚠️ There used to be two: this one ("Copy" text, no accessible name for what
 * it copied, no announcement) and apps/web's icon button, which had both. This
 * keeps that one's accessibility and offers both looks.
 */
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = {
  /** The exact text placed on the clipboard (no `$ ` prompt). */
  text: string
  /** What is copied, for the accessible name: "Copy {label}". */
  label?: string
  /** `text` — "Copy" / "Copied!" pill (code headers). `icon` — icon only. */
  variant?: 'text' | 'icon'
  className?: string
}

export function CopyButton({ text, label = 'code', variant = 'text', className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function handleCopy() {
    try {
      // navigator.clipboard is undefined on plain http and in some webviews.
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 2000)
  }

  const announce =
    state === 'copied' ? `${label} copied to clipboard` : state === 'failed' ? `Could not copy ${label}` : ''

  const pill = `font-mono text-xs px-2 py-0.5 rounded border transition-colors ${
    state === 'copied'
      ? 'border-success/50 text-success bg-success/10'
      : state === 'failed'
        ? 'border-danger/50 text-danger'
        : 'border-border-subtle text-text-muted hover:text-text-primary hover:border-border-muted'
  }`
  const icon = 'flex-shrink-0 p-2 rounded transition-colors hover:bg-bg-surface'

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className={`${variant === 'icon' ? icon : pill} ${className}`}
    >
      {variant === 'icon' ? (
        state === 'copied' ? (
          <Check className="w-4 h-4 text-success" aria-hidden />
        ) : (
          <Copy className="w-4 h-4 text-text-secondary" aria-hidden />
        )
      ) : (
        <span aria-hidden>{state === 'copied' ? 'Copied!' : state === 'failed' ? 'Failed' : 'Copy'}</span>
      )}
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </button>
  )
}
