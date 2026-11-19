// ─── Content types ────────────────────────────────────────────────────────────
//
// The shapes every section's copy must satisfy. They exist so that changing a
// word is a typed edit with autocomplete, and so a missing field is a build
// error rather than an empty heading discovered in production.

/** A link anywhere in the site chrome or a CTA. */
export interface Link {
  label: string;
  /** Build with `docsUrl()` / `appUrl()` from @evnx/config — never a literal host. */
  href: string;
  external?: boolean;
  /** Renders a small badge beside the label, e.g. "new", "beta". */
  badge?: string;
}

/** The standard heading block every section starts with. */
export interface SectionHeading {
  /** Small line above the heading. Optional — most sections have none. */
  eyebrow?: string;
  heading: string;
  /** One sentence under the heading. Keep it one sentence. */
  lede?: string;
}

/** A card in a grid: features, commands, capabilities. */
export interface Card {
  id: string;
  title: string;
  body: string;
  /** lucide-react icon name. Resolved by the renderer, not imported here. */
  icon?: string;
  href?: string;
  /** Monospace title — used for command cards. */
  mono?: boolean;
  /** A spot illustration drawn at the top of the card. */
  spot?: SpotId;
  /** The command that does this job, rendered as a CommandPill to its guide. */
  command?: CommandPill;
}

/** One moment on a timeline. Used by both the leak anatomy and the origin story. */
export interface TimelineEntry {
  /** `"00:04"`, `"23:47:03"` — whatever the timeline's own clock is. */
  time: string;
  /** Drives the colour. `neutral` for scene-setting, not every line is bad. */
  level: "neutral" | "warn" | "bad" | "good";
  /** The event, in one line. */
  text: string;
  /** Optional second line: the detail that makes it land. */
  detail?: string;
}

/** A terminal transcript rendered as a fake shell. */
export interface TerminalLine {
  type: "prompt" | "output" | "dim" | "error" | "warning" | "success" | "key";
  content: string;
}

/** One tab of a tabbed terminal: its name and its transcript. */
export interface TerminalTab {
  label: string;
  lines: TerminalLine[];
}

/** A question and its answer. */
export interface Faq {
  q: string;
  a: string;
}

/**
 * A spot illustration, by name. The drawing lives in the app
 * (`apps/web/components/art/spots.tsx`, typed `Record<SpotId, …>`), so adding a
 * name here without drawing it is a compile error, not a blank square.
 */
export type SpotId =
  | "laptop"
  | "key"
  | "guard"
  | "safe"
  | "cloud"
  | "card"
  | "card-revoked"
  | "checklist"
  | "clipboard"
  | "server"
  | "settings"
  | "settings-ok"
  | "backup"
  | "phone"
  | "board"
  | "bot"
  | "fan"
  | "sync";

/** A command named on the page, linking to its guide. */
export interface CommandPill {
  /** Exactly as typed, e.g. "evnx cloud run". Must exist in `evnx --help`. */
  label: string;
  /** The guide under docs `commands/`, e.g. "cloud". */
  guide: string;
}
