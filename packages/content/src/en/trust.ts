// ─── §7 · Trust ───────────────────────────────────────────────────────────────
//
// ⚠️ THE HIGHEST-RISK COPY ON THE SITE. Read this before editing a word.
//
// Over-claiming here costs the one thing the product is sold on, and it is the
// easiest mistake to make while writing marketing copy about cryptography you
// are proud of. Every line below is traceable to
// `content/guides/reference/cloud-architecture.mdx`, which is the technical
// source of truth. If you change a claim here, change it there first — or
// discover that you cannot, which is the point.
//
// The rule: **state the guarantee AND its limits, on the same screen.**
// A limits section the reader has to go looking for is not a disclosure.

import type { SectionHeading } from "../types";

export const trust: SectionHeading & {
  guarantee: { heading: string; body: string };
  held: { held: string; notHeld: string }[];
  limits: { title: string; body: string }[];
  docsLink: { label: string; docsSlug: string };
} = {
  heading: "What we can see, and what we can't",
  lede: "A zero-knowledge claim is only worth what its exceptions are worth.",

  guarantee: {
    heading: "The server cannot read your secrets.",
    body: "Encryption and decryption happen on your machine. The server stores ciphertext and wrapped keys — not a password, not a master key, not an unwrapped vault key. Full database access does not change that.",
  },

  /**
   * Mirrors the "What the server holds" table in the cloud-architecture guide.
   * ⚠️ Key *names* being visible is a real trade-off and belongs on the public
   * page, not only in the docs. It is what lets a dashboard list a vault
   * without decrypting it, and someone will notice either way — far better
   * they read it here than find it themselves.
   */
  held: [
    { held: "SRP verifier and salts", notHeld: "The password, in any form" },
    { held: "Your private key, already sealed", notHeld: "The master key" },
    { held: "The wrapped vault key, per member", notHeld: "The unwrapped vault key" },
    { held: "Encrypted blobs", notHeld: "Any plaintext" },
    { held: "Key names — DATABASE_URL", notHeld: "Key values" },
    { held: "Hashes, versions, timestamps", notHeld: "Anything revealing content" },
  ],

  /**
   * ⚠️ DO NOT TRIM THIS LIST TO MAKE THE SECTION SHORTER.
   * Each entry is a known limit that a competent reader will find anyway.
   */
  limits: [
    {
      title: "A compromised machine",
      body: "Malware on the device doing the decryption sees plaintext. Zero-knowledge is a claim about the server, not about your laptop.",
    },
    {
      title: "A weak master password",
      body: "Someone who steals the database can attack the SRP verifier offline, with no rate limiting. Argon2id at 64 MiB makes that expensive — not impossible.",
    },
    {
      title: "Shared vaults, against an active server",
      body: "A recipient's public keys are fetched from the server, and a malicious one could substitute its own. There is nothing to check them against yet. For a shared vault the guarantee narrows to: the server cannot read your secrets passively. A vault you never share is unaffected.",
    },
    {
      title: "A lost password",
      body: "There is nothing to recover with. That is the cost of the design, stated plainly.",
    },
  ],

  docsLink: {
    label: "Read the full architecture, including the parts that are uncomfortable",
    docsSlug: "reference/cloud-architecture",
  },
};
