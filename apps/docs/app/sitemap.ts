import type { MetadataRoute } from "next";
import { HOSTS } from "@evnx/config";
import { GUIDE_SECTIONS, getAllGuides } from "@evnx/docs-content";

/**
 * docs.evnx.dev's own sitemap.
 *
 * ⚠️ Per-host, deliberately. Each hostname publishes the URLs it actually
 * serves — schedule 3.5. A single combined sitemap would list evnx.dev URLs
 * under docs.evnx.dev, which Search Console rejects as cross-submission
 * unless both are in the same Domain property, and which makes the two
 * properties' coverage reports impossible to read separately.
 */
const url = (path: string) => `${HOSTS.docs}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const roots: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: url("/cli"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const sections: MetadataRoute.Sitemap = GUIDE_SECTIONS.map((s) => ({
    url: url(`/cli/${s.key}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ⚠️ Drafts filtered explicitly rather than relying on getAllGuides, which
  // only drops them when NODE_ENV is production. A non-production build would
  // otherwise publish a sitemap advertising pages that do not exist live.
  const guides: MetadataRoute.Sitemap = getAllGuides()
    .filter((g) => !g.draft)
    .map((g) => ({
      url: url(`/cli/${g.slug}`),
      lastModified: new Date(g.updatedAt ?? g.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...roots, ...sections, ...guides];
}
