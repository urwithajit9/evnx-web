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

/**
 * ⚠️ Prints the server's error body on failure — and that is a deliberate
 * difference from the login call above, which never does.
 *
 * The first version of this suppressed bodies everywhere "to be safe", and
 * the result was a dead end: a real run failed with a bare
 * `HTTP 400` and no way to find out why without credentials I do not have.
 * The rule that matters is narrow — a failed *auth* response can echo the
 * payload you sent it. A metrics response cannot: it never saw a password.
 * Hiding it bought nothing and cost the diagnosis.
 */
async function api(path, headers, { required = true } = {}) {
  const res = await fetch(`${HOST}${path}`, { headers });
  if (res.ok) return res.json();

  let detail = "";
  try {
    const body = await res.text();
    detail = body ? ` — ${body.slice(0, 300)}` : "";
  } catch {
    /* body unreadable; the status is still useful */
  }
  const msg = `GET ${path.split("?")[0]} → HTTP ${res.status}${detail}`;
  if (required) die(msg);
  console.error(`⚠ ${msg}`);
  return null;
}

/**
 * Fetch one metric, narrowing the query if the server rejects it.
 *
 * ⚠️ Umami's parameter schema has changed across 2.x releases, and a self-
 * hosted instance can be any of them. Rather than guess which one this is,
 * try the full query and fall back to the minimum the endpoint has always
 * accepted. A partial export beats a failed one — and the error from each
 * attempt is printed, so the next run knows which shape worked.
 */
/**
 * What this instance calls the per-page metric.
 *
 * ⚠️ Determined at runtime, not assumed. `type=url` is the documented value
 * and it returns a bare `{"code":"bad-request"}` on this instance, while
 * `/stats` with identical timestamps succeeds — so auth, access and dates are
 * fine and the handler simply does not recognise the column name.
 *
 * The parameter schema cannot tell us which name it does recognise: probing
 * unauthenticated shows it accepts `type=GARBAGE` and defers the real check
 * to the handler, behind auth. So the script discovers it, once, and says
 * what it found.
 */
// ⚠️ `path` first: it is what this instance answers to, confirmed 2026-10-03
// (203 rows). `url` is the documented name and returns bad-request here. The
// others stay as fallbacks in case the instance is upgraded.
const URL_TYPE_CANDIDATES = ["path", "url", "page", "pageview", "entry"];
const REFERRER_TYPE_CANDIDATES = ["referrer", "referrers", "ref"];

/** Query shapes, broadest first. Umami 2.x has varied on these. */
const SHAPES = [
  (r, t) => `${r}&type=${t}&limit=1000`,
  (r, t) => `${r}&type=${t}`,
  (r, t) => `${r}&type=${t}&unit=day&timezone=UTC`,
];

/**
 * Try every (type, shape) pair until one answers, and report the winner.
 *
 * ⚠️ Quiet while probing. Fifteen "Bad request" lines told us nothing the
 * first time except that something was wrong — the useful output is which
 * combination worked, or a single summary of everything that did not.
 */
async function discoverMetric(websiteId, candidates, range, headers, label) {
  const failures = [];
  for (const type of candidates) {
    for (const shape of SHAPES) {
      const q = shape(range, type);
      const res = await fetch(`${HOST}/api/websites/${websiteId}/metrics?${q}`, { headers });
      if (res.ok) {
        const data = await res.json();
        console.log(`  ${label}: type=${type} ✓ (${Array.isArray(data) ? data.length : "?"} rows)`);
        return { data, type };
      }
      failures.push(`type=${type} → ${res.status}`);
    }
  }
  console.error(`⚠ ${label}: no working query. Tried ${candidates.length} type names:`);
  console.error(`    ${[...new Set(failures)].join(", ")}`);
  return { data: null, type: null };
}

// ── Run ──────────────────────────────────────────────────────────────────────

const headers = await authHeaders();

// Resolve the website id. NEXT_PUBLIC_UMAMI_WEBSITE_ID if set, else the one
// whose domain looks like evnx.dev.
let websiteId = process.env.UMAMI_WEBSITE_ID ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
if (!websiteId) {
  const list = await api("/api/websites", headers);
  const sites = list.data ?? list;

  // ⚠️ This instance is self-hosted and tracks several sites. Print all of
  // them, not just the match — silently picking one of five is how you
  // capture a baseline for the wrong property and only notice in December.
  const matches = sites.filter((s) => /evnx\.dev/i.test(s.domain ?? s.name ?? ""));
  console.log(`  ${sites.length} website(s) on this instance:`);
  for (const site of sites) {
    const mark = matches.some((m) => m.id === site.id) ? "→" : " ";
    console.log(`   ${mark} ${site.id}  ${site.domain ?? site.name}`);
  }

  if (matches.length === 0) {
    die("none of these look like evnx.dev. Re-run with UMAMI_WEBSITE_ID=<id>.");
  }
  if (matches.length > 1) {
    // ⚠️ `evnx.dev` and `www.evnx.dev` as separate properties is common and
    // they hold DIFFERENT traffic. Refuse rather than guess: the apex 307s to
    // www, so the apex property may be nearly empty and picking it would
    // produce a baseline that looks real and measures nothing.
    die(
      `${matches.length} candidates matched (marked → above).\n` +
        "  They hold different traffic — the apex redirects to www, so one of\n" +
        "  them is probably near-empty. Pick deliberately:\n" +
        "    UMAMI_WEBSITE_ID=<id> pnpm baseline:analytics",
    );
  }
  websiteId = matches[0].id;
  console.log(`  using: ${matches[0].domain ?? matches[0].name} (${websiteId})`);
}

const range = `startAt=${startAt}&endAt=${endAt}`;

// ⚠️ Probe the simplest endpoint first. `/stats` takes only the date range, so
// if it succeeds then auth, website access and the timestamps are all fine and
// any later failure is a metrics PARAMETER problem. If it fails, the problem
// is access and no amount of parameter juggling will help. Knowing which costs
// one request and saves a round trip.
const summary = await api(`/api/websites/${websiteId}/stats?${range}`, headers, {
  required: false,
});
if (summary) {
  console.log("  access ok — /stats responded");
} else {
  console.error(
    "⚠ /stats failed too, so this is not a metrics-parameter problem:\n" +
      "  the account can log in but cannot read this website's data.",
  );
}

const { data: pages, type: urlType } = await discoverMetric(
  websiteId, URL_TYPE_CANDIDATES, range, headers, "per-URL",
);
const { data: referrers } = await discoverMetric(
  websiteId, REFERRER_TYPE_CANDIDATES, range, headers, "referrers",
);

if (!pages) {
  // ⚠️ Salvage the part that worked. /stats succeeds, so the site-wide totals
  // ARE capturable — and they expire at the same moment the per-URL data does.
  //
  // Deliberately does NOT write umami-pages-*.csv. A file with that name and
  // no rows is exactly the "baseline that captured nothing but looks like one"
  // this script exists to avoid; the summary is named for what it is.
  if (summary) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(
      join(OUT, `umami-summary-${DAYS}d-PARTIAL.json`),
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          host: HOST, websiteId, days: DAYS, startAt, endAt,
          perUrlCaptured: false,
          note: "Site totals only. The per-URL metric endpoint rejected every column name tried — see the script output. Per-URL data must still be captured, from the Umami UI if necessary, BEFORE any URL moves.",
          summary,
        },
        null, 2,
      ) + "\n",
    );
    console.error(`\n→ saved site totals to ${OUT}/umami-summary-${DAYS}d-PARTIAL.json`);
    console.error("  ⚠ This is NOT the baseline. Per-URL numbers are still missing.");
  }
  die(
    "no per-URL metric endpoint answered on this Umami instance.\n" +
      "  /stats works, so this is not auth or access — the handler rejects every\n" +
      "  column name tried. Send the list above and the Umami version from\n" +
      "  Settings → the footer, and I will match it.\n\n" +
      "  Meanwhile the UI has the same data: Umami → evnx.dev → Pages, set the\n" +
      "  range to 90 days, and copy the table. It is the per-URL numbers that\n" +
      "  matter; the exact format does not.",
  );
}

mkdirSync(OUT, { recursive: true });
const csv = (rows, head) =>
  [head, ...rows.map((r) => `"${String(r.x ?? "").replace(/"/g, '""')}",${r.y ?? 0}`)].join("\n") + "\n";

writeFileSync(join(OUT, `umami-pages-${DAYS}d.csv`), csv(pages, "url,pageviews"));
writeFileSync(join(OUT, `umami-referrers-${DAYS}d.csv`), csv(referrers ?? [], "referrer,visits"));
writeFileSync(
  join(OUT, `umami-summary-${DAYS}d.json`),
  JSON.stringify(
    { capturedAt: new Date().toISOString(), host: HOST, websiteId, days: DAYS, startAt, endAt, urlMetricType: urlType, summary },
    null,
    2,
  ) + "\n",
);

const total = pages.reduce((n, r) => n + (r.y ?? 0), 0);
console.log(`✓ ${pages.length} URLs, ${total.toLocaleString("en-US")} pageviews over ${DAYS} days`);
console.log(`✓ ${referrers?.length ?? 0} referrers${referrers ? "" : " (endpoint failed — see above)"}`);
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
