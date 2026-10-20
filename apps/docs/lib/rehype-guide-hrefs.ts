// ─── Author-form guide links → the paths this app serves (D-175) ─────────────
//
// Guides link to each other as `/guides/…`, because apps/web serves them there
// in inline mode and the MDX is shared. This app serves the same pages at
// `/cli/…` and nothing at `/guides`, so the links went out unchanged and every
// one was a 404 on docs.evnx.dev: 352 hrefs on 63 of 72 pages, measured on
// 2026-10-20. `check:links` stayed green throughout, because it resolves
// `/guides/…` against the guide list — the author's view, not this app's.
//
// Rewritten here, at render time, so a reader never takes a redirect hop. The
// `/guides/:path*` 301 in next.config.js is the safety net for links from
// outside (bookmarks, search results, other sites), not the mechanism.
//
// ⚠️ The same is true of evnx.dev's own pages. Four guides link `/blog/…`,
// which apps/web serves and this app does not: those were 404s here too, found
// by `check-content-links.mjs --built apps/docs` once it existed. They become
// absolute links to the canonical web host.
//
// Two shapes carry an href by the time rehype runs:
//   - a markdown link, `[text](/guides/x)` → an `a` element
//   - a JSX prop, `<Prerequisite href="/guides/x">` → an mdxJsx attribute
// `CommandRef` builds its own href and gets `guideHref` as a prop instead.

import { canonicalUrl } from "@evnx/config";
import { guideHref } from "@evnx/docs-content/commands";

/** Pages apps/web serves and this app does not, linked by root-relative path. */
const WEB_ONLY = /^\/(blog|pricing|changelog|install|testimonials|talks)(?=$|[/#?])/;

/** An href as written in a guide → one that resolves on docs.evnx.dev. */
export function docsHref(href: string): string {
  if (WEB_ONLY.test(href)) return canonicalUrl(href);
  return guideHref(href);
}

type JsxAttribute = { type: string; name?: string; value?: unknown };
type HastNode = {
  type: string;
  properties?: Record<string, unknown>;
  attributes?: JsxAttribute[];
  children?: HastNode[];
};

function rewrite(node: HastNode): void {
  if (node.type === "element" && typeof node.properties?.href === "string") {
    node.properties.href = docsHref(node.properties.href);
  }
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    for (const attr of node.attributes ?? []) {
      // A string literal only. An expression (`href={x}`) is code; there is
      // none in the guides, and guessing at one would be worse than leaving it.
      if (attr.type === "mdxJsxAttribute" && attr.name === "href" && typeof attr.value === "string") {
        attr.value = docsHref(attr.value);
      }
    }
  }
  node.children?.forEach(rewrite);
}

/**
 * Rehype plugin: every root-relative `/guides…` href becomes `/cli…`, and a
 * link to an evnx.dev-only page becomes absolute.
 */
export function rehypeGuideHrefs() {
  return (tree: unknown) => rewrite(tree as HastNode);
}
