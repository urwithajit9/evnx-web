import Link from "next/link";
import { Github } from "lucide-react";
import { EVNX_VERSION, GITHUB_URL, CRATES_IO_URL } from "@/lib/config";

const LINKS = {
  Learn: [
    { href: "/guides", label: "Guides" },
    { href: "/guides/getting-started/installation", label: "Install Guide" },
    { href: "/guides/getting-started/quick-start", label: "Quick Start" },
    { href: "/blog", label: "Blog" },
    { href: "/changelog", label: "Changelog" },
  ],
  Project: [
    { href: GITHUB_URL, label: "GitHub", external: true },
    { href: CRATES_IO_URL, label: "Crates.io", external: true },
    { href: "/pricing", label: "Pricing" },
    { href: "/install", label: "Install" },
  ],
};

export function Footer() {
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

          {/* Links */}
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
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
