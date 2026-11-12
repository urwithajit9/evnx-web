import fs from "fs";
import path from "path";
import { getPublishedSecurityNotice } from "@evnx/content";

const DIR = path.join(process.cwd(), "content", "security");

/**
 * The MDX body of a PUBLISHED notice, or null.
 *
 * The slug is looked up in the published list first, so a request can never
 * reach the filesystem with an arbitrary string, and an unpublished notice's
 * file is never read even if it exists.
 */
export function getSecurityNoticeBody(slug: string): string | null {
  if (!getPublishedSecurityNotice(slug)) return null;
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}
