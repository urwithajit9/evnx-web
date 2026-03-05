/**
 * TerminalOutput
 *
 * Purpose: Shows terminal output — the result of running a command — as
 * distinct from the command itself. Code blocks (```bash) show commands
 * the user types. TerminalOutput shows what the terminal prints back.
 *
 * Renders with a terminal window chrome (dots, label) and semantic
 * line colouring for evnx output patterns ([ERROR], [OK], etc.).
 *
 * Usage in MDX:
 *   <TerminalOutput>
 *     [SCAN] Scanning .env files...
 *     [ERROR] AWS_SECRET_ACCESS_KEY detected (high entropy)
 *     [INFO] 1 secret found. Run `evnx migrate` to move it.
 *   </TerminalOutput>
 *
 *   <TerminalOutput title="evnx doctor output">
 *     [DOCTOR] Running environment health check...
 *     [OK] .env is in .gitignore
 *     [WARNING] .env.example is out of sync
 *   </TerminalOutput>
 */

import React from "react";

type Props = {
  title?: string;
  children: React.ReactNode;
};

function getLineClass(line: string): string {
  if (/^\[ERROR\]|^\[CRITICAL\]/.test(line)) return "text-danger";
  if (/^\[WARNING\]/.test(line)) return "text-warning";
  if (/^\[OK\]|^\[SUCCESS\]|^\[CONVERT\]/.test(line)) return "text-success";
  if (/^\[INFO\]|^\[SCAN\]|^\[VALIDATE\]|^\[DOCTOR\]|^\[FIX\]/.test(line))
    return "text-info";
  if (/^\[TIP\]/.test(line)) return "text-brand-300";
  if (/^#/.test(line)) return "text-text-muted";
  return "text-terminal-text";
}

export function TerminalOutput({ title, children }: Props) {
  // Extract raw text content from children so we can colour lines
  const raw = React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("")
    .trim();

  const lines = raw.split("\n");

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border-b border-border-subtle">
        <div className="w-3 h-3 rounded-full bg-danger/60" />
        <div className="w-3 h-3 rounded-full bg-warning/60" />
        <div className="w-3 h-3 rounded-full bg-success/60" />
        {title && (
          <span className="ml-3 font-mono text-xs text-text-muted">
            {title}
          </span>
        )}
      </div>

      {/* Output lines */}
      <div className="bg-terminal-bg overflow-x-auto">
        <pre className="p-5 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => (
            <span key={i} className={`block ${getLineClass(line)}`}>
              {line || "\u00A0"}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}
