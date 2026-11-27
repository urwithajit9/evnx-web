import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { integrations } from "@evnx/content";
import { Badge } from "@/components/ui/badge-status";

/**
 * Integrations as a strip (D-V31, 2026-11-27): two rows of names linking to
 * the full /integrations page, which keeps the cards, the guides and the CI
 * workflow snippet. It was a full section of cards, about one laptop screen.
 *
 * ⚠️ Still two labelled tiers, and still names as text, not logos (D-V10): a
 * logo wall blurs "talks to it" and "writes a file for it", which is the
 * distinction this strip exists to keep. Each row says which it is.
 */
export function Integrations() {
  const { syncs, exports } = integrations;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-2">
            {integrations.eyebrow}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight">{integrations.heading}</h2>
        </div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 text-brand-400 hover:underline underline-offset-4 shrink-0"
        >
          Every integration, and how each works
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-[9rem_minmax(0,1fr)] gap-x-6 gap-y-4 items-baseline">
        <dt>
          <span className="block font-medium text-text-primary">{syncs.title}</span>
          <span className="block text-xs text-text-muted">{syncs.lede}</span>
        </dt>
        <dd>
          <ul className="flex flex-wrap gap-2">
            {syncs.targets.map((t) => (
              <li key={t.name}>
                <Link
                  href={docsUrl(t.docsSlug)}
                  className="inline-flex items-center rounded-md border border-border-muted bg-bg-base px-3 py-1.5 text-sm text-text-primary hover:border-brand-500 transition-colors"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </dd>

        <dt>
          <span className="block font-medium text-text-primary">{exports.title}</span>
          <span className="block text-xs text-text-muted">with evnx convert</span>
        </dt>
        <dd>
          <ul className="flex flex-wrap gap-2">
            {exports.targets.map((t) => (
              <li key={t.name}>
                <span className="inline-flex items-center gap-2 rounded-md border border-border-muted bg-bg-base px-3 py-1.5 text-sm text-text-secondary">
                  {t.name}
                  {t.experimental && <Badge variant="warning">experimental</Badge>}
                </span>
              </li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>
  );
}
