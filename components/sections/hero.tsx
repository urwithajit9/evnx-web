"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import {
  EVNX_VERSION_TAG,
  FEATURED_CHANNELS,
  INSTALL_CHANNEL_COUNT,
  LATEST_TALK,
  docsUrl,
  formatDownloads,
  hasDownloadCounts,
} from "@evnx/config";
import { hero } from "@evnx/content";
import { TerminalBlock } from "./terminal-block";

export function Hero() {
  const [active, setActive] = useState(FEATURED_CHANNELS[0].id);
  const [copied, setCopied] = useState(false);
  const channel =
    FEATURED_CHANNELS.find((c) => c.id === active) ?? FEATURED_CHANNELS[0];

  function copy() {
    navigator.clipboard.writeText(channel.command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
      <div>
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="font-mono text-xs text-brand-400 border border-brand-500/30 bg-brand-500/10 rounded-full px-3 py-1">
            {/* Never typed. `versions.json`, refreshed from the registries. */}
            {EVNX_VERSION_TAG}
          </span>
          <span className="font-mono text-xs text-text-muted border border-border-subtle rounded-full px-3 py-1">
            MIT · Rust
          </span>
        </div>

        <h1 className="font-serif font-bold leading-[1.05] mb-6 text-5xl md:text-6xl xl:text-7xl">
          <span className="block text-text-primary">{hero.headline.line1}</span>
          <span className="block" style={{ color: "var(--brand-500)" }}>
            {hero.headline.line2}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-xl">
          {hero.subhead}
        </p>

        {/* ── Install tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-3" role="tablist" aria-label="Install method">
          {FEATURED_CHANNELS.map((c) => (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={c.id === active}
              onClick={() => setActive(c.id)}
              className={
                "px-3 py-1.5 rounded-md font-mono text-xs transition-colors " +
                (c.id === active
                  ? "bg-bg-surface text-text-primary border border-border-default"
                  : "text-text-muted hover:text-text-secondary border border-transparent")
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-terminal-bg border border-border-muted rounded-lg px-4 py-3 mb-3">
          <code className="flex-1 font-mono text-sm text-terminal-text overflow-x-auto whitespace-pre">
            <span className="text-terminal-prompt select-none">$ </span>
            {channel.command}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy the ${channel.label} install command`}
            className="flex-shrink-0 p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* ⚠️ The cargo caveat is real and belongs beside the command, not in a
            footnote: `cargo install evnx` alone has no cloud commands. */}
        {channel.note && (
          <p className="text-xs text-text-muted mb-8 leading-relaxed">{channel.note}</p>
        )}

        <div className="flex items-center gap-3 text-sm flex-wrap">
          <Link
            href={docsUrl("getting-started/quick-start")}
            className="text-brand-400 hover:underline underline-offset-4 inline-flex items-center gap-1"
          >
            {hero.secondaryLinks[0].label}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {hero.reassurance.map((r) => (
            <span key={r} className="text-text-muted">
              · {r}
            </span>
          ))}
        </div>
      </div>

      <TerminalBlock lines={hero.terminal.lines} tabs={hero.terminal.tabs} />
    </div>
  );
}

/**
 * The proof strip under the hero.
 *
 * ⚠️ Every claim here is gated on being real. The download figure renders only
 * when the registry sync has produced one — an omitted number is fine, an
 * invented one is the single easiest claim on this page to falsify, and
 * "0 downloads" is worse than both.
 */
export function HeroProof() {
  const downloads = formatDownloads();
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-text-secondary border-t border-border-muted pt-6 mt-14">
      {hasDownloadCounts() && downloads && (
        <span>
          <b className="text-text-primary font-mono">{downloads}</b>{" "}
          {hero.proof.downloadsTemplate.replace("{count} ", "")}
        </span>
      )}
      <span>
        <b className="text-text-primary font-mono">{INSTALL_CHANNEL_COUNT}</b>{" "}
        {hero.proof.channelsTemplate.replace("{count} ", "")}
      </span>
      {hero.proof.showTalk && LATEST_TALK && (
        <span>
          Presented at{" "}
          <Link href="/talks" className="text-brand-400 hover:underline underline-offset-4">
            {LATEST_TALK.event} {LATEST_TALK.year}
          </Link>
          , {LATEST_TALK.city}
        </span>
      )}
    </div>
  );
}
