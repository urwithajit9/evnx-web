// ─── pay.evnx.dev — build ─────────────────────────────────────────────────────
//
// Copies `public/` to `out/` and substitutes the two Paddle values the page
// needs. There is no framework here on purpose: this origin exists to be the
// smallest possible surface that can run Paddle.js, and a build pipeline is
// surface.
//
// ⚠️ Neither substituted value is a secret.
//
//   * PADDLE_CLIENT_TOKEN is a *client-side* token. Paddle's own documentation
//     has it pasted into frontend HTML; it can open a checkout and nothing
//     else — it cannot read an account, list customers, or change a price. It
//     is NOT the API key, which must never reach a browser.
//   * PADDLE_ENVIRONMENT is `sandbox` or `live`.
//
// ⚠️ But they must still be CONFIGURED rather than committed, because sandbox
// and live are different accounts. A hard-coded sandbox token deployed to
// production fails with an authentication error that reads like a broken key.

import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const SRC = "public";
const OUT = "out";

const environment = process.env.PADDLE_ENVIRONMENT ?? "sandbox";
const token = process.env.PADDLE_CLIENT_TOKEN ?? "";

if (environment !== "sandbox" && environment !== "live") {
  throw new Error(
    `PADDLE_ENVIRONMENT must be "sandbox" or "live", got ${JSON.stringify(environment)}`,
  );
}

// ⚠️ Fails the build rather than deploying a page whose only job it cannot do.
// Without this the page ships, loads Paddle.js, calls Initialize("") and shows
// a spinner forever — a failure with no error anywhere that anyone would look.
if (!token) {
  throw new Error(
    "PADDLE_CLIENT_TOKEN is not set. Find it in Paddle > Developer tools > " +
      "Authentication > Client-side tokens. It is a public front-end token, " +
      "not the API key.",
  );
}

// ⚠️ A live build with a sandbox token is the one mistake that would reach real
// customers, so it is refused rather than warned about. Paddle prefixes sandbox
// client-side tokens with `test_`.
if (environment === "live" && token.startsWith("test_")) {
  throw new Error(
    "PADDLE_ENVIRONMENT=live with a sandbox client-side token (test_…). " +
      "Use the live token, or build with PADDLE_ENVIRONMENT=sandbox.",
  );
}
if (environment === "sandbox" && !token.startsWith("test_")) {
  throw new Error(
    "PADDLE_ENVIRONMENT=sandbox with what looks like a live client-side token. " +
      "Sandbox tokens start with `test_`.",
  );
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const name of await readdir(SRC)) {
  const body = await readFile(join(SRC, name));
  // Only the HTML is templated; _headers and robots.txt are copied verbatim.
  if (name.endsWith(".html")) {
    const out = body
      .toString("utf8")
      .replaceAll("__PADDLE_ENVIRONMENT__", environment)
      .replaceAll("__PADDLE_CLIENT_TOKEN__", token);
    // Belt and braces: a renamed placeholder would otherwise ship a page
    // containing the literal string `__PADDLE_CLIENT_TOKEN__`.
    if (out.includes("__PADDLE_")) {
      throw new Error(`unsubstituted placeholder left in ${name}`);
    }
    await writeFile(join(OUT, name), out);
  } else {
    await writeFile(join(OUT, name), body);
  }
}

console.log(`pay.evnx.dev built → ${OUT}/ (environment: ${environment})`);
