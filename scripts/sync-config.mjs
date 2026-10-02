#!/usr/bin/env node
// ─── Refresh the generated halves of @evnx/config ─────────────────────────────
//
//   node scripts/sync-config.mjs          rewrite versions.json + plan-limits.json
//   node scripts/sync-config.mjs --check  exit 1 if either is stale (for CI)
//
// ⚠️ THE RULE THIS SCRIPT ENFORCES: a failed fetch never overwrites good data.
//
// The failure that motivated it was the opposite shape — nothing overwrote
// anything, `EVNX_VERSION` sat at "0.4.0" through three releases, and the
// stale number was live on the site for a month. But the obvious fix (write
// whatever comes back) has its own failure: one registry timeout and the proof
// strip reads "0 downloads". Both are silent, so neither is allowed here.
// Every field keeps its previous value unless a fetch genuinely succeeded, and
// the script says out loud which fields it could not refresh.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_SRC = join(HERE, "..", "packages", "config", "src");
const VERSIONS_PATH = join(CONFIG_SRC, "versions.json");
const LIMITS_PATH = join(CONFIG_SRC, "plan-limits.json");

const API_BASE = process.env.EVNX_API_URL ?? "https://api.evnx.dev";
const UA = "evnx-web-config-sync (+https://evnx.dev)";
const TIMEOUT_MS = 10_000;

const checkOnly = process.argv.includes("--check");
const problems = [];

async function getJson(url, label) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    problems.push(`${label}: ${err.message}`);
    return null;
  } finally {
    clearTimeout(t);
  }
}

// ─── Versions and download counts ─────────────────────────────────────────────

async function syncVersions() {
  const current = JSON.parse(readFileSync(VERSIONS_PATH, "utf8"));
  const next = structuredClone(current);

  const cli = await getJson("https://crates.io/api/v1/crates/evnx", "crates.io/evnx");
  if (cli?.crate) {
    // `max_stable_version` and not `newest_version`: a prerelease must not
    // become the number the hero advertises.
    if (cli.crate.max_stable_version) next.cli = cli.crate.max_stable_version;
    if (typeof cli.crate.downloads === "number") next.downloads.crates = cli.crate.downloads;
  }

  const crypto = await getJson(
    "https://crates.io/api/v1/crates/evnx-crypto",
    "crates.io/evnx-crypto",
  );
  if (crypto?.crate?.max_stable_version) next.cryptoCrate = crypto.crate.max_stable_version;

  const npmLatest = await getJson("https://registry.npmjs.org/@evnx/cli/latest", "npm/@evnx/cli");
  // npm carries the wasm package's version too; the CLI's own version is
  // crates.io's, which is the canonical release.
  const wasm = await getJson(
    "https://registry.npmjs.org/@evnx/crypto-wasm/latest",
    "npm/@evnx/crypto-wasm",
  );
  if (wasm?.version) next.wasm = wasm.version;

  const npmDl = await getJson(
    "https://api.npmjs.org/downloads/point/last-year/@evnx/cli",
    "npm downloads",
  );
  if (typeof npmDl?.downloads === "number") next.downloads.npm = npmDl.downloads;

  const pypiDl = await getJson("https://pypistats.org/api/packages/evnx/recent", "pypi downloads");
  if (typeof pypiDl?.data?.last_month === "number") next.downloads.pypi = pypiDl.data.last_month;

  next.downloads.total =
    next.downloads.crates + next.downloads.npm + next.downloads.pypi;

  // ⚠️ A drift between the registries is worth saying out loud: npm publishes
  // from a workflow that has reported green on a skipped run before.
  if (npmLatest?.version && cli?.crate?.max_stable_version) {
    if (npmLatest.version !== cli.crate.max_stable_version) {
      problems.push(
        `registry drift: crates.io is ${cli.crate.max_stable_version}, npm is ${npmLatest.version}`,
      );
    }
  }

  next.syncedAt = new Date().toISOString();
  return { current, next };
}

// ─── Plan limits, from the server that enforces them ──────────────────────────

async function syncLimits() {
  const current = JSON.parse(readFileSync(LIMITS_PATH, "utf8"));
  const next = structuredClone(current);

  const res = await getJson(`${API_BASE}/api/v1/plans`, "GET /api/v1/plans");
  if (!res?.plans) {
    problems.push(
      "plan limits not refreshed — GET /api/v1/plans is not deployed yet; keeping committed defaults",
    );
    return { current, next };
  }

  for (const [id, limits] of Object.entries(res.plans)) {
    if (!(id in next.plans)) {
      // A plan the website does not know about is a real signal, not noise:
      // the tier list here and the CHECK constraint in migration 008 have to
      // agree, and this is the only place that would notice they stopped.
      problems.push(`server reports an unknown plan "${id}" — update packages/config/src/plans.ts`);
      continue;
    }
    next.plans[id] = {
      vaults: limits.vaults ?? null,
      versionsPerVault: limits.versions_per_vault ?? null,
      apiTokens: limits.api_tokens ?? null,
      auditRetentionDays: limits.audit_retention_days ?? null,
    };
  }
  for (const id of Object.keys(next.plans)) {
    if (!(id in res.plans)) problems.push(`website lists plan "${id}" and the server does not`);
  }

  next.syncedAt = new Date().toISOString();
  return { current, next };
}

// ─── Run ──────────────────────────────────────────────────────────────────────

function stable(obj) {
  const { syncedAt, ...rest } = obj;
  return JSON.stringify(rest);
}

const v = await syncVersions();
const l = await syncLimits();

const versionsChanged = stable(v.current) !== stable(v.next);
const limitsChanged = stable(l.current) !== stable(l.next);

if (checkOnly) {
  if (versionsChanged) {
    console.error("✗ versions.json is stale:");
    console.error(`    cli        ${v.current.cli} → ${v.next.cli}`);
    console.error(`    downloads  ${v.current.downloads.total} → ${v.next.downloads.total}`);
  }
  if (limitsChanged) console.error("✗ plan-limits.json no longer matches the server");
  for (const p of problems) console.error(`⚠ ${p}`);
  if (versionsChanged || limitsChanged) {
    console.error("\nRun `node scripts/sync-config.mjs` and commit the result.");
    process.exit(1);
  }
  console.log("✓ generated config is current");
  process.exit(0);
}

writeFileSync(VERSIONS_PATH, JSON.stringify(v.next, null, 2) + "\n");
writeFileSync(LIMITS_PATH, JSON.stringify(l.next, null, 2) + "\n");

console.log(`✓ cli        ${v.next.cli}`);
console.log(`✓ crypto     ${v.next.cryptoCrate}`);
console.log(`✓ wasm       ${v.next.wasm}`);
console.log(`✓ downloads  ${v.next.downloads.total.toLocaleString("en-US")}`);
console.log(`✓ limits     free: ${JSON.stringify(l.next.plans.free)}`);
for (const p of problems) console.log(`⚠ ${p}`);
