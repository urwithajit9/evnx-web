/**
 * ⚠️ THE SPLIT SWITCH, and the rollback for it.
 *
 * `inline` — /guides/* is served from this app (today).
 * `split`  — /guides/* 301s to docs.evnx.dev/cli/*.
 *
 * Flipping back to `inline` removes every redirect and the guides serve from
 * here again. That is schedule 3.4's rollback, and it is a single environment
 * variable rather than a re-migration — which is why 3.6 (deleting the guide
 * routes from this app) must NOT happen until 3.3 has passed against the live
 * site. Delete the routes and this switch stops being a way back.
 *
 * Must match NEXT_PUBLIC_DOCS_MODE in packages/config/src/site.ts: that value
 * decides where links POINT, this one decides where URLs GO. Set one and not
 * the other and the site either links to a host that 404s, or links to pages
 * that immediately redirect.
 */
const DOCS_MODE = process.env.NEXT_PUBLIC_DOCS_MODE ?? "inline";
// ⚠️ Overridable so the whole chain can be proven locally before it is real.
// Without this the 301 always points at a host that does not resolve yet, and
// "the redirect fires" is all you can ever test — not "the reader lands on a
// 200", which is the thing that actually matters.
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
      // ⚠️ /docs USED to be a temporary hop to /guides. Once the split is on
      // that becomes a CHAIN — /docs → 307 → /guides → 301 → docs.evnx.dev —
      // which is the exact thing the redirect verifier exists to prevent. It
      // slipped through because /docs was never a real page and so is not in
      // url-inventory.csv, which is what the gate walks.
      //
      // Now it goes straight to the destination, and becomes permanent once
      // there is a permanent destination to point at.
      ...(DOCS_MODE === "split"
        ? [
            { source: "/docs", destination: `${DOCS_ORIGIN}/cli`, statusCode: 301 },
            {
              source: "/docs/:path*",
              destination: `${DOCS_ORIGIN}/cli/:path*`,
              statusCode: 301,
            },
          ]
        : [
            { source: "/docs", destination: "/guides", permanent: false },
            { source: "/docs/:path*", destination: "/guides/:path*", permanent: false },
          ]),

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

      // ── Schedule 3.1 · the docs split ──────────────────────────────────
      //
      // ⚠️ Empty until NEXT_PUBLIC_DOCS_MODE=split. Enabling these before
      // docs.evnx.dev answers would 301 fifty-eight working pages onto a
      // hostname that does not resolve — which is worse than leaving them,
      // because a redirect to nothing is indexed as a redirect to nothing.
      //
      // `statusCode: 301` rather than `permanent: true` (which emits 308).
      // Both are equivalent to Google, and 308's method preservation is
      // irrelevant for GET-only documentation — but SPEC, the schedule and
      // the verification script all say 301, and every SEO tool understands
      // it without a footnote.
      ...(DOCS_MODE === "split"
        ? [
            { source: "/guides", destination: `${DOCS_ORIGIN}/cli`, statusCode: 301 },
            {
              source: "/guides/:path*",
              destination: `${DOCS_ORIGIN}/cli/:path*`,
              statusCode: 301,
            },
          ]
        : []),
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
