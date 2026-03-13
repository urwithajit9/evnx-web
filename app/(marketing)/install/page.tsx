import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { EVNX_VERSION, GITHUB_URL } from "@/lib/config";
export const metadata = {
  title: "Install evnx",
  description: "Install evnx in one command.",
};

type Method = {
  id: string;
  label: string;
};

const METHODS: Method[] = [
  { id: "curl", label: "macOS / Linux" },
  { id: "cargo", label: "Cargo" },
  { id: "npm", label: "npm" },
  { id: "pip", label: "pip / pipx" },
  { id: "source", label: "From Source" },
  { id: "windows", label: "Windows" },
];

function InlineCode({ text }: { text: string }) {
  return (
    <div className="relative bg-terminal-bg border border-border-muted rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <code className="text-terminal-text font-mono text-sm break-all">
          {text}
        </code>
        <CopyButton text={text} />
      </div>
    </div>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="-mt-24 pt-24 block" aria-hidden />;
}

export default function InstallPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-bg-base border-b border-border-muted">
        <div className="container-base section-padding flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Install evnx
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-8">
            Get up and running in seconds. Pick your preferred installation
            method below.
          </p>

          {/* Quick-nav pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {METHODS.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="px-4 py-1.5 rounded-full border border-border-muted text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
              >
                {m.label}
              </a>
            ))}
            <a
              href="#troubleshooting"
              className="px-4 py-1.5 rounded-full border border-border-muted text-sm font-medium text-brand-500 hover:text-brand-400 hover:border-brand-400 transition-colors"
            >
              Troubleshooting
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-base max-w-2xl space-y-16">
          {/* ── macOS / Linux ──────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="curl" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              macOS &amp; Linux
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              One-liner install via our automated shell script — no Rust
              toolchain required.
            </p>
            <InlineCode text="curl -fsSL https://dotenv.space/install.sh | bash" />
          </div>

          {/* ── Cargo ──────────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="cargo" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              Cargo{" "}
              <span className="text-text-tertiary text-lg font-sans font-normal">
                (Rust)
              </span>
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              Requires Rust 1.70+.{" "}
              <a
                href="https://rustup.rs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400"
              >
                Install Rust at rustup.rs
              </a>
              . The default install includes the core command set. Add{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                --features full
              </code>{" "}
              to also get{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                migrate
              </code>{" "}
              and{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                backup
              </code>
              /
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                restore
              </code>
              .
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Core (default)
                </p>
                <InlineCode text="cargo install evnx" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  All features — migrate + backup
                </p>
                <InlineCode text="cargo install evnx --features full" />
              </div>
            </div>

            <div className="mt-4 bg-bg-surface border border-border-muted rounded-lg p-4 text-sm text-text-secondary">
              <strong className="text-text-primary">
                Feature flags at a glance
              </strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <code>--features migrate</code> — adds the{" "}
                  <code>evnx migrate</code> command
                </li>
                <li>
                  <code>--features backup</code> — adds <code>evnx backup</code>{" "}
                  / <code>evnx restore</code>
                </li>
                <li>
                  <code>--features full</code> — enables both of the above
                </li>
              </ul>
            </div>
          </div>

          {/* ── npm ────────────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="npm" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              npm{" "}
              <span className="text-text-tertiary text-lg font-sans font-normal">
                (Node.js)
              </span>
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              The npm package is published as{" "}
              <a
                href="https://www.npmjs.com/package/@evnx/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400"
              >
                @evnx/cli
              </a>
              . Install it globally so the{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                evnx
              </code>{" "}
              binary is available everywhere.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Global install (recommended)
                </p>
                <InlineCode text="npm install -g @evnx/cli" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Or run without installing
                </p>
                <InlineCode text="npx @evnx/cli --version" />
              </div>
            </div>

            <p className="mt-3 text-text-secondary text-sm">
              Requires Node.js 18+. After a global install, run{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                evnx --version
              </code>{" "}
              to confirm.
            </p>
          </div>

          {/* ── pip / pipx ─────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="pip" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              pip / pipx{" "}
              <span className="text-text-tertiary text-lg font-sans font-normal">
                (Python)
              </span>
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              The package is published on{" "}
              <a
                href="https://pypi.org/project/evnx/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400"
              >
                PyPI as <code>evnx</code>
              </a>
              . We recommend <strong>pipx</strong> for CLI tools — it installs
              into an isolated environment and places the binary on your PATH
              automatically.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Recommended — pipx
                </p>
                <InlineCode text="pipx install evnx" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Alternative — pip (see note below)
                </p>
                <InlineCode text="pip install evnx" />
              </div>
            </div>

            <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                ⚠️ pip vs pipx
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                <code>pip install evnx</code> may install the package but not
                expose the <code>evnx</code> binary on your PATH if you use a
                virtual environment or a system Python with restricted bin
                directories. If the <code>evnx</code> command is not found after
                a <code>pip</code> install, use <code>pipx install evnx</code>{" "}
                instead. Install pipx with <code>pip install pipx</code> or{" "}
                <code>brew install pipx</code>.
              </p>
            </div>
          </div>

          {/* ── From source ────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="source" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              Build from Source
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              If you have{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                rustc
              </code>{" "}
              or{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                cargo
              </code>{" "}
              installed, you can compile directly from the{" "}
              <a
                href="https://github.com/urwithajit9/evnx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400"
              >
                GitHub repository
              </a>
              .
            </p>
            <CodeBlock
              language="bash"
              showLineNumbers={false}
            >{`git clone https://github.com/urwithajit9/evnx.git
cd evnx

# Core build
cargo build --release

# Full build (migrate + backup features)
cargo build --release --features full

# Copy to a directory on your PATH
cp target/release/evnx ~/.local/bin/`}</CodeBlock>
            <p className="mt-3 text-text-secondary text-sm">
              Requires Rust 1.70+. Install Rust via{" "}
              <a
                href="https://rustup.rs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400"
              >
                rustup.rs
              </a>
              .
            </p>
          </div>

          {/* ── Windows ────────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="windows" />
            <h2 className="text-2xl font-serif font-bold mb-1">Windows</h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Cargo (recommended)
                </p>
                <InlineCode text="cargo install evnx" />
                <p className="mt-2 text-text-secondary text-sm">
                  The most reliable option on Windows. Requires Rust —{" "}
                  <a
                    href="https://rustup.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:text-brand-400"
                  >
                    install via rustup.rs
                  </a>
                  .
                </p>
              </div>

              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  winget
                </p>
                <InlineCode text="winget install evnx" />
                <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    ℹ️ winget support status
                  </p>
                  <p className="text-blue-700 dark:text-blue-400">
                    A <code>winget</code> package submission is in progress.
                    Until it is accepted into the Windows Package Manager
                    Community Repository, this command may fail with "No package
                    found". If so, use <code>cargo install evnx</code> or npm as
                    the primary Windows installation path.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Verify ─────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4">
              Verify Installation
            </h2>
            <p className="text-text-secondary mb-4">
              Check that evnx is installed correctly:
            </p>
            <CodeBlock
              language="bash"
              showLineNumbers={false}
            >{`evnx --version\nevnx ${EVNX_VERSION}`}</CodeBlock>
          </div>

          {/* ── Troubleshooting ────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="troubleshooting" />
            <h2 className="text-2xl font-serif font-bold mb-6">
              Troubleshooting
            </h2>

            <div className="space-y-8">
              {/* pip */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>pip install evnx</code> succeeds but <code>evnx</code>{" "}
                    command is not found
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    This happens when pip installs the package into a location
                    that isn't on your system <code>PATH</code> — common with
                    virtual environments, system Python on macOS/Linux, or{" "}
                    <code>--user</code> installs.
                  </p>
                  <p className="font-medium text-text-primary">
                    Fix: use pipx instead
                  </p>
                  <InlineCode text="pip install pipx && pipx install evnx" />
                  <p>
                    pipx creates a dedicated virtual environment for each CLI
                    tool and automatically adds its binary to your PATH. It is
                    the recommended way to install Python-packaged CLI
                    utilities.
                  </p>
                  <p>
                    Alternatively, try running <code>python -m evnx</code> as a
                    workaround if pipx isn't available.
                  </p>
                </div>
              </div>

              {/* npm */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>npm install @evnx/cli</code> (local) doesn't expose
                    the <code>evnx</code> binary
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    A local <code>npm install</code> (without <code>-g</code>)
                    places the binary in <code>./node_modules/.bin/evnx</code>,
                    which is only available inside npm scripts or when you
                    prefix your command with <code>./node_modules/.bin/</code>.
                  </p>
                  <p className="font-medium text-text-primary">
                    Fix 1: install globally
                  </p>
                  <InlineCode text="npm install -g @evnx/cli" />
                  <p className="font-medium text-text-primary">
                    Fix 2: run without installing via npx
                  </p>
                  <InlineCode text="npx @evnx/cli --version" />
                  <p>
                    <code>npx</code> downloads and executes the package
                    on-demand — useful for one-off uses or CI pipelines where
                    you don't want a global install.
                  </p>
                </div>
              </div>

              {/* cargo not found */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>cargo: command not found</code>
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    Rust and Cargo are not installed. Install the full toolchain
                    with:
                  </p>
                  <InlineCode text="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" />
                  <p>
                    Then restart your terminal (or run{" "}
                    <code>source ~/.cargo/env</code>) so the new{" "}
                    <code>$PATH</code> entry takes effect.
                  </p>
                </div>
              </div>

              {/* winget fails */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>winget install evnx</code> — "No package found
                    matching input criteria"
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    The winget manifest has not yet been merged into the Windows
                    Package Manager Community Repository. Until the PR is
                    accepted, install via Cargo or npm instead:
                  </p>
                  <InlineCode text="cargo install evnx" />
                </div>
              </div>

              {/* permission errors on macOS */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    Permission errors during install on macOS / Linux
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    Never run <code>sudo pip install</code> or{" "}
                    <code>sudo npm install -g</code> — this can corrupt
                    system-level Python/Node environments. Instead:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      For pip: switch to <code>pipx install evnx</code>
                    </li>
                    <li>
                      For npm: configure npm to use a user-writable global
                      prefix — <code>npm config set prefix ~/.npm-global</code>,
                      then add <code>~/.npm-global/bin</code> to your{" "}
                      <code>PATH</code>
                    </li>
                    <li>
                      For cargo: no changes needed — cargo installs to{" "}
                      <code>~/.cargo/bin</code> by default
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── What's Next ────────────────────────────────────────────── */}
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
                <Link href={GITHUB_URL} target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
