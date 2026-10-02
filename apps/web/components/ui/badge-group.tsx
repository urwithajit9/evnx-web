// components/BadgeGroup.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  wrap?: boolean
  gap?: 'sm' | 'md' | 'lg'
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, align = 'start', wrap = true, gap = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          align === 'start' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'end' && 'justify-end',
          wrap && 'flex-wrap',
          gap === 'sm' && 'gap-1',
          gap === 'md' && 'gap-2',
          gap === 'lg' && 'gap-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BadgeGroup.displayName = 'BadgeGroup'

export { BadgeGroup }