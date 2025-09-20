import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loaderVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        spinner: "",
        dots: "",
        pulse: "",
        ring: "",
        bars: "",
      },
      size: {
        sm: "w-4 h-4",
        default: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
      },
      color: {
        primary: "",
        secondary: "",
        muted: "",
        accent: "",
      },
    },
    defaultVariants: {
      variant: "spinner",
      size: "default",
      color: "primary",
    },
  }
)

export interface LoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof loaderVariants> {
  className?: string
}

function Loader({ className, variant, size, color, ...props }: LoaderProps) {
  return (
    <div
      className={cn(loaderVariants({ variant, size, className }))}
      {...props}
    >
      {variant === "spinner" && (
        <SpinnerLoader size={size} color={color} />
      )}
      {variant === "dots" && (
        <DotsLoader size={size} color={color} />
      )}
      {variant === "pulse" && (
        <PulseLoader size={size} color={color} />
      )}
      {variant === "ring" && (
        <RingLoader size={size} color={color} />
      )}
      {variant === "bars" && (
        <BarsLoader size={size} color={color} />
      )}
    </div>
  )
}

// Individual loader components
function SpinnerLoader({
  size,
  color
}: {
  size?: VariantProps<typeof loaderVariants>["size"]
  color?: VariantProps<typeof loaderVariants>["color"]
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted-foreground",
    accent: "text-accent",
  }

  return (
    <div className={cn("relative", sizeClasses[size || "default"])}>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-current opacity-25",
        colorClasses[color || "primary"]
      )}></div>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin",
        colorClasses[color || "primary"]
      )}></div>
    </div>
  )
}

function DotsLoader({
  size,
  color
}: {
  size?: VariantProps<typeof loaderVariants>["size"]
  color?: VariantProps<typeof loaderVariants>["color"]
}) {
  const sizeClasses = {
    sm: "w-1 h-1",
    default: "w-1.5 h-1.5",
    lg: "w-2 h-2",
    xl: "w-3 h-3",
  }

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    muted: "bg-muted-foreground",
    accent: "bg-accent",
  }

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses[size || "default"],
            colorClasses[color || "primary"]
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

function PulseLoader({
  size,
  color
}: {
  size?: VariantProps<typeof loaderVariants>["size"]
  color?: VariantProps<typeof loaderVariants>["color"]
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    muted: "bg-muted-foreground",
    accent: "bg-accent",
  }

  return (
    <div className={cn(
      "rounded-full animate-pulse",
      sizeClasses[size || "default"],
      colorClasses[color || "primary"]
    )} />
  )
}

function RingLoader({
  size,
  color
}: {
  size?: VariantProps<typeof loaderVariants>["size"]
  color?: VariantProps<typeof loaderVariants>["color"]
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    muted: "border-muted-foreground",
    accent: "border-accent",
  }

  return (
    <div className={cn("relative", sizeClasses[size || "default"])}>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-current opacity-25",
        colorClasses[color || "primary"]
      )}></div>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin",
        colorClasses[color || "primary"]
      )}></div>
    </div>
  )
}

function BarsLoader({
  size,
  color
}: {
  size?: VariantProps<typeof loaderVariants>["size"]
  color?: VariantProps<typeof loaderVariants>["color"]
}) {
  const sizeClasses = {
    sm: "w-1 h-4",
    default: "w-1 h-6",
    lg: "w-1.5 h-8",
    xl: "w-2 h-12",
  }

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    muted: "bg-muted-foreground",
    accent: "bg-accent",
  }

  return (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size || "default"],
            colorClasses[color || "primary"]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.8s"
          }}
        />
      ))}
    </div>
  )
}

// Legacy component for backward compatibility
export default function LegacyLoader() {
  return <Loader variant="spinner" size="default" color="primary" />
}

export { Loader, loaderVariants }
