import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_SECTIONS, getAllGuides, getGuidesBySection } from "@evnx/docs-content";
import { HOSTS } from "@evnx/config";

export const metadata: Metadata = {
  title: "CLI reference",
  description: "Every evnx command, flag and exit code.",
  alternates: { canonical: `${HOSTS.docs}/cli` },
};

export default function CliIndex() {
  const bySection = getGuidesBySection();
  const total = getAllGuides().length;

  return (
    <div className="container-base section-padding max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-3">CLI reference</h1>
      <p className="text-lg text-text-secondary mb-10">
        {total} guides across {GUIDE_SECTIONS.length} sections.
      </p>
      <div className="space-y-4">
        {GUIDE_SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/cli/${s.key}`}
            className="block p-5 rounded-xl border border-border-muted bg-bg-surface hover:border-brand-500 transition-colors"
          >
            <span className="font-serif text-lg font-bold block mb-1">{s.label}</span>
            <span className="text-sm text-text-secondary block mb-2">{s.description}</span>
            <span className="font-mono text-xs text-text-muted">
              {(bySection[s.key] ?? []).length} guides
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
