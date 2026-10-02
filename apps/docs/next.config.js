/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["shiki", "vscode-oniguruma"],

  // ⚠️ The workspace packages export raw TypeScript and pnpm links them into
  // node_modules, which Next does not transpile by default.
  transpilePackages: ["@evnx/config", "@evnx/mdx", "@evnx/docs-content"],
};

module.exports = nextConfig;
