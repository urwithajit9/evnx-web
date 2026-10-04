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

Cloudflare Pages, separate project from `evnx-web`:

| | |
|---|---|
| Build command | `cd pay && node build.mjs` |
| Output directory | `pay/out` |
| Root directory | repository root |
| Environment | `PADDLE_ENVIRONMENT`, `PADDLE_CLIENT_TOKEN` |
| Custom domain | `pay.evnx.dev` |

Then, in Paddle:

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
