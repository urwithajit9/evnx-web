import { ci } from "@evnx/content";
import { SectionHeading } from "./section-shell";

export function Ci() {
  return (
    <>
      <SectionHeading heading={ci.heading} lede={ci.lede} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-xl overflow-hidden border border-border-muted">
          <div className="px-4 py-2.5 bg-bg-overlay border-b border-border-subtle">
            <span className="font-mono text-xs text-text-muted">{ci.workflow.title}</span>
          </div>
          <pre className="p-5 bg-terminal-bg overflow-x-auto font-mono text-sm text-terminal-text leading-relaxed">
            <code>{ci.workflow.code}</code>
          </pre>
        </div>

        <div className="p-6 rounded-xl border border-border-muted bg-bg-base">
          <h3 className="font-serif text-xl font-bold mb-3">{ci.exitCodes.title}</h3>
          <p className="text-text-secondary leading-relaxed mb-5">{ci.exitCodes.body}</p>
          {/* ⚠️ `evnx diff` exits non-zero on a healthy project by design. Saying
              so here prevents the obvious, wrong CI gate. */}
          <p className="text-sm text-text-muted leading-relaxed border-t border-border-muted pt-4">
            {ci.note}
          </p>
        </div>
      </div>
    </>
  );
}
