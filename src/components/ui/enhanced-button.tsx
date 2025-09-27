import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-105 active:scale-95 min-h-[44px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-strong",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-medium hover:shadow-strong",
        outline:
          "border-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-medium hover:shadow-strong",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:shadow-medium",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "gradient-primary text-white shadow-medium hover:shadow-strong hover:scale-110",
        glass: "glass text-foreground hover:bg-white/20 shadow-medium hover:shadow-strong",
        glow: "glow-primary text-white shadow-medium hover:shadow-strong hover:scale-110",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-medium hover:shadow-strong",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-medium hover:shadow-strong",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-xl px-10 has-[>svg]:px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function EnhancedButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof enhancedButtonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="enhanced-button"
      className={cn(
        enhancedButtonVariants({ variant, size, className }),
        "aria-[busy=true]:opacity-90 aria-[busy=true]:cursor-progress"
      )}
      {...props}
    />
  )
}

export { EnhancedButton, enhancedButtonVariants }
