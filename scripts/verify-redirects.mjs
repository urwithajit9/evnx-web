#!/usr/bin/env node
// ─── Schedule 3.3 — the gate before docs.evnx.dev goes live ───────────────────
//
//   node scripts/verify-redirects.mjs                 check production
//   node scripts/verify-redirects.mjs --expect inline  assert NOT split yet
//   ORIGIN=https://preview.vercel.app node scripts/…   check a preview deploy
//
// Walks every URL in docs/migration/url-inventory.csv and asserts that each
// one resolves in exactly ONE hop to a 200.
//
// ⚠️ ONE hop is the whole point, not "eventually 200". A chain —
// /guides/x → /cli/x → /cli/x/ → 200 — still delivers the reader, so it looks
// fine in a browser and is invisible to manual testing. It also leaks ranking
// at every extra hop and multiplies crawl budget across 58 URLs. The only way
// to catch it is to refuse to follow redirects and count them.
//
// ⚠️ Exits non-zero on any failure, so it can gate the cutover. Do not run
// 3.6 (deleting the guide routes from apps/web) until this passes: those
// routes are the rollback.

import { readFileSync } from "node:fs";

const ORIGIN = process.env.ORIGIN ?? "https://www.evnx.dev";
const DOCS_ORIGIN = process.env.DOCS_ORIGIN ?? "https://docs.evnx.dev";
const INVENTORY = "docs/migration/url-inventory.csv";
const CONCURRENCY = 6;

const expectIdx = process.argv.indexOf("--expect");
const expectMode = expectIdx > -1 ? process.argv[expectIdx + 1] : null; // inline | split

// ── Inventory ────────────────────────────────────────────────────────────────

function readInventory() {
  const text = readFileSync(INVENTORY, "utf8").trim().split("\n");
  const head = text[0].split(",").map((h) => h.replace(/"/g, ""));
  const iUrl = head.indexOf("url");
  const iKind = head.indexOf("kind");
  return text.slice(1).map((line) => {
    // Values are quoted; a naive split would break on commas inside titles.
    const cells = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((m) => m[1].replace(/""/g, '"'));
    return { url: cells[iUrl], kind: cells[iKind] };
  });
}

/**
 * Where a docs URL should land after the split.
 *
 * ⚠️ Strips `/docs` as well as `/guides`. The first version stripped only
 * `/guides`, so when `/docs` was added to the extra-URL list it computed
 * `/cli/` + `/docs` and reported two failures against redirects that were
 * perfectly correct. A gate that cries wolf is worse than no gate — the next
 * real failure gets waved through as "probably the script again".
 */
function expectedDestination(url) {
  const slug = url.replace(/^\/(guides|docs)\/?/, "");
  return slug ? `${DOCS_ORIGIN}/cli/${slug}` : `${DOCS_ORIGIN}/cli`;
}

// ── Probing ──────────────────────────────────────────────────────────────────

/** One request, redirects NOT followed. */
async function hop(url) {
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") };
}

async function check(entry) {
  const start = ORIGIN + entry.url;
  const isDoc = entry.kind === "docs";

  let first;
  try {
    first = await hop(start);
  } catch (err) {
    return { ...entry, ok: false, why: `network error: ${err.message}` };
  }

  // ── A permanent hop off this site (e.g. /login → app.evnx.dev) ───────────
  if (entry.kind === "external-redirect") {
    if (first.status !== 308 && first.status !== 301) {
      return { ...entry, ok: false, why: `expected a permanent redirect, got ${first.status}` };
    }
    try {
      const dest = await hop(first.location);
      if (dest.status === 200) return { ...entry, ok: true, note: `${first.status} → 200` };
      return { ...entry, ok: false, why: `destination returned ${dest.status}` };
    } catch (err) {
      return { ...entry, ok: false, why: `destination unreachable: ${err.message}` };
    }
  }

  // ── Not a docs URL: must be 200 directly ──────────────────────────────────
  if (!isDoc) {
    if (first.status === 200) return { ...entry, ok: true, note: "200" };
    return {
      ...entry, ok: false,
      why: `expected 200, got ${first.status}${first.location ? ` → ${first.location}` : ""}`,
    };
  }

  // ── A docs URL ────────────────────────────────────────────────────────────
  if (first.status === 200) {
    // Still served here. Correct before the cutover, a failure after it.
    return { ...entry, ok: expectMode !== "split", why: "still served inline (split not enabled)", note: "inline" };
  }

  if (first.status !== 301) {
    return { ...entry, ok: false, why: `expected 301, got ${first.status}` };
  }

  const want = expectedDestination(entry.url);
  if (first.location !== want) {
    return { ...entry, ok: false, why: `301 → ${first.location}\n      expected ${want}` };
  }

  // ⚠️ The destination must be 200, not another redirect.
  let second;
  try {
    second = await hop(first.location);
  } catch (err) {
    return { ...entry, ok: false, why: `destination unreachable: ${err.message}` };
  }
  if (second.status === 200) return { ...entry, ok: true, note: "301 → 200" };
  return {
    ...entry, ok: false,
    why:
      second.status >= 300 && second.status < 400
        ? `TWO hops: 301 → ${second.status} → ${second.location}`
        : `destination returned ${second.status}`,
  };
}

// ── Run ──────────────────────────────────────────────────────────────────────

/**
 * ⚠️ URLs that are NOT pages and so are not in the inventory, but which still
 * have to resolve in one hop.
 *
 * `/docs` is why this list exists. It was a temporary hop to `/guides`, and
 * the split silently turned it into a chain — /docs → 307 → /guides → 301 →
 * docs.evnx.dev. The gate walked the inventory, `/docs` was never a page, so
 * nothing looked at it. Redirect targets need checking too, not just pages.
 */
const EXTRA = [
  { url: "/docs", kind: "docs" },
  { url: "/docs/commands/scan", kind: "docs" },
  { url: "/login", kind: "external-redirect" },
  { url: "/dashboard", kind: "external-redirect" },
];

const entries = [
  ...readInventory().filter((e) => e.kind !== "dead-scaffold"),
  ...EXTRA,
];
console.log(`checking ${entries.length} URLs against ${ORIGIN}`);
if (expectMode) console.log(`expecting mode: ${expectMode}`);

const results = [];
const queue = [...entries];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const r = await check(queue.shift());
      results.push(r);
      process.stdout.write(r.ok ? "." : "✗");
    }
  }),
);
process.stdout.write("\n\n");

const failed = results.filter((r) => !r.ok);
const byNote = results.filter((r) => r.ok).reduce((m, r) => {
  m[r.note ?? "ok"] = (m[r.note ?? "ok"] ?? 0) + 1;
  return m;
}, {});

for (const [note, n] of Object.entries(byNote)) console.log(`  ${n} × ${note}`);

if (failed.length) {
  console.error(`\n✗ ${failed.length} of ${results.length} failed:\n`);
  for (const f of failed.slice(0, 25)) console.error(`  ${f.url}\n      ${f.why}`);
  if (failed.length > 25) console.error(`  … and ${failed.length - 25} more`);
  console.error("\n⚠ Do NOT remove the guide routes from apps/web (schedule 3.6)");
  console.error("  until this passes. Those routes are the rollback.");
  process.exit(1);
}

console.log(`\n✓ all ${results.length} URLs resolve in one hop`);
