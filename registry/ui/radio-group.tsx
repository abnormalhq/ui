"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

/**
 * One choice among a few, each next to a Label: a 16px ring that fills with an ink dot when chosen, as quiet as
 * Checkbox. Arrow keys move the choice between items, and the group submits with a form under its name.
 */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/70 bg-control transition-[border-color] duration-150 after:absolute after:-inset-x-3 after:-inset-y-2 hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-foreground",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="grid place-content-center">
        <span className="block size-2 rounded-full bg-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
