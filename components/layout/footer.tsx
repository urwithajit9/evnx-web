import Link from "next/link";
import { Github, Star } from "lucide-react";
import { EVNX_VERSION, GITHUB_URL, CRATES_IO_URL } from "@/lib/config";

// ── TypeScript fix: every link has `external`, defaulting to false ────────────
// The previous LINKS object mixed { href, label } and { href, label, external }
// in the same array. TypeScript infers a union type where `external` only exists
// on some members — so destructuring `external` from the union is a type error.
// Solution: give every link the `external` key explicitly.

type NavLink = {
  href: string;
  label: string;
  external: boolean;
};

const LINKS: Record<string, NavLink[]> = {
  Learn: [
    { href: "/guides", label: "Guides", external: false },
    {
      href: "/guides/getting-started/installation",
      label: "Install Guide",
      external: false,
    },
    {
      href: "/guides/getting-started/quick-start",
      label: "Quick Start",
      external: false,
    },
    { href: "/blog", label: "Blog", external: false },
    { href: "/changelog", label: "Changelog", external: false },
  ],
  Project: [
    { href: GITHUB_URL, label: "GitHub", external: true },
    { href: CRATES_IO_URL, label: "Crates.io", external: true },
    { href: "/pricing", label: "Pricing", external: false },
    { href: "/install", label: "Install", external: false },
  ],
};

// ── GitHub stars — fetched server-side at build/revalidate time ───────────────
async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/urwithajit9/evnx", {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      // ISR: revalidate every hour
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Footer (async Server Component) ──────────────────────────────────────────
export async function Footer() {
  const stars = await getGitHubStars();

  return (
    <footer className="border-t border-border-subtle bg-bg-surface mt-auto">
      <div className="container-base py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 bg-brand-500 rounded flex items-center justify-center">
                <span className="font-mono font-bold text-black text-xs">
                  ev
                </span>
              </div>
              <span className="font-mono font-bold text-text-primary">
                evnx
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              The .env tool for developers who've been there.
            </p>
            <div className="bg-terminal-bg border border-border-subtle rounded p-3 font-mono text-xs text-terminal-text">
              <span className="text-brand-500">$ </span>
              curl -fsSL https://dotenv.space/install.sh | bash
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                {section}
              </p>
              <ul className="space-y-2">
                {links.map(({ href, label, external }) => (
                  <li key={href}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label} ↗
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
            <span>Made with 🦀 Rust</span>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span>v{EVNX_VERSION}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* GitHub link + live star count */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
              {stars !== null && (
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Star className="w-3 h-3 fill-current text-warning group-hover:text-warning" />
                  {formatStars(stars)}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
