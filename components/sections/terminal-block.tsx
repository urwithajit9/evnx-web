import type { TerminalLine } from "@evnx/content";

/**
 * A static terminal transcript.
 *
 * ⚠️ Not `components/ui/terminal.tsx`. That one animates, and its `LineType`
 * is five values — it has no `dim` or `key`, which are exactly what makes a
 * transcript readable (a muted hint line, a highlighted variable name). Rather
 * than widen the animated component's union and re-test its typing loop, this
 * renders a completed transcript, which is also what the approved mockup
 * shows: the result, not the typing.
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
    <div className="rounded-xl overflow-hidden border border-border-muted bg-terminal-bg">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
        <div className="flex gap-1.5" aria-hidden>
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
          <span className="w-2.5 h-2.5 rounded-full bg-border-default" />
        </div>
        {tabs && (
          <div className="flex gap-3 font-mono text-xs">
            {tabs.map((t, i) => (
              <span key={t} className={i === 0 ? "text-text-secondary" : "text-text-muted"}>
                {t}
              </span>
            ))}
          </div>
        )}
        {title && <span className="font-mono text-xs text-text-muted">{title}</span>}
      </div>

      <pre className="p-5 overflow-x-auto font-mono text-sm leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <span key={i} className={`block ${LINE[line.type]}`}>
              {/* A blank line still needs height, or the transcript closes up. */}
              {line.type === "prompt" ? `$ ${line.content}` : line.content || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
