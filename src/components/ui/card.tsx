import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component System
 * 
 * A flexible card component system with consistent styling based on design tokens.
 * All components support dark mode and respect user motion preferences.
 * 
 * Design Token References:
 * - Border Radius: BORDER_RADIUS.xl (rounded-xl)
 * - Shadow: SHADOWS.soft (default), SHADOWS.md (hover)
 * - Spacing: SPACING.xl (padding), SPACING.lg (gap)
 * - Typography: TYPOGRAPHY.fontSize.lg (title), TYPOGRAPHY.fontSize.sm (description)
 * 
 * Accessibility:
 * - Focus-within ring for keyboard navigation
 * - Proper color contrast (WCAG AA)
 * - Semantic HTML structure
 * - Respects prefers-reduced-motion
 * 
 * @module components/ui/card
 */

/**
 * Card - Base card component with professional styling
 * 
 * Features:
 * - Consistent border-radius (xl) from design tokens
 * - Soft shadow with hover enhancement
 * - Subtle hover lift animation
 * - Focus-within ring for accessibility
 * - Smooth transitions (respects prefers-reduced-motion)
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 * 
 * @see {@link https://ui.shadcn.com/docs/components/card}
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-ring/20 py-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardHeader - Header section of the card
 * 
 * Features:
 * - Grid layout supporting title, description, and optional action
 * - Automatic spacing with gap-1.5
 * - Responsive container queries
 * - Border-bottom support via [.border-b] selector
 * 
 * @example
 * <CardHeader>
 *   <CardTitle>My Title</CardTitle>
 *   <CardDescription>My description</CardDescription>
 *   <CardAction><Button>Action</Button></CardAction>
 * </CardHeader>
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardTitle - Title text for the card header
 * 
 * Features:
 * - Large font size (lg) for visual hierarchy
 * - Semibold weight for emphasis
 * - Tight leading for compact appearance
 * - Foreground color for proper contrast
 * 
 * @example
 * <CardTitle>Dashboard Overview</CardTitle>
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg leading-none font-semibold text-foreground", className)}
      {...props}
    />
  )
}

/**
 * CardDescription - Descriptive text for the card header
 * 
 * Features:
 * - Small font size (sm) for secondary information
 * - Muted foreground color for visual hierarchy
 * - Proper line-height for readability
 * 
 * @example
 * <CardDescription>View your recent activity and stats</CardDescription>
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * CardAction - Action button container in the card header
 * 
 * Features:
 * - Positioned in top-right of header via grid
 * - Self-aligns to start (top)
 * - Justifies to end (right)
 * - Spans both rows of header grid
 * 
 * @example
 * <CardAction>
 *   <Button variant="outline" size="sm">Edit</Button>
 * </CardAction>
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardContent - Main content area of the card
 * 
 * Features:
 * - Consistent horizontal padding (px-6)
 * - Vertical spacing controlled by Card's gap-6
 * - Flexible content container
 * 
 * @example
 * <CardContent>
 *   <p>Your content here</p>
 * </CardContent>
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 py-0", className)}
      {...props}
    />
  )
}

/**
 * CardFooter - Footer section of the card
 * 
 * Features:
 * - Flex layout for horizontal arrangement
 * - Gap between items
 * - Optional top border with padding and background
 * - Consistent horizontal padding
 * 
 * @example
 * <CardFooter className="border-t">
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save</Button>
 * </CardFooter>
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 gap-2 [.border-t]:pt-6 [.border-t]:border-border [.border-t]:bg-muted/30", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
