import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-200 text-violet-800 shadow-sm hover:bg-violet-300",
        secondary:
          "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-200 text-red-800 shadow-sm hover:bg-red-300",
        outline: "text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100",
        success:
          "border-transparent bg-emerald-200 text-emerald-800 shadow-sm hover:bg-emerald-300",
        warning:
          "border-transparent bg-amber-200 text-amber-800 shadow-sm hover:bg-amber-300",
        info:
          "border-transparent bg-violet-200 text-violet-800 shadow-sm hover:bg-violet-300",
        gradient:
          "border-transparent bg-violet-200 text-violet-800 shadow-sm hover:bg-violet-300",
        muted:
          "border-transparent bg-gray-200 text-gray-800 shadow-sm hover:bg-gray-300",
        cyan:
          "border-transparent bg-cyan-200 text-cyan-800 shadow-sm hover:bg-cyan-300",
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
