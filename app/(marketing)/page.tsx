"use client";

import { Terminal } from "@/components/ui/terminal";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CircleCheck as CheckCircle,
  GitBranch,
  FileJson,
  Zap,
  Eye,
  Lock,
  ChartBar as BarChart3,
  Settings,
  Cpu,
  ArrowRight,
  Star,
  GitFork,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { GITHUB_URL, EVNX_VERSION, INSTALL_COMMANDS } from "@/lib/config";

// ─── Terminal animation data ──────────────────────────────────────────────────

const terminalLines = [
  { type: "prompt" as const, content: "evnx scan" },
  { type: "output" as const, content: "[SCAN] Scanning .env files..." },
  {
    type: "error" as const,
    content: "[ERROR] AWS_SECRET_ACCESS_KEY detected (high entropy)",
  },
  {
    type: "error" as const,
    content: "[ERROR] Pattern: aws_secret — confidence: HIGH",
  },
  {
    type: "success" as const,
    content: "[INFO] Scan complete: 1 critical secret found",
  },
  { type: "prompt" as const, content: "evnx validate --strict" },
  {
    type: "output" as const,
    content: "[VALIDATE] Checking environment configuration...",
  },
  {
    type: "warning" as const,
    content: "[WARNING] localhost in production DATABASE_URL",
  },
  {
    type: "warning" as const,
    content: "[WARNING] JWT_SECRET too short (6 chars, need 32+)",
  },
  {
    type: "success" as const,
    content: "[OK] Validation complete: 0 errors, 2 warnings",
  },
  { type: "prompt" as const, content: "evnx convert --to kubernetes" },
  {
    type: "success" as const,
    content: "[CONVERT] secret.yaml written — 9 keys, all base64",
  },
];

// ─── Incident timeline data ───────────────────────────────────────────────────

const incidentLog = [
  {
    time: "23:47:03",
    level: "info",
    msg: "git push origin main",
    sub: "3 files changed, 47 insertions",
  },
  {
    time: "23:47:41",
    level: "warn",
    msg: 'GitHub email: "Possible secret detected"',
    sub: "AWS credentials found in .env — urwithajit9/side-project",
  },
  {
    time: "23:48:12",
    level: "error",
    msg: "AWS key auto-revoked",
    sub: "IAM credential AKIAIOSFODNN7EXAMPLE invalidated by AWS",
  },
  {
    time: "00:03:19",
    level: "error",
    msg: "PagerDuty: 3 services unreachable",
    sub: "api-gateway · worker-queue · cron-service",
  },
  {
    time: "00:04:02",
    level: "error",
    msg: "Incoming call: development lead",
    sub: "Duration: 00:08:44 — most uncomfortable of career",
  },
  {
    time: "00:09:37",
    level: "warn",
    msg: "EC2 instances spun up in us-east-1, eu-west-2, ap-southeast-1",
    sub: "Cryptocurrency mining detected — estimated cost: $847",
  },
  {
    time: "03:22:00",
    level: "success",
    msg: "Services restored, new credentials rotated",
    sub: "Incident duration: 3h 34m 57s",
  },
  {
    time: "03:23:00",
    level: "success",
    msg: "Started writing evnx",
    sub: "So this never happens again",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Shield,
    title: "Secret Scanning",
    description:
      "Detects AWS keys, Stripe secrets, GitHub tokens, and high-entropy strings before they leave your machine.",
    badge: null,
  },
  {
    icon: CheckCircle,
    title: "Validation",
    description:
      "Catches placeholders, weak secrets, boolean string traps, and localhost in production configs.",
    badge: null,
  },
  {
    icon: FileJson,
    title: "14+ Format Targets",
    description:
      "JSON, YAML, Kubernetes, Terraform, GitHub Actions, Doppler, Infisical, Heroku, Vercel, and more.",
    badge: null,
  },
  {
    icon: GitBranch,
    title: "Stack Blueprints",
    description:
      "Init with pre-wired templates for Django, Next.js, FastAPI, Laravel, Rust, and more frameworks.",
    badge: null,
  },
  {
    icon: Zap,
    title: "Bidirectional Sync",
    description:
      "Keep .env and .env.example aligned — both directions, automatically.",
    badge: null,
  },
  {
    icon: Eye,
    title: "Add Variables",
    description:
      "Manage your .env entirely from the CLI. No manual file editing, no format mistakes.",
    badge: "NEW",
  },
  {
    icon: Lock,
    title: "Cloud Migration",
    description:
      "Push directly to AWS Secrets Manager, Doppler, Infisical, or GitHub Actions secrets.",
    badge: null,
  },
  {
    icon: BarChart3,
    title: "CI/CD Native",
    description:
      "SARIF output for GitHub Security tab. Inline PR annotations. Exits 1 on findings.",
    badge: null,
  },
  {
    icon: Settings,
    title: "Doctor Diagnostics",
    description:
      "Health check everything: gitignore coverage, file permissions, .env.example sync, project structure.",
    badge: null,
  },
  {
    icon: Cpu,
    title: "Template Engine",
    description:
      "Dynamic config generation with filters — |int, |bool, |upper — for multi-environment setups.",
    badge: null,
  },
  {
    icon: Lock,
    title: "Encrypted Backups",
    description:
      "AES-256-GCM encryption with Argon2 key derivation. Your backups are yours alone.",
    badge: null,
  },
  {
    icon: Settings,
    title: "Zero Config",
    description:
      "Works out of the box in any project. .evnx.toml unlocks team-level customization.",
    badge: null,
  },
];

// ─── Commands ─────────────────────────────────────────────────────────────────

const commands = [
  {
    name: "scan",
    description: "Detect secrets and sensitive data",
    example: "evnx scan --path ./config --format sarif",
    link: "/guides/commands/scan",
  },
  {
    name: "validate",
    description: "Catch misconfiguration before deployment",
    example: "evnx validate --strict --exit-code",
    link: "/guides/commands/validate",
  },
  {
    name: "convert",
    description: "Export to 14+ secret manager formats",
    example: "evnx convert --from .env --to kubernetes",
    link: "/guides/commands/convert",
  },
  {
    name: "add",
    description: "Manage variables without touching files",
    example: 'evnx add DATABASE_URL "postgres://..."',
    link: "/guides/commands/add",
    badge: "NEW",
  },
  {
    name: "doctor",
    description: "Full environment health check",
    example: "evnx doctor --fix",
    link: "/guides/commands/doctor",
  },
  {
    name: "migrate",
    description: "Push secrets to a cloud manager",
    example: "evnx migrate --to aws-secrets-manager",
    link: "/guides/commands/migrate",
  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function IncidentTimeline() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Start animation when scrolled into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (visibleLines >= incidentLog.length) return;
    const delay = visibleLines === 0 ? 400 : visibleLines < 4 ? 600 : 300;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [started, visibleLines]);

  const levelStyles: Record<
    string,
    { dot: string; time: string; msg: string }
  > = {
    info: {
      dot: "bg-text-muted",
      time: "text-text-muted",
      msg: "text-text-secondary",
    },
    warn: { dot: "bg-warning", time: "text-warning", msg: "text-text-primary" },
    error: {
      dot: "bg-danger animate-pulse",
      time: "text-danger",
      msg: "text-danger",
    },
    success: { dot: "bg-success", time: "text-success", msg: "text-success" },
  };

  return (
    <div
      ref={ref}
      className="bg-terminal-bg border border-border-muted rounded-xl overflow-hidden"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-surface">
        <div className="w-3 h-3 rounded-full bg-danger/70" />
        <div className="w-3 h-3 rounded-full bg-warning/70" />
        <div className="w-3 h-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-text-muted">
          incident-log — Thu Mar 14 2024
        </span>
      </div>

      {/* Log lines */}
      <div className="p-5 space-y-0 font-mono text-sm min-h-[420px]">
        {incidentLog.slice(0, visibleLines).map((entry, i) => {
          const s = levelStyles[entry.level];
          const isLast =
            i === visibleLines - 1 && visibleLines < incidentLog.length;
          return (
            <div
              key={i}
              className="flex gap-3 items-start py-2 border-b border-border-subtle/30 last:border-0 animate-fade-in"
            >
              {/* Timestamp */}
              <span
                className={`flex-shrink-0 text-xs ${s.time} w-20 pt-0.5 tabular-nums`}
              >
                {entry.time}
              </span>

              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`}
              />

              {/* Content */}
              <div className="min-w-0">
                <p className={`${s.msg} font-medium leading-snug`}>
                  {entry.msg}
                </p>
                <p className="text-text-muted text-xs mt-0.5 leading-relaxed">
                  {entry.sub}
                </p>
              </div>

              {/* Cursor on last visible line */}
              {isLast && (
                <span className="w-2 h-4 bg-brand-500 animate-blink ml-1 flex-shrink-0 self-center" />
              )}
            </div>
          );
        })}

        {/* Idle cursor before animation starts */}
        {visibleLines === 0 && started && (
          <div className="flex items-center gap-2 py-2">
            <span className="text-text-muted text-xs w-20 tabular-nums">
              --:--:--
            </span>
            <span className="w-2 h-4 bg-brand-500 animate-blink" />
          </div>
        )}
      </div>
    </div>
  );
}

function InstallTabs() {
  const [active, setActive] = useState<keyof typeof INSTALL_COMMANDS>("macos");
  const [copied, setCopied] = useState(false);

  const tabs: { key: keyof typeof INSTALL_COMMANDS; label: string }[] = [
    { key: "macos", label: "macOS" },
    { key: "linux", label: "Linux" },
    { key: "windows", label: "Windows" },
    { key: "cargo", label: "Cargo" },
  ];

  function copy() {
    navigator.clipboard.writeText(INSTALL_COMMANDS[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-bg-surface border border-border-muted rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border-muted">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 px-3 py-3 font-mono text-xs sm:text-sm transition-colors ${
              active === t.key
                ? "bg-brand-500 text-black font-bold"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="p-5">
        <div className="flex items-center gap-3 bg-terminal-bg border border-border-subtle rounded-lg p-4">
          <span className="text-brand-500 font-mono text-sm flex-shrink-0">
            $
          </span>
          <code className="font-mono text-sm text-terminal-text flex-1 break-all">
            {INSTALL_COMMANDS[active]}
          </code>
          <button
            onClick={copy}
            className={`font-mono text-xs flex-shrink-0 px-2 py-1 rounded border transition-all ${
              copied
                ? "border-success text-success bg-success/10"
                : "border-border-muted text-text-muted hover:text-text-primary hover:border-border-default"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {active === "cargo" && (
          <p className="font-mono text-xs text-text-muted mt-3">
            All features:{" "}
            <code className="text-brand-300">
              cargo install evnx --features full
            </code>
          </p>
        )}
      </div>

      {/* Verify output */}
      <div className="mx-5 mb-5 bg-terminal-bg border border-border-subtle rounded-lg p-4 font-mono text-xs">
        <div className="space-y-1 text-terminal-text">
          <div>
            <span className="text-brand-500">$ </span>evnx --version
          </div>
          <div className="text-success">evnx {EVNX_VERSION}</div>
          <div className="mt-2">
            <span className="text-brand-500">$ </span>evnx doctor
          </div>
          <div className="text-success">[OK] Environment looks healthy</div>
          <div className="text-success">[OK] .env is in .gitignore</div>
          <div className="text-success">
            [OK] .env.example is present and in sync
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-bg-base border-b border-border-muted overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-muted) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-muted) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Orange glow top-right */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--brand-500) 0%, transparent 70%)",
          }}
        />

        <div className="container-base section-padding relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-1.5 bg-danger/10 border border-danger/25 rounded-full px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                  <span className="font-mono text-xs text-danger">
                    0 incidents since evnx
                  </span>
                </div>
                <span className="font-mono text-xs text-text-muted border border-border-subtle rounded-full px-3 py-1">
                  v{EVNX_VERSION} · MIT · Rust
                </span>
              </div>

              <h1 className="font-serif font-bold leading-[1.05] mb-6">
                <span className="block text-5xl md:text-6xl xl:text-7xl text-text-primary">
                  Stop leaking
                </span>
                <span
                  className="block text-5xl md:text-6xl xl:text-7xl"
                  style={{ color: "var(--brand-500)" }}
                >
                  secrets.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-lg">
                evnx is a blazing-fast Rust CLI for validating, scanning,
                converting, and securing your environment files — before they
                become incidents.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a
                  href="#install"
                  className="flex items-center gap-2 font-mono text-sm bg-brand-500 text-black px-5 py-2.5 rounded-lg hover:bg-brand-400 transition-colors font-bold"
                >
                  Install evnx
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-mono text-sm border border-border-muted text-text-secondary px-5 py-2.5 rounded-lg hover:text-text-primary hover:border-border-default transition-colors"
                >
                  <Star className="w-4 h-4" />
                  GitHub
                </a>
                <Link
                  href="/guides/getting-started/quick-start"
                  className="flex items-center gap-2 font-mono text-sm text-text-muted hover:text-brand-400 transition-colors px-2 py-2.5"
                >
                  Quick start →
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-text-muted pt-8 border-t border-border-subtle">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Open source
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  MIT License
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  macOS · Linux · Windows
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  Built with Rust 🦀
                </span>
              </div>
            </div>

            {/* Terminal */}
            <div className="hidden lg:block">
              <Terminal lines={terminalLines} speed={28} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Origin Story (Incident Timeline) ───────────────────────────────── */}
      <section className="relative border-b border-border-muted overflow-hidden bg-bg-void">
        {/* Faint scanline texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
          }}
        />

        <div className="container-base section-padding relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — the story */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-danger/50 to-transparent" />
                <span className="font-mono text-xs text-danger uppercase tracking-widest">
                  Incident Report
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-danger/50 to-transparent" />
              </div>

              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                The night that
                <br />
                <span className="text-danger">cost $847</span>
                <br />
                and a phone call.
              </h2>

              <div className="space-y-6 text-text-secondary leading-relaxed">
                <p>
                  I pushed a hotfix at 11:47 PM. I typed{" "}
                  <code className="font-mono text-sm text-brand-300 bg-bg-surface px-1.5 py-0.5 rounded">
                    git add .
                  </code>{" "}
                  when I meant{" "}
                  <code className="font-mono text-sm text-brand-300 bg-bg-surface px-1.5 py-0.5 rounded">
                    git add src/
                  </code>
                  . I didn't notice{" "}
                  <code className="font-mono text-sm text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                    .env
                  </code>{" "}
                  was tracked.
                </p>
                <p>
                  The key was live for 22 minutes. An automated scanner found it
                  in four. By the time I woke up to the alerts, three services
                  were down and someone was mining crypto in three AWS regions
                  on my account.
                </p>
                <p>
                  The billing was painful. The call with my development lead at
                  midnight was worse.
                </p>
              </div>

              {/* Resolution callout */}
              <div className="mt-10 flex items-start gap-4 bg-success/5 border border-success/20 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full bg-success mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-mono text-sm text-success font-semibold mb-1">
                    Three years and zero incidents later.
                  </p>
                  <p className="text-sm text-text-secondary">
                    evnx is the pre-commit hook, the CI gate, and the doctor
                    diagnostic I wish had existed that night.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/blog/why-i-built-evnx"
                  className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5"
                >
                  Read the full story
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/guides/use-cases/prevent-secret-leaks"
                  className="font-mono text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Prevention guide →
                </Link>
              </div>
            </div>

            {/* Right — animated incident log */}
            <div>
              <IncidentTimeline />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section className="section-padding border-b border-border-muted bg-bg-base">
        <div className="container-base">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
            <div>
              <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
                // features
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                Everything your .env
                <br />
                workflow needs.
              </h2>
            </div>
            <p className="text-text-secondary max-w-sm">
              From secret detection to cloud migration — evnx handles the entire
              .env lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle rounded-xl overflow-hidden border border-border-subtle">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-bg-base hover:bg-bg-surface transition-colors p-7"
                >
                  {/* Number watermark */}
                  <span className="absolute top-4 right-5 font-mono text-xs text-text-muted/30 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-500/10 rounded-lg group-hover:bg-brand-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-brand-500" />
                    </div>
                    {f.badge && (
                      <span className="font-mono text-xs bg-brand-500 text-black px-2 py-0.5 rounded font-bold">
                        {f.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-brand-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {f.description}
                  </p>

                  {/* Hover line accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Install ─────────────────────────────────────────────────────────── */}
      <section
        id="install"
        className="section-padding border-b border-border-muted bg-bg-surface"
      >
        <div className="container-base">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
                // install
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Running in
                <br />
                under two minutes.
              </h2>
              <p className="text-text-secondary mb-8">
                Single static binary. No runtime, no dependencies. Works on
                macOS, Linux, and Windows.
              </p>

              {/* Steps */}
              <div className="space-y-4">
                {[
                  {
                    n: "01",
                    title: "Install",
                    desc: "One curl command or cargo install",
                  },
                  {
                    n: "02",
                    title: "Run doctor",
                    desc: "evnx doctor — checks gitignore, permissions, .env.example sync",
                  },
                  {
                    n: "03",
                    title: "Add pre-commit hook",
                    desc: "Blocks any commit containing a secret",
                  },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <span className="font-mono text-xs text-text-muted tabular-nums mt-0.5 w-6 flex-shrink-0">
                      {step.n}
                    </span>
                    <div>
                      <p className="font-mono text-sm text-text-primary font-semibold">
                        {step.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/guides/getting-started/installation"
                  className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5"
                >
                  Full installation guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div>
              <InstallTabs />
            </div>
          </div>
        </div>
      </section>

      {/* ── Commands Showcase ───────────────────────────────────────────────── */}
      <section className="section-padding border-b border-border-muted bg-bg-base">
        <div className="container-base">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
                // commands
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold">
                Built for your workflow.
              </h2>
            </div>
            <Link
              href="/guides"
              className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              All guides
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commands.map((cmd, i) => (
              <Link key={i} href={cmd.link}>
                <div className="group h-full bg-bg-surface border border-border-muted rounded-xl p-5 hover:border-brand-500/40 hover:bg-bg-overlay transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-brand-400">
                        evnx {cmd.name}
                      </span>
                      {cmd.badge && (
                        <span className="font-mono text-xs bg-brand-500 text-black px-1.5 py-0.5 rounded font-bold">
                          {cmd.badge}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <p className="text-sm text-text-muted mb-4">
                    {cmd.description}
                  </p>

                  <div className="bg-terminal-bg rounded-lg px-3 py-2.5 font-mono text-xs">
                    <span className="text-brand-500">$ </span>
                    <span className="text-terminal-text">{cmd.example}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CI/CD ───────────────────────────────────────────────────────────── */}
      <section className="section-padding border-b border-border-muted bg-bg-surface">
        <div className="container-base">
          <div className="mb-12">
            <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-3">
              // integrations
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3">
              Ship with confidence.
            </h2>
            <p className="text-text-secondary">
              evnx runs everywhere your code does.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "GitHub Actions",
                filename: ".github/workflows/scan.yml",
                lang: "yaml",
                code: `name: evnx security scan
on: [pull_request, push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: curl -fsSL https://dotenv.space/install.sh | bash
      - run: evnx scan --format github --exit-code`,
              },
              {
                label: "Pre-commit Hook",
                filename: ".pre-commit-config.yaml",
                lang: "yaml",
                code: `repos:
  - repo: local
    hooks:
      - id: evnx-scan
        name: Scan for secrets
        entry: evnx scan --exit-code
        language: system
        files: '\\.env'`,
              },
              {
                label: "Docker",
                filename: "Dockerfile",
                lang: "dockerfile",
                code: `FROM rust:slim AS build
RUN cargo install evnx

COPY .env .env
RUN evnx validate --strict \
 && evnx scan --exit-code`,
              },
            ].map(({ label, filename, lang, code }) => (
              <div
                key={label}
                className="bg-bg-base border border-border-muted rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <span className="font-mono text-xs font-semibold text-brand-400">
                    {label}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {filename}
                  </span>
                </div>
                <div className="p-4">
                  <CodeBlock language={lang} showLineNumbers={false}>
                    {code}
                  </CodeBlock>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/guides/integrations/github-actions"
              className="font-mono text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Full GitHub Actions guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="relative section-padding bg-bg-void overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-muted) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-muted) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-3xl opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, var(--brand-500) 0%, transparent 70%)",
          }}
        />

        <div className="container-base relative text-center">
          <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-5">
            // get started
          </p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Don't wait for
            <br />
            <span className="text-danger">your incident.</span>
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
            Install evnx, run{" "}
            <code className="font-mono text-sm text-brand-300 bg-bg-surface px-2 py-0.5 rounded">
              evnx doctor
            </code>
            , add the pre-commit hook. Five minutes of setup to avoid the worst
            conversation of your career.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <a
              href="#install"
              className="flex items-center gap-2 font-mono text-sm bg-brand-500 text-black px-6 py-3 rounded-lg hover:bg-brand-400 transition-colors font-bold"
            >
              Install evnx — it's free
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/guides/getting-started/quick-start"
              className="flex items-center gap-2 font-mono text-sm border border-border-muted text-text-secondary px-6 py-3 rounded-lg hover:text-text-primary hover:border-border-default transition-colors"
            >
              5-minute quick start
            </Link>
          </div>

          {/* Mini terminal */}
          <div className="max-w-md mx-auto bg-terminal-bg border border-border-muted rounded-xl p-5 font-mono text-sm text-left">
            <div className="space-y-1.5 text-terminal-text">
              <div>
                <span className="text-brand-500">$ </span>curl -fsSL
                https://dotenv.space/install.sh | bash
              </div>
              <div className="text-success pl-4">
                ✓ evnx {EVNX_VERSION} installed
              </div>
              <div>
                <span className="text-brand-500">$ </span>evnx doctor
              </div>
              <div className="text-success pl-4">✓ All checks passed</div>
              <div>
                <span className="text-brand-500">$ </span>evnx scan
              </div>
              <div className="text-success pl-4">✓ No secrets detected</div>
              <div className="flex items-center gap-1 pl-4 text-success">
                <span>✓ You're protected</span>
                <span className="w-2 h-4 bg-brand-500 animate-blink" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
