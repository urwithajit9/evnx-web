import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { integrations } from "@evnx/content";
import { CodeFrame } from "@evnx/mdx/code-frame";
import { Badge } from "@/components/ui/badge-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandPill } from "@/components/ui/command-pill";
import { SectionHeading } from "./section-shell";

/**
 * Two labelled tiers (D-V10). Names are text, not logos: a logo wall blurs
 * "talks to it" and "writes a file for it", which is the distinction this
 * section exists to keep. Replaces the former CI section, whose workflow
 * snippet now sits behind a disclosure here.
 */
export function Integrations() {
  const { syncs, exports, workflow } = integrations;
  return (
    <>
      <SectionHeading eyebrow={integrations.eyebrow} heading={integrations.heading} lede={integrations.lede} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-1">{syncs.title}</h3>
          <p className="text-sm text-text-secondary mb-5">{syncs.lede}</p>
          <ul className="space-y-4">
            {syncs.targets.map((t) => (
              <li key={t.name}>
                <Card className="bg-bg-base">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <CardDescription>{t.body}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-4">
                    <CommandPill href={docsUrl(`commands/${t.command.guide}`)}>{t.command.label}</CommandPill>
                    <Link
                      href={docsUrl(t.docsSlug)}
                      className="inline-flex items-center gap-1 text-sm text-brand-400 hover:underline underline-offset-4"
                    >
                      {t.name} guide
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-2xl font-bold mb-1">{exports.title}</h3>
          <p className="text-sm text-text-secondary mb-5">{exports.lede}</p>
          <ul className="flex flex-wrap gap-2 mb-5">
            {exports.targets.map((t) => (
              <li key={t.name}>
                <span className="inline-flex items-center gap-2 rounded-md border border-border-muted bg-bg-base px-3 py-1.5 text-sm">
                  {t.name}
                  {t.experimental && <Badge variant="warning">experimental</Badge>}
                </span>
              </li>
            ))}
          </ul>
          <CommandPill href={docsUrl(`commands/${exports.command.guide}`)}>{exports.command.label}</CommandPill>
        </div>
      </div>

      {/* Native disclosure: keyboard and screen-reader support for free, and
          the snippet is in the HTML for search and for readers without JS. */}
      <details className="mt-10 group">
        <summary className="inline-flex items-center gap-2 cursor-pointer text-brand-400 hover:underline underline-offset-4">
          <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" aria-hidden />
          {workflow.summary}
        </summary>
        <div className="mt-5 max-w-3xl">
          <CodeFrame
            label={workflow.title}
            copyText={workflow.code}
            copyLabel="workflow steps"
            ariaLabel={`${workflow.title} workflow`}
          >
            <pre className="p-5 m-0 font-mono text-sm text-terminal-text leading-relaxed">
              <code>{workflow.code}</code>
            </pre>
          </CodeFrame>
          <p className="mt-4 text-sm text-text-secondary">{workflow.exitCodes}</p>
        </div>
      </details>
    </>
  );
}
