#!/usr/bin/env node
// RM-W3(e). The post-release chore, in one command.
//
//   EVNX_BIN=/path/to/new/evnx node scripts/post-release.mjs
//
// After a CLI release, two generated files go stale:
//   packages/config/src/versions.json           <- scripts/sync-config.mjs
//   packages/docs-content/src/command-index.json <- scripts/sync-command-index.mjs
// This rewrites both, then runs their --check modes so the result is verified.
// EVNX_BIN must point at the RELEASED binary: the index is a join against its
// command tree. Review and commit the diff yourself.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.EVNX_BIN) {
  console.error(
    "post-release: EVNX_BIN is not set, refusing to run.\n" +
      "  Point it at the released binary, e.g. EVNX_BIN=$(command -v evnx)",
  );
  process.exit(1);
}

const steps = [
  ["versions.json", ["scripts/sync-config.mjs"]],
  ["command-index.json", ["scripts/sync-command-index.mjs"]],
  ["verify versions.json", ["scripts/sync-config.mjs", "--check"]],
  ["verify command-index.json", ["scripts/sync-command-index.mjs", "--check"]],
];
// The sync would otherwise call the production API for plan limits. The chore
// only needs the versions, so point it at a dead local port unless told otherwise.
const syncEnv = { ...process.env, EVNX_API_URL: process.env.EVNX_API_URL ?? "http://127.0.0.1:9" };
const checkEnv = { ...process.env };
delete checkEnv.EVNX_API_URL;

for (const [label, args] of steps) {
  console.log(`\n── ${label}`);
  try {
    execFileSync(process.execPath, args, { cwd: ROOT, stdio: "inherit", env: args.includes("--check") ? checkEnv : syncEnv });
  } catch {
    console.error(`\npost-release: step "${label}" failed.`);
    process.exit(1);
  }
}
console.log("\n✓ done. Review `git diff packages/` and commit.");
