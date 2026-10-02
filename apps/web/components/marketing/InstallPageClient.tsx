"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { EVNX_VERSION, GITHUB_URL } from "@/lib/config";

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
  | "winget";

// ─── Data ──────────────────────────────────────────────────────────────────────

const OS_METHODS: Record<OS, MethodId[]> = {
  mac:   ["curl", "homebrew", "cargo", "npm", "pip", "source", "gh"],
  linux: ["curl", "cargo", "pip", "npm", "homebrew", "source", "gh"],
  win:   ["cargo", "npm", "pip", "scoop", "winget", "gh"],
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
        These commands are behind feature flags. If you installed via{" "}
        <IC>cargo install evnx</IC> without <IC>--features full</IC>, they won&apos;t appear.
        Reinstall with: <IC>cargo install evnx --features full --force</IC>
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
        A local <IC>npm install</IC> (without <IC>-g</IC>) places the binary at{" "}
        <IC>./node_modules/.bin/evnx</IC>, only accessible inside npm scripts. Install
        globally: <IC>npm install -g @evnx/cli</IC>, or run without installing:{" "}
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
        The winget manifest is still pending acceptance into the Windows Package Manager
        Community Repository. Until it merges, use Cargo, npm, or Scoop as the primary Windows
        installation path: <IC>cargo install evnx --features full</IC>
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
      <InfoBox variant="success">
        Recommended for most macOS and Linux users. No Rust toolchain or language runtime
        required.
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
            Includes validate, scan, diff, and convert commands. Requires Rust 1.70+.{" "}
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
          <CmdLine code="cargo install evnx --features full" />
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Adds <IC>migrate</IC> and <IC>backup</IC> / <IC>restore</IC> on top of the core
            command set.
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
        <div className="col-span-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-3">
          <p className="font-mono text-xs text-green-800 dark:text-green-300 mb-1">
            --features full
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            both of the above &mdash; recommended
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
                  Alternatively, use <IC>cargo install evnx --features full</IC> or{" "}
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

# Full build (migrate + backup features)
cargo build --release --features full

# Copy to a directory on your PATH
cp target/release/evnx ~/.local/bin/`}</CodeBlock>
      <p className="mt-3 text-sm text-text-secondary">
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
    </>
  );
}

function GHPanel() {
  return (
    <>
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        Pre-built binaries for every platform are available on the{" "}
        <a
          href={`${GITHUB_URL}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400"
        >
          GitHub Releases page
        </a>
        . Useful for CI/CD pipelines and air-gapped environments where package managers are
        unavailable.
      </p>

      <div className="space-y-3">
        <CmdLine
          label="macOS — Apple Silicon (arm64)"
          code={`curl -Lo evnx https://github.com/urwithajit9/evnx/releases/latest/download/evnx-aarch64-apple-darwin\nchmod +x evnx && mv evnx ~/.local/bin/`}
        />
        <CmdLine
          label="macOS — Intel (x86_64)"
          code={`curl -Lo evnx https://github.com/urwithajit9/evnx/releases/latest/download/evnx-x86_64-apple-darwin\nchmod +x evnx && mv evnx ~/.local/bin/`}
        />
        <CmdLine
          label="Linux — x86_64"
          code={`curl -Lo evnx https://github.com/urwithajit9/evnx/releases/latest/download/evnx-x86_64-unknown-linux-gnu\nchmod +x evnx && mv evnx ~/.local/bin/`}
        />
        <CmdLine
          label="Windows — x86_64 (PowerShell)"
          code="Invoke-WebRequest -Uri https://github.com/urwithajit9/evnx/releases/latest/download/evnx-x86_64-pc-windows-msvc.exe -OutFile evnx.exe"
        />
      </div>

      <InfoBox variant="info">
        All release assets are signed and checksums are published alongside each release.
        Verify with: <IC>{"sha256sum -c evnx-*.sha256"}</IC>
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
      <CmdLine code="winget install evnx" />
      <InfoBox variant="warn">
        <strong>Status: pending.</strong> The winget manifest has not yet been merged into the
        Windows Package Manager Community Repository. This command may fail with &ldquo;No
        package found&rdquo;. Use Cargo, npm, or Scoop as the primary Windows installation
        path in the meantime.
      </InfoBox>
      <p className="text-sm text-text-secondary mt-2 mb-3">
        Recommended Windows alternatives:
      </p>
      <div className="space-y-2">
        <CmdLine label="Cargo (if you have Rust)" code="cargo install evnx --features full" />
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
                <Link href="/guides">Read guides</Link>
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