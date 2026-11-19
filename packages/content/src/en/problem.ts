// ─── Problem: the two ways an environment file fails ─────────────────────────
//
// D-V7 (DESIGN-BRIEF.md): leaks are the hook, but the page sells the whole
// lifecycle. This section is where the second half — drift — is introduced, so
// the reader meets validate/diff/sync as answers to a problem they recognise.
//
// ⚠️ Every pill must be a real top-level command with a guide under
// commands/. They are checked by `pnpm cli:check` only once they are in a
// guide, so check them here by hand against `evnx --help`.

import type { CommandPill, SectionHeading, SpotId } from "../types";

export interface FailureMode {
  id: string;
  title: string;
  body: string;
  spot: SpotId;
  commands: CommandPill[];
}

export const problem: SectionHeading & { modes: FailureMode[]; close: string } = {
  eyebrow: "The problem",
  heading: "Environment files fail in two ways",
  lede: "They leak credentials. And they drift.",

  modes: [
    {
      id: "leak",
      title: "They leak",
      spot: "key",
      body: "A key pasted into a config file, a .env committed by accident, a token left in a log. Once it reaches a shared repository, assume someone has it.",
      commands: [
        { label: "evnx scan", guide: "scan" },
        { label: "evnx doctor", guide: "doctor" },
      ],
    },
    {
      id: "drift",
      title: "They drift",
      spot: "settings",
      body: "A variable added locally but never to .env.example, a value that differs between staging and production, a placeholder that reaches a deploy. Nothing fails until it does.",
      commands: [
        { label: "evnx validate", guide: "validate" },
        { label: "evnx diff", guide: "diff" },
        { label: "evnx sync", guide: "sync" },
      ],
    },
  ],

  close: "evnx catches both — on your machine, at commit time, and in CI.",
};
