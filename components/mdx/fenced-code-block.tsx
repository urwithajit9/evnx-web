/**
 * FencedCodeBlock — async Server Component
 * No 'use client'
 *
 * Instead of rendering Shiki's full <pre><code>…</code></pre> output and
 * fighting its styles, we:
 *   1. Call Shiki to get the full HTML
 *   2. Extract ONLY the inner content of <code> (the token <span>s)
 *   3. Render our own <pre><code> with full style control
 *
 * This means there is exactly one box — ours. No double border possible.
 */
import React from "react";
import { codeToHtml } from "shiki";
import { LANG_LABELS } from "@/lib/shiki";
import { CopyButton } from "./copy-button";

type Props = { children?: React.ReactNode };

export async function FencedCodeBlock({ children }: Props) {
  const codeEl = React.Children.only(children) as React.ReactElement<{
    className?: string;
    children?: React.ReactNode;
  }>;

  const cls = codeEl?.props?.className ?? "";
  const lang = cls.startsWith("language-") ? cls.slice("language-".length) : "";

  if (!lang) {
    return (
      <pre className="my-6 rounded-xl bg-terminal-bg border border-border-muted p-5 overflow-x-auto font-mono text-sm text-terminal-text leading-relaxed">
        {children}
      </pre>
    );
  }

  const label = LANG_LABELS[lang] ?? lang;
  const rawCode = extractText(codeEl.props.children).replace(/\n$/, "");

  // ── Get token HTML from Shiki ─────────────────────────────────────────────
  let innerHtml: string;

  try {
    const fullHtml = await codeToHtml(rawCode, {
      lang: SUPPORTED_LANGS.has(lang) ? lang : "plaintext",
      theme: "github-dark",
    });

    // Shiki outputs:
    //   <pre class="shiki …" style="…" tabindex="0">
    //     <code><span class="line"><span style="color:#…">token</span>…</span></code>
    //   </pre>
    //
    // We extract ONLY what's between <code> and </code>.
    // The token spans carry all colour info as inline style="color:#…".
    const match = fullHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    innerHtml = match?.[1] ?? escapeHtml(rawCode);
  } catch (err) {
    console.error("[FencedCodeBlock] shiki failed:", err);
    innerHtml = escapeHtml(rawCode);
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      {/* Header */}
      <div className="flex items-center justify-between bg-bg-overlay px-4 py-2.5 border-b border-border-subtle">
        <span className="font-mono text-xs text-text-muted">{label}</span>
        <CopyButton code={rawCode} />
      </div>

      {/* Our <pre> — single box, full control, Shiki token spans inside */}
      <div className="overflow-x-auto bg-terminal-bg">
        <pre
          style={{
            margin: 0,
            padding: "1.25rem", // p-5
            background: "transparent",
            border: "none",
            borderRadius: 0,
            fontSize: "0.875rem", // text-sm
            lineHeight: "1.75",
            fontFamily: "'IBM Plex Mono', 'Menlo', 'Consolas', monospace",
            tabSize: 2,
            overflowX: "visible", // parent div handles scroll
          }}
        >
          <code
            style={{ background: "transparent", padding: 0 }}
            dangerouslySetInnerHTML={{ __html: innerHtml }}
          />
        </pre>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPPORTED_LANGS = new Set([
  "bash",
  "shell",
  "sh",
  "powershell",
  "yaml",
  "yml",
  "json",
  "toml",
  "typescript",
  "ts",
  "tsx",
  "javascript",
  "js",
  "jsx",
  "python",
  "py",
  "rust",
  "rs",
  "go",
  "dockerfile",
  "diff",
  "sql",
  "ini",
  "env",
  "plaintext",
  "text",
]);

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
