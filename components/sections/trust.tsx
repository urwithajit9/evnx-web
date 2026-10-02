import Link from "next/link";
import { Check, X } from "lucide-react";
import { docsUrl } from "@evnx/config";
import { trust } from "@evnx/content";
import { SectionHeading } from "./section-shell";

/**
 * ⚠️ THE HIGHEST-RISK SECTION ON THE PAGE.
 *
 * Over-claiming here costs the one thing the product is sold on. The limits
 * are rendered with the same weight as the guarantee, on the same screen, on
 * purpose — a limits list the reader has to go looking for is not a
 * disclosure. Do not collapse it behind a toggle to save vertical space.
 */
export function Trust() {
  return (
    <>
      <SectionHeading heading={trust.heading} lede={trust.lede} />

      <div className="p-6 rounded-xl border border-success/30 bg-success/5 mb-10 max-w-3xl">
        <h3 className="font-serif text-xl font-bold mb-2 text-text-primary">
          {trust.guarantee.heading}
        </h3>
        <p className="text-text-secondary leading-relaxed">{trust.guarantee.body}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
            What the server holds
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left font-medium text-text-secondary py-2">Held</th>
                <th className="text-left font-medium text-text-secondary py-2">Not held</th>
              </tr>
            </thead>
            <tbody>
              {trust.held.map((row) => (
                <tr key={row.held} className="border-b border-border-subtle last:border-0">
                  <td className="py-2.5 pr-4 text-text-secondary align-top">
                    <Check className="w-3.5 h-3.5 inline mr-1.5 text-text-muted" aria-hidden />
                    {row.held}
                  </td>
                  <td className="py-2.5 text-text-primary align-top">
                    <X className="w-3.5 h-3.5 inline mr-1.5 text-success" aria-hidden />
                    {row.notHeld}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
            And what it does not protect against
          </h3>
          <dl className="space-y-4">
            {trust.limits.map((l) => (
              <div key={l.title} className="border-l-2 border-warning/40 pl-4">
                <dt className="font-medium text-text-primary mb-1">{l.title}</dt>
                <dd className="text-sm text-text-secondary leading-relaxed">{l.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Link
        href={docsUrl(trust.docsLink.docsSlug)}
        className="inline-block mt-10 text-brand-400 hover:underline underline-offset-4"
      >
        {trust.docsLink.label}
      </Link>
    </>
  );
}
