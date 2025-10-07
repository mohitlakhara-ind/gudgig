'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({ value, defaultValue, onValueChange, children, className }: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
}) {
  const controlled = typeof value === 'string'
  const [internal, setInternal] = React.useState<string>(defaultValue || '')
  const current = controlled ? (value as string) : internal
  const setValue = (val: string) => {
    if (!controlled) setInternal(val)
    onValueChange?.(val)
  }
  React.useEffect(() => {
    if (!controlled && !internal && defaultValue) setInternal(defaultValue)
  }, [controlled, internal, defaultValue])
  return (
    <TabsContext.Provider value={{ value: current, onValueChange: setValue }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')
  const selected = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
        selected && 'bg-background text-foreground shadow',
        className
      )}
      data-state={selected ? 'active' : 'inactive'}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  const selected = ctx.value === value
  if (!selected) return null
  return (
    <div role="tabpanel" className={cn('mt-2', className)}>
      {children}
    </div>
  )
}

export default Tabs




























