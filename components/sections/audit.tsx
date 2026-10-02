import { audit } from "@evnx/content";
import { SectionHeading } from "./section-shell";
import { TerminalBlock } from "./terminal-block";

const SEVERITY: Record<string, string> = {
  critical: "text-danger border-danger/30 bg-danger/5",
  warning: "text-warning border-warning/30 bg-warning/5",
  clean: "text-success border-success/30 bg-success/5",
};

export function Audit() {
  return (
    <>
      <SectionHeading heading={audit.heading} lede={audit.lede} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <TerminalBlock lines={audit.terminal} title="evnx scan --all" />

        <div>
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
            Severities, and the exit code each produces
          </h3>
          <dl className="space-y-3">
            {audit.severities.map((s) => (
              <div
                key={s.level}
                className="flex items-start gap-4 p-4 rounded-lg border border-border-muted bg-bg-surface"
              >
                <dt
                  className={`font-mono text-xs px-2 py-1 rounded border flex-shrink-0 ${SEVERITY[s.level]}`}
                >
                  {s.level}
                </dt>
                <dd className="flex-1 text-sm text-text-secondary leading-relaxed">
                  {s.meaning}
                </dd>
                <dd className="font-mono text-xs text-text-muted flex-shrink-0">
                  exit {s.exitCode}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-text-muted leading-relaxed">{audit.note}</p>
        </div>
      </div>
    </>
  );
}
