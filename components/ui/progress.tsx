"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  className?: string
  value?: number
  max?: number
  [key: string]: any
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <div
          className="bg-primary h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - (value ? (value / max) * 100 : 0)}%)` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }