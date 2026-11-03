import * as React from "react";
import { cn } from "@/lib/utils";

/** The browser's own select, styled like Input: use it where the system picker is the better control, such as on phones. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-8 w-full min-w-0 rounded-control border border-input bg-control px-3 text-base text-foreground transition-[border-color,background-color] duration-150 hover:border-[color-mix(in_oklab,var(--input),var(--text)_30%)] focus-visible:border-[color-mix(in_oklab,var(--input),var(--text)_30%)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive [&_option]:bg-popover [&_option]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
