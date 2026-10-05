/**
 * 5.2 — write `commands:` into every guide's frontmatter.
 *
 *   node scripts/sync-guide-commands.mjs            # write
 *   node scripts/sync-guide-commands.mjs --check    # fail if stale
 *
 * ─── Why this is DERIVED and not hand-authored ──────────────────────────────
 *
 * The obvious way to do 5.2 is to open 62 guides and type out which commands
 * each one covers. That is 62 opportunities to be slightly wrong, and nothing
 * would ever catch it — the whole value of the key is that something else can
 * trust it.
 *
 * So it is derived from what each guide actually demonstrates: every `evnx …`
 * invocation in a shell fence or inline code, resolved against the real binary.
 * A guide claims a command when it shows the reader that command.
 *
 * ⚠️ **The resolution comes from `check-cli-invocations.mjs --emit-commands`,
 * not from a second parser here.** That script already knows that everything
 * after `--` belongs to a child process, that a pipeline tail is another
 * program, that `evnx 0.6.0` in sample output is not a command, and how deep to
 * walk `auth token create`. A second parser would get some of that wrong and
 * disagree silently, which is worse than having no key at all.
 *
 * ─── What it deliberately does not capture ──────────────────────────────────
 *
 * A guide that discusses a command only in prose, with no example, gets no
 * entry for it. That is the honest answer: if a page is meant to document a
 * command, it should show it. The fix is to add the example, not the key.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const check = process.argv.includes("--check");

// ─── 1 · what each guide demonstrates ────────────────────────────────────────

let emitted;
try {
  const out = execFileSync(
    process.execPath,
    [join(HERE, "check-cli-invocations.mjs"), "--emit-commands"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  if (out.startsWith("skipped:")) {
    console.log(out.trim());
    process.exit(0);
  }
  emitted = JSON.parse(out);
} catch (e) {
  console.error(
    "could not read the command surface:\n" +
      (e.stdout || e.stderr || e.message || "").toString().trim(),
  );
  process.exit(1);
}

// ─── 2 · rewrite the key, and nothing else ───────────────────────────────────

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

/**
 * ⚠️ Surgical, not a YAML round trip.
 *
 * Parsing the frontmatter and dumping it back would normalise quoting, key
 * order and list style across 62 files — an enormous diff in which the one
 * line that matters is invisible. This replaces exactly one line.
 */
function withCommands(raw, commands) {
  const m = raw.match(FRONTMATTER);
  if (!m) return null;
  const body = m[1];
  const line = `commands: [${commands.map((c) => JSON.stringify(c)).join(", ")}]`;

  const existing = body.split("\n").findIndex((l) => /^commands:/.test(l));
  let next;
  if (existing !== -1) {
    const lines = body.split("\n");
    if (lines[existing] === line) return raw; // already correct
    lines[existing] = line;
    next = lines.join("\n");
  } else {
    // After `tags:` where there is one — it is the other list-shaped key, so
    // they read together. Otherwise at the end, before `draft:` if present.
    const lines = body.split("\n");
    const after = lines.findIndex((l) => /^tags:/.test(l));
    if (after !== -1) lines.splice(after + 1, 0, line);
    else lines.push(line);
    next = lines.join("\n");
  }
  return raw.replace(FRONTMATTER, `---\n${next}\n---\n`);
}

const files = globSync("packages/docs-content/guides/**/*.mdx", { cwd: ROOT }).sort();
const changed = [];
const noCommands = [];

for (const rel of files) {
  const abs = join(ROOT, rel);
  const raw = readFileSync(abs, "utf8");
  const commands = emitted[rel] ?? [];
  if (commands.length === 0) noCommands.push(rel);

  const next = withCommands(raw, commands);
  if (next === null) {
    console.error(`✗ ${rel} has no frontmatter block`);
    process.exit(1);
  }
  if (next === raw) continue;
  changed.push(rel);
  if (!check) writeFileSync(abs, next);
}

// ─── 3 · report ──────────────────────────────────────────────────────────────

const documented = files.length - noCommands.length;

if (check) {
  if (changed.length) {
    console.error(
      `✗ ${changed.length} guide(s) have a stale \`commands:\` key — run \`pnpm guide:commands\`:\n` +
        changed.map((f) => `    ${f}`).join("\n"),
    );
    process.exit(1);
  }
  console.log(
    `✓ every guide's \`commands:\` matches what it demonstrates ` +
      `(${documented}/${files.length} demonstrate at least one)`,
  );
  process.exit(0);
}

console.log(
  changed.length
    ? `updated ${changed.length} of ${files.length} guides`
    : `no change — all ${files.length} guides were already correct`,
);
console.log(
  `${documented} guide(s) demonstrate at least one command; ` +
    `${noCommands.length} demonstrate none`,
);
if (noCommands.length) {
  console.log(
    "\nⓘ prose-only, which is fine for a concept page and suspicious for a command page:",
  );
  for (const f of noCommands) console.log(`    ${relative("packages/docs-content/guides", f)}`);
}
