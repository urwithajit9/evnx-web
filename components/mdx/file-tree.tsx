/**
 * FileTree
 *
 * Purpose: Renders a directory tree to show project structure, config file
 * placement, or output file layout. Used in integration guides ("where to
 * put the .evnx.toml") and use-case guides ("what evnx creates").
 *
 * The children are plain text in the same format as `tree` CLI output.
 * Lines that end with `/` are treated as directories (brand orange).
 * Lines starting with a comment `#` are treated as annotations (muted).
 *
 * Usage in MDX:
 *   <FileTree>
 *   my-project/
 *   ├── .env
 *   ├── .env.example
 *   ├── .evnx.toml
 *   └── src/
 *       └── index.ts
 *   </FileTree>
 *
 *   <FileTree title="After evnx migrate">
 *   my-project/
 *   ├── .env              # values replaced with secret references
 *   └── .evnx-backups/
 *       └── .env.2024-03-15.enc
 *   </FileTree>
 */

import React from "react";
import { Folder, FileText } from "lucide-react";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function FileTree({ title, children }: Props) {
  const raw = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
    .trim();

  const lines = raw.split("\n");

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <Folder className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-mono text-xs text-text-muted">
          {title ?? "project structure"}
        </span>
      </div>

      {/* Tree */}
      <div className="bg-terminal-bg overflow-x-auto">
        <pre className="p-5 m-0 font-mono text-sm leading-[1.75] whitespace-pre">
          {lines.map((line, i) => {
            // Separate the tree chars from the name + annotation
            // Tree chars: ├── └── │   spaces
            const match = line.match(/^((?:[│├└─\s])*)(.*?)(\s*#.*)?$/);
            const treeChars = match?.[1] ?? "";
            let name = match?.[2]?.trim() ?? line;
            const annotation = match?.[3]?.trim() ?? "";

            // Strip trailing slash for display icon logic
            const isDirectory = name.endsWith("/");
            const isComment = line.trimStart().startsWith("#");
            const isRoot = i === 0 && isDirectory;

            if (isComment) {
              return (
                <span key={i} className="block text-text-muted">
                  {line || "\u00A0"}
                </span>
              );
            }

            return (
              <span key={i} className="flex items-baseline gap-0">
                {/* Tree structure characters */}
                <span className="text-border-default">{treeChars}</span>

                {/* Icon */}
                {isDirectory ? (
                  <Folder className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 self-center mr-1.5" />
                ) : (
                  !isRoot && (
                    <FileText className="w-3.5 h-3.5 text-text-muted flex-shrink-0 self-center mr-1.5" />
                  )
                )}

                {/* Name */}
                <span
                  className={
                    isDirectory
                      ? "text-brand-400 font-semibold"
                      : "text-terminal-text"
                  }
                >
                  {name || "\u00A0"}
                </span>

                {/* Inline annotation */}
                {annotation && (
                  <span className="text-text-muted ml-2 text-xs">
                    {annotation}
                  </span>
                )}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
