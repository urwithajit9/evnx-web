#!/usr/bin/env node
// ─── 5.4 · Every `evnx …` in the docs resolves against the real CLI ───────────
//
//   node scripts/check-cli-invocations.mjs
//   node scripts/check-cli-invocations.mjs --list   print every invocation found
//
// ⚠️ WOULD HAVE CAUGHT FOUR REAL ERRORS, each found by a hand sweep instead:
//
//   `evnx vault rekey` documented before it existed
//   "arriving in the next release" callouts stale the moment 0.7.0 shipped
//   `commands/auth` missing four subcommands for a whole release
//   `cloud delete-version` shipping with no row in its own subcommand table
//
// ═══ THE HARD PART IS PRECISION, NOT COVERAGE ════════════════════════════════
//
// Measured before writing this: a naive scan of all prose finds 396 "failures"
// across 188 strings, and essentially all of them are English — "evnx is",
// "evnx does", "evnx never". A check that cries wolf 396 times is a check
// somebody turns off, and then it catches nothing at all.
//
// So the scan is deliberately narrow, and each narrowing is listed here because
// each one is a decision about what this check does NOT cover:
//
//   1. Only fenced blocks tagged as a shell, and inline `code`. Prose never.
//   2. Only the first line-segment of a command — not what follows a pipe into
//      another program, and not heredoc bodies.
//   3. `#` comments inside shell blocks are stripped. ⚠️ This is where almost
//      all the remaining noise lived: `# evnx asks for your password` is prose.
//   4. Placeholders (`<vault>`, `$VAR`, `…`) are skipped rather than guessed at.
//
// ⚠️ What it therefore cannot catch: a wrong flag inside a pipeline, a command
// named only in prose, and anything in a ```text block. Those are real gaps,
// written down so nobody assumes otherwise.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "node:fs";
import { findBinary, readSurface, index } from "./lib/surface.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const listOnly = process.argv.includes("--list");

// ─── The baseline ────────────────────────────────────────────────────────────
//
// ⚠️ Without this, the check fails on the docs DOING THE RIGHT THING.
//
// Measured: all ten remaining failures in the guides are deliberate mentions of
// a command or flag that does not exist, inside prose that says exactly that —
//
//   "`--exit-code` … have appeared on this page in the past. None of them exist."
//   "There is no `evnx update --apply` and there will not be one."
//   "evnx validate --pattern .env.production    # gone"
//
// Those are the output of the per-command review, and a check that fails on
// them teaches people to delete the retraction. So each is listed once, with
// why, and anything NOT listed is a failure.
//
// ⚠️ The file is also checked in the other direction: an entry that no longer
// occurs is reported, so the baseline cannot quietly accumulate permissions for
// text somebody removed years ago.
const BASELINE_PATH = join(HERE, "cli-invocations-baseline.json");
const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
  : { accepted: [] };
const baselineKeys = new Map(
  baseline.accepted.map((e) => [`${e.file}::${e.invocation}`, e]),
);
const baselineHit = new Set();

// ⚠️ GUIDES ONLY BY DEFAULT, and the reason matters.
//
// Running this across the blog found fourteen "failures" — and every one was
// inside a RETRACTION:
//
//   "Retracted: `evnx link aws`, `evnx pull`, `evnx run`, `evnx push KEY=value`"
//   "Corrected September 2026: this policy listed `evnx audit` and
//    `evnx onboarding`. Neither command exists."
//
// Those posts are doing exactly the right thing: naming a wrong command in
// order to withdraw it. A check that fails on a correction teaches people to
// delete the correction, which is worse than the original error.
//
// Guides are instructions — every `evnx …` in them is something a reader is
// meant to type, so there is no legitimate reason for one not to resolve.
// Prose about the product is a different kind of writing and is not checked.
//
// `--all` includes the blog for a manual sweep, where a human can tell a
// retraction from a mistake.
const GUIDE_SOURCES = ["packages/docs-content/guides/**/*.mdx"];
const PROSE_SOURCES = ["apps/web/content/**/*.mdx"];
const SOURCES = process.argv.includes("--all")
  ? [...GUIDE_SOURCES, ...PROSE_SOURCES]
  : GUIDE_SOURCES;

// Fences whose contents are commands a reader would type. ⚠️ `text`, `json`,
// `yaml` and friends are deliberately absent: they hold OUTPUT, which quotes
// evnx's own prose back at us.
const SHELL_LANGS = new Set(["bash", "sh", "shell", "console", "zsh"]);

const FENCE = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
const INLINE = /`([^`\n]+)`/g;

/** A value the reader is meant to replace. Checking it would be guessing. */
function isPlaceholder(tok) {
  return (
    tok.startsWith("<") ||
    tok.startsWith("$") ||
    tok.startsWith("{") ||
    tok.includes("…") ||
    tok === "..." ||
    tok.startsWith("[")
  );
}

/**
 * Split a shell snippet into the command segments worth checking.
 *
 * ⚠️ Only the FIRST segment of a pipeline. `evnx scan --format json | jq .x`
 * is checkable up to the pipe; what follows belongs to another program.
 */
function segments(block) {
  const out = [];
  for (let line of block.split("\n")) {
    // 3 · strip comments — where nearly all the noise lived.
    const hash = line.indexOf("#");
    if (hash === 0) continue;
    if (hash > 0) line = line.slice(0, hash);

    line = line.trim().replace(/^\$\s*/, "");
    if (!line) continue;
    // Continuations and chaining: take each command, drop pipeline tails.
    for (const part of line.split(/&&|\|\||;/)) {
      out.push(part.split("|")[0].trim());
    }
  }
  return out;
}

const problems = [];
const seen = [];

/** Record a failure unless the baseline accepts it. */
function fail(p) {
  const key = `${p.file}::${p.text}`;
  if (baselineKeys.has(key)) {
    baselineHit.add(key);
    return;
  }
  problems.push(p);
}

function checkInvocation({ text, file, where }) {
  // ⚠️ Shell punctuation clings to tokens. `$(evnx sync --check)` yields a
  // flag named `--check)`, which is a parsing artefact rather than a finding —
  // and one bogus failure teaches people to ignore the next real one.
  const toks = text
    .split(/\s+/)
    .map((t) => t.replace(/[)\]},;"']+$/, "").replace(/^[("'`]+/, ""))
    .filter(Boolean);
  if (toks[0] !== "evnx") return;
  seen.push({ text, file });

  // ⚠️ Everything after a bare `--` belongs to the CHILD process.
  //
  // `evnx cloud run --vault x -- npm run build --prod` passes `--prod` to npm,
  // and the first version of this check reported it as a flag evnx does not
  // have. `cloud run` exists precisely to hand arguments to another program;
  // a check that cannot see that would fail its own headline feature.
  const dashdash = toks.indexOf("--");
  if (dashdash !== -1) toks.length = dashdash;

  const { paths, aliasPaths, subsOf, flagsOf, roots } = SURF;

  const rest = toks.slice(1).filter((t) => !t.startsWith("-"));
  if (rest.length === 0) return; // bare `evnx`, or only flags

  if (isPlaceholder(rest[0])) return;

  // ⚠️ A command name is lowercase and letter-led. Anything else is output that
  // happens to begin with the word: a bash block showing `evnx --version`'s
  // reply contains the line `evnx 0.6.0`, and reporting that as an unknown
  // command is the check misreading its own examples.
  if (!/^[a-z][a-z0-9-]*$/.test(rest[0])) return;

  const rootNames = new Set(roots.map((r) => r.name));
  if (!rootNames.has(rest[0]) && !aliasPaths.has(rest[0])) {
    fail({ file, where, text, why: `\`evnx ${rest[0]}\` is not a command` });
    return;
  }

  // ⚠️ Walk as DEEP as the tree goes, not two levels.
  //
  // The first version stopped at depth 2, so `evnx auth token create --scope`
  // was checked against `auth token`'s flags — which has none, because they
  // belong to `auth token create`. It reported two false failures on correct
  // documentation, which is the precise way a check like this loses its
  // audience.
  let path = rest[0];
  let i = 1;
  while (i < rest.length) {
    const subs = subsOf.get(path);
    if (!subs || subs.size === 0) break; // the rest are arguments
    const next = rest[i];
    if (isPlaceholder(next)) break;
    if (!subs.has(next)) {
      fail({
        file,
        where,
        text,
        why: `\`evnx ${path} ${next}\` — \`${path}\` has no \`${next}\` subcommand`,
      });
      return;
    }
    path = `${path} ${next}`;
    i += 1;
  }
  const known = flagsOf.get(path);
  if (known) {
    for (const t of toks.slice(1)) {
      if (!t.startsWith("--") || t === "--") continue;
      const name = t.split("=")[0];
      if (isPlaceholder(name)) continue;
      // Global flags live on the root command, not on each subcommand.
      if (["--help", "--version", "--verbose", "--quiet", "--no-color", "--server"].includes(name)) {
        continue;
      }
      if (!known.has(name)) {
        fail({
          file,
          where,
          text,
          why: `\`evnx ${path}\` has no \`${name}\` flag`,
        });
      }
    }
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────

let bin;
try {
  bin = findBinary();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
if (!bin) {
  console.log(
    "skipped: no evnx binary found. Set EVNX_BIN, or:\n" +
      "    cd ../evnx && cargo build --release --all-features",
  );
  process.exit(0);
}

let SURF;
try {
  SURF = index(readSurface(bin));
} catch (e) {
  console.error(`could not read the command surface from ${bin}:\n${e.message}`);
  process.exit(1);
}

const files = SOURCES.flatMap((p) => globSync(p, { cwd: ROOT }).map((f) => join(ROOT, f)));

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);

  for (const m of text.matchAll(FENCE)) {
    if (!SHELL_LANGS.has(m[1].toLowerCase())) continue;
    for (const seg of segments(m[2])) {
      checkInvocation({ text: seg, file: rel, where: "code block" });
    }
  }
  for (const m of text.matchAll(INLINE)) {
    const t = m[1].trim();
    if (!t.startsWith("evnx")) continue;
    // ⚠️ Inline code is often prose about evnx rather than a command —
    // `evnx cannot read your secrets`. Require a plausible shape: no sentence
    // punctuation, and at most a handful of words.
    if (/[.,;:!?]/.test(t) || t.split(/\s+/).length > 8) continue;
    checkInvocation({ text: t, file: rel, where: "inline code" });
  }
}

if (listOnly) {
  const uniq = [...new Set(seen.map((s) => s.text))].sort();
  for (const u of uniq) console.log("  " + u);
  console.log(`\n${uniq.length} distinct invocations across ${files.length} files`);
  process.exit(0);
}

console.log(
  `checked ${seen.length} \`evnx …\` invocations in ${files.length} files against ${bin}`,
);

const stale = [...baselineKeys.keys()].filter((k) => !baselineHit.has(k));
if (stale.length) {
  console.log(
    `⚠ ${stale.length} baseline entr${stale.length === 1 ? "y no longer occurs" : "ies no longer occur"}` +
      ` — remove them from cli-invocations-baseline.json:\n` +
      stale.map((k) => `    ${k.replace("::", "  →  ")}`).join("\n"),
  );
}

if (problems.length === 0) {
  console.log(
    `✓ every documented invocation resolves against the real CLI` +
      ` (${baselineHit.size} accepted by the baseline)`,
  );
  process.exit(0);
}

console.error(`\n✗ ${problems.length} invocation(s) do not resolve:\n`);
const byFile = new Map();
for (const p of problems) {
  if (!byFile.has(p.file)) byFile.set(p.file, []);
  byFile.get(p.file).push(p);
}
for (const [file, ps] of [...byFile].sort()) {
  console.error(`  ${file}`);
  for (const p of ps) console.error(`      ${p.why}\n        in ${p.where}: ${p.text}`);
}
process.exit(1);
