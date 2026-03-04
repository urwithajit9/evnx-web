import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        // Backgrounds
        "bg-void": "#080B0F",
        "bg-base": "#0D1117",
        "bg-surface": "#161B22",
        "bg-overlay": "#1C2128",

        // Borders
        "border-subtle": "#21262D",
        "border-muted": "#30363D",
        "border-default": "#484F58",

        // Text
        "text-primary": "#E6EDF3",
        "text-secondary": "#8B949E",
        "text-muted": "#484F58",

        // Brand
        brand: {
          300: "#F8A07A",
          400: "#F07840",
          500: "#E8652A",
        },

        // Semantic
        success: "#3FB950",
        warning: "#D29922",
        danger: "#F85149",
        info: "#388BFD",

        // Terminal
        "terminal-bg": "#010409",
        "terminal-text": "#C9D1D9",
        "terminal-prompt": "#E8652A",

        // shadcn/ui compatibility (maps to CSS vars)
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--brand-500)",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--bg-overlay)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text-primary)",
        },
        border: "var(--border-muted)",
        input: "var(--border-muted)",
        ring: "var(--brand-500)",
        card: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-overlay)",
          foreground: "var(--text-primary)",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        mono: ["var(--font-mono)", "IBM Plex Mono", "Courier New", "monospace"],
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
      },

      // ─── Spacing ────────────────────────────────────────────────────────────
      maxWidth: {
        prose: "72ch",
        site: "1280px",
      },

      // ─── Border radius ──────────────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ─── Animations ─────────────────────────────────────────────────────────
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
  plugins: [require("tailwindcss-animate")],
};

export default config;
