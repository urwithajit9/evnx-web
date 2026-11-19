import Link from "next/link";
import { Github, Star } from "lucide-react";
import { EVNX_VERSION, GITHUB_URL, CRATES_IO_URL, NPM_URL, PYPI_URL, AGENT_SKILLS_URL } from "@/lib/config";
import { TESTIMONIALS_ENABLED, docsUrl } from "@evnx/config";
import { BrandMark } from "./brand-mark";

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
    { href: "/features", label: "Features", external: false },
    { href: "/integrations", label: "Integrations", external: false },
    // ⚠️ Same reason as the header — see the note there.
    { href: docsUrl(), label: "Guides", external: false },
    {
      href: docsUrl("getting-started/installation"),
      label: "Install Guide",
      external: false,
    },
    {
      href: docsUrl("getting-started/quick-start"),
      label: "Quick Start",
      external: false,
    },
    { href: "/blog", label: "Blog", external: false },
    { href: "/changelog", label: "Changelog", external: false },
    // ⚠️ Shown only once there are approved testimonials — see
    // TESTIMONIALS_ENABLED.
    ...(TESTIMONIALS_ENABLED
      ? [{ href: "/testimonials", label: "Testimonials", external: false }]
      : []),
  ],
  Project: [
    { href: GITHUB_URL, label: "GitHub", external: true },
    { href: CRATES_IO_URL, label: "Crates.io", external: true },
    { href: NPM_URL, label: "NPM", external: true },
    { href: PYPI_URL, label: "PyPI", external: true },
    { href: AGENT_SKILLS_URL, label: "Agent Skills", external: true },
    { href: "/pricing", label: "Pricing", external: false },
    { href: "/install", label: "Install", external: false },
    { href: "/security", label: "Security", external: false },
    { href: "/privacy", label: "Privacy", external: false },
    { href: "/terms", label: "Terms", external: false },
    // ⚠️ Linked, not merely published. A payment processor's website review
    // checks that the site LINKS to its refund policy — a page that resolves
    // but is unreachable from the site can still fail verification. The same
    // applies to /pricing above, which was commented out while there was
    // nothing to buy and had to be restored for exactly this reason.
    { href: "/refunds", label: "Refunds", external: false },
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
              <BrandMark />
              <span className="font-mono font-bold text-text-primary">
                evnx
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              The .env tool for developers who&apos;ve been there.
            </p>
            <div className="bg-terminal-bg border border-border-subtle rounded p-3 font-mono text-xs text-terminal-text">
              <span className="text-brand-500">$ </span>
              curl -fsSL https://dotenv.space/install.sh | bash
            </div>
          </div>

          {/* Link columns — one landmark, each column labelled by its heading */}
          <nav aria-label="Footer" className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p id={`footer-${section}`} className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
                {section}
              </p>
              <ul aria-labelledby={`footer-${section}`} className="space-y-2">
                {links.map(({ href, label, external }) => (
                  <li key={href}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label} <span aria-hidden>↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          </nav>
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
              aria-label={stars !== null ? `evnx on GitHub, ${formatStars(stars)} stars (opens in a new tab)` : "evnx on GitHub (opens in a new tab)"}
            >
              <Github className="w-4 h-4" aria-hidden />
              {stars !== null && (
                <span aria-hidden className="flex items-center gap-1 font-mono text-xs">
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
