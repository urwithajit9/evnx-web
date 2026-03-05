/**
 * DiffBlock
 *
 * Purpose: Shows before/after changes to .env files or config, styled like
 * a git diff. Lines starting with `-` are removed (red), lines starting
 * with `+` are added (green), context lines are neutral. Used in migration
 * guides and "what changed" sections.
 *
 * Usage in MDX:
 *   <DiffBlock>
 *     # Old insecure pattern
 *     - DATABASE_URL=postgres://admin:password@localhost/db
 *     + DATABASE_URL=secret:aws:///myapp/prod/DATABASE_URL
 *
 *     # Unchanged
 *       APP_NAME=my-app
 *       APP_ENV=production
 *   </DiffBlock>
 *
 *   <DiffBlock filename=".env">
 *     - JWT_SECRET=secret
 *     + JWT_SECRET=a8f3k2m9p1q7r4s6t0u5v8w2x9y1z3b
 *   </DiffBlock>
 */

import React from "react";
import { CopyButton } from "./copy-button";

type Props = {
  filename?: string;
  children: React.ReactNode;
};

export function DiffBlock({ filename, children }: Props) {
  const raw = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
    .trim();

  const lines = raw.split("\n");

  // Build copyable "after" version: only + lines (without the + prefix) and context lines
  const copyable = lines
    .filter((l) => !l.startsWith("-"))
    .map((l) => (l.startsWith("+") ? l.slice(1).trimStart() : l))
    .join("\n");

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted">diff</span>
          {filename && (
            <>
              <span className="text-border-default">·</span>
              <span className="font-mono text-xs text-text-muted">
                {filename}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <span className="font-mono text-xs text-danger/70">− removed</span>
          <span className="font-mono text-xs text-success/70">+ added</span>
          <CopyButton code={copyable} />
        </div>
      </div>

      {/* Diff lines */}
      <div className="bg-terminal-bg overflow-x-auto">
        <pre className="p-5 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => {
            let bgClass = "";
            let textClass = "text-terminal-text";
            let prefix = " ";

            if (line.startsWith("+")) {
              bgClass = "bg-success/5";
              textClass = "text-success";
              prefix = "+";
            } else if (line.startsWith("-")) {
              bgClass = "bg-danger/5";
              textClass = "text-danger";
              prefix = "-";
            } else if (line.startsWith("#")) {
              textClass = "text-text-muted";
            }

            return (
              <span key={i} className={`flex gap-3 px-2 rounded-sm ${bgClass}`}>
                <span
                  className={`select-none flex-shrink-0 w-3 ${textClass} opacity-60`}
                >
                  {prefix}
                </span>
                <span className={textClass}>
                  {line.startsWith("+") || line.startsWith("-")
                    ? line.slice(1)
                    : line || "\u00A0"}
                </span>
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
