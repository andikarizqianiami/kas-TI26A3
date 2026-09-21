import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'rejected'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-navy-800 text-gray-300 border border-gray-600',
    success: 'bg-success/10 text-success border border-success/30',
    warning: 'bg-warning/10 text-warning border border-warning/30',
    error: 'bg-error/10 text-error border border-error/30',
    info: 'bg-info/10 text-info border border-info/30',
    pending: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/30',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
