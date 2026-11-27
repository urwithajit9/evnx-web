import Link from "next/link";
import { Check, X } from "lucide-react";
import { appUrl, docsUrl, fillLimits } from "@evnx/config";
import { cloud, trust } from "@evnx/content";
import { Badge } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Cloud as CloudArt } from "@/components/art/spots";
import { SectionHeading } from "./section-shell";

/**
 * Cloud sync and what it can and cannot see, as one section (D-V31,
 * 2026-11-27). They were two sections of about one laptop screen each.
 *
 * ⚠️ This section describes a SHIPPED product. What it replaced said "coming
 * soon" and offered a waitlist form, for a feature that went live in v0.4.0.
 * The call to action is an account, not an email box.
 *
 * ⚠️ THE TRUST HALF IS THE HIGHEST-RISK CONTENT ON THE PAGE. The merge kept
 * every row of "what the server holds" and every limit, with their full text:
 * the limits sit beside the guarantee, on the same screen, with the same
 * weight. What made it shorter was dropping the three capability cards to a
 * list of their titles, not trimming the disclosure. Do not collapse the
 * limits behind a toggle to save space.
 */
export function Cloud() {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="success">live</Badge>
        <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
          {cloud.eyebrow}
        </span>
      </div>

      <SectionHeading heading={cloud.heading} lede={cloud.lede} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center p-6 rounded-xl border border-success/30 bg-success/5 mb-6">
            {/* The cloud holds only scrambled bars: data it cannot read. */}
            <CloudArt size={64} className="shrink-0" />
            <div>
              <h3 className="font-serif text-xl font-bold mb-2 text-text-primary">
                {trust.guarantee.heading}
              </h3>
              <p className="text-text-secondary leading-relaxed">{trust.guarantee.body}</p>
            </div>
          </div>

          <ul className="space-y-2 mb-8">
            {cloud.capabilities.map((c) => (
              <li key={c.id} className="flex gap-3 text-text-primary">
                <Check className="w-4 h-4 mt-1 text-brand-400 shrink-0" aria-hidden />
                <span>{c.title}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild>
              <a href={appUrl("/register")}>{cloud.cta.primary}</a>
            </Button>
            <Link
              href={docsUrl(cloud.cta.secondaryDocsSlug)}
              className="text-brand-400 hover:underline underline-offset-4"
            >
              {cloud.cta.secondary}
            </Link>
          </div>

          {/* Real enforced numbers, from the server's own quotas. */}
          <p className="mt-5 text-sm text-text-muted">{fillLimits(cloud.freeTierNote, "free")}</p>
        </div>

        <div className="space-y-8">
          <h3 id="trust" className="font-serif text-2xl font-bold scroll-mt-20">
            {trust.heading}
          </h3>
          <div>
            <h4 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
              What the server holds
            </h4>
            <table className="w-full text-sm">
              <thead className="sr-only">
                <tr>
                  <th>Held</th>
                  <th>Not held</th>
                </tr>
              </thead>
              <tbody>
                {trust.held.map((row) => (
                  <tr key={row.held} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pr-4 text-text-secondary align-top">
                      <Check className="w-3.5 h-3.5 inline mr-1.5 text-text-muted" aria-hidden />
                      {row.held}
                    </td>
                    <td className="py-2 text-text-primary align-top">
                      <X className="w-3.5 h-3.5 inline mr-1.5 text-success" aria-hidden />
                      {row.notHeld}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
              And what it does not protect against
            </h4>
            <dl className="space-y-3">
              {trust.limits.map((l) => (
                <div key={l.title} className="border-l-2 border-warning/40 pl-4">
                  <dt className="font-medium text-text-primary">{l.title}</dt>
                  <dd className="text-sm text-text-secondary leading-relaxed">{l.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            href={docsUrl(trust.docsLink.docsSlug)}
            className="inline-block text-brand-400 hover:underline underline-offset-4"
          >
            {trust.docsLink.label}
          </Link>
        </div>
      </div>
    </>
  );
}
