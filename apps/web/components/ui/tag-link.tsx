'use client'
import Link from 'next/link'

type Props = {
  tag: string
  active?: boolean
  className?: string
}

export function TagLink({ tag, active, className = '' }: Props) {
  return (
    <Link
      href={`/blog?tag=${tag}`}
      className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${
        active
          ? 'text-brand-400 bg-brand-500/10 border border-brand-500/30'
          : 'text-text-muted hover:text-brand-400'
      } ${className}`}
    >
      #{tag}
    </Link>
  )
}