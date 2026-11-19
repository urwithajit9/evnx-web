/**
 * Colour for one line of terminal output, by its leading tag.
 *
 * ⚠️ One copy. This function used to exist twice, in apps/web's CodeBlock and
 * in TerminalOutput, and the two had already drifted (`[FIX]` was info in one
 * and plain in the other). Both now import it from here.
 *
 * The classes are page tokens, and that is safe: every caller renders inside
 * <CodeFrame>, whose `theme-dark` scope keeps them at their dark values in
 * both themes.
 */
export function lineClass(line: string, opts: { commands?: boolean } = {}): string {
  if (/^\[ERROR\]|^\[CRITICAL\]/.test(line)) return 'text-danger'
  if (/^\[WARNING\]/.test(line)) return 'text-warning'
  if (/^\[OK\]|^\[SUCCESS\]|^\[CONVERT\]/.test(line)) return 'text-success'
  if (/^\[INFO\]|^\[SCAN\]|^\[VALIDATE\]|^\[DOCTOR\]|^\[FIX\]/.test(line)) return 'text-info'
  if (/^\[TIP\]/.test(line)) return 'text-brand-300'
  if (/^#/.test(line)) return 'text-text-muted'
  // Only where the block shows commands a reader types, not output.
  if (opts.commands && /^(evnx |curl |cargo |git )/.test(line.trimStart())) return 'text-brand-400'
  return 'text-terminal-text'
}
