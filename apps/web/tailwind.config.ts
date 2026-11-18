import type { Config } from "tailwindcss";

// Colours, fonts, radii and animations come from @evnx/tokens, shared with the
// other app (D-V16). Only what is this app's own — content paths and plugins —
// belongs here. To change a colour, edit packages/tokens/tokens.css.
const config: Config = {
  presets: [require("@evnx/tokens/tailwind-preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    // ⚠️ Blog posts render through @evnx/mdx, which lives outside this app.
    // Without this line a class used there reached the CSS only if something
    // in this app happened to use it too. Dozens did not, among them `my-6`
    // (code blocks and callouts had no vertical margin) and `max-w-prose`
    // (paragraphs ran the full column instead of 72ch).
    "../../packages/mdx/src/**/*.{ts,tsx}",
  ],
  plugins: [require("tailwindcss-animate")],
};

export default config;
