import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        card: "bg-muted/50",
        text: "bg-muted/60",
        avatar: "bg-muted rounded-full",
        button: "bg-muted/80",
      },
      size: {
        sm: "h-4",
        default: "h-6",
        lg: "h-8",
        xl: "h-12",
        full: "h-full w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  className?: string
}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3 p-4", className)} {...props}>
      <Skeleton variant="avatar" size="lg" className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton variant="text" size="lg" className="w-3/4" />
        <Skeleton variant="text" size="default" className="w-full" />
        <Skeleton variant="text" size="default" className="w-2/3" />
      </div>
    </div>
  )
}

function SkeletonText({
  lines = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          size="default"
          className={cn(
            "w-full",
            i === lines - 1 && lines > 1 ? "w-3/4" : ""
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = "default", className, ...props }: SkeletonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <Skeleton
      variant="avatar"
      size="full"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      variant="button"
      size="default"
      className={cn("h-9 w-20", className)}
      {...props}
    />
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  skeletonVariants
}
