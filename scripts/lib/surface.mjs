// ─── Reading the CLI's command surface ────────────────────────────────────────
//
// Shared by the three checks that need to know what the CLI actually has:
//
//   sync-command-index.mjs     the generated command → guide index   (5.3)
//   check-cli-invocations.mjs  every `evnx …` in prose resolves      (5.4)
//   diff-cli-surface.mjs       what a release changed                (5.5)
//
// ⚠️ All three read the BINARY, never a list. Five documentation errors in this
// project came from a hand-maintained list of what the CLI does, and every one
// was found by a hand sweep, which does not repeat.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const HINTS = [
  join(HERE, "..", "..", "..", "evnx", "target", "release", "evnx"),
  join(HERE, "..", "..", "..", "evnx", "target", "debug", "evnx"),
];

/**
 * ⚠️ EVNX_BIN is an OVERRIDE, not a hint. Treating it as one candidate among
 * several means a typo'd path silently falls through to a different binary with
 * a different feature set — and reading the wrong binary is the single failure
 * these scripts exist to prevent.
 */
export function findBinary() {
  if (process.env.EVNX_BIN) {
    if (!existsSync(process.env.EVNX_BIN)) {
      throw new Error(`EVNX_BIN is set to ${process.env.EVNX_BIN}, which does not exist`);
    }
    return process.env.EVNX_BIN;
  }
  for (const p of HINTS) if (existsSync(p)) return p;
  return null;
}

/** Bumped by `evnx commands --json` when the payload shape changes. */
export const SUPPORTED_SCHEMA = 1;

/**
 * The emitter's invocation has changed once, so both spellings are tried.
 *
 * ⚠️ This is not politeness — `diff-cli-surface.mjs` BUILDS OLD TAGS, so it
 * meets old binaries by design. The emitter was hidden as
 * `evnx surface --compact` when it landed and became `evnx commands --json`
 * two commits later, so any tag cut in that window needs the older spelling.
 *
 * Both emit the same schema-1 payload, so nothing downstream changes.
 *
 * ⚠️ NO RELEASED VERSION HAS EITHER. Verified: `src/commands/surface.rs` does
 * not exist at v0.9.0 — it landed in #109, after that tag. 0.10.0 will be the
 * first release carrying it, which means `diff-cli-surface.mjs` cannot compare
 * against anything yet and its first useful run is 0.10.0 → 0.11.0.
 */
const INVOCATIONS = [
  ["commands", "--json", "--compact"], // 0.10.0+
  ["surface", "--compact"],            // 0.9.0
];

export function readSurface(bin) {
  let raw, lastErr;
  for (const argv of INVOCATIONS) {
    try {
      raw = execFileSync(bin, argv, {
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      });
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (raw === undefined) {
    throw new Error(
      `${bin} has no command-surface emitter.\n\n` +
        `It landed AFTER v0.9.0 (in #109), so no released version carries it — ` +
        `0.10.0 is the first. A surface cannot be recovered from an older ` +
        `binary, which is the same reason the emitter exists at all.\n` +
        (lastErr?.stderr?.toString().trim() || lastErr?.message || ""),
    );
  }

  const data = JSON.parse(raw);

  if (data.schema !== SUPPORTED_SCHEMA) {
    throw new Error(
      `evnx emitted schema ${data.schema}; these scripts understand ${SUPPORTED_SCHEMA}.`,
    );
  }

  // ⚠️ Refuse a default-features build. It has 18 commands instead of 80 and no
  // auth/vault/cloud/org at all, so every check would report the cloud guides as
  // documenting commands that do not exist — precisely backwards.
  if (!data.features?.includes("cloud")) {
    throw new Error(
      `${bin} was built without the \`cloud\` feature, so its surface is missing ` +
        `every cloud command. Rebuild with:\n    cargo build --release --all-features\n` +
        `features seen: ${JSON.stringify(data.features ?? [])}`,
    );
  }

  if (!Array.isArray(data.commands) || data.commands.length < 20) {
    throw new Error(`surface looks wrong: ${data.commands?.length ?? 0} commands`);
  }

  return data;
}

/** Convenience shapes every consumer wants. */
export function index(surface) {
  const visible = surface.commands.filter((c) => !c.hidden);
  const roots = visible.filter((c) => c.path.length === 1);
  const paths = new Set(visible.map((c) => c.path.join(" ")));

  // Aliases are real invocations. `evnx surface` must not be reported as wrong
  // just because the command is now called `commands`.
  const aliasPaths = new Set();
  // ⚠️ And the reverse direction, which the alias Set alone cannot answer:
  // `evnx surface` and `evnx commands` are ONE command, so anything counting
  // coverage must fold them together or it reports a command twice and a guide
  // as documenting two things it mentions once.
  const canonicalOf = new Map();
  for (const c of visible) {
    const canonical = c.path.join(" ");
    for (const a of c.visible_aliases ?? []) {
      const aliased = [...c.path.slice(0, -1), a].join(" ");
      aliasPaths.add(aliased);
      canonicalOf.set(aliased, canonical);
    }
  }

  const subsOf = new Map();
  for (const c of visible) {
    if (c.path.length > 1) {
      const parent = c.path.slice(0, -1).join(" ");
      if (!subsOf.has(parent)) subsOf.set(parent, new Set());
      subsOf.get(parent).add(c.path[c.path.length - 1]);
      for (const a of c.visible_aliases ?? []) subsOf.get(parent).add(a);
    }
  }
  for (const c of roots) {
    for (const a of c.visible_aliases ?? []) {
      aliasPaths.add(a);
      canonicalOf.set(a, c.path.join(" "));
    }
  }

  const flagsOf = new Map();
  for (const c of visible) {
    const set = new Set();
    for (const a of c.args ?? []) {
      if (a.long) set.add(`--${a.long}`);
      if (a.short) set.add(`-${a.short}`);
    }
    flagsOf.set(c.path.join(" "), set);
  }

  return { visible, roots, paths, aliasPaths, canonicalOf, subsOf, flagsOf };
}
