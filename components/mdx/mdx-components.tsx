/**
 * MDX Component Registry — SERVER COMPONENT
 * NO 'use client' — MDXRemote (next-mdx-remote/rsc) runs on the server.
 *
 * pre  → FencedCodeBlock (async, calls Shiki via lib/shiki.ts)
 * code → InlineCode      (simple span, only for `backtick` prose)
 */
import React from "react";
import type { MDXComponents } from "mdx/types";
import { FencedCodeBlock } from "./fenced-code-block";
import { CopyButton } from "./copy-button";
import { Callout } from "./callout";
import { CodeTabs, Tab } from "./code-tabs";
import { TerminalOutput } from "./terminal-output";
import { DiffBlock } from "./diff-block";
import { Step } from "./step";
import { Prerequisites, Prerequisite } from "./prerequisites";
import { VersionBadge } from "./version-badge";
import { Difficulty } from "./difficulty";
import { CommandSignature } from "./command-signature";
import { OptionTable, Option } from "./option-table";
import { FileTree } from "./file-tree";
import { AuthorNote } from "./author-note";
import { CommandRef } from "./command-ref";

// ── Inline code ───────────────────────────────────────────────────────────────
function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="font-mono text-sm px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-brand-300 break-words">
      {children}
    </code>
  );
}

// ── Prose ─────────────────────────────────────────────────────────────────────
function H2({ children }: { children?: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl font-bold mt-12 mb-4 text-text-primary scroll-mt-20 leading-snug">
      {children}
    </h2>
  );
}
function H3({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="font-serif text-xl font-bold mt-8 mb-3 text-text-primary scroll-mt-20">
      {children}
    </h3>
  );
}
function H4({ children }: { children?: React.ReactNode }) {
  return (
    <h4 className="font-mono text-base font-semibold mt-6 mb-2 text-text-primary">
      {children}
    </h4>
  );
}
function P({ children }: { children?: React.ReactNode }) {
  return (
    <p className="text-text-secondary leading-relaxed mb-4 max-w-prose">
      {children}
    </p>
  );
}
function UL({ children }: { children?: React.ReactNode }) {
  return <ul className="mb-4 ml-1 space-y-2">{children}</ul>;
}
function OL({ children }: { children?: React.ReactNode }) {
  return <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>;
}
function LI({ children }: { children?: React.ReactNode }) {
  return (
    <li className="text-text-secondary leading-relaxed flex gap-2 items-start">
      <span className="text-brand-500 flex-shrink-0 mt-[3px] select-none">
        ›
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}
function Blockquote({ children }: { children?: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-brand-500 pl-5 my-6 text-text-secondary italic">
      {children}
    </blockquote>
  );
}
function HR() {
  return <hr className="border-border-subtle my-10" />;
}
function A({ href, children }: { href?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  );
}
function Strong({ children }: { children?: React.ReactNode }) {
  return (
    <strong className="font-semibold text-text-primary">{children}</strong>
  );
}

// ── Tables ────────────────────────────────────────────────────────────────────
function Table({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border-muted">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}
function THead({ children }: { children?: React.ReactNode }) {
  return (
    <thead className="bg-bg-overlay border-b border-border-muted">
      {children}
    </thead>
  );
}
function TBody({ children }: { children?: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
function TR({ children }: { children?: React.ReactNode }) {
  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-bg-surface transition-colors">
      {children}
    </tr>
  );
}
function TH({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap">
      {children}
    </th>
  );
}
function TD({ children }: { children?: React.ReactNode }) {
  return (
    <td className="py-2.5 px-4 text-text-secondary font-mono text-xs align-top">
      {children}
    </td>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export const mdxComponents: MDXComponents = {
  pre: FencedCodeBlock, // ← fenced ```blocks``` — async Shiki
  code: InlineCode, // ← `inline` only

  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  hr: HR,
  a: A,
  strong: Strong,

  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,

  Callout,
  CodeTabs,
  Tab,
  TerminalOutput,
  DiffBlock,
  Step,
  Prerequisites,
  Prerequisite,
  VersionBadge,
  Difficulty,
  CommandSignature,
  OptionTable,
  Option,
  FileTree,
  AuthorNote,
  CommandRef,
};
