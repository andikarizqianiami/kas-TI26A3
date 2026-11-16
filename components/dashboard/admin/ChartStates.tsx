'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import Link from 'next/link'
import { BarChart3, RefreshCw, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: { href: string; label: string }
  /** Keeps the card the same height as the chart it replaces. */
  minHeight?: number
}

export function EmptyState({ title, description, icon: Icon = BarChart3, action, minHeight = 200 }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center"
      style={{ minHeight }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-1 rounded text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  description?: string
  onRetry?: () => void
  minHeight?: number
}

export function ErrorState({ title, description, onRetry, minHeight = 200 }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-red-50 px-6 py-8 text-center"
      style={{ minHeight }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-600 shadow-sm ring-1 ring-red-100">
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description && <p className="text-xs text-slate-600">{description}</p>}
      </div>
      {onRetry && (
        <Button type="button" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Coba lagi
        </Button>
      )}
    </div>
  )
}

export function ChartSkeleton({ height }: { height: number }) {
  return <div className="w-full animate-pulse rounded-lg bg-slate-100" style={{ height }} aria-hidden="true" />
}

interface ChartErrorBoundaryProps {
  children: ReactNode
  minHeight: number
  /** Changing this value (e.g. new chart data) clears a previous render error. */
  resetKey?: unknown
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

/** Isolates a failing chart so the rest of the dashboard keeps rendering. */
export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Chart render error:', error, info.componentStack)
  }

  componentDidUpdate(prevProps: ChartErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Grafik tidak dapat ditampilkan"
          description="Terjadi kesalahan saat menggambar grafik ini."
          onRetry={() => this.setState({ hasError: false })}
          minHeight={this.props.minHeight}
        />
      )
    }
    return this.props.children
  }
}
