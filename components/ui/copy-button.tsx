'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-2 hover:bg-bg-surface rounded transition-colors"
    >
      {copied ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4 text-text-secondary" />
      )}
    </button>
  );
}
