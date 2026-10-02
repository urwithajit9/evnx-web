import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SITE, TALKS, canonicalUrl, docsUrl, type Talk } from "@evnx/config";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Conference talks and writing about evnx, Rust CLI distribution, and keeping secrets out of version control.",
  alternates: { canonical: canonicalUrl("/talks") },
  openGraph: { url: canonicalUrl("/talks") },
};

/**
 * ⚠️ Built because the landing page links here from two places and the route
 * did not exist. A proof strip pointing at a 404 is worse than no proof strip.
 *
 * ⚠️ NO FABRICATED MEDIA. The schedule asked for `VideoObject` structured
 * data, and that is correct *for a talk with a recording*. This one has no
 * published video and no slides URL, so emitting VideoObject would be
 * declaring a video that does not exist — to Google, in machine-readable
 * form, on the one page whose entire job is verifiable credibility. The
 * schema below describes the event, which is true, and `VideoObject` is
 * attached per talk only once `videoUrl` is set.
 */
function talkSchema(talk: Talk) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: talk.title,
    startDate: String(talk.year),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: talk.event,
      address: { "@type": "PostalAddress", addressLocality: talk.city, addressCountry: talk.country },
    },
    performer: { "@type": "Organization", name: SITE.name },
  };
  if (talk.videoUrl) {
    base.recordedIn = {
      "@type": "VideoObject",
      name: talk.title,
      contentUrl: talk.videoUrl,
      description: `${talk.title} — ${talk.event} ${talk.year}`,
    };
  }
  return base;
}

export default function TalksPage() {
  return (
    <div>
      <section className="bg-bg-surface border-b border-border-muted">
        <div className="container-base section-padding">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Talks</h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
            What shipping a secrets tool to nine package registries actually
            taught us, said in public.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-3xl">
          {TALKS.length === 0 ? (
            <p className="text-text-secondary">Nothing scheduled right now.</p>
          ) : (
            <ul className="space-y-5">
              {TALKS.map((talk) => (
                <li
                  key={`${talk.event}-${talk.year}`}
                  className="p-6 rounded-xl border border-border-muted bg-bg-surface"
                >
                  <script
                    type="application/ld+json"
                    // Structured data describes only what exists — see talkSchema.
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(talkSchema(talk)) }}
                  />
                  <h2 className="font-serif text-2xl font-bold mb-2">{talk.title}</h2>
                  <p className="font-mono text-sm text-text-muted mb-4">
                    {talk.event} {talk.year} · {talk.city}, {talk.country}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {talk.videoUrl && (
                      <a
                        href={talk.videoUrl}
                        className="text-brand-400 hover:underline underline-offset-4 inline-flex items-center gap-1"
                      >
                        Watch <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {talk.slidesUrl && (
                      <a
                        href={talk.slidesUrl}
                        className="text-brand-400 hover:underline underline-offset-4 inline-flex items-center gap-1"
                      >
                        Slides <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {talk.url && (
                      <a
                        href={talk.url}
                        className="text-text-secondary hover:underline underline-offset-4 inline-flex items-center gap-1"
                      >
                        Event page <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {/* ⚠️ Says so rather than leaving an empty card. A talk row
                        with no links reads as broken; this reads as honest. */}
                    {!talk.videoUrl && !talk.slidesUrl && !talk.url && (
                      <span className="text-text-muted">
                        No recording published.
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 pt-8 border-t border-border-muted">
            <h2 className="font-serif text-xl font-bold mb-3">Invite us</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Happy to talk about zero-knowledge encryption in developer tools,
              distributing a Rust binary to nine registries, or why{" "}
              <code className="font-mono text-sm text-brand-400">.env</code> is
              still the most common way credentials leak.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="mailto:support@evnx.dev?subject=Speaking"
                className="text-brand-400 hover:underline underline-offset-4"
              >
                Get in touch
              </a>
              <Link
                href={docsUrl("reference/cloud-architecture")}
                className="text-text-secondary hover:underline underline-offset-4"
              >
                The architecture, if you want the detail first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
