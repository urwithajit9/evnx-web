'use client'

import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
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
  )
}