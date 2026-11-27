"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { CANONICAL_INSTALL_SCRIPT, TALKS, docsUrl } from "@evnx/config";
import { cta } from "@evnx/content";

/**
 * The one ending (D-V34, 2026-11-27): talks as a slim row when there are any,
 * the install command, and three doors into the docs. It replaced three
 * sections in a row: talks, six docs cards, and this call to action.
 */
export function Cta() {
  const [copied, setCopied] = useState(false);
  const command = `curl -fsSL ${CANONICAL_INSTALL_SCRIPT} | bash`;

  return (
    <div className="max-w-2xl mx-auto text-center">
      {TALKS.length > 0 && (
        <p className="mb-10 text-sm text-text-secondary">
          <span className="font-mono text-xs text-text-muted uppercase tracking-widest mr-2">Talks</span>
          {TALKS.slice(0, 2).map((t, i) => (
            <span key={`${t.event}-${t.year}`}>
              {i > 0 && <span aria-hidden> · </span>}
              {t.title}, {t.event} {t.year}
            </span>
          ))}
          <Link href="/talks" className="ml-2 text-brand-400 underline underline-offset-4">
            All talks
          </Link>
        </p>
      )}

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

      <ul className="flex flex-wrap justify-center gap-3" aria-label="Start in the docs">
        {cta.docLinks.map((d) => (
          <li key={d.docsSlug}>
            <Link
              href={docsUrl(d.docsSlug)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-muted px-4 py-2 text-sm text-text-primary hover:border-brand-500 transition-colors"
            >
              {d.label}
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
