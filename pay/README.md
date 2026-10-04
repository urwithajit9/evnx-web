# pay.evnx.dev

One static page. Its entire job is to load Paddle.js so that
`app.evnx.dev` never has to.

## Why it exists

Paddle Billing has **no Paddle-hosted checkout page for the web**. A
transaction's payment link is *our own* URL with `?_ptxn=txn_…` appended, and
the page it points at has to run Paddle.js:

> Paddle Billing automatically generates a payment link for transactions you
> create, using your default payment link as a base. Your default payment link
> should be a page that includes Paddle.js.

So Paddle.js runs somewhere we own. The only question is where, and two origins
are ruled out:

| Origin | Why not |
|---|---|
| `app.evnx.dev` | Holds the master key in a Web Worker and the access token in memory. A script there could read the token and — far worse — render a convincing "re-enter your master password" prompt. That is a **plaintext** compromise. ADR-1 and `evnx-app/public/_headers` both forbid it. |
| `evnx.dev` | ADR-1 keeps the marketing origin anonymous, and it already carries analytics and will accumulate more. A payment page should not share an origin with whatever marketing adds next. |

This origin holds **no session, no cookie, no key, no API credential and no
analytics**. It reads one query parameter Paddle itself put there.

⚠️ **Keep it that way.** The moment this page needs a login, an API call or an
analytics tag, the reason it exists has gone — and its CSP is deliberately wider
than the app's, so it would become both the weakest origin we own and one with
something worth stealing.

## Build

```bash
cd pay && PADDLE_ENVIRONMENT=sandbox PADDLE_CLIENT_TOKEN=test_… node build.mjs
```

⚠️ **Deliberately outside the pnpm workspace**, at `pay/` rather than
`apps/pay/`. It shares no dependency with the monorepo — no React, no
`@evnx/config`, no `node_modules` at all — and the isolation this origin exists
for is easier to keep when it is not in the same build graph as everything else.

It was briefly a workspace member, and `pnpm build` at the repo root then failed
for anyone without a Paddle token, because this app's build refuses to produce a
page it knows cannot work. Correct behaviour for this app; wrong thing to put in
front of the whole monorepo.

Output is `out/`. Both variables are required and both are checked:

- an empty token fails the build rather than shipping a page that spins forever
- `live` with a `test_…` token fails, and `sandbox` without one fails

Neither value is a secret. `PADDLE_CLIENT_TOKEN` is a *client-side* token —
Paddle's own docs paste it into frontend HTML. It can open a checkout and
nothing else. **It is not the API key**, which must never reach a browser.

Find it in **Paddle → Developer tools → Authentication → Client-side tokens**.

## Deploy

⚠️ **Cloudflare has two workflows now, and both work here.** `_headers` is
supported identically by Pages and by Workers static assets, with the same
syntax.

ⓘ **Correction to an earlier version of this file**, which argued for Workers
because `wrangler.jsonc` is version-controlled while Pages keeps build settings
in the dashboard. That is true but weaker than it sounded: the
*security-relevant* configuration here is the CSP, and that lives in
`public/_headers` — in the repository either way. What differs between the two
is only the build command and the output directory.

So: **Pages**, because `evnx.dev` and `app.evnx.dev` already run on it and a
third project behaves the way you already expect. `wrangler.jsonc` is kept for
the Workers path and is simply ignored by Pages.

### Pages — the path to take

**Workers & Pages → Create → Continue to Pages → Import an existing Git
repository**

| Field | Value |
|---|---|
| Repository | `urwithajit9/evnx-web` |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `node build.mjs` |
| Build output directory | `out` |
| **Root directory (advanced)** | `pay` ⚠️ **this one matters** |

⚠️ **Set the root directory, and the other two become relative to it.** Without
it, Cloudflare treats the repository root as the project — it would run
`pnpm install` across the whole monorepo and look for `out/` at the top level,
which does not exist. Cloudflare's own wording: *"The root directory needs to be
specified in cases like monorepos, where there may be multiple projects in one
repository."*

Then **Settings → Variables and Secrets**, as **build-time** variables:

```
PADDLE_ENVIRONMENT  = sandbox
PADDLE_CLIENT_TOKEN = test_…
```

ⓘ Neither is a secret. `PADDLE_CLIENT_TOKEN` is a *client-side* token — Paddle's
own docs paste it into frontend HTML, and it can open a checkout and nothing
else. It is **not** the API key, which must never reach a browser. They are
configuration rather than constants only because sandbox and live are different
accounts.

ⓘ The build **refuses** rather than shipping something broken: an empty token,
`live` with a `test_…` token, or `sandbox` without one all fail the build.

### The custom domain

**The project → Custom domains → Set up a custom domain** → `pay.evnx.dev`

Cloudflare writes the DNS record itself, since `evnx.dev` is on the same
account. Do not add a CNAME by hand.

### Workers instead, if you prefer

`wrangler.jsonc` is already in `pay/`, configured assets-only. Either deploy
straight from a terminal:

```bash
cd pay && PADDLE_ENVIRONMENT=sandbox PADDLE_CLIENT_TOKEN=test_… npm run deploy
```

…or **Compute (Workers) → Create an app → Connect GitHub**, then
**Settings → Build**: root directory `pay`, build command `node build.mjs`,
deploy command `npx wrangler deploy` (the default), and the same two build
variables. Add **Build watch paths → `pay/*`** so pushes to the marketing site
do not rebuild this.

### Confirm it, either way

```bash
curl -sI https://pay.evnx.dev/ | grep -i "content-security-policy\|^HTTP"
```

⚠️ The CSP **must** be present and **must** contain
`frame-src https://*.paddle.com`. Without it Paddle's overlay is blocked
silently — the spinner never finishes and nothing appears in the console except
a CSP report most people never look at.

### Then, in Paddle

1. **My account → Settings → Website approval** — add `pay.evnx.dev`.
   Instant in sandbox; reviewed in live.
2. **Checkout → Checkout configuration → Default payment link** —
   `https://pay.evnx.dev/`.
3. In `evnx-server`'s `.env.prod`: `PADDLE_CHECKOUT_URL=https://pay.evnx.dev/`.

⚠️ **Step 2 is mandatory, and step 3 does not substitute for it.** Verified
against the sandbox API on 2026-10-05: with no default payment link set, Paddle
**refuses to create the transaction at all** — and it refuses *even when
`checkout.url` is passed explicitly in the request body*:

```
transaction_default_checkout_url_not_set
  Cannot create a transaction or open a checkout as no default payment link
  has been set for this account.
```

So step 2 is what makes checkout work. Step 3 is still worth setting: it pins
the URL per deployment rather than relying on one dashboard field shared by
every integration on the account, and it is what a self-hoster configures.

⚠️ The dashboard default also covers every link Paddle generates on its own —
including the ones inside the subscription-management emails Paddle sends, which
never pass through our API.

## Verified

2026-10-05, against the real CSP in `public/_headers`:

- Paddle.js loads from `cdn.paddle.com`
- `Paddle.Initialize` succeeds with the sandbox client-side token
- the overlay's iframe (`sandbox-buy.paddle.com`) is **permitted** —
  `frame-src` is load-bearing and `default-src 'none'` blocks it silently
  without it
- no `_ptxn` → "Nothing to pay for"; a malformed one → refused without ever
  reaching Paddle
- a `checkout.error` event reaches the page's own `eventCallback` and is shown

And against a **real sandbox transaction**, once the default payment link was
set: the overlay rendered `$18.00 now Inc. VAT` with the Test Mode badge, from
`https://pay.evnx.dev/?_ptxn=txn_…` served locally under the same `_headers`.
