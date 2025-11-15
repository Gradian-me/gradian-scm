import { cn } from "@/gradian-ui/shared/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-100/60 dark:bg-gray-800/60",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

