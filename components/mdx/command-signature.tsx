/**
 * CommandSignature
 *
 * Purpose: Shows the formal CLI syntax of a command at the top of a command
 * reference guide — like a function signature in API docs. Distinguishes
 * between the command itself, required arguments, optional flags, and
 * metavariables (placeholders for user-supplied values).
 *
 * Syntax conventions:
 *   UPPERCASE      → metavariable (user replaces with real value)
 *   [--flag]       → optional flag
 *   --flag VALUE   → flag with required argument
 *   <arg>          → required positional argument
 *   ...            → repeatable
 *
 * The component parses and colour-codes these automatically.
 *
 * Usage in MDX:
 *
 *   <CommandSignature>
 *     evnx scan [OPTIONS] [PATH]
 *   </CommandSignature>
 *
 *   <CommandSignature>
 *     evnx convert --from FILE --to FORMAT [--output FILE]
 *     evnx convert --from .env --to kubernetes
 *     evnx convert --from .env --to json --output secrets.json
 *   </CommandSignature>
 *
 *   <CommandSignature>
 *     evnx add KEY VALUE [--comment COMMENT] [--file FILE]
 *   </CommandSignature>
 */

import React from "react";

type Props = {
  children: React.ReactNode;
};

// Tokenise a single line of CLI syntax with colour coding
function TokenisedLine({ line }: { line: string }) {
  if (!line.trim()) return <span className="block h-2" />;

  // Split on spaces, but keep bracket groups and quoted strings intact
  const tokens = line.match(/(\[.*?\]|<.*?>|"[^"]*"|'[^']*'|\S+)/g) ?? [];

  return (
    <span className="block leading-[1.8]">
      {tokens.map((token, i) => {
        // Command name (first word, no - prefix)
        if (i === 0 && !token.startsWith("-")) {
          const parts = token.split(" ");
          return (
            <span key={i}>
              {parts.map((p, j) => (
                <span key={j}>
                  {j === 0 ? (
                    <span className="text-brand-400 font-semibold">{p}</span>
                  ) : (
                    <span className="text-brand-300">{p}</span>
                  )}
                  {j < parts.length - 1 && " "}
                </span>
              ))}{" "}
            </span>
          );
        }

        // Optional block [--flag] or [PATH]
        if (token.startsWith("[") && token.endsWith("]")) {
          return (
            <span key={i} className="text-text-muted">
              {token}{" "}
            </span>
          );
        }

        // Required argument <arg>
        if (token.startsWith("<") && token.endsWith(">")) {
          return (
            <span key={i} className="text-warning">
              {token}{" "}
            </span>
          );
        }

        // Flag --flag
        if (token.startsWith("--") || token.startsWith("-")) {
          return (
            <span key={i} className="text-info">
              {token}{" "}
            </span>
          );
        }

        // METAVARIABLE (all caps)
        if (/^[A-Z][A-Z0-9_]+$/.test(token)) {
          return (
            <span key={i} className="text-warning italic">
              {token}{" "}
            </span>
          );
        }

        // Literal value (lowercase, no special prefix)
        return (
          <span key={i} className="text-terminal-text">
            {token}{" "}
          </span>
        );
      })}
    </span>
  );
}

export function CommandSignature({ children }: Props) {
  const raw = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
    .trim();

  const lines = raw.split("\n");
  // First non-empty line is the canonical signature; the rest are examples
  const signatureLine = lines.find((l) => l.trim()) ?? "";
  const exampleLines = lines
    .slice(lines.indexOf(signatureLine) + 1)
    .filter((l) => l.trim());

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <span className="font-mono text-xs text-text-muted">syntax</span>
        {exampleLines.length > 0 && (
          <span className="font-mono text-xs text-text-muted">
            + {exampleLines.length} example{exampleLines.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="bg-terminal-bg p-5 font-mono text-sm">
        {/* Canonical signature */}
        <TokenisedLine line={signatureLine} />

        {/* Examples */}
        {exampleLines.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-0">
            <span className="block font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
              Examples
            </span>
            {exampleLines.map((line, i) => (
              <span key={i} className="flex items-start gap-2">
                <span className="text-brand-500 select-none flex-shrink-0">
                  $
                </span>
                <TokenisedLine line={line} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Colour legend */}
      <div className="flex flex-wrap gap-4 px-5 py-3 border-t border-border-subtle bg-bg-surface">
        <span className="font-mono text-xs text-brand-400">command</span>
        <span className="font-mono text-xs text-info">--flag</span>
        <span className="font-mono text-xs text-warning italic">METAVAR</span>
        <span className="font-mono text-xs text-text-muted">[optional]</span>
        <span className="font-mono text-xs text-warning">{"<required>"}</span>
      </div>
    </div>
  );
}
