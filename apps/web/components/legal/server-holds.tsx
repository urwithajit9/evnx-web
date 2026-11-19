import Link from "next/link";
import { docsUrl } from "@evnx/config";
import { trust } from "@evnx/content";

/**
 * The threat model on /security: what the server holds, what it does not, and
 * the known limits — the SAME data the homepage trust section renders
 * (@evnx/content trust.ts), so the two pages cannot disagree.
 */
export function ServerHolds() {
  return (
    <section className="pb-16" aria-labelledby="threat-model">
      <div className="container-base max-w-2xl">
        <h2 id="threat-model" className="font-serif text-2xl font-bold mb-2">
          {trust.heading}
        </h2>
        <p className="text-text-secondary leading-relaxed mb-6">{trust.guarantee.body}</p>

        <div className="rounded-xl border border-border-muted overflow-hidden mb-10">
          <table className="w-full text-sm">
            <caption className="sr-only">What the evnx server holds and does not hold</caption>
            <thead className="bg-bg-surface">
              <tr>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">
                  Server holds
                </th>
                <th scope="col" className="text-left font-mono text-xs uppercase tracking-widest text-text-muted px-4 py-3">
                  Server never holds
                </th>
              </tr>
            </thead>
            <tbody>
              {trust.held.map((r) => (
                <tr key={r.held} className="border-t border-border-subtle">
                  <td className="px-4 py-3 text-text-secondary">{r.held}</td>
                  <td className="px-4 py-3 text-text-primary">{r.notHeld}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-serif text-xl font-bold mb-4">Known limits</h3>
        <dl className="space-y-5">
          {trust.limits.map((l) => (
            <div key={l.title}>
              <dt className="font-medium text-text-primary">{l.title}</dt>
              <dd className="text-text-secondary leading-relaxed mt-1">{l.body}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={docsUrl(trust.docsLink.docsSlug)}
          className="inline-block mt-8 text-brand-400 hover:underline underline-offset-4"
        >
          {trust.docsLink.label} →
        </Link>
      </div>
    </section>
  );
}
