import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { canonicalUrl, docsUrl } from "@evnx/config";
import { features } from "@evnx/content";
import { COMMAND_INDEX } from "@evnx/docs-content";
import { Spot } from "@/components/art/spots";
import { buttonVariants } from "@/components/ui/button";
import { CommandPill } from "@/components/ui/command-pill";

export const metadata: Metadata = {
  title: "Features",
  description: features.lede,
  alternates: { canonical: canonicalUrl("/features") },
  openGraph: { url: canonicalUrl("/features") },
};

/** "/guides/commands/scan" → the docs URL for it, in whichever docs mode is on. */
function guideUrl(guide: string | null | undefined): string | null {
  return guide ? docsUrl(guide.replace(/^\/guides\/?/, "")) : null;
}

/**
 * /features (DESIGN-BRIEF §6). The prose is @evnx/content; every command name,
 * its one-line description and its subcommands come from command-index.json,
 * which `pnpm cli:index` generates from the real binary. A feature whose
 * command has left the index is not rendered: a feature section for a command
 * a reader cannot run is worse than a shorter page.
 */
export default function FeaturesPage() {
  const byName = new Map(COMMAND_INDEX.commands.map((c) => [c.name, c]));
  const shown = features.features.filter((f) => byName.has(f.command));

  return (
    <div className="container-base section-padding">
      <header className="max-w-3xl mb-16">
        <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">{features.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-5">{features.heading}</h1>
        <p className="text-lg text-text-secondary leading-relaxed">{features.lede}</p>
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
          {shown.map((f) => (
            <a
              key={f.command}
              href={`#${f.command}`}
              className="text-sm px-3 py-1.5 rounded-md border border-border-muted text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
            >
              {f.title}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-6">
        {shown.map((f) => {
          const cmd = byName.get(f.command)!;
          const href = guideUrl(cmd.guide);
          return (
            <section
              key={f.command}
              id={f.command}
              aria-labelledby={`${f.command}-title`}
              className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 rounded-xl border border-border-muted bg-bg-surface p-6 md:p-10"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Spot id={f.spot} size={48} />
                  {href ? (
                    <CommandPill href={href}>{`evnx ${cmd.name}`}</CommandPill>
                  ) : (
                    <span className="font-mono text-xs text-text-muted">{`evnx ${cmd.name}`}</span>
                  )}
                </div>
                <h2 id={`${f.command}-title`} className="font-serif text-3xl font-bold mb-4">
                  {f.title}
                </h2>
                {f.body.map((p) => (
                  <p key={p} className="text-text-secondary leading-relaxed mb-4 max-w-prose">
                    {p}
                  </p>
                ))}
                <ul className="mt-2 space-y-2 max-w-prose">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-3 text-text-primary">
                      <span aria-hidden className="text-brand-400 mt-0.5">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {href && (
                  <Link href={href} className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-6`}>
                    Read the {cmd.name} guide
                  </Link>
                )}
              </div>

              {cmd.subcommands.length > 0 && (
                <aside aria-label={`${cmd.name} subcommands`} className="lg:border-l lg:border-border-subtle lg:pl-8">
                  <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Subcommands</p>
                  <ul className="space-y-3">
                    {cmd.subcommands
                      // Top level only (`cloud push`, not `scan rules list`).
                      .filter((s) => s.path.split(" ").length === 2)
                      .map((s) => (
                        <li key={s.path}>
                          <span className="block font-mono text-xs text-brand-400">evnx {s.path}</span>
                          <span className="block text-sm text-text-secondary leading-snug">{s.about}</span>
                        </li>
                      ))}
                  </ul>
                </aside>
              )}
            </section>
          );
        })}
      </div>

      <section aria-labelledby="all-commands" className="mt-24">
        <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
          {features.allCommands.eyebrow}
        </p>
        <h2 id="all-commands" className="font-serif text-3xl font-bold mb-3">
          {features.allCommands.heading}
        </h2>
        <p className="text-text-secondary mb-8 max-w-prose">
          {features.allCommands.lede} Indexed from evnx {COMMAND_INDEX.evnx_version}.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {COMMAND_INDEX.commands.map((c) => {
            const href = guideUrl(c.guide);
            return (
              <li key={c.name} className="flex gap-4 items-baseline border-b border-border-subtle pb-4">
                {href ? (
                  <Link href={href} className="font-mono text-sm text-brand-400 hover:underline underline-offset-4 shrink-0 w-28">
                    {c.name}
                  </Link>
                ) : (
                  <span className="font-mono text-sm text-text-muted shrink-0 w-28">{c.name}</span>
                )}
                <span className="text-sm text-text-secondary">{c.about}</span>
              </li>
            );
          })}
        </ul>
        <Link
          href={docsUrl("commands")}
          className="inline-flex items-center gap-1 mt-8 text-brand-400 hover:underline underline-offset-4"
        >
          Every flag and exit code, in the docs
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
