import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl, docsUrl } from "@evnx/config";
import { integrations } from "@evnx/content";
import { CodeFrame } from "@evnx/mdx/code-frame";
import { Badge } from "@/components/ui/badge-status";
import { buttonVariants } from "@/components/ui/button";
import { CommandPill } from "@/components/ui/command-pill";

export const metadata: Metadata = {
  title: "Integrations",
  description: integrations.lede,
  alternates: { canonical: canonicalUrl("/integrations") },
  openGraph: { url: canonicalUrl("/integrations") },
};

/**
 * /integrations (DESIGN-BRIEF §6, D-V10): the homepage's two tiers in depth.
 *
 * ⚠️ Same rule as the homepage: "Syncs with" means evnx talks to the platform;
 * "Exports to" means it writes what that tool reads and you apply it. The
 * content file (@evnx/content integrations.ts) carries the sources for every
 * row; do not add a row here that is not there.
 */
export default function IntegrationsPage() {
  const { syncs, exports, workflow } = integrations;
  return (
    <div className="container-base section-padding">
      <header className="max-w-3xl mb-16">
        <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">{integrations.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-5">{integrations.heading}</h1>
        <p className="text-lg text-text-secondary leading-relaxed">{integrations.lede}</p>
      </header>

      <section aria-labelledby="syncs" className="mb-20">
        <h2 id="syncs" className="font-serif text-3xl font-bold mb-2">{syncs.title}</h2>
        <p className="text-text-secondary mb-8">{syncs.lede}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {syncs.targets.map((t) => (
            <article key={t.name} className="rounded-xl border border-border-muted bg-bg-surface p-6 flex flex-col">
              <h3 className="font-serif text-2xl font-bold mb-2">{t.name}</h3>
              <p className="text-text-secondary leading-relaxed mb-5">{t.body}</p>
              <CodeFrame
                label="Commands"
                copyText={t.commands.join("\n")}
                copyLabel={`${t.name} commands`}
                ariaLabel={`${t.name} commands`}
                className="mb-5"
              >
                <pre className="p-4 m-0 font-mono text-sm text-terminal-text leading-relaxed">
                  {t.commands.map((c) => (
                    <span key={c} className="block">
                      <span className="text-terminal-prompt select-none" aria-hidden>$ </span>
                      {c}
                    </span>
                  ))}
                </pre>
              </CodeFrame>
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <CommandPill href={docsUrl(`commands/${t.command.guide}`)}>{t.command.label}</CommandPill>
                <Link href={docsUrl(t.docsSlug)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  {t.name} guide
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 max-w-3xl">
          <h3 className="font-serif text-xl font-bold mb-3">{workflow.title} workflow</h3>
          <CodeFrame label="yaml" copyText={workflow.code} copyLabel="workflow steps" ariaLabel="GitHub Actions workflow">
            <pre className="p-5 m-0 font-mono text-sm text-terminal-text leading-relaxed">
              <code>{workflow.code}</code>
            </pre>
          </CodeFrame>
          <p className="mt-3 text-sm text-text-secondary">{workflow.exitCodes}</p>
        </div>
      </section>

      <section aria-labelledby="exports">
        <h2 id="exports" className="font-serif text-3xl font-bold mb-2">{exports.title}</h2>
        <p className="text-text-secondary mb-8">{exports.lede}</p>
        <div className="overflow-x-auto rounded-xl border border-border-muted" tabIndex={0} role="group" aria-label="Export formats">
          <table className="w-full text-sm">
            <caption className="sr-only">Targets evnx convert writes for, with the --to value each takes</caption>
            <thead className="bg-bg-surface">
              <tr>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">Target</th>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">--to</th>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">Writes</th>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">Needs</th>
              </tr>
            </thead>
            <tbody>
              {exports.targets.map((t) => (
                <tr key={t.format} className="border-t border-border-subtle align-top">
                  <th scope="row" className="text-left font-medium px-4 py-3">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {t.name}
                      {t.experimental && <Badge variant="warning">experimental</Badge>}
                    </span>
                  </th>
                  <td className="px-4 py-3 font-mono text-xs text-brand-400 whitespace-nowrap">{t.format}</td>
                  <td className="px-4 py-3 text-text-secondary">{t.writes}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted whitespace-nowrap">{t.needs ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CommandPill href={docsUrl(`commands/${exports.command.guide}`)}>{exports.command.label}</CommandPill>
          <Link href={docsUrl("reference/convert-reference")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Each format&apos;s output
          </Link>
        </div>
      </section>
    </div>
  );
}
