// ─── @evnx/tokens Tailwind preset ────────────────────────────────────────────
//
// Shared by apps/web and apps/docs. Each app's tailwind.config.ts keeps only
// what is genuinely its own — `content` paths and plugins — and takes
// everything else from here, so the two sites cannot drift apart again (their
// configs had already diverged before this package existed).
//
// ⚠️ Colours are `rgb(var(--c-NAME) / <alpha-value>)`, NOT hex. The old configs
// hard-coded hex, so `bg-bg-base` compiled to #0D1117 and no CSS variable —
// and therefore no theme — could ever change it. The channel form also makes
// opacity modifiers (`bg-brand-500/10`, ~100 uses) work for every token,
// including the shadcn names, where `var(--x)` silently dropped the alpha.
//
// Values live in ./tokens.css. Plain CommonJS on purpose: tailwind.config.ts
// loads it with `require`, the same way it loads tailwindcss-animate.

/** @param {string} name */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // next-themes sets class="dark" | "light" on <html>; existing `dark:`
  // variants (InstallPageClient, alert, mermaid) keep working.
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        // Backgrounds, darkest → lightest in the dark theme
        "bg-void": c("bg-void"),
        "bg-base": c("bg-base"),
        "bg-surface": c("bg-surface"),
        "bg-overlay": c("bg-overlay"),

        // Borders
        "border-subtle": c("border-subtle"),
        "border-muted": c("border-muted"),
        "border-default": c("border-default"),

        // Text
        "text-primary": c("text-primary"),
        "text-secondary": c("text-secondary"),
        "text-muted": c("text-muted"),

        // Brand. `brand-fg` is the text colour ON a brand fill: black in the
        // dark theme (6.3:1), white in the light one (5.5:1). Never text-black.
        brand: {
          300: c("brand-300"),
          400: c("brand-400"),
          500: c("brand-500"),
          fg: c("brand-fg"),
        },

        // Semantic
        success: c("success"),
        warning: c("warning"),
        danger: c("danger"),
        info: c("info"),

        // Terminal — dark in both themes; see the dark-island note in tokens.css
        "terminal-bg": c("terminal-bg"),
        "terminal-text": c("terminal-text"),
        "terminal-prompt": c("terminal-prompt"),

        // shadcn/ui compatibility, mapped straight to the tokens above
        background: c("bg-base"),
        foreground: c("text-primary"),
        primary: { DEFAULT: c("brand-500"), foreground: c("brand-fg") },
        secondary: { DEFAULT: c("bg-surface"), foreground: c("text-primary") },
        muted: { DEFAULT: c("bg-surface"), foreground: c("text-muted") },
        accent: { DEFAULT: c("bg-overlay"), foreground: c("text-primary") },
        destructive: { DEFAULT: c("danger"), foreground: c("text-primary") },
        border: c("border-muted"),
        input: c("border-muted"),
        ring: c("brand-500"),
        card: { DEFAULT: c("bg-surface"), foreground: c("text-primary") },
        popover: { DEFAULT: c("bg-overlay"), foreground: c("text-primary") },
      },

      // D-V5: Plex Sans for body and UI, Plex Mono for code, commands and
      // labels, Fraunces for display. Each app loads them with next/font and
      // exposes --font-sans / --font-mono / --font-serif on <html>.
      fontFamily: {
        sans: ["var(--font-sans)", "IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
      },

      maxWidth: {
        prose: "72ch",
        site: "1280px",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
      },
    },
  },
};
