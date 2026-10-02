'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  /** What is being copied, for the accessible name. */
  label?: string;
}

export function CopyButton({ text, label = 'command' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // ⚠️ An icon-only button has no accessible name — a screen reader
    // announces "button" and nothing more. aria-live reports the result,
    // since the only feedback was a visual icon swap.
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="flex-shrink-0 p-2 hover:bg-bg-surface rounded transition-colors"
    >
      {copied ? (
        <Check className="w-4 h-4 text-success" aria-hidden />
      ) : (
        <Copy className="w-4 h-4 text-text-secondary" aria-hidden />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} copied to clipboard` : ''}
      </span>
    </button>
  );
}
