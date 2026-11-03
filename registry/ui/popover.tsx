"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover as PopoverPrimitive } from "radix-ui";

/** Popover panel (interactive content such as filter conditions): the same paper, radius and shadow as the dropdown menu. */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          "z-50 max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) overflow-y-auto rounded-mark border border-border bg-popover p-3 text-popover-foreground shadow-popover outline-none data-open:animate-arrive data-closed:animate-leave",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
