import type { MetadataRoute } from "next";
import { HOSTS } from "@evnx/config";

/**
 * ⚠️ Generated rather than a static file, so the sitemap URL cannot drift
 * from the host. apps/web's robots.txt named the apex while content served
 * from www for long enough that the one file whose job is declaring canonical
 * locations pointed at a redirect.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${HOSTS.docs}/sitemap.xml`,
    host: HOSTS.docs,
  };
}
