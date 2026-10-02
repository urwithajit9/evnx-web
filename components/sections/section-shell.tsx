import type { ReactNode } from "react";
import type { SectionSpec } from "@evnx/content";

/**
 * The band every landing section sits in.
 *
 * ⚠️ Surface and anchor come from `landingSections` in @evnx/content, not from
 * the component. That is what makes reordering the page an edit to one array:
 * if each section hardcoded its own background, moving two sections would put
 * two identical bands next to each other and the rhythm would collapse.
 */
const SURFACE: Record<SectionSpec["surface"], string> = {
  base: "bg-bg-base",
  surface: "bg-bg-surface",
  void: "bg-bg-void",
};

export function SectionShell({
  spec,
  children,
}: {
  spec: SectionSpec;
  children: ReactNode;
}) {
  return (
    <section
      id={spec.anchor}
      className={`section-padding border-b border-border-muted ${SURFACE[spec.surface]}`}
    >
      <div className="container-base">{children}</div>
    </section>
  );
}

/** Heading block. One shape for every section, so they cannot drift apart. */
export function SectionHeading({
  eyebrow,
  heading,
  lede,
}: {
  eyebrow?: string;
  heading: ReactNode;
  lede?: string;
}) {
  return (
    <div className="mb-12 max-w-3xl">
      {eyebrow && (
        <div className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
        {heading}
      </h2>
      {lede && (
        <p className="text-lg text-text-secondary leading-relaxed">{lede}</p>
      )}
    </div>
  );
}
