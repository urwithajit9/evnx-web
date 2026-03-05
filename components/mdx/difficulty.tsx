/**
 * Difficulty
 *
 * Purpose: Visual indicator of guide difficulty and estimated completion time.
 * Placed at the very top of a guide, below the title. Gives the reader an
 * immediate signal about what they're getting into before they start reading.
 *
 * Usage in MDX:
 *   <Difficulty level="beginner" time="5 minutes" />
 *   <Difficulty level="intermediate" time="20 minutes" />
 *   <Difficulty level="advanced" time="45 minutes" />
 */

import { Clock, Signal } from "lucide-react";

type Level = "beginner" | "intermediate" | "advanced";

const LEVEL_STYLES: Record<Level, { color: string; bars: number }> = {
  beginner: { color: "text-success", bars: 1 },
  intermediate: { color: "text-warning", bars: 2 },
  advanced: { color: "text-danger", bars: 3 },
};

type Props = {
  level: string; // string so MDX doesn't throw on unknown value
  time: string; // e.g. "5 minutes"
};

export function Difficulty({ level, time }: Props) {
  const resolved =
    (level as Level) in LEVEL_STYLES ? (level as Level) : "beginner";

  const { color } = LEVEL_STYLES[resolved];

  return (
    <div className="flex items-center gap-4 my-6 py-4 px-5 bg-bg-surface border border-border-muted rounded-lg">
      {/* Difficulty */}
      <div className="flex items-center gap-2">
        <Signal className={`w-4 h-4 ${color}`} />
        <span className={`font-mono text-xs font-semibold capitalize ${color}`}>
          {resolved}
        </span>
      </div>

      <span className="text-border-muted">·</span>

      {/* Time */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-text-muted" />
        <span className="font-mono text-xs text-text-secondary">{time}</span>
      </div>
    </div>
  );
}
