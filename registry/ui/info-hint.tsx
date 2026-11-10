"use client";

import * as React from "react";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * The small ⓘ next to a title or a field: the note opens on hover and keyboard focus, and a click or tap toggles
 * it. A tooltip alone never opens from a tap, so on phones and tablets the note could not be read; here the trigger
 * is a real button, so it can.
 * The tooltip closes itself as soon as the button is pressed, so by the time the click arrives the note always looks
 * closed and a plain toggle would only ever open it. The click therefore toggles from what the user saw when the
 * press began. A click with no press before it (Enter, Space, assistive technology) toggles from the current state.
 */
function InfoHint({
  label,
  className,
  children,
  side = "bottom",
  align = "start",
  onPointerDown,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** The button's accessible name, such as "About quotas". */
  label: string;
  /** The note. */
  children: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  align?: React.ComponentProps<typeof TooltipContent>["align"];
}) {
  const [open, setOpen] = React.useState(false);
  const openAtPress = React.useRef(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="info-hint"
          aria-label={label}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            openAtPress.current = open;
          }}
          onClick={(event) => {
            onClick?.(event);
            // detail counts the presses behind a click, and is 0 when there were none.
            setOpen(event.detail === 0 ? !open : !openAtPress.current);
          }}
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-control text-muted-foreground transition-colors duration-150 hover:bg-control hover:text-foreground",
            className,
          )}
          {...props}
        >
          <InfoIcon aria-hidden="true" className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className="max-w-sm leading-relaxed font-normal">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export { InfoHint };
