/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Experimental features for Next.js 15
  experimental: {
    // Required for next-mdx-remote/rsc in App Router
    serverComponentsExternalPackages: ["shiki", "vscode-oniguruma"],
  },

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

  // Redirect /docs to /guides for now (will change when docs launches)
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/guides",
        permanent: false,
      },
      {
        source: "/docs/:path*",
        destination: "/guides/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
