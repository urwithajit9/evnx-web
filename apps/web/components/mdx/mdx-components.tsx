import { mdxComponents as shared } from "@evnx/mdx";
import { AuthorNote } from "./author-note";

/**
 * The MDX component set for apps/web.
 *
 * ⚠️ `AuthorNote` is NOT in `@evnx/mdx`, deliberately. It reads the app's
 * author records through `lib/content`, and a shared rendering package must
 * not depend on the app that consumes it. It is also blog-only — six posts
 * use it, zero guides — so the docs app will never need it.
 *
 * The package exports what both apps must render identically; each app adds
 * what only it has.
 */
export const mdxComponents = {
  ...shared,
  AuthorNote,
};
