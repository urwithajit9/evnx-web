import type { MetadataRoute } from "next";
import { canonicalUrl } from "@evnx/config";
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
  { path: "/testimonials", priority: 0.4, changeFrequency: "monthly" },
];

/**
 * ⚠️ `/login` and `/dashboard` are deliberately absent. They are the dead auth
 * scaffold ADR-5 removes, `public/robots.txt` already disallows them, and a
 * sitemap that lists a disallowed URL sends Search Console a contradiction.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const dated = (iso: string | undefined, fallback: string) =>
    new Date(iso ?? fallback);

  const guides: Entry[] = getAllGuides()
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

  const statics: Entry[] = STATIC_PAGES.map((p) => ({
    url: canonicalUrl(p.path),
    // No real modification date for a generated page; "now" is the honest
    // answer and tells crawlers nothing false.
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  return [...statics, ...guides, ...posts];
}
