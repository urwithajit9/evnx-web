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
  { id: "homebrew", label: "Homebrew" },
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
              toolchain required. Detects your OS and architecture
              automatically.
            </p>
            <InlineCode text="curl -fsSL https://raw.githubusercontent.com/urwithajit9/evnx/main/scripts/install.sh | bash" />
            <p className="mt-3 text-text-secondary text-sm">
              Installs to{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                ~/.local/bin
              </code>
              . Run{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                evnx --version
              </code>{" "}
              after to confirm. If the command is not found, see{" "}
              <a
                href="#troubleshooting"
                className="text-brand-500 hover:text-brand-400"
              >
                PATH troubleshooting
              </a>
              .
            </p>
          </div>

          {/* ── Homebrew ───────────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="homebrew" />
            <h2 className="text-2xl font-serif font-bold mb-1">
              Homebrew{" "}
              <span className="text-text-tertiary text-lg font-sans font-normal">
                (macOS and Linux)
              </span>
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              Install via the official evnx tap. Homebrew handles updates
              automatically — run{" "}
              <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                brew upgrade evnx
              </code>{" "}
              to get the latest version.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Install (taps and installs in one command)
                </p>
                <InlineCode text="brew install urwithajit9/evnx/evnx" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Or tap first, then install
                </p>
                <CodeBlock
                  language="bash"
                  showLineNumbers={false}
                >{`brew tap urwithajit9/evnx
brew install evnx`}</CodeBlock>
              </div>
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Update to the latest release
                </p>
                <InlineCode text="brew upgrade evnx" />
              </div>
            </div>

            <div className="mt-4 bg-bg-surface border border-border-muted rounded-lg p-4 text-sm text-text-secondary">
              <p>
                The tap repository is{" "}
                <a
                  href="https://github.com/urwithajit9/homebrew-evnx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 hover:text-brand-400"
                >
                  urwithajit9/homebrew-evnx
                </a>
                . The formula is updated automatically on every release. Once
                evnx reaches the threshold for inclusion in{" "}
                <code>homebrew/core</code>, the install command will shorten to{" "}
                <code>brew install evnx</code>.
              </p>
            </div>
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
              binary is available everywhere. Includes all features — no flags
              needed.
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
              automatically. Includes all features.
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

            {/* Don't have pipx? */}
            <div className="mt-6">
              <p className="text-sm font-medium text-text-primary mb-3">
                Don't have pipx? Install it for your platform:
              </p>

              <div className="space-y-4">
                {/* macOS */}
                <div className="border border-border-muted rounded-lg overflow-hidden">
                  <div className="bg-bg-surface px-4 py-2 border-b border-border-muted">
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                      macOS
                    </p>
                  </div>
                  <div className="p-4 space-y-2">
                    <InlineCode text="brew install pipx" />
                    <InlineCode text="pipx ensurepath" />
                  </div>
                </div>

                {/* Ubuntu / Debian */}
                <div className="border border-border-muted rounded-lg overflow-hidden">
                  <div className="bg-bg-surface px-4 py-2 border-b border-border-muted">
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                      Ubuntu / Debian
                    </p>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-text-tertiary mb-1">
                      Ubuntu 22.04+ (pipx is in apt)
                    </p>
                    <InlineCode text="sudo apt install pipx" />
                    <InlineCode text="pipx ensurepath" />
                    <p className="text-xs text-text-tertiary mt-3 mb-1">
                      Ubuntu 20.04 and below
                    </p>
                    <InlineCode text="pip install --user pipx" />
                    <InlineCode text="python -m pipx ensurepath" />
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Ubuntu 22.04+ — PEP 668
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-xs">
                        <code>pip install evnx</code> will fail with an
                        "externally managed environment" error. Ubuntu 22.04+
                        intentionally blocks pip from modifying the system
                        Python (PEP 668). Use <code>pipx install evnx</code>{" "}
                        instead — this is the correct approach for CLI tools.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div className="border border-border-muted rounded-lg overflow-hidden">
                  <div className="bg-bg-surface px-4 py-2 border-b border-border-muted">
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                      Windows (PowerShell)
                    </p>
                  </div>
                  <div className="p-4 space-y-2">
                    <InlineCode text="python -m pip install --user pipx" />
                    <InlineCode text="python -m pipx ensurepath" />
                    <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Windows PATH note
                      </p>
                      <p className="text-blue-700 dark:text-blue-400 text-xs">
                        After running <code>ensurepath</code>, close and reopen
                        your terminal. A full logout and login may be required
                        for PATH changes to take effect. Then run{" "}
                        <code>pipx install evnx</code>.
                      </p>
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">
                      Alternatively, use{" "}
                      <code>cargo install evnx --features full</code> or{" "}
                      <code>npm install -g @evnx/cli</code> on Windows — both
                      are simpler if you already have Rust or Node.js installed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                pip vs pipx — what's the difference?
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                <code>pip install evnx</code> may install the package but not
                expose the <code>evnx</code> binary on your PATH — this happens
                when using a virtual environment, system Python on macOS/Linux,
                or <code>--user</code> installs. <code>pipx</code> is
                purpose-built for CLI tools: it creates an isolated environment
                per tool and wires the binary to your system PATH automatically.
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
            <p className="text-text-secondary text-sm mb-6">
              Three options depending on which toolchain you already have.
            </p>

            <div className="space-y-6">
              {/* Cargo */}
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  Cargo — recommended if you have Rust
                </p>
                <InlineCode text="cargo install evnx --features full" />
                <p className="mt-2 text-text-secondary text-sm">
                  Requires Rust —{" "}
                  <a
                    href="https://rustup.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:text-brand-400"
                  >
                    install via rustup.rs
                  </a>
                  . Use <code>--features full</code> to include migrate and
                  backup commands.
                </p>
              </div>

              {/* npm */}
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  npm — recommended if you have Node.js
                </p>
                <InlineCode text="npm install -g @evnx/cli" />
                <p className="mt-2 text-text-secondary text-sm">
                  Requires Node.js 18+. Includes all features. After install,
                  run{" "}
                  <code className="text-sm bg-bg-surface px-1 py-0.5 rounded">
                    evnx --version
                  </code>{" "}
                  to confirm.
                </p>
              </div>

              {/* pipx */}
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  pipx — recommended if you have Python
                </p>
                <CodeBlock
                  language="powershell"
                  showLineNumbers={false}
                >{`python -m pip install --user pipx
python -m pipx ensurepath
# Restart your terminal, then:
pipx install evnx`}</CodeBlock>
                <p className="mt-2 text-text-secondary text-sm">
                  After running <code>ensurepath</code>, close and reopen your
                  terminal (a full logout/login may be required). Includes all
                  features.
                </p>
              </div>

              {/* winget */}
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1.5">
                  winget
                </p>
                <InlineCode text="winget install evnx" />
                <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    winget support status
                  </p>
                  <p className="text-blue-700 dark:text-blue-400">
                    A <code>winget</code> package submission is in progress.
                    Until it is accepted into the Windows Package Manager
                    Community Repository, this command may fail with "No package
                    found". Use Cargo, npm, or pipx as the primary Windows
                    installation path in the meantime.
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
              Check that evnx is installed correctly and all commands are
              available:
            </p>
            <CodeBlock language="bash" showLineNumbers={false}>{`evnx --version
evnx ${EVNX_VERSION}

# Confirm all commands are present (including migrate, backup, restore)
evnx --help`}</CodeBlock>
          </div>

          {/* ── Troubleshooting ────────────────────────────────────────── */}
          <div>
            <SectionAnchor id="troubleshooting" />
            <h2 className="text-2xl font-serif font-bold mb-6">
              Troubleshooting
            </h2>

            <div className="space-y-8">
              {/* evnx installed but wrong version / old binary shadows new */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    Install succeeds but <code>evnx --version</code> shows the
                    wrong version
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    An older binary on your PATH is shadowing the new install.
                    Run <code>which evnx</code> (macOS/Linux) or{" "}
                    <code>where evnx</code> (Windows) to see which binary is
                    being used.
                  </p>
                  <p className="font-medium text-text-primary">
                    Fix: ensure the new install directory comes first in PATH
                  </p>
                  <InlineCode text='export PATH="$HOME/.local/bin:$PATH"' />
                  <p>
                    To make this permanent, add the line above to{" "}
                    <code>~/.zshrc</code> (macOS) or <code>~/.bashrc</code>{" "}
                    (Linux) and restart your terminal. If the old binary came
                    from Homebrew, remove it with{" "}
                    <code>brew uninstall evnx</code> before reinstalling via the
                    tap.
                  </p>
                </div>
              </div>

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
                    pip installs the binary into a location that isn't on your
                    PATH — common with virtual environments, system Python, or{" "}
                    <code>--user</code> installs.
                  </p>
                  <p className="font-medium text-text-primary">
                    Fix: use pipx instead
                  </p>
                  <InlineCode text="pip install pipx && pipx install evnx" />
                  <p>
                    pipx creates a dedicated virtual environment for each CLI
                    tool and automatically adds the binary to your PATH.
                  </p>
                </div>
              </div>

              {/* PEP 668 */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>pip install evnx</code> fails with "externally managed
                    environment" (Ubuntu 22.04+)
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    Ubuntu 22.04 and Debian 12+ implement PEP 668, which
                    intentionally prevents pip from modifying the system Python
                    environment. This is not a bug in evnx.
                  </p>
                  <p className="font-medium text-text-primary">Fix</p>
                  <CodeBlock
                    language="bash"
                    showLineNumbers={false}
                  >{`sudo apt install pipx
pipx ensurepath
# Restart terminal, then:
pipx install evnx`}</CodeBlock>
                </div>
              </div>

              {/* npm local */}
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
                    only available inside npm scripts or with a full path
                    prefix.
                  </p>
                  <p className="font-medium text-text-primary">
                    Fix 1: install globally
                  </p>
                  <InlineCode text="npm install -g @evnx/cli" />
                  <p className="font-medium text-text-primary">
                    Fix 2: run without installing
                  </p>
                  <InlineCode text="npx @evnx/cli --version" />
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
                  <p>Rust and Cargo are not installed.</p>
                  <InlineCode text="curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" />
                  <p>
                    Then restart your terminal or run{" "}
                    <code>source ~/.cargo/env</code> so the new PATH entry takes
                    effect.
                  </p>
                </div>
              </div>

              {/* migrate/backup missing */}
              <div className="border border-border-muted rounded-lg overflow-hidden">
                <div className="bg-bg-surface px-5 py-3 border-b border-border-muted">
                  <h3 className="font-semibold">
                    <code>migrate</code>, <code>backup</code>, or{" "}
                    <code>restore</code> commands are missing from{" "}
                    <code>evnx --help</code>
                  </h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-text-secondary">
                  <p>
                    These commands are behind feature flags. If you installed
                    via <code>cargo install evnx</code> without{" "}
                    <code>--features full</code>, they won't appear. Reinstall
                    with:
                  </p>
                  <InlineCode text="cargo install evnx --features full --force" />
                  <p>
                    If you installed via npm, pipx, Homebrew, or the curl
                    script, all features are included by default — update to the
                    latest version:
                  </p>
                  <CodeBlock
                    language="bash"
                    showLineNumbers={false}
                  >{`npm install -g @evnx/cli@latest  # npm
pipx upgrade evnx                # pipx
brew upgrade evnx                # homebrew`}</CodeBlock>
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
                    Package Manager Community Repository. Use Cargo, npm, or
                    pipx instead:
                  </p>
                  <InlineCode text="cargo install evnx --features full" />
                </div>
              </div>

              {/* permission errors */}
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
                      For npm: configure a user-writable global prefix —{" "}
                      <code>npm config set prefix ~/.npm-global</code>, then add{" "}
                      <code>~/.npm-global/bin</code> to your <code>PATH</code>
                    </li>
                    <li>
                      For cargo: no changes needed — installs to{" "}
                      <code>~/.cargo/bin</code> by default
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── What's Next ────────────────────────────────────────────── */}
          <div className="bg-bg-surface border border-border-muted rounded-lg p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              What&apos;s Next?
            </h2>
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
