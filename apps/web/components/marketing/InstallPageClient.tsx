"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { EVNX_VERSION, GITHUB_URL } from "@/lib/config";
import { docsUrl } from "@evnx/config";

// ─── Types ─────────────────────────────────────────────────────────────────────

type OS = "mac" | "linux" | "win";
type MethodId =
  | "curl"
  | "homebrew"
  | "cargo"
  | "npm"
  | "pip"
  | "source"
  | "gh"
  | "scoop"
  | "winget"
  | "docker";

// ─── Data ──────────────────────────────────────────────────────────────────────

const OS_METHODS: Record<OS, MethodId[]> = {
  mac:   ["curl", "homebrew", "cargo", "npm", "pip", "docker", "source", "gh"],
  linux: ["curl", "cargo", "pip", "npm", "homebrew", "docker", "source", "gh"],
  win:   ["cargo", "npm", "pip", "scoop", "winget", "docker", "gh"],
};

const METHOD_LABELS: Record<MethodId, { label: string; recommended?: boolean }> = {
  curl:     { label: "curl script", recommended: true },
  homebrew: { label: "Homebrew" },
  cargo:    { label: "Cargo" },
  npm:      { label: "npm" },
  pip:      { label: "pip / pipx" },
  source:   { label: "From source" },
  gh:       { label: "GitHub Releases" },
  scoop:    { label: "Scoop" },
  winget:   { label: "winget" },
  docker:   { label: "Docker" },
};

const CHANNELS: { label: string; className: string }[] = [
  {
    label: "npm @evnx/cli",
    className:
      "bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700",
  },
  {
    label: "crates.io",
    className:
      "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  },
  {
    label: "PyPI",
    className:
      "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  },
  {
    label: "Homebrew",
    className:
      "bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700",
  },
  {
    label: "shell script",
    className:
      "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
  },
  {
    label: "GitHub Releases",
    className: "bg-bg-surface text-text-secondary border-border-muted",
  },
];

interface TroubleItem {
  q: string;
  a: React.ReactNode;
}

const IC = ({ children }: { children: React.ReactNode }) => (
  <code className="font-mono text-[0.8em] bg-bg-surface px-1 py-0.5 rounded border border-border-muted">
    {children}
  </code>
);

const TROUBLE_ITEMS: TroubleItem[] = [
  {
    q: "evnx: command not found after install",
    a: (
      <>
        The install directory is not on your PATH. Run <IC>which evnx</IC> (macOS/Linux) or{" "}
        <IC>where evnx</IC> (Windows) to find the binary. To fix permanently, add to your
        shell rc file:
        <br />
        <IC>{"export PATH=\"$HOME/.local/bin:$PATH\""}</IC>
        <br />
        Then restart your terminal. If it came from Homebrew run{" "}
        <IC>brew uninstall evnx</IC> before reinstalling via the tap.
      </>
    ),
  },
  {
    q: "pip install evnx \u2014 \u201cexternally managed environment\u201d (Ubuntu 22.04+)",
    a: (
      <>
        Ubuntu 22.04+ and Debian 12+ implement PEP 668, which intentionally blocks pip from
        modifying the system Python. This is not a bug in evnx. Use pipx instead:
        <br />
        <IC>sudo apt install pipx &amp;&amp; pipx ensurepath &amp;&amp; pipx install evnx</IC>
      </>
    ),
  },
  {
    q: "pip install evnx succeeds but the evnx command is not found",
    a: (
      <>
        pip installs the binary into a location that is not on your PATH &mdash; common with
        virtual environments, system Python, or <IC>--user</IC> installs. Switch to pipx:{" "}
        <IC>pipx install evnx</IC>. pipx creates a dedicated virtual environment per CLI tool
        and automatically adds the binary to PATH.
      </>
    ),
  },
  {
    q: "migrate, backup, or restore are missing from evnx --help",
    a: (
      <>
        These commands, and <IC>auth</IC>, <IC>org</IC>, <IC>vault</IC> and <IC>cloud</IC>, are
        behind feature flags, and <IC>cargo install evnx</IC> compiles with none of them.
        Reinstall with: <IC>cargo install evnx --all-features --force</IC>. Not{" "}
        <IC>--features full</IC>: that is <IC>migrate</IC> and <IC>backup</IC> only, with no
        cloud commands. <IC>evnx commands</IC> lists what your build has.
        <br />
        If you installed via npm, pipx, Homebrew, Scoop, or the curl script, all features are
        included &mdash; update with <IC>pipx upgrade evnx</IC>,{" "}
        <IC>npm install -g @evnx/cli@latest</IC>, <IC>scoop update evnx</IC>, or{" "}
        <IC>brew upgrade evnx</IC>.
      </>
    ),
  },
  {
    q: "cargo: command not found",
    a: (
      <>
        Rust and Cargo are not installed. Run:
        <br />
        <IC>{"curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"}</IC>
        <br />
        Then restart your terminal or run <IC>source ~/.cargo/env</IC>.
      </>
    ),
  },
  {
    q: "Install succeeds but evnx --version shows the wrong version",
    a: (
      <>
        An older binary on your PATH is shadowing the new install. Run{" "}
        <IC>which evnx</IC> to see which binary is active. Ensure the new install directory
        appears first in PATH. If the old binary came from Homebrew, remove it with{" "}
        <IC>brew uninstall evnx</IC> before reinstalling via the tap.
      </>
    ),
  },
  {
    q: "npm install @evnx/cli (local) doesn't expose the evnx binary",
    a: (
      <>
        From evnx 0.10.6, <IC>npm install --save-dev @evnx/cli</IC> places the command at{" "}
        <IC>./node_modules/.bin/evnx</IC>: run it with <IC>npx evnx</IC> or from an npm
        script. Up to 0.10.5 only <IC>npm install -g</IC> created an <IC>evnx</IC> command
        &mdash; upgrade with <IC>npm install --save-dev @evnx/cli@latest</IC>. Or install
        globally, <IC>npm install -g @evnx/cli</IC>, or run without installing:{" "}
        <IC>npx @evnx/cli --version</IC>.
      </>
    ),
  },
  {
    q: "scoop install evnx \u2014 \"couldn't find manifest for 'evnx'\"",
    a: (
      <>
        You need to add the evnx bucket before installing. Run:{" "}
        <IC>scoop bucket add evnx https://github.com/urwithajit9/scoop-evnx</IC>
        <br />
        Then retry <IC>scoop install evnx</IC>. If Scoop itself is not installed, see the
        Scoop tab on the install page for the PowerShell bootstrap command.
      </>
    ),
  },
  {
    q: "winget install evnx \u2014 \u201cNo package found matching input criteria\u201d",
    a: (
      <>
        Use the full package id: <IC>winget install urwithajit9.evnx</IC>. The manifest
        declares no moniker, so <IC>winget install evnx</IC> falls back to matching by name.
        A new release reaches winget once Microsoft merges its manifest, which can take a few
        days; until then winget offers the previous version. Scoop and npm carry a release
        sooner: <IC>npm install -g @evnx/cli</IC>
      </>
    ),
  },
  {
    q: "Permission errors during install on macOS / Linux",
    a: (
      <>
        Never run <IC>sudo pip install</IC> or <IC>sudo npm install -g</IC> &mdash; this can
        corrupt system-level Python/Node environments. Instead:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            For pip: use <IC>pipx install evnx</IC>
          </li>
          <li>
            For npm: configure a user-writable prefix &mdash;{" "}
            <IC>npm config set prefix ~/.npm-global</IC>, then add{" "}
            <IC>~/.npm-global/bin</IC> to PATH
          </li>
          <li>
            For cargo: no changes needed &mdash; installs to{" "}
            <IC>~/.cargo/bin</IC> by default
          </li>
        </ul>
      </>
    ),
  },
];

// ─── Shared UI primitives ──────────────────────────────────────────────────────

function CmdLine({ label, code }: { label?: string; code: string }) {
  return (
    <div className="rounded-lg border border-border-muted overflow-hidden mb-3">
      {label && (
        <p className="text-xs text-text-tertiary uppercase tracking-wide px-4 py-2 bg-bg-surface border-b border-border-muted">
          {label}
        </p>
      )}
      <div className="bg-terminal-bg p-4 flex items-center justify-between gap-4">
        <code className="text-terminal-text font-mono text-sm break-all flex-1 leading-relaxed whitespace-pre">
          {code}
        </code>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function InfoBox({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warn" | "success";
}) {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
    warn: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    success:
      "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
  };
  return (
    <div className={`rounded-lg border p-4 text-sm mb-3 leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
}

function SubTabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-2 mb-5">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            active === t.id
              ? "bg-bg-surface border-border-strong text-text-primary font-medium"
              : "border-border-muted text-text-secondary hover:text-text-primary"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Method panels ─────────────────────────────────────────────────────────────

function CurlPanel() {
  return (
    <>
      <CmdLine
        code="curl -fsSL https://raw.githubusercontent.com/urwithajit9/evnx/main/scripts/install.sh | bash"
      />
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Installs to <IC>~/.local/bin</IC>. Detects your OS and architecture automatically. All
        features included &mdash; no flags needed. If the command is not found after install,
        see{" "}
        <a href="#troubleshooting" className="text-brand-500 hover:text-brand-400">
          PATH troubleshooting
        </a>
        .
      </p>
      <p className="text-sm text-text-secondary mb-2 leading-relaxed">
        The script checks the archive&apos;s SHA-256 before installing, and from v0.11.0 its
        build provenance too: with a signed-in GitHub CLI (<IC>gh</IC> 2.49+), an archive
        that was not built by evnx&apos;s release workflow from that tag is refused. Without{" "}
        <IC>gh</IC> it says the check was skipped.
      </p>
      <CmdLine
        label="Pin a version"
        code="curl -fsSL https://dotenv.space/install.sh | EVNX_VERSION=0.11.0 bash"
      />
      <InfoBox variant="success">
        Recommended for most macOS and Linux users. No Rust toolchain or language runtime
        required. <IC>https://dotenv.space/install.sh</IC> serves the same script.
      </InfoBox>
    </>
  );
}

function DockerPanel() {
  return (
    <>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Every release publishes an image to the GitHub Container Registry, built from the same
        static binaries as the archives. Mount your project and run any command:
      </p>
      <CmdLine
        label="Read-only commands (scan, validate, diff)"
        code={`docker run --rm -v "$PWD:/work" ghcr.io/urwithajit9/evnx:${EVNX_VERSION} scan`}
      />
      <CmdLine
        label="Commands that write (sync, init, add, template) — run as yourself"
        code={`docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/work" ghcr.io/urwithajit9/evnx:${EVNX_VERSION} sync --direction forward`}
      />
      <InfoBox variant="info">
        Tags are the version (<IC>{EVNX_VERSION}</IC>) and <IC>latest</IC>; the project is
        mounted at <IC>/work</IC>. Without <IC>--user</IC> the container runs as its own
        non-root user, and files it writes are not yours to edit. Cloud commands need your
        credentials inside the container, so prefer an installed binary for those.
      </InfoBox>
    </>
  );
}

function HomebrewPanel() {
  return (
    <>
      <CmdLine
        label="Install (taps and installs in one command)"
        code="brew install urwithajit9/evnx/evnx"
      />
      <CmdLine
        label="Or tap first, then install"
        code={`brew tap urwithajit9/evnx\nbrew install evnx`}
      />
      <CmdLine label="Update to the latest release" code="brew upgrade evnx" />
      <p className="text-sm text-text-secondary leading-relaxed">
        The tap repository is{" "}
        <a
          href="https://github.com/urwithajit9/homebrew-evnx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400"
        >
          urwithajit9/homebrew-evnx
        </a>
        . The formula updates automatically on every release. Once evnx reaches the threshold
        for inclusion in <IC>homebrew/core</IC>, the install command will shorten to{" "}
        <IC>brew install evnx</IC>.
      </p>
    </>
  );
}

type CargoVariant = "core" | "full";

function CargoPanel({
  variant,
  onVariantChange,
}: {
  variant: CargoVariant;
  onVariantChange: (v: CargoVariant) => void;
}) {
  return (
    <>
      <SubTabBar
        tabs={[
          { id: "core" as CargoVariant, label: "Core" },
          { id: "full" as CargoVariant, label: "All features" },
        ]}
        active={variant}
        onChange={onVariantChange}
      />

      {variant === "core" ? (
        <>
          <CmdLine code="cargo install evnx" />
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            The local commands &mdash; init, add, validate, scan, diff, convert, sync,
            template, doctor and spec &mdash; with no network code compiled in. Requires Rust
            1.85+.{" "}
            <a
              href="https://rustup.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-400"
            >
              Install Rust at rustup.rs
            </a>
            .
          </p>
        </>
      ) : (
        <>
          <CmdLine code="cargo install evnx --all-features" />
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Adds <IC>migrate</IC>, <IC>backup</IC> / <IC>restore</IC> and the cloud commands
            (<IC>auth</IC>, <IC>org</IC>, <IC>vault</IC>, <IC>cloud</IC>) &mdash; what every
            prebuilt binary has.
          </p>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="rounded-lg border border-border-muted bg-bg-surface p-3">
          <p className="font-mono text-xs text-text-secondary mb-1">--features migrate</p>
          <p className="text-xs text-text-tertiary">adds evnx migrate</p>
        </div>
        <div className="rounded-lg border border-border-muted bg-bg-surface p-3">
          <p className="font-mono text-xs text-text-secondary mb-1">--features backup</p>
          <p className="text-xs text-text-tertiary">adds backup + restore</p>
        </div>
        <div className="col-span-2 rounded-lg border border-border-muted bg-bg-surface p-3">
          <p className="font-mono text-xs text-text-secondary mb-1">--features cloud</p>
          <p className="text-xs text-text-tertiary">adds auth, org, vault + cloud</p>
        </div>
        <div className="col-span-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-3">
          <p className="font-mono text-xs text-green-800 dark:text-green-300 mb-1">
            --all-features
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            all of the above &mdash; recommended. <span className="font-mono">--features full</span>{" "}
            is migrate + backup only, with no cloud commands
          </p>
        </div>
      </div>
    </>
  );
}

function NpmPanel() {
  return (
    <>
      <CmdLine label="Global install (recommended)" code="npm install -g @evnx/cli" />
      <CmdLine label="Or run without installing" code="npx @evnx/cli --version" />
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Package:{" "}
        <a
          href="https://www.npmjs.com/package/@evnx/cli"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400"
        >
          @evnx/cli on npm
        </a>
        . Requires Node.js 18+. All features included &mdash; no flags needed.
      </p>
      <InfoBox variant="info">
        After a global install, run <IC>evnx --version</IC> to confirm the binary is on your
        PATH. If not found, see PATH troubleshooting below.
      </InfoBox>
    </>
  );
}

type PipVariant = "pipx" | "pip";

function PipPanel({
  variant,
  onVariantChange,
}: {
  variant: PipVariant;
  onVariantChange: (v: PipVariant) => void;
}) {
  return (
    <>
      <SubTabBar
        tabs={[
          { id: "pipx" as PipVariant, label: "pipx (recommended)" },
          { id: "pip" as PipVariant, label: "pip" },
        ]}
        active={variant}
        onChange={onVariantChange}
      />

      {variant === "pipx" ? (
        <>
          <CmdLine code="pipx install evnx" />
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Package:{" "}
            <a
              href="https://pypi.org/project/evnx/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-400"
            >
              evnx on PyPI
            </a>
            . pipx creates an isolated environment per tool and wires the binary to PATH
            automatically.
          </p>
          <InfoBox variant="success">
            Recommended for CLI tools &mdash; avoids PATH and virtualenv issues entirely.
          </InfoBox>

          <p className="text-sm font-medium text-text-primary mb-3 mt-5">
            Don&apos;t have pipx? Install it for your platform:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border border-border-muted overflow-hidden">
              <p className="text-xs text-text-tertiary uppercase tracking-wide px-4 py-2 bg-bg-surface border-b border-border-muted">
                macOS
              </p>
              <div className="p-4 space-y-2">
                <CmdLine code="brew install pipx" />
                <CmdLine code="pipx ensurepath" />
              </div>
            </div>

            <div className="rounded-lg border border-border-muted overflow-hidden">
              <p className="text-xs text-text-tertiary uppercase tracking-wide px-4 py-2 bg-bg-surface border-b border-border-muted">
                Ubuntu / Debian
              </p>
              <div className="p-4 space-y-2">
                <p className="text-xs text-text-tertiary mb-1">Ubuntu 22.04+ (pipx is in apt)</p>
                <CmdLine code="sudo apt install pipx" />
                <CmdLine code="pipx ensurepath" />
                <p className="text-xs text-text-tertiary mt-3 mb-1">Ubuntu 20.04 and below</p>
                <CmdLine code="pip install --user pipx" />
                <CmdLine code="python -m pipx ensurepath" />
                <InfoBox variant="warn">
                  <strong>Ubuntu 22.04+ &mdash; PEP 668:</strong>{" "}
                  <IC>pip install evnx</IC> will fail with an &ldquo;externally managed
                  environment&rdquo; error. Use <IC>pipx install evnx</IC> instead.
                </InfoBox>
              </div>
            </div>

            <div className="rounded-lg border border-border-muted overflow-hidden">
              <p className="text-xs text-text-tertiary uppercase tracking-wide px-4 py-2 bg-bg-surface border-b border-border-muted">
                Windows (PowerShell)
              </p>
              <div className="p-4 space-y-2">
                <CmdLine code="python -m pip install --user pipx" />
                <CmdLine code="python -m pipx ensurepath" />
                <InfoBox variant="info">
                  After running <IC>ensurepath</IC>, close and reopen your terminal. A full
                  logout and login may be required for PATH changes to take effect. Then run{" "}
                  <IC>pipx install evnx</IC>.
                </InfoBox>
                <p className="text-xs text-text-tertiary mt-1">
                  Alternatively, use <IC>cargo install evnx --all-features</IC> or{" "}
                  <IC>npm install -g @evnx/cli</IC> on Windows &mdash; simpler if you already
                  have Rust or Node.js installed.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <CmdLine code="pip install evnx" />
          <InfoBox variant="warn">
            <strong>Before you proceed:</strong> <IC>pip install evnx</IC> may install the
            package but not expose the <IC>evnx</IC> binary on your PATH &mdash; this happens
            with virtual environments, system Python on macOS/Linux, or <IC>--user</IC>{" "}
            installs. Ubuntu 22.04+ will fail with an &ldquo;externally managed
            environment&rdquo; error (PEP 668). Use <IC>pipx install evnx</IC> instead.
          </InfoBox>
        </>
      )}
    </>
  );
}

function SourcePanel() {
  return (
    <>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        If you have <IC>rustc</IC> or <IC>cargo</IC> installed, compile directly from the{" "}
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
      <CodeBlock language="bash" showLineNumbers={false}>{`git clone https://github.com/urwithajit9/evnx.git
cd evnx

# Core build
cargo build --release

# Every feature, as the prebuilt binaries have
cargo build --release --all-features

# Copy to a directory on your PATH
cp target/release/evnx ~/.local/bin/`}</CodeBlock>
      <p className="mt-3 text-sm text-text-secondary">
        Requires Rust 1.85+. Install Rust via{" "}
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
    </>
  );
}

function GHPanel() {
  const base = "https://github.com/urwithajit9/evnx/releases/latest/download";
  const unix = (target: string, sum: string) =>
    `curl -fsSLO ${base}/evnx-${target}.tar.gz\n` +
    `curl -fsSLO ${base}/evnx-${target}.tar.gz.sha256\n` +
    `${sum} evnx-${target}.tar.gz.sha256\n` +
    `tar -xzf evnx-${target}.tar.gz\n` +
    `mkdir -p ~/.local/bin && install -m 755 evnx-${target} ~/.local/bin/evnx`;
  return (
    <>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Pre-built archives for every platform are on the{" "}
        <a
          href={`${GITHUB_URL}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400"
        >
          GitHub Releases page
        </a>
        , each with a <IC>.sha256</IC> beside it. Useful for CI/CD pipelines and air-gapped
        environments. Replace <IC>latest/download</IC> with <IC>download/v{EVNX_VERSION}</IC>{" "}
        to pin a version.
      </p>

      <div className="space-y-3">
        <CmdLine label="macOS — Apple Silicon (arm64)" code={unix("aarch64-apple-darwin", "shasum -a 256 -c")} />
        <CmdLine label="macOS — Intel (x86_64)" code={unix("x86_64-apple-darwin", "shasum -a 256 -c")} />
        <CmdLine label="Linux — x86_64 (static, any distro)" code={unix("x86_64-unknown-linux-musl", "sha256sum -c")} />
        <CmdLine label="Linux — arm64 (static, any distro)" code={unix("aarch64-unknown-linux-musl", "sha256sum -c")} />
        <CmdLine
          label="Windows — x86_64 (PowerShell)"
          code={`Invoke-WebRequest -Uri ${base}/evnx-x86_64-pc-windows-msvc.zip -OutFile evnx.zip\nExpand-Archive evnx.zip -DestinationPath .\nRename-Item evnx-x86_64-pc-windows-msvc.exe evnx.exe`}
        />
      </div>

      <InfoBox variant="info">
        The checksum proves the download is intact. From v0.11.0 every archive also carries a
        signed build provenance attestation, which proves where it was built: verify it with
        the GitHub CLI, signed in (<IC>gh auth login</IC>):{" "}
        <IC>{"gh attestation verify evnx-x86_64-unknown-linux-musl.tar.gz -R urwithajit9/evnx"}</IC>
      </InfoBox>
    </>
  );
}

function ScoopPanel() {
  return (
    <>
      <CmdLine
        label="Add the evnx bucket"
        code="scoop bucket add evnx https://github.com/urwithajit9/scoop-evnx"
      />
      <CmdLine label="Install" code="scoop install evnx" />
      <CmdLine label="Update to the latest release" code="scoop update evnx" />
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Bucket repo:{" "}
        <a
          href="https://github.com/urwithajit9/scoop-evnx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400"
        >
          urwithajit9/scoop-evnx
        </a>
        . All features included &mdash; no flags needed.
      </p>
      <InfoBox variant="success">
        Recommended for Windows users who prefer user-local installs. Scoop installs to{" "}
        <IC>~/scoop/shims</IC> with no admin privileges required and keeps a clean uninstall
        path.
      </InfoBox>
      <p className="text-sm text-text-secondary mt-4 mb-2 leading-relaxed">
        Don&apos;t have Scoop yet? Install it from PowerShell:
      </p>
      <CmdLine
        label="Install Scoop (PowerShell)"
        code={`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser\nInvoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression`}
      />
    </>
  );
}

function WingetPanel() {
  return (
    <>
      <CmdLine code="winget install urwithajit9.evnx" />
      <CmdLine label="Update to the latest release" code="winget upgrade urwithajit9.evnx" />
      <InfoBox variant="info">
        Use the full package id. The manifest declares no moniker, so{" "}
        <IC>winget install evnx</IC> falls back to matching by name and can ask you to choose.
        A new release reaches winget once Microsoft merges its manifest, which can take a few
        days; until then winget installs the previous version.
      </InfoBox>
      <p className="text-sm text-text-secondary mt-2 mb-3">
        Other Windows options:
      </p>
      <div className="space-y-2">
        <CmdLine label="Cargo (if you have Rust)" code="cargo install evnx --all-features" />
        <CmdLine label="npm (if you have Node.js)" code="npm install -g @evnx/cli" />
        <CmdLine
          label="Scoop (no admin required)"
          code="scoop bucket add evnx https://github.com/urwithajit9/scoop-evnx && scoop install evnx"
        />
      </div>
    </>
  );
}

// ─── Troubleshooting accordion ─────────────────────────────────────────────────

function TroubleAccordion({ items }: { items: TroubleItem[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-2" id="troubleshooting">
      {items.map((item, i) => (
        <div key={i} className="border border-border-muted rounded-lg overflow-hidden">
          <button
            onClick={() => toggle(i)}
            className="w-full px-5 py-4 text-left flex justify-between items-center bg-bg-surface hover:bg-bg-base transition-colors gap-4"
          >
            <span className="text-sm font-medium leading-snug">{item.q}</span>
            <span
              className={`text-text-tertiary flex-shrink-0 transition-transform text-xs ${
                open.has(i) ? "rotate-90" : ""
              }`}
            >
              &#9654;
            </span>
          </button>
          {open.has(i) && (
            <div className="px-5 py-4 text-sm text-text-secondary border-t border-border-muted bg-bg-base leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function InstallPageClient() {
  const [os, setOS] = useState<OS>("mac");
  const [activeTab, setActiveTab] = useState<MethodId>("curl");
  const [cargoVariant, setCargoVariant] = useState<CargoVariant>("core");
  const [pipVariant, setPipVariant] = useState<PipVariant>("pipx");

  useEffect(() => {
    const ua = navigator.userAgent;
    let detected: OS = "mac";
    if (/Windows/i.test(ua)) detected = "win";
    else if (/Linux/i.test(ua)) detected = "linux";
    setOS(detected);
    setActiveTab(OS_METHODS[detected][0]);
  }, []);

  const handleOSChange = (newOS: OS) => {
    setOS(newOS);
    setActiveTab(OS_METHODS[newOS][0]);
  };

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-bg-base border-b border-border-muted">
        <div className="container-base section-padding flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Install evnx</h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-8">
            Published across six package registries. Pick what fits your workflow.
          </p>

          {/* Channel badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CHANNELS.map((ch) => (
              <span
                key={ch.label}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${ch.className}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                {ch.label}
              </span>
            ))}
          </div>

          {/* OS selector */}
          <div className="flex p-1 bg-bg-surface rounded-lg border border-border-muted gap-1">
            {(["mac", "linux", "win"] as OS[]).map((o) => (
              <button
                key={o}
                onClick={() => handleOSChange(o)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  os === o
                    ? "bg-bg-base text-text-primary border border-border-muted shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {{ mac: "macOS", linux: "Linux", win: "Windows" }[o]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Install content ──────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-base max-w-2xl">

          {/* Method tabs */}
          <div className="flex border-b border-border-muted mb-6 overflow-x-auto -mx-1 px-1">
            {OS_METHODS[os].map((id) => {
              const meta = METHOD_LABELS[id];
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors -mb-px ${
                    activeTab === id
                      ? "border-text-primary text-text-primary font-medium"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {meta.label}
                  {meta.recommended && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-normal">
                      recommended
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active panel */}
          <div className="min-h-[240px]">
            {activeTab === "curl"     && <CurlPanel />}
            {activeTab === "homebrew" && <HomebrewPanel />}
            {activeTab === "cargo"    && (
              <CargoPanel variant={cargoVariant} onVariantChange={setCargoVariant} />
            )}
            {activeTab === "npm"      && <NpmPanel />}
            {activeTab === "pip"      && (
              <PipPanel variant={pipVariant} onVariantChange={setPipVariant} />
            )}
            {activeTab === "source"   && <SourcePanel />}
            {activeTab === "gh"       && <GHPanel />}
            {activeTab === "scoop"    && <ScoopPanel />}
            {activeTab === "winget"   && <WingetPanel />}
            {activeTab === "docker"   && <DockerPanel />}
          </div>

          {/* ── Verify installation ────────────────────────────────────────── */}
          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-1">Verify installation</h2>
            <p className="text-text-secondary text-sm mb-4">
              Check that evnx is installed correctly and all commands are available:
            </p>
            <CodeBlock language="bash" showLineNumbers={false}>{`evnx --version
evnx ${EVNX_VERSION}

# Confirm all commands are present (including migrate, backup, restore)
evnx --help`}</CodeBlock>
          </div>

          {/* ── Troubleshooting ────────────────────────────────────────────── */}
          <div className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-2">Troubleshooting</h2>
            <p className="text-text-secondary text-sm mb-6">
              Common issues and how to resolve them.
            </p>
            <TroubleAccordion items={TROUBLE_ITEMS} />
          </div>

          {/* ── What's next ────────────────────────────────────────────────── */}
          <div className="mt-12 bg-bg-surface border border-border-muted rounded-lg p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">What&apos;s next?</h2>
            <p className="text-text-secondary mb-6">
              Now that evnx is installed, learn how to use it:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href={docsUrl()}>Read guides</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
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