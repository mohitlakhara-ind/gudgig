'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionContextValue = {
  openItems: Set<string>
  toggleItem: (val: string) => void
  type: 'single' | 'multiple'
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

export function Accordion({ type = 'single', defaultValue, children, className }: {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  children: React.ReactNode
  className?: string
}) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    if (Array.isArray(defaultValue)) return new Set(defaultValue)
    return new Set([defaultValue])
  })

  const toggleItem = (val: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (type === 'single') {
        if (next.has(val)) next.clear()
        else { next.clear(); next.add(val) }
      } else {
        next.has(val) ? next.delete(val) : next.add(val)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('w-full divide-y rounded-md border', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <div data-accordion-item="" data-value={value} className={cn('group', className)}>
      {children}
    </div>
  )
}

export function AccordionTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion')
  const open = ctx.openItems.has(value)
  return (
    <button
      type="button"
      onClick={() => ctx.toggleItem(value)}
      className={cn('flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/60', className)}
      aria-expanded={open}
      aria-controls={`content-${value}`}
    >
      <span>{children}</span>
      <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
    </button>
  )
}

export function AccordionContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionContent must be used within Accordion')
  const open = ctx.openItems.has(value)
  if (!open) return null
  return (
    <div id={`content-${value}`} className={cn('p-4 pt-0 text-sm text-muted-foreground', className)}>
      {children}
    </div>
  )
}

export default Accordion




























