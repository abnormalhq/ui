import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/** The page column: at most 1184px, with gutters that tighten from 40px to 24px and 16px on narrow screens. */
function Container({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="container"
      className={cn(
        "mx-auto w-[min(1184px,calc(100%-80px))] max-[49.9375rem]:w-[calc(100%-48px)] max-[37.4375rem]:w-[calc(100%-32px)]",
        className,
      )}
      {...props}
    />
  );
}

export { Container };
