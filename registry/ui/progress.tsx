"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress as ProgressPrimitive } from "radix-ui";

/**
 * A thin bar in the signal color (ink in light, yellow in dark), so it stays visible on any surface.
 * value runs from 0 to max (100 unless given). Without one the bar is indeterminate: a third-width sweep runs until a
 * value arrives.
 * Name it with aria-label or aria-labelledby, and pass getValueLabel for a reading other than a percentage.
 * `tone` is for a meter of something that runs out, such as a mailbox's storage: `warning` in amber as it nears the
 * limit, `destructive` in red at it. The page decides where those lines are; the color adds to the numbers beside the
 * bar, which say how full it is. `muted` greys the bar for work that has stopped or finished, such as a search the
 * person ended, so a bar that no longer moves does not read as one still running.
 */
function Progress({
  className,
  value,
  max = 100,
  tone = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { tone?: "default" | "warning" | "destructive" | "muted" }) {
  const indeterminate = value === undefined || value === null;
  const shown = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      data-tone={tone}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full",
          tone === "warning"
            ? "bg-badge-ink"
            : tone === "destructive"
              ? "bg-destructive"
              : tone === "muted"
                ? "bg-muted-foreground"
                : "bg-signal",
          indeterminate ? "w-1/3 animate-progress-sweep" : "w-full transition-transform duration-300 ease-out",
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - shown}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
