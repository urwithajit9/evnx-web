"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { CANONICAL_INSTALL_SCRIPT, docsUrl } from "@evnx/config";
import { cta } from "@evnx/content";

export function Cta() {
  const [copied, setCopied] = useState(false);
  const command = `curl -fsSL ${CANONICAL_INSTALL_SCRIPT} | bash`;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
        {cta.heading}
      </h2>
      <p className="text-lg text-text-secondary mb-10 leading-relaxed">{cta.lede}</p>

      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(command).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
        }
        className="w-full flex items-center gap-3 bg-terminal-bg border border-border-muted hover:border-brand-500 rounded-lg px-5 py-4 mb-5 transition-colors text-left"
        aria-label={cta.primaryLabel}
      >
        <code
          tabIndex={0}
          role="group"
          aria-label="Install command"
          className="flex-1 font-mono text-sm text-terminal-text overflow-x-auto whitespace-pre"
        >
          <span className="text-terminal-prompt select-none">$ </span>
          {command}
        </code>
        {copied ? (
          <Check className="w-4 h-4 text-success flex-shrink-0" />
        ) : (
          <Copy className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>

      <Link
        href={docsUrl(cta.secondaryDocsSlug)}
        className="text-brand-400 hover:underline underline-offset-4"
      >
        {cta.secondaryLabel}
      </Link>
    </div>
  );
}
