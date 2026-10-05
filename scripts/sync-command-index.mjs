#!/usr/bin/env node
// ─── 5.3 · The command → guide index ──────────────────────────────────────────
//
//   node scripts/sync-command-index.mjs           rewrite the index
//   node scripts/sync-command-index.mjs --check   exit 1 if stale or mismatched
//
// ⚠️ THIS IS WHAT `EVNX_COMMANDS` TRIED TO BE AND GOT WRONG.
//
// That constant was a hand-written list of evnx's commands, and it omitted
// `spec` entirely. The same shape of error has now happened five times in this
// project. So this is not written — it is a JOIN between two things that both
// already exist:
//
//   the binary's own command tree   (`evnx commands --json`)
//   the guides on disk              (packages/docs-content/guides/commands/*)
//
// ⚠️ AND IT REPORTS BOTH DIRECTIONS OF MISMATCH, which is the part that earns
// its place. An index alone would be a nicer list. An index that says
// "`evnx foo` has no guide" and "`commands/bar.mdx` documents nothing" is a
// check — and both of those have really happened here:
//
//   `cloud delete-version` shipped with no row in its own table
//   `evnx vault rekey` was documented before it existed

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findBinary, readSurface, index } from "./lib/surface.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const GUIDES = join(HERE, "..", "packages", "docs-content", "guides", "commands");
const OUT = join(HERE, "..", "packages", "docs-content", "src", "command-index.json");

const checkOnly = process.argv.includes("--check");

/** Guides that document a command, by the filename convention. */
function guidesOnDisk() {
  const out = new Map();
  for (const f of readdirSync(GUIDES)) {
    if (!f.endsWith(".mdx")) continue;
    const name = f.replace(/\.mdx$/, "");
    const body = readFileSync(join(GUIDES, f), "utf8");
    // ⚠️ A draft guide is UNLISTED, not unreachable — `getGuide()` does not
    // filter drafts. It still counts as documentation, and linking to it is
    // what lets the binary's --help footer work before a release.
    const draft = /^draft:\s*true\s*$/m.test(body);
    out.set(name, { file: f, draft });
  }
  return out;
}

let bin;
try {
  bin = findBinary();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

if (!bin) {
  const msg =
    "no evnx binary found. Set EVNX_BIN, or build one:\n" +
    "    cd ../evnx && cargo build --release --all-features";
  // ⚠️ Advisory, not fatal. evnx-web must stay buildable by anyone who has not
  // cloned the Rust repo; the committed index is what the site builds from.
  if (checkOnly) {
    console.log(`skipped: ${msg}`);
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
}

let surface;
try {
  surface = readSurface(bin);
} catch (e) {
  // The existing index is left exactly as it was.
  console.error(`could not read the command surface from ${bin}:\n${e.message}`);
  process.exit(1);
}

const { visible, roots, subsOf } = index(surface);
const guides = guidesOnDisk();

// What each guide actually demonstrates, resolved by the one parser that knows
// how to read a shell fence — see sync-guide-commands.mjs for why this is not
// re-derived here.
let demonstratedByFile = {};
try {
  demonstratedByFile = JSON.parse(
    execFileSync(
      process.execPath,
      [join(HERE, "check-cli-invocations.mjs"), "--emit-commands"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    ),
  );
} catch {
  // Advisory: without it the index still builds, it just cannot report
  // subcommand coverage.
}

const commands = roots.map((r) => {
  const g = guides.get(r.name);
  return {
    name: r.name,
    about: r.about ?? null,
    aliases: r.visible_aliases ?? [],
    // ⚠️ The guide path in AUTHOR form (`/guides/…`), not the rendered `/cli/…`.
    // DOCS_MODE rewrites the prefix at render time; writing the rendered form
    // produces links that are dead on the live site. That exact mistake shipped
    // four dead links in `billing-and-plans.mdx`.
    guide: g ? `/guides/commands/${r.name}` : null,
    guide_draft: g?.draft ?? false,
    subcommands: visible
      .filter((c) => c.path.length > 1 && c.path[0] === r.name)
      .map((c) => ({ path: c.path.join(" "), about: c.about ?? null })),
  };
});

const undocumented = commands.filter((c) => !c.guide).map((c) => c.name);

// ─── Subcommand coverage, which the per-file guide map alone cannot see ──────
//
// A root command having a guide says nothing about whether that guide shows
// its fifteen subcommands. `evnx org` shipped in 0.9.0 with a guide covering
// twelve of them; the four it missed were `list`, `members`, `invites` and
// `uninvite` — the entire READ side, so the guide taught people to create
// things they could not then see.
//
// ⚠️ Parents are excluded. `evnx auth token` takes a subcommand and is never
// invoked alone, so "nobody demonstrates it" is correct rather than a gap, and
// counting it would bury the four real findings under three false ones.
const demonstrated = new Set(Object.values(demonstratedByFile).flat());
const leaves = visible
  .map((c) => c.path.join(" "))
  .filter((p) => !(subsOf.get(p)?.size > 0));
const unshown = leaves.filter((p) => !demonstrated.has(p)).sort();
const orphanGuides = [...guides.keys()].filter(
  (name) => !roots.some((r) => r.name === name),
);

const payload = {
  schema: 1,
  evnx_version: surface.evnx_version,
  features: surface.features,
  commands,
  // ⚠️ Baked in rather than computed at render time, so a new gap shows up in
  // the DIFF of this file. A number recomputed on every page load is a number
  // nobody ever reviews.
  undocumented,
  // Leaf commands no guide demonstrates. Baked in for the same reason as
  // `undocumented`: a new gap then shows up in this file's diff.
  unshown_subcommands: unshown,
  orphan_guides: orphanGuides,
};

const next = JSON.stringify(payload, null, 2) + "\n";
const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";

// ─── Mismatches are reported whether writing or checking ─────────────────────
let problems = 0;
if (orphanGuides.length) {
  problems += orphanGuides.length;
  console.error(
    `✗ ${orphanGuides.length} guide(s) document a command that does not exist: ` +
      orphanGuides.map((n) => `commands/${n}.mdx`).join(", "),
  );
}
if (undocumented.length) {
  // ⚠️ A warning, not a failure. A command can legitimately ship before its
  // guide — `evnx commands` did, deliberately — and failing CI for it would
  // mean the only way to land a command is to land its guide in the same push,
  // across two repositories. The number is in the file, so it is reviewable.
  console.log(
    `⚠ ${undocumented.length} command(s) have no guide: ${undocumented.join(", ")}`,
  );
}

if (unshown.length) {
  // ⚠️ Also a warning, for the same reason: a subcommand can ship ahead of the
  // paragraph that shows it. But unlike `undocumented`, this one is easy to
  // never notice — the root command HAS a guide, so every other check is green
  // while a quarter of the command is invisible.
  console.log(
    `⚠ ${unshown.length} subcommand(s) are demonstrated in no guide: ` +
      unshown.map((p) => `evnx ${p}`).join(", "),
  );
}

if (checkOnly) {
  if (next !== current) {
    console.error(
      "✗ command-index.json is stale.\n  Run: node scripts/sync-command-index.mjs",
    );
    process.exit(1);
  }
  if (problems) process.exit(1);
  console.log(
    `✓ command-index.json matches ${bin} ` +
      `(${commands.length} commands, ${commands.length - undocumented.length} documented)`,
  );
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(
  `wrote ${OUT}\n  evnx ${payload.evnx_version} · ${commands.length} commands · ` +
    `${commands.length - undocumented.length} with a guide`,
);
if (problems) process.exit(1);
