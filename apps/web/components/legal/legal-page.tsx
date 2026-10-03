import type { LegalDoc } from "@evnx/content";

/**
 * One renderer for /privacy, /terms and /security.
 *
 * ⚠️ Deliberately plain. Legal text is read by people who are already slightly
 * suspicious, and a page that looks designed reads as a page that was written
 * to be skimmed past. Long measure, generous spacing, no cards.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">{doc.title}</h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed mb-4">
            {doc.lede}
          </p>
          <p className="font-mono text-xs text-text-muted">
            Last updated {doc.updated}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-2xl">
          {doc.sections.map((s) => (
            <section key={s.heading} className="mb-12 last:mb-0">
              <h2 className="font-serif text-2xl font-bold mb-4">{s.heading}</h2>

              {s.body.map((p) => (
                <p key={p} className="text-text-secondary leading-relaxed mb-4">
                  {p}
                </p>
              ))}

              {s.list && (
                <ul className="space-y-2.5 mt-5">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-3 text-text-secondary leading-relaxed">
                      <span className="text-brand-500 flex-shrink-0 mt-1.5" aria-hidden>
                        <span className="block w-1 h-1 rounded-full bg-current" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {s.callout && (
                <p className="mt-5 border-l-2 border-brand-500 pl-4 text-text-secondary leading-relaxed">
                  {s.callout}
                </p>
              )}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
