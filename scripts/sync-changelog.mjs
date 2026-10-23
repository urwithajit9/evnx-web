#!/usr/bin/env node
// ─── Generate /changelog from the CLI's own CHANGELOG.md ──────────────────────
//
//   node scripts/sync-changelog.mjs           rewrite apps/web/content/changelog.json
//   node scripts/sync-changelog.mjs --check   exit 1 if it is stale (for CI)
//   node scripts/sync-changelog.mjs --from PATH   read a local CHANGELOG.md
//
// Source, in order: --from, $EVNX_CHANGELOG, ../evnx/CHANGELOG.md (a sibling
// clone, as the cli:* scripts assume), then the file on GitHub's main branch.
//
// ⚠️ Why this exists: the /changelog page was a hand-maintained array and it
// stopped at v0.4.0 while the CLI shipped 26 more releases. That is the same
// shape as every other drift this repo has scripts for — a second list of what
// the CLI did, kept by hand. So there is no second list: the page reads this
// JSON and this JSON is derived from CHANGELOG.md.
//
// ⚠️ Same rule as sync-config.mjs: a failed read never overwrites good data.
// If no source can be read, the committed JSON stays as it is and the script
// says so: exit 1 when asked to write, a warning (exit 0) under --check.
//
// What is extracted per release:
//   * the opening paragraph, as a one-line summary
//   * every top-level "- **Bold lead**" bullet and every "### ⛔/⚠️ …" headline,
//     typed by the "### Section" it sits under
// Sections that are about the repository rather than the product (Internal,
// Shared code, Tests, Library, Release checks, "Why this is …") are skipped.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(ROOT, "apps", "web", "content", "changelog.json");
const RAW_URL =
  "https://raw.githubusercontent.com/urwithajit9/evnx/main/CHANGELOG.md";
const REPO = "https://github.com/urwithajit9/evnx";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const fromIdx = args.indexOf("--from");
const fromArg = fromIdx >= 0 ? args[fromIdx + 1] : undefined;

// ─── Read the source ──────────────────────────────────────────────────────────

async function readSource() {
  const candidates = [
    fromArg,
    process.env.EVNX_CHANGELOG,
    join(ROOT, "..", "evnx", "CHANGELOG.md"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return { text: readFileSync(p, "utf8"), from: p };
  }
  try {
    const res = await fetch(RAW_URL, {
      headers: { "User-Agent": "evnx-web-changelog-sync (+https://evnx.dev)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { text: await res.text(), from: RAW_URL };
  } catch (err) {
    return { text: null, from: `${RAW_URL} (${err.message})` };
  }
}

// ─── Parse ────────────────────────────────────────────────────────────────────

const SKIP_SECTION =
  /^(internal|shared code|shared|tests|library|release checks|why |version history|known limitations)/i;

function sectionType(heading) {
  const h = heading.replace(/^[⛔⚠️\s]+/u, "").toLowerCase();
  if (heading.startsWith("⛔") || h.startsWith("security")) return "security";
  if (heading.startsWith("⚠️") || h.startsWith("breaking")) return "breaking";
  if (h.startsWith("added")) return "feature";
  if (h.startsWith("fixed")) return "fix";
  if (h.startsWith("performance")) return "performance";
  if (h.startsWith("doc")) return "docs";
  return "improvement"; // Changed, per-command sections, Packaging, …
}

/** "- **Thing** (I-123, DEC-X). Rest…" → "Thing" */
function boldLead(bullet) {
  const m = bullet.match(/^- \*\*(.+?)\*\*/);
  return m ? m[1].trim() : null;
}

/** First sentence of a plain bullet, for the early releases that have no bold leads. */
function plainLead(bullet) {
  const body = bullet.replace(/^- /, "").trim();
  return firstSentences(body, 1) || null;
}

/**
 * Sentences up to `max` chars. Code spans are masked first so that `.env`,
 * `0.4.0` and `--help.` do not end a sentence.
 */
function firstSentences(text, max) {
  const spans = [];
  const masked = text.replace(/`[^`]*`/g, (m) => `\u0000${spans.push(m) - 1}\u0000`);
  const sentences = masked.match(/.+?[.!?](?=\s+[A-Z(`\u0000"]|\s*$)|.+$/g) ?? [masked];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  return out.trim().replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
}

/** The opening prose paragraph, as a sentence or two. */
function summaryOf(lines) {
  const para = [];
  for (const l of lines) {
    if (!l.trim()) {
      if (para.length) break;
      continue;
    }
    if (/^(#|- |\* |\d+\. |```|\||>|⚠️|🔒|ⓘ|⛔|\*\*Full)/u.test(l.trim())) break;
    para.push(l.trim());
  }
  return para.length ? firstSentences(para.join(" "), 280) : null;
}

/** Join a bullet's indented continuation lines onto it. */
function joinContinuations(lines) {
  const out = [];
  for (const l of lines) {
    if (/^\s{2,}\S/.test(l) && out.length && out[out.length - 1].startsWith("- ")) {
      out[out.length - 1] += " " + l.trim();
    } else out.push(l);
  }
  return out;
}

function releaseType(version, prev) {
  if (!prev) return "minor";
  const [a, b] = [version, prev].map((v) => v.split(".").map(Number));
  if (a[0] !== b[0]) return "major";
  if (a[1] !== b[1]) return "minor";
  return "patch";
}

function parse(md) {
  const blocks = md.split(/^## /m).slice(1);
  const releases = [];
  for (const block of blocks) {
    const [head, ...lines] = block.split("\n");
    const m = head.match(/^\[(\d+\.\d+\.\d+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (!m) continue; // [Unreleased]
    const [, version, date] = m;

    const body = joinContinuations(lines);
    // Releases written with bold leads list detail in plain bullets beneath
    // them; only the early, terse releases need the plain bullets themselves.
    const hasBold = body.some((l) => l.startsWith("- **"));

    const highlights = [];
    const seen = new Set();
    const push = (type, text) => {
      if (!text || seen.has(text)) return;
      seen.add(text);
      highlights.push({ type, text });
    };
    let section = null; // null = before the first ###
    let skipping = false;
    for (const line of body) {
      if (line.startsWith("### ")) {
        section = line.slice(4).trim();
        skipping = SKIP_SECTION.test(section.replace(/^[⛔⚠️\s]+/u, ""));
        // A ⛔/⚠️ headline is itself the news; most have prose, not bullets.
        if (/^(⛔|⚠️)/u.test(section) && !/breaking/i.test(section)) {
          push(
            sectionType(section),
            section
              .replace(/^[⛔⚠️\s]+/u, "")
              .replace(/^(Security|Fixed)\s+—\s+/, "")
              .trim(),
          );
        }
        continue;
      }
      if (skipping || !line.startsWith("- ")) continue;
      const type = section ? sectionType(section) : "improvement";
      if (hasBold) push(type, boldLead(line));
      else push(type, plainLead(line));
    }

    releases.push({ version, date, summary: summaryOf(lines), highlights });
  }

  return releases.map((r, i) => ({
    ...r,
    type: releaseType(r.version, releases[i + 1]?.version),
    links: {
      github: releases[i + 1]
        ? `${REPO}/compare/v${releases[i + 1].version}...v${r.version}`
        : `${REPO}/releases/tag/v${r.version}`,
    },
  }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const { text, from } = await readSource();
if (!text) {
  // ⚠️ Same policy as sync-config.mjs: an unreachable source is a warning in
  // --check (a check that goes red when GitHub is slow is one people learn to
  // ignore), and an error when asked to write (nothing was written).
  console.error(`${checkOnly ? "⚠" : "✗"} could not read CHANGELOG.md from any source; last tried ${from}`);
  console.error("  apps/web/content/changelog.json left unchanged.");
  process.exit(checkOnly ? 0 : 1);
}

const releases = parse(text);
if (!releases.length) {
  console.error(`✗ ${from} parsed to zero releases — refusing to write an empty changelog.`);
  process.exit(1);
}

const json =
  JSON.stringify(
    {
      _comment:
        "GENERATED — do not hand-edit. Run `pnpm changelog:sync` to refresh from the CLI's CHANGELOG.md.",
      latest: releases[0].version,
      releases,
    },
    null,
    2,
  ) + "\n";

const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
if (checkOnly) {
  if (current !== json) {
    console.error(`✗ changelog.json is stale against ${from} (latest there: v${releases[0].version}).`);
    console.error("  Run `pnpm changelog:sync`.");
    process.exit(1);
  }
  console.log(`✓ changelog.json is current (v${releases[0].version}).`);
} else {
  writeFileSync(OUT, json);
  const n = releases.reduce((s, r) => s + r.highlights.length, 0);
  console.log(`✓ ${releases.length} releases, ${n} highlights → apps/web/content/changelog.json (from ${from})`);
}
