type Props = {
  version: string;
  label?: string;
  prefix?: string;
  /** Emoji icon */
  icon?: string;
  /** Image URL icon — takes precedence over icon if both provided */
  iconSrc?: string;
  iconAlt?: string;
};

export function VersionBadge({
  version,
  label,
  prefix = "evnx",
  icon,
  iconSrc,
  iconAlt,
}: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded border border-brand-500/30 bg-brand-500/10 text-brand-400 align-middle">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={iconAlt ?? prefix}
          className="w-3.5 h-3.5 object-contain rounded-sm"
        />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      <span className="opacity-60">{prefix}</span>
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
