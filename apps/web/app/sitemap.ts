import type { MetadataRoute } from "next";
import { DOCS_MODE, TESTIMONIALS_ENABLED, canonicalUrl } from "@evnx/config";
import { getAllBlogPosts, getAllGuides } from "@/lib/content";

/**
 * The sitemap, generated from the content that exists.
 *
 * ⚠️ WHAT THIS REPLACED, because the failure is instructive: a hand-written
 * array of **five** URLs, on a site with **eighty-four**. Every guide and
 * every blog post — 79 pages — was absent, discoverable only by crawling
 * links. It had been wrong since the day the second guide was written, and
 * nothing could ever have noticed, because a hardcoded list has no
 * relationship to the content it claims to describe.
 *
 * It also hardcoded `https://evnx.dev`, which 307s to `www` — so the one file
 * whose job is to declare canonical URLs named a hostname that redirects.
 * Both now come from `@evnx/config`.
 */

type Entry = MetadataRoute.Sitemap[number];

/** Pages that are not content — hand-listed because there is nothing to derive. */
const STATIC_PAGES: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/install", priority: 0.8, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/talks", priority: 0.5, changeFrequency: "yearly" },
  { path: "/security", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * ⚠️ `/login` and `/dashboard` are absent because they no longer exist. They
 * were a non-functional sign-in form and an empty dashboard on the marketing
 * origin of a secrets product; both now 308 to `app.evnx.dev`, and a sitemap
 * should list destinations, never redirects.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const dated = (iso: string | undefined, fallback: string) =>
    new Date(iso ?? fallback);

  // ⚠️ Once the split is on, every /guides/* URL is a 301 — and a sitemap
  // should list destinations, never redirects. Telling Google to crawl
  // eighty-two URLs that all bounce is the opposite of what the redirects are
  // for. docs.evnx.dev publishes its own sitemap for the real locations.
  const guides: Entry[] = DOCS_MODE === "split" ? [] : getAllGuides()
    // ⚠️ Filtered here, not relied on upstream. `getAllGuides` only drops
    // drafts when `isProd()`, so a non-production build would otherwise
    // publish a sitemap advertising pages that do not exist in production.
    .filter((g) => !g.draft)
    .map((g) => ({
      url: canonicalUrl(`/guides/${g.slug}`),
      lastModified: dated(g.updatedAt, g.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const posts: Entry[] = getAllBlogPosts()
    .filter((p) => !p.draft)
    .map((p) => ({
      url: canonicalUrl(`/blog/${p.slug}`),
      lastModified: dated(p.updatedAt, p.publishedAt),
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  // ⚠️ /testimonials is absent while the flag is off. A thin page that is
  // linked and indexed is a quality signal about the whole site, and the page
  // has nothing on it until there are approved rows.
  const statics: Entry[] = [
    ...STATIC_PAGES,
    ...(TESTIMONIALS_ENABLED
      ? [{ path: "/testimonials", priority: 0.4, changeFrequency: "monthly" as const }]
      : []),
  ]
    .filter((p) => !(DOCS_MODE === "split" && p.path.startsWith("/guides")))
    .map((p) => ({
    url: canonicalUrl(p.path),
    // No real modification date for a generated page; "now" is the honest
    // answer and tells crawlers nothing false.
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  return [...statics, ...guides, ...posts];
}
