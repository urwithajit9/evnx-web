/**
 * FencedCodeBlock — async Server Component
 * No 'use client' — must stay a server component.
 *
 * MDX renders fenced blocks as:
 *   <pre><code className="language-typescript">…src…\n</code></pre>
 *
 * We intercept <pre>, read lang from inner <code>, run Shiki, render result.
 */
import React from "react";
import { highlight, LANG_LABELS } from "@/lib/shiki";
import { CopyButton } from "./copy-button";

type Props = {
  children?: React.ReactNode;
};

export async function FencedCodeBlock({ children }: Props) {
  const codeEl = React.Children.only(children) as React.ReactElement<{
    className?: string;
    children?: string;
  }>;

  // Guard: if child isn't a <code> element render plain pre
  if (!codeEl || (codeEl as React.ReactElement).type !== "code") {
    return (
      <pre className="my-6 rounded-xl bg-terminal-bg border border-border-muted p-5 overflow-x-auto font-mono text-sm text-terminal-text leading-relaxed">
        {children}
      </pre>
    );
  }

  const cls = codeEl.props.className ?? "";
  const lang = cls.startsWith("language-")
    ? cls.slice("language-".length)
    : "bash";
  const label = LANG_LABELS[lang] ?? lang;
  const rawCode = (codeEl.props.children ?? "").replace(/\n$/, "");

  // highlight() never throws — it has its own try/catch with plain-text fallback
  const highlightedHtml = await highlight(rawCode, lang);

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-bg-overlay px-4 py-2.5 border-b border-border-subtle">
        <span className="font-mono text-xs text-text-muted">{label}</span>
        <CopyButton code={rawCode} />
      </div>

      {/* Shiki output — inline styles on tokens give the colours */}
      <div
        className="shiki-block overflow-x-auto bg-terminal-bg [&_pre]:p-5 [&_pre]:m-0 [&_pre]:text-sm [&_pre]:leading-[1.75] [&_pre]:font-mono [&_code]:bg-transparent"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
