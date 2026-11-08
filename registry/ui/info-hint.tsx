"use client";

import * as React from "react";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * The small ⓘ next to a title or a field: the note opens on hover and keyboard focus, and a click or tap toggles
 * it. A tooltip alone never opens from a tap, so on phones and tablets the note could not be read; here the trigger
 * is a real button, so it can.
 */
function InfoHint({
  label,
  className,
  children,
  side = "bottom",
  align = "start",
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
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="info-hint"
          aria-label={label}
          onClick={() => setOpen((current) => !current)}
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
