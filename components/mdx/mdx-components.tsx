/**
 * MDX Component Registry
 *
 * Every component listed here is automatically available inside any .mdx file
 * without an explicit import. Add new components here as the library grows.
 *
 * Usage in .mdx:
 *   <Callout type="warning">Watch out!</Callout>
 *   <CodeBlock language="bash">evnx scan</CodeBlock>
 */

import type { MDXComponents } from "mdx/types";
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

// ─── Prose overrides ──────────────────────────────────────────────────────────
// These replace default HTML elements rendered by MDX so we can style them
// with the evnx design system without adding a Tailwind typography plugin.

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl font-bold mt-12 mb-4 text-text-primary scroll-mt-8">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-xl font-bold mt-8 mb-3 text-text-primary scroll-mt-8">
      {children}
    </h3>
  );
}

function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-mono text-base font-semibold mt-6 mb-2 text-text-primary">
      {children}
    </h4>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-secondary leading-relaxed mb-4">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 mb-4 ml-4">{children}</ul>;
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-text-secondary leading-relaxed flex gap-2">
      <span className="text-brand-500 flex-shrink-0 mt-1">›</span>
      <span>{children}</span>
    </li>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-brand-500 pl-4 my-6 text-text-secondary italic">
      {children}
    </blockquote>
  );
}

function HR() {
  return <hr className="border-border-subtle my-10" />;
}

function A({ href, children }: { href?: string; children: React.ReactNode }) {
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-text-primary">{children}</strong>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-sm px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-brand-300">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  // next-mdx-remote wraps <CodeBlock> in a <pre>. We pass through to let
  // CodeBlock handle its own container styling.
  return <>{children}</>;
}

function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  // Extract language from className (e.g. "language-bash")
  const lang = className?.replace("language-", "") ?? "bash";

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border-muted">
      <div className="flex items-center justify-between bg-bg-overlay px-4 py-2 border-b border-border-subtle">
        <span className="font-mono text-xs text-text-muted">{lang}</span>
      </div>
      <div className="bg-terminal-bg p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-terminal-text leading-relaxed whitespace-pre">
          {children}
        </pre>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const mdxComponents: MDXComponents = {
  // HTML overrides
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
  code: InlineCode,
  pre: Pre,

  // Code block — used when MDX renders fenced code blocks
  // The `code` override above handles inline code; fenced blocks go through `pre > code`
  // Override per block with the CodeBlock component below
  CodeBlock,

  // Custom evnx MDX components
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
