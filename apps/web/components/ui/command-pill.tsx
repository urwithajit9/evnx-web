import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * CommandPill — an evnx command as a link to its guide (DESIGN-BRIEF §5).
 *
 * ⚠️ Real text, never an image: it is searchable, read by screen readers,
 * and it is a command name the docs checks can see.
 *
 * `bg-terminal-bg` makes it a dark island (see @evnx/tokens), so the brand
 * text keeps its dark-theme value and contrast in both themes.
 */
export function CommandPill({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center font-mono text-xs text-brand-400 bg-terminal-bg border border-border-muted rounded px-2 py-1 hover:border-brand-500 transition-colors',
        className
      )}
    >
      {children}
    </Link>
  );
}
