import type { Metadata } from "next";
import Link from "next/link";
import { security, getPublishedSecurityNotices } from "@evnx/content";
import { canonicalUrl, GITHUB_ORG } from "@evnx/config";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: security.title,
  description: security.lede,
  alternates: { canonical: canonicalUrl("/security") },
  openGraph: { url: canonicalUrl("/security") },
};

// SECURITY.md lives in this (evnx-web) repository.
const WEB_REPO_URL = `https://github.com/${GITHUB_ORG}/evnx-web`;

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function Page() {
  const notices = getPublishedSecurityNotices();

  return (
    <>
      <LegalPage doc={security} />

      <section className="pb-16 md:pb-24" aria-labelledby="security-notices">
        <div className="container-base max-w-2xl">
          <h2 id="security-notices" className="font-serif text-2xl font-bold mb-4">
            Security notices
          </h2>

          {notices.length === 0 ? (
            <p className="text-text-secondary leading-relaxed">No security notices.</p>
          ) : (
            <ul className="divide-y divide-border-subtle border-y border-border-subtle">
              {notices.map((n) => (
                <li key={n.slug} className="py-4">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted mb-1">
                    <time dateTime={n.date}>{formatDate(n.date)}</time>
                    {n.severity === "action-required" && (
                      <span className="px-2 py-0.5 rounded border border-warning/30 bg-warning/10 text-warning">
                        Action required
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/security/${n.slug}`}
                    className="font-serif text-lg font-bold hover:text-brand-400 transition-colors"
                  >
                    {n.title}
                  </Link>
                  <p className="text-text-secondary leading-relaxed mt-1">{n.summary}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-sm text-text-muted leading-relaxed">
            Reporting a vulnerability: email{" "}
            <a className="text-brand-400 hover:text-brand-300" href="mailto:security@evnx.dev">
              security@evnx.dev
            </a>{" "}
            or use GitHub&apos;s{" "}
            <a
              className="text-brand-400 hover:text-brand-300"
              href={`${WEB_REPO_URL}/security/advisories/new`}
              target="_blank"
              rel="noopener noreferrer"
            >
              private vulnerability reporting
            </a>
            . The full policy is in{" "}
            <a
              className="text-brand-400 hover:text-brand-300"
              href={`${WEB_REPO_URL}/blob/main/SECURITY.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              SECURITY.md
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
