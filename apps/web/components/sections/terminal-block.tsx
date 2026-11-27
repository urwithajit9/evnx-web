import type { TerminalLine } from "@evnx/content";
import { CodeFrame } from "@evnx/mdx/code-frame";

/**
 * A static terminal transcript: the result, not the typing.
 *
 * Draws the shared <CodeFrame> from @evnx/mdx, so the hero, the audit section,
 * guides and /install all show one terminal. (The animated
 * `components/ui/terminal.tsx` and `terminal-v1.tsx` were imported nowhere and
 * were deleted in the same change.) The hero's tabbed version is
 * <HeroTerminal>, which renders its transcripts with <TranscriptLines> below.
 */
const LINE: Record<TerminalLine["type"], string> = {
  prompt: "text-terminal-prompt",
  output: "text-terminal-text",
  dim: "text-text-muted",
  error: "text-danger",
  warning: "text-warning",
  success: "text-success",
  key: "text-brand-300",
};

/** The `<pre>` of one transcript. No state, so it renders on either side. */
export function TranscriptLines({ lines }: { lines: readonly TerminalLine[] }) {
  return (
    <pre className="p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed">
      <code>
        {lines.map((line, i) => (
          <span key={i} className={`block ${LINE[line.type]}`}>
            {/* A blank line still needs height, or the transcript closes up. */}
            {line.type === "prompt" ? `$ ${line.content}` : line.content || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function TerminalBlock({
  lines,
  tabs,
  title,
}: {
  lines: readonly TerminalLine[];
  tabs?: readonly string[];
  title?: string;
}) {
  return (
    <CodeFrame
      dots
      tabs={tabs}
      label={title}
      ariaLabel={title ? `Terminal: ${title}` : "Terminal transcript"}
    >
      <TranscriptLines lines={lines} />
    </CodeFrame>
  );
}
