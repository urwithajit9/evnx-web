import { CodeBlock } from '@/components/ui/code-block';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CopyButton } from '@/components/ui/copy-button';

export const metadata = {
  title: 'Install evnx',
  description: 'Install evnx in one command.',
};

export default function InstallPage() {
  return (
    <div>
      <section className="bg-bg-base border-b border-border-muted">
        <div className="container-base section-padding flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Install evnx
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-8">
            Get up and running in seconds. Choose your preferred installation method.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-2xl">
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">macOS & Linux</h2>
              <p className="text-text-secondary mb-4">
                Quick install using our automated script:
              </p>
              <div className="relative bg-terminal-bg border border-border-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-terminal-text font-mono text-sm break-all">
                    curl -fsSL https://dotenv.space/install.sh | bash
                  </code>
                  <CopyButton text="curl -fsSL https://dotenv.space/install.sh | bash" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Windows</h2>
              <p className="text-text-secondary mb-4">
                Using Windows Package Manager:
              </p>
              <div className="relative bg-terminal-bg border border-border-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-terminal-text font-mono text-sm">
                    winget install evnx
                  </code>
                  <CopyButton text="winget install evnx" />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                Alternatively, use Cargo (available on all platforms)
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">All Platforms with Cargo</h2>
              <p className="text-text-secondary mb-4">
                Install using Rust's package manager:
              </p>
              <div className="relative bg-terminal-bg border border-border-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-terminal-text font-mono text-sm">
                    cargo install evnx
                  </code>
                  <CopyButton text="cargo install evnx" />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                Requires Rust 1.70+. Install Rust at{' '}
                <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-400">
                  rustup.rs
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Verify Installation</h2>
              <p className="text-text-secondary mb-4">
                Check that evnx is installed correctly:
              </p>
              <CodeBlock
                language="bash"
                showLineNumbers={false}
              >{`evnx --version
evnx 0.2.0`}</CodeBlock>
            </div>

            <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
              <h2 className="text-2xl font-serif font-bold mb-4">What's Next?</h2>
              <p className="text-text-secondary mb-6">
                Now that evnx is installed, learn how to use it:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/guides">Read Guides</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://github.com/urwithajit9/evnx" target="_blank">
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
