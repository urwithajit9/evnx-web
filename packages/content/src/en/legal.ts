// ─── Legal and security pages ─────────────────────────────────────────────────
//
// ⚠️ THESE DESCRIBE WHAT THE SYSTEM ACTUALLY DOES. Every claim below is
// traceable to the code: the SRP verifier and Argon2id salts in evnx-server's
// `users` table, the BLAKE3 `ip_hash` in `audit_events`, the three Supabase
// tables in apps/web/lib/supabase.ts, and the "What the server holds" table in
// the cloud-architecture guide.
//
// If you change what is collected, change it here in the same commit. A
// privacy policy that drifts from the system is worse than none — it is a
// written statement that happens to be false.
//
// ⚠️ NOT REVIEWED BY A LAWYER. Accurate, plain-English, and written by the
// people who built the thing — which is the right starting point, not the
// finish line.
//
// ⚠️ **This is now the gate on taking real money**, not a background task.
// Paddle is the merchant of record and asks for the privacy policy, the terms
// and a refund policy as part of approving an account for the LIVE environment.
// Sandbox needs none of it, so the billing screens can ship and be exercised
// with test cards while this is outstanding — but a live price cannot.
//
// ⚠️ The refund terms in `terms` below contain two numbers somebody has to
// actually decide rather than inherit from a draft: the 14-day window, and
// "no refunds for part-used periods on renewal". Both are the ordinary SaaS
// answer and both are safe defaults; neither is a considered choice yet.

export interface LegalSection {
  heading: string;
  /** Paragraphs. Plain text — no markdown, no HTML. */
  body: string[];
  /** Optional bullet list under the paragraphs. */
  list?: string[];
  /** Rendered as a callout rather than body text. */
  callout?: string;
}

export interface LegalDoc {
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
}

const CONTACT_LINE =
  "Questions about any of this go to support@evnx.dev, and security reports to security@evnx.dev.";

// ─────────────────────────────────────────────────────────────────────────────

export const privacy: LegalDoc = {
  title: "Privacy",
  lede: "What evnx collects, what it cannot collect, and why the difference is structural rather than a promise.",
  updated: "2026-10-03",
  sections: [
    {
      heading: "The short version",
      body: [
        "We cannot read your secrets. Not because we promise not to, but because the encryption happens on your machine and the server never receives a key that opens it. That is the one claim this whole product rests on, and the rest of this page is the detail behind it — including the parts that are less comfortable.",
      ],
      callout:
        "If you only read one section, read “What the server can see”. It states the limits as plainly as the guarantee.",
    },
    {
      heading: "The CLI collects nothing",
      body: [
        "evnx scan, validate, convert, doctor, diff and the rest run entirely on your machine. They make no network request, send no telemetry, and work with no account and no internet connection. Nothing you scan leaves the computer you scan it on.",
        "Only the cloud commands — auth, vault and cloud — contact a server, and only when you run them.",
      ],
    },
    {
      heading: "What an account stores",
      body: ["If you create an account for cloud sync, the server holds:"],
      list: [
        "Your email address, for sign-in, verification and security alerts.",
        "An SRP-6a verifier and two salts. Not your password — the verifier cannot be reversed into it, and the password never reaches the server in any form.",
        "Your private key, already encrypted with a key derived from your password. We hold the sealed envelope, never the key to it.",
        "Encrypted vault contents, and one wrapped copy of each vault key per member.",
        "The names of your environment variables — DATABASE_URL, STRIPE_SECRET_KEY — but never their values.",
        "A BLAKE3 hash of the IP address a request came from. The address itself is never written to the database or to logs.",
      ],
    },
    {
      heading: "What the server can see",
      body: [
        "The server stores ciphertext and wrapped keys. Full database access does not reveal a single secret value. But a zero-knowledge claim is only worth what its exceptions are worth, so here they are:",
      ],
      list: [
        "Variable names are visible. This is a deliberate trade — it lets a dashboard list a vault's contents without decrypting it. The values are not.",
        "Timing and size are visible. We can see that you pushed, when, and roughly how much.",
        "For a shared vault, the recipient's public keys are fetched from the server. A malicious server could substitute its own and read what you share. There is nothing to verify them against yet, so for shared vaults the guarantee narrows to: the server cannot read your secrets passively.",
        "A compromised machine sees plaintext. Zero knowledge is a claim about the server, not about your laptop.",
      ],
    },
    {
      heading: "This website",
      body: [
        "evnx.dev uses a self-hosted Umami instance for analytics — no cookies, no cross-site tracking, no advertising identifiers, no third party receiving your data. It records the page you viewed, where you came from, and coarse device information.",
        "If you submit the waitlist form, a testimonial, or vote on whether a page was helpful, that goes to a Supabase database we run. A testimonial is stored with whatever you typed and is not published unless it is approved.",
        "app.evnx.dev runs no analytics at all. It is the origin where your keys exist in browser memory, and no third-party script runs there.",
      ],
    },
    {
      heading: "Who else processes your data",
      body: ["We use a small number of services, each for one thing:"],
      list: [
        "Vercel — hosting for evnx.dev and docs.evnx.dev.",
        "Cloudflare — DNS, and hosting for app.evnx.dev.",
        "Resend — transactional email: verification, security alerts, invitations.",
        "Cloudflare R2 — storage for encrypted vault blobs. R2 holds ciphertext only.",
        "Supabase — the three website forms described above.",
        "A VPS provider for api.evnx.dev.",
      ],
    },
    {
      heading: "What you can take and what you can delete",
      body: [
        "evnx cloud export writes every version of every vault to disk as plain .env files, decrypted on your machine. It works regardless of plan state, and it exists specifically so that leaving is not an argument you have to have with us.",
        "evnx auth download-data exports your account record. evnx auth delete-account removes it. Deletion is real: the account row, the vaults you own, and the blobs behind them.",
      ],
      callout:
        "⚠️ There is no password recovery. If you lose your master password, the data is unrecoverable — by you and by us. That is the cost of the design, and we would rather state it here than have you discover it.",
    },
    {
      heading: "Changes and contact",
      body: [
        "If what we collect changes, this page changes in the same release. The date at the top is when it last did.",
        CONTACT_LINE,
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

export const terms: LegalDoc = {
  title: "Terms",
  lede: "The agreement for using evnx cloud. The CLI itself is MIT licensed and has no terms beyond that licence.",
  updated: "2026-10-03",
  sections: [
    {
      heading: "The CLI is yours",
      body: [
        "The evnx command-line tool is open source under the MIT licence. Use it commercially, modify it, redistribute it. Nothing on this page restricts that — these terms cover the hosted cloud service only.",
      ],
    },
    {
      heading: "Your account",
      body: [
        "You need a verified email address. You are responsible for your master password, and we cannot reset it — see the note on the privacy page about why.",
        "One account is for one person. Share a vault with your team rather than sharing an account; vault sharing exists precisely so that credentials do not have to be.",
      ],
    },
    {
      heading: "Acceptable use",
      body: ["Do not use evnx cloud to:"],
      list: [
        "Store or distribute material that is illegal where you or we operate.",
        "Attack the service — denial of service, attempts to access other accounts, or probing for vulnerabilities without contacting us first.",
        "Resell the hosted service as your own.",
      ],
      callout:
        "Security research is welcome. Email security@evnx.dev before testing anything that could affect other users, and we will not take action against good-faith research conducted that way.",
    },
    {
      heading: "Plans and payment",
      body: [
        "The free tier has enforced limits, published on the pricing page and read directly from the server that enforces them. Paid plans are billed per seat, per month or per year.",
        // ⚠️ Paddle must be named. They are the seller on the customer's bank
        // statement, and an unrecognised name on a statement is the most common
        // cause of a chargeback — which costs more than the subscription.
        "Payments are handled by Paddle.com Market Ltd, who act as the merchant of record and are the seller for the transaction. Paddle's own terms apply to the payment itself, Paddle is responsible for VAT and sales tax, and Paddle is the name that appears on your statement. evnx never receives or stores your card details.",
        "A plan is bought by an organisation and applies to whoever holds its seats. Changing the seat count takes effect immediately and Paddle prorates the difference.",
      ],
      callout:
        "A subscription decides which plan's limits apply. It cannot grant or revoke access to a vault, and nothing is ever deleted for non-payment — the server holds only ciphertext it cannot read.",
    },
    {
      // ⚠️ Its own section rather than a sentence inside the one above. A
      // merchant of record's onboarding review looks for a refund policy
      // specifically, and so do customers — burying it reads as hiding it.
      heading: "Refunds and cancellation",
      body: [
        "You can cancel at any time from the billing screen, which hands you to Paddle. Cancelling stops the next renewal; it does not end the period you have already paid for. Your plan runs to the end of that period and your limits change only when it expires.",
        "If evnx is not what you expected, write to support@evnx.dev within 14 days of a first payment and we will refund it in full. After that, and on renewals, we do not refund part-used periods by default — but if something went wrong on our side, tell us and we will put it right.",
        "Refunds are issued by Paddle, back to the original payment method.",
      ],
      callout:
        "Cancelling never deletes anything. Your vaults stay where they are, your limits return to the free tier when the period ends, and evnx cloud export works on every plan including free.",
    },
    {
      heading: "Availability, and what we do not promise",
      body: [
        "We aim for the service to be available and we run backups, but this is a small team and there is no uptime SLA on the free tier. If the service is down, the CLI still works for everything that does not need a server, and evnx cloud export means your data is never only in our hands.",
        "The service is provided as is. We are not liable for indirect or consequential losses, and our total liability is limited to what you paid us in the twelve months before the claim.",
      ],
    },
    {
      heading: "Ending it",
      body: [
        "You can delete your account at any time with evnx auth delete-account. We may suspend an account for a breach of the acceptable use section, and we will tell you why.",
        "If we ever shut the service down, we will give notice with enough time to export, and evnx cloud export will keep working throughout.",
      ],
    },
    { heading: "Contact", body: [CONTACT_LINE] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ **A refund policy needs its own URL, not just its own section.**
 *
 * Paddle's website verification asks for a refund policy as a link, alongside
 * terms and privacy. The policy was written as a section inside `terms` and the
 * go-live runbook recorded it as "now exists" — which was true of the text and
 * not of a URL. `/refund-policy` and `/refunds` both 404'd when someone finally
 * pasted one into the form.
 *
 * ⚠️ **This derives from `terms`, it does not copy it.** Two refund policies
 * that can disagree is worse than one that is hard to find: the one a customer
 * reads and the one a payment processor approved would eventually differ, and
 * nothing would catch it.
 */
function sectionOf(doc: LegalDoc, heading: string): LegalSection {
  const found = doc.sections.find((s) => s.heading === heading);
  if (!found) {
    // Throws at module load, so a renamed heading fails the BUILD rather than
    // publishing an empty legal page that a verification review then reads.
    throw new Error(
      `@evnx/content: no section "${heading}" in "${doc.title}". ` +
        `The refunds page is derived from it — rename it there too, or the page ships empty.`,
    );
  }
  return found;
}

export const refunds: LegalDoc = {
  title: "Refund policy",
  lede: "How cancellation and refunds work. This is the same text as the corresponding section of the Terms — it has its own page because a refund policy should be findable without reading an agreement.",
  updated: terms.updated,
  sections: [
    sectionOf(terms, "Refunds and cancellation"),
    // Included because a refund policy that does not say who issues the refund
    // is incomplete — Paddle is the merchant of record and the refund comes
    // back from them, which is the first thing a customer needs to know.
    sectionOf(terms, "Plans and payment"),
    sectionOf(terms, "Contact"),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

export const security: LegalDoc = {
  title: "Security",
  lede: "How evnx is built, how to report a problem, and what we have deliberately not claimed.",
  updated: "2026-10-03",
  sections: [
    {
      heading: "Reporting a vulnerability",
      body: [
        "Email security@evnx.dev. Include enough to reproduce it. We will acknowledge within three working days and tell you what we intend to do.",
        "Test against your own account. Do not access anyone else's data, degrade the service, or run automated scanning without telling us first. Good-faith research conducted that way will not result in action against you.",
      ],
    },
    {
      heading: "How the encryption works",
      body: [
        "Your password derives a master key with Argon2id, which never leaves your machine. That key unwraps a per-vault key, which decrypts the vault with AES-256-GCM. The server receives ciphertext and a wrapped key it cannot open.",
        "Sharing uses a hybrid X25519 and ML-KEM-768 wrap, so a shared vault stays sealed even against an adversary with a quantum computer. There is no X25519-only path — the database refuses to store half a wrap.",
        "Each version's ciphertext is bound to its version number, so a server cannot replay an old version as the current one.",
      ],
    },
    {
      heading: "Authentication",
      body: [
        "Sign-in uses SRP-6a: the password is never transmitted, and the server stores a verifier that cannot be reversed. Two-factor authentication is available with recovery codes. Failed attempts are rate limited and lock out after a threshold.",
        "Sessions can be listed and revoked individually, and revoking one kills its tokens immediately rather than letting them expire.",
      ],
    },
    {
      heading: "What we have not claimed",
      body: [
        "No third-party security audit has been performed. The cryptography uses well-reviewed primitives and the design is documented in full, but documented is not audited and we will not imply otherwise.",
        "Variable names are visible to the server. Shared vaults depend on the server returning honest public keys. Both are explained in the architecture guide rather than buried.",
      ],
      callout:
        "Everything above is described in detail, including the uncomfortable parts, in the cloud architecture guide. It is the document to read if you are evaluating evnx for anything that matters.",
    },
    { heading: "Contact", body: [CONTACT_LINE] },
  ],
};
