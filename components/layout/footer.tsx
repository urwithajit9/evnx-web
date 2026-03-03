import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-border-muted mt-24">
      <div className="container-base section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
                e
              </div>
              <span className="font-serif text-lg font-bold">evnx</span>
            </div>
            <p className="text-text-secondary text-sm">
              The .env tool for developers who've been there.
            </p>
          </div>

          <div>
            <h3 className="font-mono font-semibold text-sm mb-4 text-text-primary">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guides" className="text-text-secondary hover:text-brand-500 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-text-secondary hover:text-brand-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-text-secondary hover:text-brand-500 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold text-sm mb-4 text-text-primary">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/urwithajit9/evnx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-brand-500 transition-colors flex items-center gap-2"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://crates.io/crates/evnx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-brand-500 transition-colors flex items-center gap-2"
                >
                  Crates.io <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold text-sm mb-4 text-text-primary">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-text-secondary inline-flex items-center gap-2">
                  MIT License
                </span>
              </li>
              <li>
                <span className="text-text-secondary text-xs">
                  Made with Rust
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-muted pt-8 flex flex-col md:flex-row items-center justify-between text-text-secondary text-xs">
          <p>© 2024 evnx. Built by developers, for developers.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a
              href="https://github.com/urwithajit9/evnx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-500 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
