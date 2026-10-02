/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,
  reactCompiler: true,
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

  // Umami analytics proxy (ad-blocker bypass)
  async rewrites() {
    return [
      {
        source: "/stats/:match*",
        destination: "https://analytics.dotenv.space/:match*",
      },
    ];
  },
};

module.exports = nextConfig;
