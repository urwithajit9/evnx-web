'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export function CodeBlock({
  children,
  language = 'bash',
  filename,
  showLineNumbers = true,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = children.trim().split('\n');
  const shouldShowNumbers = showLineNumbers && lines.length > 1;

  return (
    <div className="bg-terminal-bg border border-border-muted rounded-lg overflow-hidden">
      {filename && (
        <div className="bg-bg-surface px-4 py-2 text-xs text-text-secondary border-b border-border-muted font-mono">
          {filename}
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-bg-surface hover:bg-border-muted rounded transition-colors z-10"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-text-secondary hover:text-text-primary" />
          )}
        </button>
        <pre className="p-4 overflow-auto max-h-96">
          <code className={`language-${language} text-sm text-terminal-text`}>
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  highlightLines.includes(idx + 1)
                    ? 'bg-bg-surface bg-opacity-50'
                    : ''
                } flex gap-4`}
              >
                {shouldShowNumbers && (
                  <span className="text-text-muted select-none min-w-8 text-right">
                    {idx + 1}
                  </span>
                )}
                <span>{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
