import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/** A quiet link with an optional trailing icon: gray text that brightens on hover. */
function TextLink({ className, asChild = false, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="text-link"
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-base/[1.6] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { TextLink };
