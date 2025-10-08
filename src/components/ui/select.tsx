import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps extends React.ComponentProps<"div"> {
  value?: string
  onValueChange?: (value: string) => void
}

interface SelectTriggerProps extends React.ComponentProps<"button"> {}

interface SelectContentProps extends React.ComponentProps<"div"> {}

interface SelectItemProps extends React.ComponentProps<"div"> {}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

function Select({ children, value, onValueChange, ...props }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div
        data-slot="select"
        className={cn(
          "relative",
          props.className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              isOpen,
              setIsOpen
            } as any)
          }
          return child
        })}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children, isOpen, setIsOpen, ...props }: SelectTriggerProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }) {
  const context = React.useContext(SelectContext)

  return (
    <button
      type="button"
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onClick={() => setIsOpen?.(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  return <span className="text-muted-foreground">{context.value || placeholder}</span>
}

function SelectContent({ children, className, isOpen, setIsOpen, ...props }: SelectContentProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }) {
  const context = React.useContext(SelectContext)

  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!(event.target as Element)?.closest('[data-slot="select"]')) {
          setIsOpen?.(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute top-full left-0 right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClick: () => {
                context.onValueChange?.((child as any).props.value)
                setIsOpen?.(false)
              }
            } as any)
          }
          return child
        })}
      </div>
    </div>
  )
}

function SelectItem({ children, className, value, onClick, ...props }: SelectItemProps & { value?: string }) {
  const context = React.useContext(SelectContext)

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        context.value === value && "bg-accent text-accent-foreground",
        className
      )}
      onClick={(event) => onClick?.(event)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
