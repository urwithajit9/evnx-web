#!/usr/bin/env node
// ─── Export the Umami traffic baseline ────────────────────────────────────────
//
// ⚠️ THE PRE-MIGRATION BASELINE. Capture it BEFORE any URL moves. Once
// /guides/* starts redirecting there is no way back to the before-picture,
// and the migration's effect becomes unmeasurable forever.
//
//   UMAMI_API_KEY=... node scripts/export-analytics.mjs
//   UMAMI_USER=... UMAMI_PASSWORD=... node scripts/export-analytics.mjs
//
// ⚠️ Credentials come from the environment and are never written, logged or
// echoed — not to stdout, not into the exported files. Use a shell that does
// not record history for the line that sets them, or export them first.
//
// Writes to docs/migration/baseline/:
//   umami-pages-90d.csv       pageviews + visitors PER URL   ← the one that matters
//   umami-referrers-90d.csv
//   umami-summary-90d.json
//
// ⚠️ Per-URL is the point. A site total cannot answer "did
// /guides/commands/scan lose its traffic", which is the only question worth
// asking after 58 URLs move.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const HOST = process.env.UMAMI_HOST ?? "https://analytics.dotenv.space";
const DAYS = Number(process.env.UMAMI_DAYS ?? 90);
const OUT = "docs/migration/baseline";

const endAt = Date.now();
const startAt = endAt - DAYS * 24 * 60 * 60 * 1000;

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

async function authHeaders() {
  if (process.env.UMAMI_API_KEY) {
    return { "x-umami-api-key": process.env.UMAMI_API_KEY };
  }
  const username = process.env.UMAMI_USER;
  const password = process.env.UMAMI_PASSWORD;
  if (!username || !password) {
    die(
      "set UMAMI_API_KEY, or UMAMI_USER and UMAMI_PASSWORD.\n" +
        "  An API key is preferable: it can be revoked without changing your password.",
    );
  }
  const res = await fetch(`${HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  // ⚠️ Never echo the body — a failed login response can contain the payload.
  if (!res.ok) die(`login failed: HTTP ${res.status}`);
  const { token } = await res.json();
  if (!token) die("login returned no token");
  return { Authorization: `Bearer ${token}` };
}

async function api(path, headers) {
  const res = await fetch(`${HOST}${path}`, { headers });
  if (!res.ok) die(`GET ${path.split("?")[0]} → HTTP ${res.status}`);
  return res.json();
}

// ── Run ──────────────────────────────────────────────────────────────────────

const headers = await authHeaders();

// Resolve the website id. NEXT_PUBLIC_UMAMI_WEBSITE_ID if set, else the one
// whose domain looks like evnx.dev.
let websiteId = process.env.UMAMI_WEBSITE_ID ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
if (!websiteId) {
  const list = await api("/api/websites", headers);
  const sites = list.data ?? list;
  const match = sites.find((s) => /evnx\.dev/i.test(s.domain ?? s.name ?? ""));
  if (!match) {
    die(
      "could not find an evnx.dev website. Available:\n" +
        sites.map((s) => `    ${s.id}  ${s.domain ?? s.name}`).join("\n"),
    );
  }
  websiteId = match.id;
  console.log(`  website: ${match.domain ?? match.name} (${websiteId})`);
}

const range = `startAt=${startAt}&endAt=${endAt}`;
const [pages, referrers, summary] = await Promise.all([
  api(`/api/websites/${websiteId}/metrics?${range}&type=url&limit=1000`, headers),
  api(`/api/websites/${websiteId}/metrics?${range}&type=referrer&limit=500`, headers),
  api(`/api/websites/${websiteId}/stats?${range}`, headers),
]);

mkdirSync(OUT, { recursive: true });
const csv = (rows, head) =>
  [head, ...rows.map((r) => `"${String(r.x ?? "").replace(/"/g, '""')}",${r.y ?? 0}`)].join("\n") + "\n";

writeFileSync(join(OUT, `umami-pages-${DAYS}d.csv`), csv(pages, "url,pageviews"));
writeFileSync(join(OUT, `umami-referrers-${DAYS}d.csv`), csv(referrers, "referrer,visits"));
writeFileSync(
  join(OUT, `umami-summary-${DAYS}d.json`),
  JSON.stringify(
    { capturedAt: new Date().toISOString(), host: HOST, websiteId, days: DAYS, startAt, endAt, summary },
    null,
    2,
  ) + "\n",
);

const total = pages.reduce((n, r) => n + (r.y ?? 0), 0);
console.log(`✓ ${pages.length} URLs, ${total.toLocaleString("en-US")} pageviews over ${DAYS} days`);
console.log(`✓ ${referrers.length} referrers`);
console.log(`→ ${OUT}/umami-pages-${DAYS}d.csv`);

// ⚠️ A baseline that captured nothing is worse than none, because it looks
// like one. Say so loudly rather than writing an empty file quietly.
if (pages.length === 0) {
  console.error(
    "\n⚠ ZERO URLs returned. Either analytics were not recording over this window,\n" +
      "  or the website id is wrong. Do NOT treat this file as a baseline.",
  );
  process.exit(1);
}
