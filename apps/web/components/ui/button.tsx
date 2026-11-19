import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Button — Phase A primitive (DESIGN-BRIEF §5, D-V9).
 *
 * ⚠️ No `focus-visible:outline-none`. The shadcn default removed the outline
 * and drew a ring instead, which overrode the site-wide focus style in
 * globals.css (2px brand outline, offset). One focus style everywhere.
 *
 * ⚠️ `default` and `lg` are ≥44px tall: the WCAG 2.2 tap-target size for the
 * actions people press most. `sm` (36px) is for dense desktop rows only.
 *
 * Text on a filled button is `brand-fg`, never white or black: it flips with
 * the theme (black on the dark theme's orange, white on the light one's).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-brand-fg hover:bg-brand-400',
        // brand-fg on danger: black on #F85149 (dark, 6.9:1), white on #CF222E (light, 5.4:1).
        destructive: 'bg-danger text-brand-fg hover:bg-danger/90',
        outline:
          'border border-border-default bg-transparent text-text-primary hover:bg-bg-surface',
        secondary:
          'border border-border-muted bg-bg-surface text-text-primary hover:bg-bg-overlay',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-surface',
        link: 'h-auto px-0 text-brand-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
