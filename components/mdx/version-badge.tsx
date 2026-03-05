/**
 * VersionBadge
 *
 * Purpose: Inline badge showing the minimum evnx version required for a
 * feature or command. Placed near the top of a guide or next to a heading
 * when a feature was added in a specific release.
 *
 * Usage in MDX:
 *   <VersionBadge version="0.2.0" />
 *   <VersionBadge version="0.3.0" label="Cloud sync only" />
 */

type Props = {
  version: string;
  /** Optional extra label, e.g. "Cloud sync only" */
  label?: string;
};

export function VersionBadge({ version, label }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded border border-brand-500/30 bg-brand-500/10 text-brand-400 align-middle">
      <span className="opacity-60">evnx</span>
      <span>v{version}+</span>
      {label && (
        <>
          <span className="opacity-40">·</span>
          <span className="text-brand-300">{label}</span>
        </>
      )}
    </span>
  );
}
