import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Pill — a short status or label: "live", "experimental", a plan ribbon.
 * Phase A primitive (DESIGN-BRIEF §5).
 *
 * ⚠️ Never colour alone: the pill always carries its word, so the meaning
 * survives for readers who cannot tell red from green.
 *
 * Kept as `Badge` from this file so existing imports (cloud, pricing,
 * changelog) need no change. Uses `/10` opacity modifiers, which work on
 * every token since @evnx/tokens moved colours to RGB channels.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-success/10 text-success border-success/30',
        warning: 'bg-warning/10 text-warning border-warning/30',
        danger: 'bg-danger/10 text-danger border-danger/30',
        info: 'bg-info/10 text-info border-info/30',
        brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
        neutral: 'bg-bg-surface text-text-secondary border-border-muted',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
