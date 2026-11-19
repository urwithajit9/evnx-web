// ─── /features: the six pillars in depth ─────────────────────────────────────
//
// DESIGN-BRIEF §6. Each feature is summarised from its own command guide
// (the guide's excerpt and option tables), so the page cannot promise more
// than the guide demonstrates.
//
// ⚠️ No counts that drift (number of rules, of formats): the subcommand lists
// on the page are read from the generated command-index.json at build time,
// and anything else countable belongs in the guide, where it is checked.
//
// ⚠️ No terminal transcripts on this page on purpose. Every guide carries real
// output from a named release; copying it here would freeze it at that
// release with nothing checking it. Each feature links to its guide instead.

import type { SectionHeading, SpotId } from "../types";

export interface Feature {
  /** Top-level command name, as in command-index.json; also the anchor. */
  command: string;
  title: string;
  spot: SpotId;
  body: string[];
  points: string[];
}

export const features: SectionHeading & { features: Feature[]; allCommands: SectionHeading } = {
  eyebrow: "Features",
  heading: "Everything evnx does with a .env file",
  lede: "Six jobs across the lifecycle of an environment file, each one command. Every command here links to a guide with real output.",

  features: [
    {
      command: "scan",
      title: "Catch secrets before they ship",
      spot: "guard",
      body: [
        "Scans a project for values that look like real secrets — provider keys, tokens, private keys, passwords in connection strings — before they leave your machine. A folder scan reads every file, not only .env, and in a git repository it counts what git would commit.",
        "It never touches the network, which is what makes it safe in a pre-commit hook and in CI.",
      ],
      points: [
        "Severity is separate from confidence, so a pipeline can fail on what matters",
        "A baseline for existing findings, so adopting it does not mean fixing everything first",
        "JSON, SARIF and GitHub annotation output",
        "Your own rules and rule packs, committed so the team shares them",
      ],
    },
    {
      command: "validate",
      title: "Deploy with the right variables",
      spot: "checklist",
      body: [
        "Checks a .env against .env.example and the project's contract: missing variables, placeholders that were never replaced, weak values, and values in the wrong format.",
      ],
      points: [
        "Catches localhost and placeholder values before a deploy does",
        "Fixes what can be fixed safely",
        "An exit code a pipeline can gate on",
      ],
    },
    {
      command: "diff",
      title: "Keep environments aligned",
      spot: "clipboard",
      body: [
        "Compares a .env with its template by key name, or two environments by key and value. Values stay hidden unless you ask for them.",
      ],
      points: [
        "Keys missing or extra on either side",
        "--fail-on chooses what fails the run, so the exit code is a CI gate",
      ],
    },
    {
      command: "sync",
      title: "Keep the example honest",
      spot: "sync",
      body: [
        "Keeps .env and .env.example in step by name, and generates placeholders the template can safely carry, so the example never leaks a real value and never falls behind.",
      ],
      points: ["--check gates CI without changing a file", "Placeholders, not values, in the template"],
    },
    {
      command: "convert",
      title: "Export to your stack",
      spot: "fan",
      body: [
        "Turns a .env into the format a tool expects: Kubernetes Secrets, Terraform variables, Docker Compose, cloud secret managers, and more. Output files are written readable by you only.",
      ],
      points: [
        "Include, exclude, or keep only the secrets with --only",
        "Collisions between renamed keys are refused unless you allow them",
        "Every format and what it writes is on the integrations page",
      ],
    },
    {
      command: "cloud",
      title: "Share and run without plaintext",
      spot: "cloud",
      body: [
        "Pushes and pulls encrypted .env files across machines and CI. Encryption happens on your machine, version numbers are authenticated, and the server only ever holds ciphertext.",
        "cloud run starts a command with a vault's variables in its environment, so a deploy needs no .env file on disk.",
      ],
      points: [
        "Versions, history and an audit trail per vault",
        "Share a vault with a teammate; revoking re-keys it",
        "Scoped API tokens for pipelines",
      ],
    },
  ],

  allCommands: {
    eyebrow: "Reference",
    heading: "Every command",
    lede: "Read from the CLI's own command tree when the site is built, so this list cannot fall behind a release.",
  },
};
