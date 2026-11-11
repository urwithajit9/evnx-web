/**
 * The docs split is done: guides live at docs.evnx.dev/cli/*, and the old
 * /guides/* routes are gone from this app. The redirects below are what keep
 * every old URL working, so they are unconditional. There is no rollback
 * switch any more; do not reintroduce one without restoring the routes.
 */
// Overridable so the whole chain can be proven locally before it is real.
const DOCS_ORIGIN = process.env.NEXT_PUBLIC_DOCS_ORIGIN ?? "https://docs.evnx.dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,
  reactCompiler: true,

  // ⚠️ Required now that @evnx/config and @evnx/content are real workspace
  // packages. They export raw TypeScript from src/, and Next does not
  // transpile node_modules by default — pnpm links workspace packages into
  // node_modules, so without this the build fails on the first `.ts` import.
  // It was unnecessary while they resolved through tsconfig path aliases.
  transpilePackages: ["@evnx/config", "@evnx/content", "@evnx/mdx", "@evnx/docs-content"],
  serverExternalPackages: ["shiki", "vscode-oniguruma"],

  // Image domains for external avatars (GitHub, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },

  async redirects() {
    return [
      // /docs goes straight to the destination (no /docs -> /guides -> docs hop).
      { source: "/docs", destination: `${DOCS_ORIGIN}/cli`, statusCode: 301 },
      { source: "/docs/:path*", destination: `${DOCS_ORIGIN}/cli/:path*`, statusCode: 301 },

      // ⚠️ The dead auth scaffold. `app/(auth)/login/` and `app/dashboard/`
      // were a non-functional sign-in form and an empty dashboard on the
      // MARKETING origin of a secrets product — ADR-5's week-one carve-out,
      // and ADR-1's rule that evnx.dev is anonymous-only.
      //
      // Redirected rather than deleted outright: anyone who reaches /login
      // wants to sign in, and the real sign-in is app.evnx.dev. A 404 would
      // be correct and unhelpful. Permanent, because this will not move
      // again — the product lives on its own origin by design.
      // ⚠️ Trailing slashes are required. app.evnx.dev is a static export on
      // Cloudflare Pages and 308s /login to /login/, so without them these
      // were two-hop chains.
      { source: "/login", destination: "https://app.evnx.dev/login/", permanent: true },
      { source: "/dashboard", destination: "https://app.evnx.dev/vaults/", permanent: true },

      // ── The docs split ────────────────────────────────────────────────
      // `statusCode: 301` rather than `permanent: true` (which emits 308):
      // SPEC, the schedule and verify-redirects.mjs all say 301.
      { source: "/guides", destination: `${DOCS_ORIGIN}/cli`, statusCode: 301 },
      { source: "/guides/:path*", destination: `${DOCS_ORIGIN}/cli/:path*`, statusCode: 301 },
    ];
  },

  async rewrites() {
    return [
      // Umami analytics proxy (ad-blocker bypass).
      {
        source: "/stats/:match*",
        destination: "https://analytics.dotenv.space/:match*",
      },

      // ⚠️ Schedule P5. A REWRITE, not a redirect — this must answer 200 with
      // the script itself. Install commands get copied out of docs and blog
      // posts without `curl -L`, and a redirect turns those into a silent
      // no-op that writes HTML to a pipe.
      //
      // Points at the CLI repo's raw file, which is the single source
      // `dotenv.space/install.sh` already proxies (verified byte-identical,
      // sha256 a080c411…). Going direct skips the GitHub rename redirect that
      // dotenv.space's older `dotenv-space-cli` URL still travels through, so
      // the two URLs serve one file and cannot drift.
      {
        source: "/install.sh",
        destination:
          "https://raw.githubusercontent.com/urwithajit9/evnx/main/scripts/install.sh",
      },
    ];
  },
};

module.exports = nextConfig;
