import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A hairline between groups: horizontal by default, vertical inside a row of controls. It is decorative unless told
 * otherwise; a separator that structures the content for assistive technology passes decorative={false}.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical"; decorative?: boolean }) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative || orientation === "horizontal" ? undefined : "vertical"}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
