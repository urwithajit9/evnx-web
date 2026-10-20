// The host evnx.dev's pages are served from. Same default and variable as
// CANONICAL_HOST in packages/config/src/site.ts, which this file cannot import.
const WEB_ORIGIN = process.env.NEXT_PUBLIC_CANONICAL_HOST ?? "https://www.evnx.dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["shiki", "vscode-oniguruma"],

  // ⚠️ The workspace packages export raw TypeScript and pnpm links them into
  // node_modules, which Next does not transpile by default.
  transpilePackages: ["@evnx/config", "@evnx/mdx", "@evnx/docs-content"],

  async redirects() {
    return [
      // ⚠️ D-175. The guides are written with `/guides/…` links — apps/web's
      // inline paths — and this app serves the same pages at `/cli/…` only, so
      // every one of those links was a 404 here. The page renderer now
      // rewrites them (lib/rehype-guide-hrefs.ts), so a reader never takes this
      // hop; it is the net for `/guides` URLs that arrive from outside:
      // bookmarks, search results, a link someone copied, a page rendered by
      // something that skipped the rewrite.
      //
      // `statusCode: 301`, as apps/web's split redirects use. A fragment never
      // reaches a server; the browser keeps it across the redirect.
      { source: "/guides", destination: "/cli", statusCode: 301 },
      { source: "/guides/:path*", destination: "/cli/:path*", statusCode: 301 },

      // The blog is evnx.dev's, and guides link it as `/blog/…` too — rewritten
      // at render time to the canonical web host; this is the same net.
      { source: "/blog", destination: `${WEB_ORIGIN}/blog`, statusCode: 301 },
      { source: "/blog/:path*", destination: `${WEB_ORIGIN}/blog/:path*`, statusCode: 301 },
    ];
  },
};

module.exports = nextConfig;
