/**
 * CommandRef
 *
 * Purpose: A compact inline card that links to a command's full reference
 * guide. Used at the bottom of use-case guides and integration guides
 * to cross-link to the relevant command docs without repeating content.
 *
 * The difference from a plain link:
 *   - Visually distinct — hard to miss at the end of a section
 *   - Shows the command in monospace with its one-line description
 *   - Includes the section label so readers know it goes to a reference doc
 *
 * Usage in MDX:
 *
 *   ## Related
 *   <CommandRef command="evnx scan" />
 *   <CommandRef command="evnx validate" />
 *   <CommandRef command="evnx migrate" />
 *
 *   <CommandRef command="evnx doctor" label="Run a full health check on your project" />
 */

import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

// Known commands with their slugs and default descriptions
const COMMAND_META: Record<string, { slug: string; description: string }> = {
  "evnx scan": {
    slug: "commands/scan",
    description: "Detect secrets and high-entropy strings in .env files",
  },
  "evnx validate": {
    slug: "commands/validate",
    description: "Catch misconfiguration, placeholders, and weak secrets",
  },
  "evnx convert": {
    slug: "commands/convert",
    description:
      "Export .env to Kubernetes, Terraform, JSON, and 11 more formats",
  },
  "evnx add": {
    slug: "commands/add",
    description: "Add or update variables from the CLI without editing files",
  },
  "evnx diff": {
    slug: "commands/diff",
    description: "Compare two .env files and show what changed",
  },
  "evnx sync": {
    slug: "commands/sync",
    description: "Keep .env and .env.example in sync bidirectionally",
  },
  "evnx migrate": {
    slug: "commands/migrate",
    description: "Push secrets to AWS Secrets Manager, Doppler, or Infisical",
  },
  "evnx doctor": {
    slug: "commands/doctor",
    description: "Full environment health check — gitignore, permissions, sync",
  },
  "evnx backup": {
    slug: "commands/backup",
    description: "Create an AES-256-GCM encrypted backup of your .env",
  },
  "evnx restore": {
    slug: "commands/restore",
    description: "Restore from an encrypted backup",
  },
  "evnx template": {
    slug: "commands/template",
    description:
      "Generate .env from a template with filters and transformations",
  },
  "evnx init": {
    slug: "commands/init",
    description: "Scaffold a new project with a pre-wired .env for your stack",
  },
};

type Props = {
  command: string;
  /** Override the default description */
  label?: string;
};

export function CommandRef({ command, label }: Props) {
  const meta = COMMAND_META[command];
  const href = meta
    ? `/guides/${meta.slug}`
    : `/guides/commands/${command.replace("evnx ", "")}`;
  const description = label ?? meta?.description ?? "View command reference";

  return (
    <Link href={href}>
      <div className="group flex items-center justify-between gap-4 my-3 bg-bg-surface border border-border-muted rounded-lg px-5 py-4 hover:border-brand-500/40 hover:bg-bg-overlay transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 bg-brand-500/10 rounded flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-brand-500" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
              {command}
            </p>
            <p className="font-mono text-xs text-text-muted truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-xs text-text-muted hidden sm:block">
            reference →
          </span>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
