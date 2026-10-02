import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold',
  {
    variants: {
      variant: {
        success: 'bg-success bg-opacity-10 text-success border border-success border-opacity-20',
        warning: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20',
        danger: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20',
        info: 'bg-info bg-opacity-10 text-info border border-info border-opacity-20',
        brand: 'bg-brand-500 bg-opacity-10 text-brand-400 border border-brand-500 border-opacity-20',
        neutral: 'bg-border-muted bg-opacity-50 text-text-secondary border border-border-muted',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
