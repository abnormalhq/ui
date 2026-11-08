"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress as ProgressPrimitive } from "radix-ui";

/**
 * A thin bar in the signal color (ink in light, yellow in dark), so it stays visible on any surface.
 * value is 0 to 100. Without one the bar is indeterminate: a third-width sweep runs until a value arrives.
 * Name it with aria-label or aria-labelledby, and pass getValueLabel for a reading other than a percentage.
 */
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const indeterminate = value === undefined || value === null;
  const shown = indeterminate ? 0 : Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-signal",
          indeterminate ? "w-1/3 animate-progress-sweep" : "w-full transition-transform duration-300 ease-out",
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - shown}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
