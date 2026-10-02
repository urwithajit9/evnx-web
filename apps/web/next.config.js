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
  transpilePackages: ["@evnx/config", "@evnx/content"],
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
      // Temporary on purpose: these move again when docs.evnx.dev exists, and
      // a 308 cached by browsers would then be the wrong answer forever.
      { source: "/docs", destination: "/guides", permanent: false },
      { source: "/docs/:path*", destination: "/guides/:path*", permanent: false },

      // ⚠️ The dead auth scaffold. `app/(auth)/login/` and `app/dashboard/`
      // were a non-functional sign-in form and an empty dashboard on the
      // MARKETING origin of a secrets product — ADR-5's week-one carve-out,
      // and ADR-1's rule that evnx.dev is anonymous-only.
      //
      // Redirected rather than deleted outright: anyone who reaches /login
      // wants to sign in, and the real sign-in is app.evnx.dev. A 404 would
      // be correct and unhelpful. Permanent, because this will not move
      // again — the product lives on its own origin by design.
      { source: "/login", destination: "https://app.evnx.dev/login", permanent: true },
      { source: "/dashboard", destination: "https://app.evnx.dev/vaults", permanent: true },
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
