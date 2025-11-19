"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  ({ className, value = 0, extraStyles = "", ...props }, ref) => {
    const safeValue = Math.min(Math.max(value, 0), 100); // clamp 0–100

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-300 ease-out",
            extraStyles
          )}
          style={{
            transform: `translateX(calc(-100% + ${safeValue}%))`,
          }}
        />
      </ProgressPrimitive.Root>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
