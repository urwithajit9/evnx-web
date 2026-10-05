#!/usr/bin/env node
// ─── 5.5 · What a release changed, and which guides it touches ────────────────
//
//   node scripts/diff-cli-surface.mjs v0.9.0
//   node scripts/diff-cli-surface.mjs v0.9.0 --json
//
// Compares the CLI's command surface at a git tag against the current binary,
// and names the guides that document whatever moved.
//
// ⚠️ WHAT THIS IS FOR: making "checked against this version" enforceable rather
// than asserted.
//
// 37 guides sat on a `0.2.x` badge through four releases. A bulk find-and-
// replace was rejected — correctly — because the badge would then claim each
// guide had been checked when nothing had been. This produces the other half:
// the list of guides a release ACTUALLY affects, so the badge can be raised on
// those and honestly left alone on the rest.
//
// ⚠️ It needs a worktree at the tag, because the old surface has to come from
// the old binary. There is no way to recover a past command tree from the
// current source — which is the same reason the emitter exists at all.
//
// ⚠️ SO IT CANNOT RUN YET. The emitter landed after v0.9.0 was tagged, so no
// released version has it; 0.10.0 is the first. The first useful comparison is
// therefore 0.10.0 → 0.11.0. Verified against the tag, not assumed:
// `src/commands/surface.rs` does not exist at v0.9.0.
//
// This is shipped now rather than later because the alternative is writing it
// during a release, which is when nobody wants to be debugging a build script.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findBinary, readSurface } from "./lib/surface.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI_REPO = join(HERE, "..", "..", "evnx");
const GUIDES = join(HERE, "..", "packages", "docs-content", "guides");

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const asJson = process.argv.includes("--json");
const tag = args[0];

if (!tag) {
  console.error(
    "usage: node scripts/diff-cli-surface.mjs <tag>   e.g. v0.9.0\n" +
      "Compares that tag's command surface against the current binary.",
  );
  process.exit(1);
}

function sh(cmd, cmdArgs, cwd) {
  return execFileSync(cmd, cmdArgs, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

// ─── The current surface ─────────────────────────────────────────────────────
const bin = findBinary();
if (!bin) {
  console.error(
    "no evnx binary found. Build one:\n    cd ../evnx && cargo build --release --all-features",
  );
  process.exit(1);
}
const now = readSurface(bin);

// ─── The surface at the tag ──────────────────────────────────────────────────
//
// ⚠️ A worktree, not `git checkout`. Checking out in place would move the
// developer's branch under them, and this script is something you run while
// preparing a release — the worst possible moment to silently switch branches.
if (!existsSync(join(CLI_REPO, ".git"))) {
  console.error(`expected the CLI repo at ${CLI_REPO}`);
  process.exit(1);
}

let work;
try {
  sh("git", ["rev-parse", "--verify", `${tag}^{commit}`], CLI_REPO);
} catch {
  console.error(`tag ${tag} not found in ${CLI_REPO}. Try: git fetch --tags`);
  process.exit(1);
}

work = mkdtempSync(join(tmpdir(), "evnx-surface-"));
let before;
try {
  console.error(`building ${tag} in a worktree — this takes a minute…`);
  sh("git", ["worktree", "add", "--detach", work, tag], CLI_REPO);
  sh("cargo", ["build", "--release", "--all-features"], work);
  before = readSurface(join(work, "target", "release", "evnx"));
} catch (e) {
  console.error(`could not build ${tag}:\n${e.stderr?.toString() ?? e.message}`);
  process.exit(1);
} finally {
  try {
    sh("git", ["worktree", "remove", "--force", work], CLI_REPO);
  } catch {
    rmSync(work, { recursive: true, force: true });
  }
}

// ─── The diff ────────────────────────────────────────────────────────────────
const key = (c) => c.path.join(" ");
const flagSet = (c) => new Set((c.args ?? []).filter((a) => a.long).map((a) => `--${a.long}`));

const was = new Map(before.commands.filter((c) => !c.hidden).map((c) => [key(c), c]));
const is = new Map(now.commands.filter((c) => !c.hidden).map((c) => [key(c), c]));

const added = [...is.keys()].filter((k) => !was.has(k)).sort();
const removed = [...was.keys()].filter((k) => !is.has(k)).sort();

const changed = [];
for (const [k, c] of is) {
  const old = was.get(k);
  if (!old) continue;
  const a = flagSet(old);
  const b = flagSet(c);
  const gained = [...b].filter((f) => !a.has(f)).sort();
  const lost = [...a].filter((f) => !b.has(f)).sort();
  // ⚠️ `about` changes too — a one-line description IS documentation, and a
  // guide quoting the old one is wrong in the way nobody notices.
  const aboutChanged = (old.about ?? "") !== (c.about ?? "");
  if (gained.length || lost.length || aboutChanged) {
    changed.push({ path: k, gained, lost, aboutChanged });
  }
}

// ─── Which guides those touch ────────────────────────────────────────────────
//
// ✅ **Exact since 5.2.** Every guide declares, in its `commands:` frontmatter,
// the full command paths it demonstrates — generated from the page itself and
// checked in CI, so it cannot drift from what the page shows.
//
// ⚠️ This used to regex the body for `evnx <root>`, which was over-broad in
// both directions: a guide that says "evnx vault" once in passing was listed
// as needing a new badge, and a change to `vault share` could not be
// distinguished from a change to `vault create`. Matching on the full path
// means a release that touched only `vault share` names only the pages that
// actually show `vault share`.
function guidesFor(paths) {
  const want = new Set(paths);
  const hits = new Map();
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith(".mdx")) continue;
      const m = readFileSync(p, "utf8").match(/^---\n([\s\S]*?)\n---/);
      if (!m) continue;
      const line = m[1].split("\n").find((l) => /^commands:/.test(l));
      if (!line) continue;
      let declared;
      try {
        declared = JSON.parse(line.slice(line.indexOf("[")));
      } catch {
        continue; // malformed; `pnpm guide:commands:check` is what reports it
      }
      const matched = declared.filter((d) => want.has(d));
      if (matched.length) hits.set(p.slice(GUIDES.length + 1), new Set(matched));
    }
  };
  walk(GUIDES);
  return hits;
}

// ⚠️ Full paths, not root commands. That is the whole point of 5.2.
const touchedPaths = new Set([
  ...added,
  ...removed,
  ...changed.map((c) => c.path),
]);
const guides = guidesFor(touchedPaths);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        from: { tag, evnx_version: before.evnx_version },
        to: { evnx_version: now.evnx_version },
        added, removed, changed,
        guides: Object.fromEntries([...guides].map(([f, s]) => [f, [...s].sort()])),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log(`\n  ${tag} (evnx ${before.evnx_version})  →  evnx ${now.evnx_version}\n`);

if (!added.length && !removed.length && !changed.length) {
  console.log("  The command surface is unchanged. No guide needs a new version badge.\n");
  process.exit(0);
}

if (added.length) {
  console.log(`  Added (${added.length})`);
  for (const a of added) console.log(`    + evnx ${a}`);
  console.log();
}
if (removed.length) {
  console.log(`  ⚠️ Removed (${removed.length}) — any guide still showing these is now wrong`);
  for (const r of removed) console.log(`    - evnx ${r}`);
  console.log();
}
if (changed.length) {
  console.log(`  Changed (${changed.length})`);
  for (const c of changed) {
    const bits = [];
    if (c.gained.length) bits.push(`+${c.gained.join(" +")}`);
    if (c.lost.length) bits.push(`⚠️ -${c.lost.join(" -")}`);
    if (c.aboutChanged) bits.push("description");
    console.log(`    ~ evnx ${c.path}   ${bits.join("  ")}`);
  }
  console.log();
}

console.log(`  Guides that mention the affected commands (${guides.size}):`);
for (const [file, roots] of [...guides].sort()) {
  console.log(`    ${file}   (${[...roots].sort().join(", ")})`);
}
console.log(
  `\n  ⚠️ Mentioning is not documenting. This is the SHORTLIST to review and` +
    `\n     re-badge — not a list of files that are wrong.\n`,
);
