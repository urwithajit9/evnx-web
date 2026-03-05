/**
 * OptionTable + Option
 *
 * Purpose: Documents every flag/option of a CLI command in a structured
 * table — the standard format for CLI reference docs. Each Option row shows
 * the flag name, value type, default, and description.
 *
 * Using a custom component instead of a plain Markdown table gives us:
 *   - Consistent formatting for flag names (monospace + coloured)
 *   - Type badges (string, bool, enum, number)
 *   - "Required" indicator
 *   - Easy to extend (e.g. add "Added in version" column later)
 *
 * Usage in MDX:
 *
 *   <OptionTable>
 *     <Option flag="--path"     type="string"  default=".">
 *       Directory or file to scan. Accepts glob patterns.
 *     </Option>
 *     <Option flag="--format"   type="enum"    default="pretty" options="pretty,json,sarif,github">
 *       Output format. Use `sarif` for GitHub Security tab integration.
 *     </Option>
 *     <Option flag="--exit-code" type="bool"   default="false">
 *       Exit with code 1 if any findings are detected. Use this in CI.
 *     </Option>
 *     <Option flag="--severity" type="enum"    default="all"    options="high,medium,low,all">
 *       Minimum severity level to report.
 *     </Option>
 *     <Option flag="--ignore"   type="string"  default=""       required>
 *       Key name or glob pattern to ignore. Repeatable.
 *     </Option>
 *   </OptionTable>
 */

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  string: "text-info border-info/30 bg-info/5",
  bool: "text-success border-success/30 bg-success/5",
  boolean: "text-success border-success/30 bg-success/5",
  number: "text-warning border-warning/30 bg-warning/5",
  int: "text-warning border-warning/30 bg-warning/5",
  enum: "text-brand-400 border-brand-500/30 bg-brand-500/5",
};

function TypeBadge({ type }: { type: string }) {
  const style =
    TYPE_STYLES[type.toLowerCase()] ??
    "text-text-muted border-border-muted bg-bg-surface";
  return (
    <span
      className={`inline font-mono text-xs px-1.5 py-0.5 rounded border ${style}`}
    >
      {type}
    </span>
  );
}

// ─── Option (row) ─────────────────────────────────────────────────────────────

type OptionProps = {
  flag: string;
  type: string;
  default?: string;
  /** Comma-separated list of valid enum values */
  options?: string;
  /** Mark as required */
  required?: boolean;
  children: React.ReactNode;
};

export function Option({
  flag,
  type,
  default: def,
  options,
  required,
  children,
}: OptionProps) {
  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-bg-surface/50 transition-colors align-top">
      {/* Flag */}
      <td className="py-3 px-4 whitespace-nowrap">
        <code className="font-mono text-xs text-brand-300 bg-bg-surface border border-border-subtle px-1.5 py-0.5 rounded">
          {flag}
        </code>
        {required && (
          <span className="ml-2 font-mono text-xs text-danger">*</span>
        )}
      </td>

      {/* Type */}
      <td className="py-3 px-4 whitespace-nowrap">
        <TypeBadge type={type} />
      </td>

      {/* Default */}
      <td className="py-3 px-4 whitespace-nowrap">
        {def !== undefined && def !== "" ? (
          <code className="font-mono text-xs text-text-secondary bg-bg-surface border border-border-subtle px-1.5 py-0.5 rounded">
            {def}
          </code>
        ) : (
          <span className="font-mono text-xs text-text-muted">—</span>
        )}
      </td>

      {/* Description */}
      <td className="py-3 px-4 text-sm text-text-secondary leading-relaxed">
        <div>{children}</div>
        {options && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {options.split(",").map((opt) => (
              <code
                key={opt.trim()}
                className="font-mono text-xs text-text-muted bg-bg-overlay border border-border-subtle px-1 py-0.5 rounded"
              >
                {opt.trim()}
              </code>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── OptionTable (wrapper) ────────────────────────────────────────────────────

type OptionTableProps = {
  children: React.ReactNode;
};

export function OptionTable({ children }: OptionTableProps) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border-muted">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-bg-overlay border-b border-border-muted">
            <tr>
              <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap w-36">
                Flag
              </th>
              <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap w-24">
                Type
              </th>
              <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap w-28">
                Default
              </th>
              <th className="text-left py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-text-muted">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-terminal-bg">{children}</tbody>
        </table>
      </div>
      {/* Required field note */}
      <div className="px-4 py-2 border-t border-border-subtle bg-bg-overlay">
        <span className="font-mono text-xs text-text-muted">
          <span className="text-danger">*</span> required
        </span>
      </div>
    </div>
  );
}
