import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-600 text-white shadow-sm",
        secondary:
          "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline: "text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100",
        success:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
        warning:
          "border-transparent bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        info:
          "border-transparent bg-violet-500 text-white hover:bg-violet-600 shadow-sm",
        gradient:
          "border-transparent bg-violet-600 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
