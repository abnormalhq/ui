"use client";

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

/** The variant and size set on the group, so every item matches without repeating them. */
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({});

/**
 * Toggles joined into one control: one pressed at a time (type="single", such as a view switcher) or several
 * (type="multiple", such as text styles). `outline` is a segmented control: a sunken track at the control height
 * with the pressed segment raised on it in the popover color.
 */
function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "flex w-fit items-center rounded-control data-[variant=outline]:gap-0.5 data-[variant=outline]:bg-control data-[variant=outline]:p-0.5",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const group = React.useContext(ToggleGroupContext);
  const resolved = { variant: group.variant ?? variant, size: group.size ?? size };
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolved.variant}
      data-size={resolved.size}
      className={cn(
        toggleVariants(resolved),
        // Plain items join squared where they meet. In the outline track each item is a segment 4px shorter than the size,
        // so the track keeps the control height, and the pressed one is raised on it.
        "min-w-0 flex-1 focus-visible:z-raised not-data-[variant=outline]:rounded-none not-data-[variant=outline]:first:rounded-l-control not-data-[variant=outline]:last:rounded-r-control",
        "data-[variant=outline]:rounded-chip data-[variant=outline]:border-0 data-[variant=outline]:bg-transparent data-[variant=outline]:hover:bg-transparent data-[variant=outline]:data-[size=default]:h-7 data-[variant=outline]:data-[size=lg]:h-9 data-[variant=outline]:data-[size=sm]:h-6",
        "data-[variant=outline]:data-[state=on]:bg-popover data-[variant=outline]:data-[state=on]:shadow-control data-[variant=outline]:data-[state=on]:hover:bg-popover",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
