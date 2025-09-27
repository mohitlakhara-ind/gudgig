import * as React from "react"

import { cn } from "@/lib/utils"

function EnhancedCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card"
      className={cn(
        "glass-card text-card-foreground flex flex-col gap-6 rounded-2xl border-0 shadow-strong hover:shadow-strong transition-all duration-300 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring",
        className
      )}
      {...props}
    />
  )
}

function EnhancedCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function EnhancedCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-title"
      className={cn("leading-none font-semibold text-lg", className)}
      {...props}
    />
  )
}

function EnhancedCardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function EnhancedCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function EnhancedCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function EnhancedCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="enhanced-card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardAction,
  EnhancedCardDescription,
  EnhancedCardContent,
}
