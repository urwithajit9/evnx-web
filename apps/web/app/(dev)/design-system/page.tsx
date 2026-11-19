import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeFrame } from "@evnx/mdx/code-frame";
import { CopyButton } from "@evnx/mdx/copy-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge-status";
import { CommandPill } from "@/components/ui/command-pill";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { TerminalBlock } from "@/components/sections/terminal-block";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * /design-system — every Phase A component on one page, for review in both
 * themes (DESIGN-BRIEF §7, step 6).
 *
 * ⚠️ DEVELOPMENT ONLY. In a production build it is a 404, so it never ships,
 * never reaches the sitemap (which is an explicit list) and is never indexed.
 * Not `/_design`: an App Router folder starting with `_` is private and never
 * becomes a route.
 *
 * ⚠️ The terminal lines below are labelled illustrative. They demonstrate the
 * component, not the CLI; real transcripts live in @evnx/content.
 */
export const metadata: Metadata = {
  title: "Design system (dev)",
  robots: { index: false, follow: false },
};

const SWATCHES: { group: string; tokens: string[] }[] = [
  { group: "Surfaces", tokens: ["bg-void", "bg-base", "bg-surface", "bg-overlay"] },
  { group: "Borders", tokens: ["border-subtle", "border-muted", "border-default"] },
  { group: "Text", tokens: ["text-primary", "text-secondary", "text-muted"] },
  { group: "Brand", tokens: ["brand-500", "brand-400", "brand-300", "brand-fg"] },
  { group: "Semantic", tokens: ["success", "warning", "danger", "info"] },
  { group: "Terminal (dark in both themes)", tokens: ["terminal-bg", "terminal-text", "terminal-prompt"] },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-t border-border-subtle">
      <h2 className="font-serif text-2xl font-bold mb-6">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="container-base max-w-5xl py-12">
      <div className="flex items-start justify-between gap-6 mb-4">
        <div>
          <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-2">dev only</p>
          <h1 className="font-serif text-4xl font-bold mb-2">Design system</h1>
          <p className="text-text-secondary max-w-prose">
            Phase A components on the @evnx/tokens palette. Switch the theme and check every
            block: text must stay readable, and code surfaces must stay dark.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Section title="Colour tokens">
        <div className="space-y-6">
          {SWATCHES.map(({ group, tokens }) => (
            <div key={group}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">{group}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tokens.map((t) => (
                  <div key={t} className="rounded-lg border border-border-muted overflow-hidden">
                    <div className="h-12" style={{ background: `var(--${t})` }} />
                    <p className="font-mono text-xs px-2 py-1.5 text-text-secondary">--{t}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-4">
          <p className="font-serif text-5xl font-bold leading-tight">Fraunces display</p>
          <p className="font-serif text-3xl font-bold">Fraunces section heading</p>
          <p className="text-lg font-semibold">IBM Plex Sans, H3 / UI emphasis</p>
          <p className="max-w-prose leading-relaxed text-text-secondary">
            IBM Plex Sans body. Readable at length across guides and posts, with a measure of at
            most 72 characters. Inline code stays mono: <code className="font-mono text-sm px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-brand-300">evnx scan</code>.
          </p>
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Plex Mono label · eyebrow · metadata</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button>Install evnx</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Delete</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small (36px)</Button>
          <Button>Default (44px)</Button>
          <Button size="lg">Large (48px)</Button>
        </div>
      </Section>

      <Section title="Pills">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="success">live</Badge>
          <Badge variant="warning">experimental</Badge>
          <Badge variant="danger">critical</Badge>
          <Badge variant="info">deploy</Badge>
          <Badge variant="brand">most popular</Badge>
          <Badge>neutral</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CommandPill href="#">evnx scan</CommandPill>
          <CommandPill href="#">evnx validate</CommandPill>
          <CommandPill href="#">evnx cloud run</CommandPill>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Catch secrets before they ship</CardTitle>
              <CardDescription>Card with header, body and footer. Border, no shadow, in both themes.</CardDescription>
            </CardHeader>
            <CardContent>
              <CommandPill href="#">evnx scan</CommandPill>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Read the guide</Button>
            </CardFooter>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-text-secondary">A bare card with padding only.</p>
          </Card>
        </div>
      </Section>

      <Section title="Code surfaces">
        <div className="space-y-6">
          <TerminalBlock
            tabs={["pre-commit", "doctor"]}
            lines={[
              { type: "prompt", content: "evnx scan" },
              { type: "dim", content: "illustrative output for this page only" },
              { type: "error", content: "✗  example finding" },
              { type: "warning", content: "!  example warning" },
              { type: "success", content: "✓  example pass" },
            ]}
          />
          <CodeBlock language="bash">{`# plain code block (CodeBlock)\nevnx --version\n[OK] illustrative line`}</CodeBlock>
          <CodeFrame label="CodeFrame" copyText="evnx --help" ariaLabel="CodeFrame example">
            <pre className="p-4 m-0 font-mono text-sm text-terminal-text">evnx --help</pre>
          </CodeFrame>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">CopyButton:</span>
            <CopyButton text="evnx scan" label="command" />
            <CopyButton text="evnx scan" label="command" variant="icon" />
          </div>
        </div>
      </Section>
    </div>
  );
}
