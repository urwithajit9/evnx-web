"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

// ⚠️ useSyncExternalStore, not useEffect(() => setMounted(true)): React 19's
// lint rule flags setState inside an effect, and this is the idiom it points
// to. The server snapshot is false and the client one true, so the first
// client render still matches the server and the next one shows the icon.
const noopSubscribe = () => () => {};
const ORDER = ["system", "light", "dark"] as const;
type Choice = (typeof ORDER)[number];

const LABEL: Record<Choice, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

/**
 * One button that cycles System → Light → Dark.
 *
 * ⚠️ The theme is unknown on the server, so until mount this renders a
 * placeholder of the same size: rendering an icon for a guessed theme is a
 * hydration mismatch, and an empty slot of a different size shifts the header.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const base =
    "inline-flex items-center justify-center w-8 h-8 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors";

  if (!mounted) {
    return <span aria-hidden="true" className={`${base} ${className}`} />;
  }

  const current: Choice = ORDER.includes(theme as Choice) ? (theme as Choice) : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`${base} ${className}`}
      aria-label={`${LABEL[current]}. Switch to ${LABEL[next].toLowerCase()}`}
      title={`${LABEL[current]} (click for ${LABEL[next].toLowerCase()})`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
