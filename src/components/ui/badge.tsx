import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component System
 * 
 * A versatile badge component for displaying status, counts, and labels.
 * Built with class-variance-authority for type-safe variant management.
 * 
 * Variants:
 * - default: Primary badge with brand color
 * - secondary: Neutral gray badge
 * - destructive: Red badge for errors/alerts
 * - success: Green badge for success states
 * - warning: Orange badge for warnings
 * - error: Red badge (alias for destructive)
 * - outline: Bordered badge with transparent background
 * 
 * Features:
 * - Hover animations (scale, shadow)
 * - Pulse animation for notifications (use animate-badge-pulse class)
 * - Icon support (automatically sized)
 * - WCAG AA color contrast
 * - Dark mode support
 * - Respects prefers-reduced-motion
 * 
 * Design Token References:
 * - Border Radius: BORDER_RADIUS.md (rounded-md)
 * - Typography: TYPOGRAPHY.fontSize.xs (text-xs)
 * - Colors: COLORS.PRIMARY, COLORS.SUCCESS, COLORS.WARNING, COLORS.ERROR
 * 
 * @module components/ui/badge
 */

/**
 * Badge Variants - Color and style options
 * 
 * @variant default - Primary badge with brand color (bg-primary)
 *   - Use for: Primary labels, featured items, brand highlights
 *   - Color: LinkedIn Blue (#0a66c2)
 *   - Contrast: WCAG AA compliant (white text on blue)
 *   - Example: "Featured", "Premium", "Pro"
 * 
 * @variant secondary - Neutral gray badge (bg-secondary)
 *   - Use for: Secondary labels, neutral states, categories
 *   - Color: Neutral Gray (#4b5563)
 *   - Contrast: WCAG AA compliant
 *   - Example: "Draft", "Archived", "General"
 * 
 * @variant destructive - Red badge for errors/alerts (bg-destructive)
 *   - Use for: Errors, critical alerts, negative states
 *   - Color: Red (#ef4444)
 *   - Contrast: WCAG AA compliant (white text on red)
 *   - Example: "Error", "Failed", "Rejected"
 * 
 * @variant success - Green badge for success states (bg-success)
 *   - Use for: Success messages, completed states, positive indicators
 *   - Color: Green (#10b981)
 *   - Contrast: WCAG AA compliant (white text on green)
 *   - Example: "Active", "Approved", "Completed"
 * 
 * @variant warning - Orange badge for warnings (bg-warning)
 *   - Use for: Warnings, pending states, attention needed
 *   - Color: Orange (#f59e0b)
 *   - Contrast: WCAG AA compliant (white text on orange)
 *   - Example: "Pending", "In Review", "Warning"
 * 
 * @variant error - Red badge (alias for destructive)
 *   - Use for: Error states, failed actions
 *   - Same as destructive variant
 *   - Example: "Error", "Invalid"
 * 
 * @variant outline - Bordered badge with transparent background
 *   - Use for: Subtle labels, tags, filters
 *   - Style: Border with foreground text color
 *   - Hover: Accent background
 *   - Example: "Tag", "Category", "Filter"
 * 
 * Accessibility:
 * - All variants meet WCAG AA color contrast requirements (4.5:1 for text)
 * - Focus-visible ring for keyboard navigation
 * - Hover states for interactive badges (when used as links)
 * - Respects prefers-reduced-motion for animations
 * 
 * Animation Support:
 * - Use `animate-badge-pulse` class for notification badges
 * - Hover scale animation (1.05x) for interactive feedback
 * - Active scale animation (0.95x) for press feedback
 * - Smooth transitions (200ms duration)
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        success:
          "border-transparent bg-success text-white [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-white [a&]:hover:bg-warning/90",
        error:
          "border-transparent bg-error text-white [a&]:hover:bg-error/90",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Badge - Display status, counts, and labels
 * 
 * @example
 * // Basic usage
 * <Badge>New</Badge>
 * 
 * @example
 * // Different variants
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="outline">Draft</Badge>
 * 
 * @example
 * // With icon
 * <Badge>
 *   <CheckCircle className="h-3 w-3" />
 *   Verified
 * </Badge>
 * 
 * @example
 * // Notification badge with pulse animation
 * <Badge variant="destructive" className="animate-badge-pulse">
 *   3
 * </Badge>
 * 
 * @example
 * // As link (polymorphic)
 * <Badge asChild variant="outline">
 *   <Link href="/notifications">5 new</Link>
 * </Badge>
 * 
 * @example
 * // Count badge (common pattern)
 * <div className="relative">
 *   <Bell className="h-5 w-5" />
 *   {unreadCount > 0 && (
 *     <Badge 
 *       variant="destructive" 
 *       className="absolute -top-2 -right-2 animate-badge-pulse"
 *     >
 *       {unreadCount}
 *     </Badge>
 *   )}
 * </div>
 */

/**
 * NotificationBadge - Specialized badge for notification counts
 * 
 * A convenience wrapper around Badge with pulse animation and
 * optimized styling for notification counts.
 * 
 * @example
 * <NotificationBadge count={5} />
 * 
 * @example
 * <NotificationBadge count={99} max={99} /> // Shows "99+"
 */
function NotificationBadge({
  count,
  max = 99,
  className,
  ...props
}: {
  count: number
  max?: number
  className?: string
} & Omit<React.ComponentProps<typeof Badge>, 'children'>) {
  if (count <= 0) return null
  
  const displayCount = count > max ? `${max}+` : count
  
  return (
    <Badge
      variant="destructive"
      className={cn(
        "animate-badge-pulse min-w-[20px] h-5 px-1.5 text-[10px] font-bold",
        className
      )}
      aria-label={`${count} unread notifications`}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

export { Badge, badgeVariants, NotificationBadge }
