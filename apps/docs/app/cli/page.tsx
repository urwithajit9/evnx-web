import Link from "next/link";
import type { Metadata } from "next";
import {
  COMMAND_INDEX,
  GUIDE_SECTIONS,
  commandCount,
  getAllGuides,
  getGuidesBySection,
} from "@evnx/docs-content";
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

      {/* ─── Every command ──────────────────────────────────────────────────
          ⚠️ GENERATED. The list comes from `command-index.json`, which
          `scripts/sync-command-index.mjs` builds by walking the CLI binary's
          own argument parser. Nothing here is written by hand — that is the
          entire point. `EVNX_COMMANDS` was the hand-written version and it
          omitted `spec`.

          It is also the only place the docs show subcommands that have no
          guide of their own: `evnx vault share` is documented inside
          `commands/vault`, not at a page of its own, and before this there was
          no index that admitted it exists. */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-bold mb-2">Every command</h2>
        <p className="text-sm text-text-secondary mb-6">
          {commandCount()} commands and subcommands, read from evnx{" "}
          <span className="font-mono">{COMMAND_INDEX.evnx_version}</span> itself —
          so one that ships appears here, and one that is removed cannot linger.
        </p>

        <div className="space-y-5">
          {COMMAND_INDEX.commands.map((c) => (
            <div key={c.name}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {c.guide ? (
                  <Link
                    href={c.guide.replace("/guides/", "/cli/")}
                    className="font-mono text-sm text-brand-500 hover:underline"
                  >
                    evnx {c.name}
                  </Link>
                ) : (
                  <span className="font-mono text-sm">evnx {c.name}</span>
                )}
                <span className="text-sm text-text-secondary">{c.about}</span>
              </div>

              {c.subcommands.length > 0 && (
                <ul className="mt-1 ml-4 flex flex-wrap gap-x-4 gap-y-1">
                  {c.subcommands.map((s) => (
                    <li
                      key={s.path}
                      title={s.about ?? undefined}
                      className="font-mono text-xs text-text-muted"
                    >
                      {s.path.slice(c.name.length + 1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {COMMAND_INDEX.undocumented.length > 0 && (
          <p className="mt-6 text-xs text-text-muted">
            ⚠️ No guide yet:{" "}
            <span className="font-mono">
              {COMMAND_INDEX.undocumented.join(", ")}
            </span>
          </p>
        )}
      </section>
    </div>
  );
}
