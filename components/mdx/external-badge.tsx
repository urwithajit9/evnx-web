// components/ExternalBadge.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ExternalBadgeProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  src: string
  alt: string
  href: string
  height?: number
  className?: string
  imgClassName?: string
}

const ExternalBadge = React.forwardRef<HTMLAnchorElement, ExternalBadgeProps>(
  ({ src, alt, href, height = 20, className, imgClassName, ...props }, ref) => {
    // Ensure consistent badge sizing
    const badgeSrc = React.useMemo(() => {
      // Add style=flat-square if not present
      if (!src.includes('style=')) {
        const separator = src.includes('?') ? '&' : '?'
        return `${src}${separator}style=flat-square`
      }
      return src
    }, [src])

    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center justify-center',
          'transition-opacity hover:opacity-80',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        {...props}
      >
        <img
          src={badgeSrc}
          alt={alt}
          height={height}
          // Width auto maintains aspect ratio
          style={{ 
            height: `${height}px`, 
            width: 'auto', 
            display: 'block' 
          }}
          className={cn('object-contain', imgClassName)}
          loading="lazy"
          decoding="async"
        />
      </a>
    )
  }
)
ExternalBadge.displayName = 'ExternalBadge'

export { ExternalBadge }