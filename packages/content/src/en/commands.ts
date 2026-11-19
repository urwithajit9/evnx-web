// ─── §5 · Command showcase ────────────────────────────────────────────────────
//
// 👉 Add, remove or reorder the cards by editing `featured`. The grid renders
//    whatever it is given.
//
// ⚠️ Every `id` here must be a real top-level command. Verified against
//    `src/cli.rs` on 2026-10-02: init, add, validate, scan, diff, convert,
//    migrate, sync, template, backup, restore, auth, vault, cloud, doctor,
//    spec, completions, update.
//
//    A card for a command that does not exist is the fastest way to lose a
//    reader who tries it.

import type { Card, SectionHeading } from "../types";

export const commands: SectionHeading & {
  featured: Card[];
  allCommandsLink: { label: string; docsSlug: string };
} = {
  eyebrow: "What it does",
  heading: "One CLI for the whole .env lifecycle",
  // ⚠️ No count here: the road section lists every command, and a typed
  // number drifts (it said "Twenty" when 0.12.0 had twenty-two).
  lede: "The six jobs you will run most, each one command.",

  // ⚠️ D-V7 pillars (DESIGN-BRIEF §4.5). `diff` replaced `doctor` here: doctor
  // already leads the problem section and the hero terminal, while drift had
  // no card at all. The title says the job; the pill says the command.
  featured: [
    {
      id: "scan",
      title: "Catch secrets before they ship",
      spot: "guard",
      command: { label: "evnx scan", guide: "scan" },
      body: "Find secrets before they leave the machine. Reads every .env variant, not just .env.",
    },
    {
      id: "validate",
      title: "Deploy with the right variables",
      spot: "checklist",
      command: { label: "evnx validate", guide: "validate" },
      body: "Placeholders, weak values, localhost in a production config.",
    },
    {
      id: "diff",
      title: "Keep environments aligned",
      spot: "clipboard",
      command: { label: "evnx diff", guide: "diff" },
      body: "Compare two env files by key: what is missing, what is extra, and which values differ between environments.",
    },
    {
      id: "sync",
      title: "Keep the example honest",
      spot: "sync",
      command: { label: "evnx sync", guide: "sync" },
      body: "Keep .env and .env.example honest about each other.",
    },
    {
      id: "convert",
      title: "Export to your stack",
      spot: "fan",
      command: { label: "evnx convert", guide: "convert" },
      body: "Fourteen targets — JSON, YAML, Kubernetes, Terraform, Vercel and more.",
    },
    {
      id: "cloud",
      title: "Share and run without plaintext",
      spot: "cloud",
      command: { label: "evnx cloud", guide: "cloud" },
      body: "Push, pull and run. Encrypted on your machine before it leaves it.",
    },
  ],

  allCommandsLink: { label: "Every command and flag", docsSlug: "commands" },
};
